"""Deterministic provider HTTP boundary. No card data and no external Stripe traffic.

Production Payments validates these SDK responses and verifies signed events through YARP.
The fulfillment endpoint invokes the production one-shot worker against the real databases/APIs.
This server and its fixed signing secret must never be deployed outside disposable acceptance tests.
"""
import asyncio
import hashlib
import hmac
import json
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlsplit
from urllib.request import Request, urlopen

from ecommerce_store_payments.infrastructure.config.settings import Settings
from ecommerce_store_payments.infrastructure.persistence.mongodb.fulfill_payments import run

SECRET = 'whsec_deterministic_checkout_fixture'
SESSIONS = {}
IDEMPOTENCY = {}
EVENTS = {}
LOCK = threading.Lock()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def reply(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/health/live':
            return self.reply(200, {'status': 'ok'})
        if path.startswith('/v1/checkout/sessions/'):
            session = SESSIONS.get(path.rsplit('/', 1)[-1])
            return self.reply(200 if session else 404, session or {'error': {'message': 'Unknown fixture session'}})
        if path == '/fixtures/sessions':
            order = parse_qs(urlsplit(self.path).query).get('order', [''])[0]
            return self.reply(200, [s for s in SESSIONS.values() if s['metadata']['order_id'] == order])
        return self.reply(404, {'error': 'Unknown fixture endpoint'})

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get('Content-Length', '0')))
        path = urlsplit(self.path).path
        if path == '/v1/checkout/sessions':
            data = parse_qs(body.decode())
            key = self.headers.get('Idempotency-Key')
            with LOCK:
                if key in IDEMPOTENCY:
                    return self.reply(200, SESSIONS[IDEMPOTENCY[key]])
                identifier = 'cs_test_' + uuid.uuid4().hex
                metadata = {k: data[f'metadata[{k}]'][0] for k in ['order_id', 'payment_id', 'attempt_id']}
                session = {
                    'id': identifier, 'object': 'checkout.session', 'livemode': False, 'mode': 'payment',
                    'amount_total': int(data['line_items[0][price_data][unit_amount]'][0]), 'currency': 'pln',
                    'metadata': metadata, 'client_reference_id': data['client_reference_id'][0],
                    'payment_intent': 'pi_' + uuid.uuid4().hex, 'status': 'open', 'payment_status': 'unpaid',
                    'expires_at': int(time.time()) + 1800,
                    'url': 'https://checkout.stripe.com/c/pay/' + identifier,
                    'success_url': data['success_url'][0], 'cancel_url': data['cancel_url'][0],
                }
                SESSIONS[identifier] = session
                IDEMPOTENCY[key] = identifier
                return self.reply(200, session)
        if path == '/fixtures/fulfill':
            count = asyncio.run(run(Settings(), 100))
            return self.reply(200, {'processed': count})
        if path.startswith('/fixtures/events/'):
            identifier, scenario = path.split('/')[-2:]
            session = SESSIONS.get(identifier)
            if not session or scenario not in ['success', 'failed', 'expired']:
                return self.reply(400, {'error': 'Unknown session or outcome'})
            with LOCK:
                cache_key = (identifier, scenario)
                if cache_key not in EVENTS:
                    session['status'] = 'expired' if scenario == 'expired' else 'complete'
                    session['payment_status'] = 'paid' if scenario == 'success' else 'unpaid'
                    session['url'] = None
                    event_type = {'success': 'checkout.session.completed', 'failed': 'checkout.session.async_payment_failed',
                                  'expired': 'checkout.session.expired'}[scenario]
                    EVENTS[cache_key] = json.dumps({'id': 'evt_' + uuid.uuid4().hex, 'object': 'event',
                        'livemode': False, 'type': event_type, 'data': {'object': dict(session)}}).encode()
                payload = EVENTS[cache_key]
            timestamp = str(int(time.time()))
            signature = hmac.new(SECRET.encode(), timestamp.encode() + b'.' + payload, hashlib.sha256).hexdigest()
            request = Request('http://bff:8080/payments/webhooks/stripe', data=payload, method='POST',
                headers={'Content-Type': 'application/json', 'Stripe-Signature': f't={timestamp},v1={signature}'})
            try:
                with urlopen(request, timeout=15) as response:
                    return self.reply(response.status, json.load(response))
            except HTTPError as error:
                return self.reply(error.code, json.load(error))
        return self.reply(404, {'error': 'Unknown fixture endpoint'})


if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0', 8080), Handler).serve_forever()
