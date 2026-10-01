"""Acceptance-only SDK boundary; mounted by ecommerce-compose.acceptance.yml only."""
import stripe
import uvicorn


class FixtureStripeClient(stripe.StripeClient):
    def __init__(self, *args, **kwargs):
        kwargs['base_addresses'] = {'api': 'http://stripe-fixture:8080'}
        super().__init__(*args, **kwargs)


stripe.StripeClient = FixtureStripeClient
uvicorn.run('ecommerce_store_payments.main:app', host='0.0.0.0', port=8080)
