# Storefront redesign

Task WEB/STORE-03 implements the shared Angular shell from the [approved desktop and mobile Figma design](https://www.figma.com/design/ZRkPrMyrqoNcVn93FMUh07). Task WEB/STORE-04 adds the home and catalog pages, integrating the shared phone card. The header, footer, mobile navigation and filter drawer are live. Task WEB/STORE-05 implements product details. Task WEB/STORE-06 implements cart, favorites, profile, order history, order details and payment states, retaining the existing customer and checkout flows.

## Shared presentation

`src/app/shared/presentation` contains standalone Angular components using the installed Angular Material controls and icons. The layout container owns customer state and passes counts into the header and mobile navigation. Navigation uses the existing routes and real links. Cart badges count quantities, favorites count saved products, and the menu opens the existing brand/price filter form. Desktop users edit filters in the catalog sidebar; mobile users can open the same controls from the catalog button or header menu. Applying filters closes the drawer, including on the current catalog route. Escape, backdrop dismissal and focus restoration use Material's drawer behavior.

The mobile navigation appears below 768px. Its reserved content space includes the device safe area, and all five destinations remain available. The shell provides a skip link, visible keyboard focus, navigation landmarks and active route announcements. Orders stays selected on order details.

`StorePhoneCard` is prepared for the next home/catalog task, with API-driven name, brand, photo, specifications and price inputs, a saved state, a disabled-actions input, and separate cart/favorite outputs. It has no facade, generated DTO or customer dependency. It links to the existing details route. Missing/broken photos have an accessible fallback; missing prices/currencies display “Price unavailable.” Numeric values retain their supplied currency, including zero amounts. Do not derive storage from the catalog list DTO or add a default currency. Home and catalog containers connect the card outputs to the existing customer context and cart/favorite facades; the shell initializes customer state and both browsing pages refresh favorites for the selected customer. Cards match favorites by both customer and product IDs.

## Theme

`src/styles/_storefront.scss` defines the Figma CSS tokens and Material overrides. Shared components use the `--store-*` colors, spacing and radii. `.store-container` centers content at a maximum of 1248px with responsive gutters; `.store-button` applies the 48px high, 8px radius Material button treatment. Typography uses the existing Roboto family, now including the 700 weight.

Legacy page SCSS imports the Sass-only `src/styles/_tokens.scss`, rather than importing the global stylesheet and emitting its CSS into every component. Remove compatibility tokens as those pages are migrated. New pages should use the CSS theme tokens. The details purchase bar sits above `--store-mobile-nav-space`; the shared layout reserves additional space while that bar exists, keeping the footer reachable.

## Verification

Shell/component unit tests cover customer loading and guidance, reactive counts, navigation, order detail selection, errors, drawer close behavior, card outputs, disabled actions and missing data. `tests/acceptance/storefront-shell.spec.ts` checks five viewport widths, desktop/mobile filter access, Escape focus restoration and fixed mobile navigation. It runs with the existing real-container acceptance suite. API contracts, generated clients and coverage thresholds remain unchanged.

## Home and catalog behavior

The home hero reuses the first two top products; featured cards use the complete top-product response. Hero photos are decorative within named product links so each featured photo is announced once. Brand shortcuts navigate to the catalog. Titles, photos and prices come from the API, including zero amounts and supplied currencies. Missing top-product money no longer becomes an invented zero/USD pair. The hero uses a truncated full API name with a title and an accessible full-name link; there is no separate short-name API field. The catalog callout avoids a hardcoded total that the top feed cannot supply.

Catalog criteria are encoded as `/list?brand=Xiaomi&minPrice=1000&maxPrice=2600`. Both filter forms follow query parameters, including reload, Back/Forward and Clear filters. Supported brands and finite nonnegative price bounds map to the existing filter DTO; unknown brands, invalid bounds and inverted URL ranges are ignored. Forms prevent submitting negative or inverted ranges. A zero bound remains valid. The budget controls retain the catalog's PLN convention; cards display the API currency individually.

A single catalog effect handles list/filter requests, canceling obsolete subscriptions when criteria change. Per-view home/catalog load states prevent a late home response from hiding a catalog loading or error state. Loaded-empty results, errors with Retry, and skeleton loading each have their own presentation. The existing facades, repository ports, BFF adapter and generated clients remain the API boundary. The ordinary catalog still requests the existing 15-product page; pagination, sorting, search and additional facets are outside this task.

The catalog card shows only screen size and display type, which are supplied in the list DTO. It does not invent storage or show the camera field as a processor. The known Samsung S25 Green-name/Black-photo mismatch is retained as source data. The customer and checkout screens use the shared storefront theme as described below.

Additional browser scenarios verify featured-phone cart/favorite mutations through real registered customers, backend currencies, product links, brand shortcuts, desktop budgets, refresh/Back preservation, mobile drawer synchronization and empty-result recovery. Existing cart/photo/payment coverage remains active with selectors adapted to the shared card.


## Product details

The responsive details page follows Figma desktop `8:3104` and mobile `8:3216`. Main and additional photos come from the current product response, trimmed and deduplicated in source order. Native keyboard-accessible thumbnail buttons select the active image, skip broken photos and show an accessible fallback when none remain. The obsolete placeholder/dog images and the now-unused Swiper dependency/global registration are removed.

The page displays the supplied amount/currency, including zero, and explicitly handles missing money. Cart commands still send only product ID and quantity one. Saving/removing favorites uses the existing customer/product commands; both IDs scope the saved state. Guest actions remain disabled. The mobile purchase bar stays above bottom navigation, and its shared-shell space reservation clears on navigation, loading and errors.

Brand breadcrumbs use existing catalog query filters; Back retains browser history. The overview uses the actual processor, display, memory and enabled connectivity fields. Storage is informational, not a variant selector; no color, reviews, stock or delivery promises are invented. Descriptions retain all three API text sections. The specifications preserve every available field and explicit Yes/No flags, with readable labels and without duplicated RAM/storage units. This makes seeded pages longer than the abbreviated Figma specification example.

Detail load state is independent of late home/catalog requests. Route changes clear stale products/actions, cancel obsolete requests through the existing effect, and reload the new ID. Loading, error/retry, missing photos and unavailable prices have explicit states.

Unit tests cover data mapping, gallery selection/failure, customer-scoped mutations, guests, stale routes, retry, money and mobile space cleanup. `tests/acceptance/storefront-details.spec.ts` checks the real BFF detail response, four gallery URLs and keyboard selection, specifications, registered-customer cart/favorite persistence, brand links, five widths, mobile bar/navigation geometry and footer reachability. Only external development-storage image bytes are isolated in the gallery scenario; product/customer APIs remain real.


## Customer and checkout screens

Task WEB/STORE-06 follows Figma's cart, favorites, profile and order desktop/mobile frames (`14:851` through `14:1998`). Shared Sass presentation in `src/styles/_storefront-pages.scss` keeps page gutters, headings, white panels, notices and responsive spacing consistent without changing the API or application boundaries. The existing shell and bottom-navigation reservation remain in place; these pages do not add a fixed purchase overlay.

Cart rows use current API main photos, accessible broken-photo fallbacks, product links and human-readable quantity/remove labels. The summary still groups estimates by currency, excludes unavailable/nonpositive prices and blocks checkout until all lines have valid prices in a single currency. Quantity changes, removal, clearing and checkout remain the existing facade commands. Final order totals and uncertain-checkout recovery/history links are retained. Unit/line totals use the supplied currency; no shipping charges, discounts or new payment form are introduced.

Favorites reuse `StorePhoneCard`, with current main photos, display specifications, prices, details links and saved state. The displayed list is scoped to the selected customer. Removed/inactive products stay visible as unavailable, cannot be added to the cart, and can still be removed. Clear-all and retry remain available. Guest, empty, loading and failure states are distinct.

Profile keeps external-ID demo selection and its explicit authentication disclaimer, full customer IDs and update metadata. Existing individual and company forms use installed Material outlined fields, with two desktop columns and single-column mobile fields. All contact/billing/shipping fields, required/email validation, complete update payloads and conflict/reload feedback are preserved. Company forms retain separate submissions. Metadata and company sections make the real page longer than the individual-only Figma example.

Order history shows full API order IDs, timestamps, saved totals/currencies and status badges. Order detail reads the stored purchase snapshot and preserves brand, quantity, unit price and line totals; it does not replace historical data with live catalog values or invent abbreviated order numbers. The desktop purchase/payment columns stack on mobile.

Hosted Stripe Checkout, return hints, ownership checks, PLN/minimum-amount eligibility, polling, retry/resume behavior and invoice metadata remain unchanged. Payment presentation follows the pending, confirmed, failed/expired, paused and invoice-ready state frames (`15:1863`, `15:1877`, `15:1891`, `15:1906`, `15:1920`). Exact local Figma SVG exports retain their 24px dimensions inside 48px state symbols. Existing reference, provider, delayed-fulfillment and paused-polling explanations are retained in the panels. Confirmed payments disable further payment while fulfillment is pending. PDF delivery remains unavailable, with no fabricated download link.

`tests/acceptance/storefront-account.spec.ts` adds real-service favorite mutations and cart-to-order/snapshot/payment-layout scenarios, including five viewport widths and API image URLs. The existing profile scenario also checks five widths, mobile required-field validation and individual/company saves. Existing hosted-payment success, cancel, failure/expiry, duplicate-click and forged-return tests remain active. Only external development-storage image bytes and the pre-existing provider boundary are isolated; product/customer/order APIs remain real. Task WEB/STORE-07 completes the final regression and design audit; see [the audit record](storefront-final-audit.md).


## Final audit

WEB/STORE-07 adds `tests/acceptance/storefront-audit.spec.ts`: complete-page axe checks on eight desktop/mobile routes, 320px reflow, a real filter-dialog focus trap, empty/404/broken-image states, native Tab visibility above sticky/fixed chrome, skip-link behavior, page-entry focus/scroll and delayed real-API Back restoration. The existing 22 business scenarios remain active. Axe results and incomplete/manual-review items are attached to the Playwright report without rule exclusions.

Accessible labels retain the visible control text, redundant linked-photo announcements are removed, and error/catalog headings retain their hierarchy. Each route has a meaningful document title. Root scroll padding protects keyboard targets above mobile navigation and the detail purchase bar. Angular scrolling handles page entry; a scoped observer restores history positions after API-backed content grows and cancels on user interaction, a new navigation or component destruction.

Roboto and Material Icons now load from local WOFF2 assets with source hashes and original licenses in `public/fonts`. They use the same source TTFs as the design verification and retain Polish glyphs and the full icon ligature set. The audit asserts loaded fonts and zero Google Fonts requests. `@axe-core/playwright` is a development-only dependency; application APIs and business rules remain unchanged.
