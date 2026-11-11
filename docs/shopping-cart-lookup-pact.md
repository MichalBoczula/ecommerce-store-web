# PACT/10 Web → Invoice cart lookup

The storefront's `OrdersKiotaRepository.getByClientId` requests
`GET /backend/shopping-carts/client/{clientId}`. The consumer test checks this
browser path and forwards the request to the Pact mock on
`GET /shopping-carts/client/{clientId}`. Invoice owns the response.

| Scenario | Expected result |
| --- | --- |
| Load a populated cart | HTTP 200 with cart and client IDs, timestamps and product quantities. The repository maps the timestamps to JavaScript dates. |
| Look up a client without a cart | HTTP 404 with `application/problem+json` and `status: 404`. The repository surfaces `ShoppingCartNotFoundError`. |

Run `npm run test:pact` with Node 22 or later. The test generates the Pact twice
and checks for identical bytes. The required unit job uploads `web-invoice-pact`
with the Pact and SHA-256 manifest. After the quality gate, `publish-web-pact (invoice)`
publishes the original bytes on a push or manual run on `master` using `web-ci`.
The `web-invoice-publication` receipt links the Web commit, Pact hash and CI run.

Invoice provider verification is the next step. It will replay the pinned
consumer artifact against the Invoice API with an isolated MongoDB database.
Cart updates, order creation, order history and billing have their own interactions.
