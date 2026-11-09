# PACT/10 Web → Users profile lookup

The real storefront Kiota repository calls `GET /backend/customers/external/{externalId}`.
The consumer test checks that browser path before forwarding to the Pact mock on
`GET /customers/external/{externalId}`. Users owns the response contract.

| Scenario | Expected result |
| --- | --- |
| Load a profile for an existing external ID | HTTP 200 with the customer ID, external ID, update timestamp, individual details, and company details. Both address types include postal code, city, street, building number, and apartment number. The storefront maps a null apartment number to an empty form value. |
| Load a profile for an unknown external ID | HTTP 404 with an `application/problem+json` response and `status: 404`. The repository surfaces `ProfileNotFoundError`. |

Run `npm run test:pact` with Node 22 or later. The consumer tests generate the Pact twice and
check for identical bytes. The required unit job uploads the Users Pact and SHA-256 manifest
as `web-users-pact`. The `publish-web-pact (users)` job publishes the original bytes after
the quality gate on a push or manual run on `master`, using the existing `web-ci` publisher.
The `web-users-publication` receipt links the exact Web commit, Pact hash and CI run.

Users provider CI will replay the pinned artifact against the Users API and MongoDB.
Profile edits, favorites and BFF registration have separate contract coverage.
