# Storefront redesign

Task WEB/STORE-03 implements the shared Angular shell from the [approved desktop and mobile Figma design](https://www.figma.com/design/ZRkPrMyrqoNcVn93FMUh07). Task WEB/STORE-04 adds the home and catalog pages, integrating the shared phone card. The header, footer, mobile navigation and filter drawer are live. Product detail and customer/checkout page layouts are subsequent tasks; their existing behavior and API contracts remain in place.

## Shared presentation

`src/app/shared/presentation` contains standalone Angular components using the installed Angular Material controls and icons. The layout container owns customer state and passes counts into the header and mobile navigation. Navigation uses the existing routes and real links. Cart badges count quantities, favorites count saved products, and the menu opens the existing brand/price filter form. Desktop users edit filters in the catalog sidebar; mobile users can open the same controls from the catalog button or header menu. Applying filters closes the drawer, including on the current catalog route. Escape, backdrop dismissal and focus restoration use Material's drawer behavior.

The mobile navigation appears below 768px. Its reserved content space includes the device safe area, and all five destinations remain available. The shell provides a skip link, visible keyboard focus, navigation landmarks and active route announcements. Orders stays selected on order details.

`StorePhoneCard` is prepared for the next home/catalog task, with API-driven name, brand, photo, specifications and price inputs, a saved state, a disabled-actions input, and separate cart/favorite outputs. It has no facade, generated DTO or customer dependency. It links to the existing details route. Missing/broken photos have an accessible fallback; missing prices/currencies display “Price unavailable.” Numeric values retain their supplied currency, including zero amounts. Do not derive storage from the catalog list DTO or add a default currency. Home and catalog containers connect the card outputs to the existing customer context and cart/favorite facades; the shell initializes customer state and both browsing pages refresh favorites for the selected customer. Cards match favorites by both customer and product IDs.

## Theme

`src/styles/_storefront.scss` defines the Figma CSS tokens and Material overrides. Shared components use the `--store-*` colors, spacing and radii. `.store-container` centers content at a maximum of 1248px with responsive gutters; `.store-button` applies the 48px high, 8px radius Material button treatment. Typography uses the existing Roboto family, now including the 700 weight.

Legacy page SCSS imports the Sass-only `src/styles/_tokens.scss`, rather than importing the global stylesheet and emitting its CSS into every component. Remove compatibility tokens as those pages are migrated. New pages should use the CSS theme tokens. Fixed mobile purchase controls in the later product task must sit above `--store-mobile-nav-space`.

## Verification

Shell/component unit tests cover customer loading and guidance, reactive counts, navigation, order detail selection, errors, drawer close behavior, card outputs, disabled actions and missing data. `tests/acceptance/storefront-shell.spec.ts` checks five viewport widths, desktop/mobile filter access, Escape focus restoration and fixed mobile navigation. It runs with the existing real-container acceptance suite. No API, generated client, dependency or coverage threshold changes are required.

## Home and catalog behavior

The home hero reuses the first two top products; featured cards use the complete top-product response. Hero photos are decorative within named product links so each featured photo is announced once. Brand shortcuts navigate to the catalog. Titles, photos and prices come from the API, including zero amounts and supplied currencies. Missing top-product money no longer becomes an invented zero/USD pair. The hero uses a truncated full API name with a title and an accessible full-name link; there is no separate short-name API field. The catalog callout avoids a hardcoded total that the top feed cannot supply.

Catalog criteria are encoded as `/list?brand=Xiaomi&minPrice=1000&maxPrice=2600`. Both filter forms follow query parameters, including reload, Back/Forward and Clear filters. Supported brands and finite nonnegative price bounds map to the existing filter DTO; unknown brands, invalid bounds and inverted URL ranges are ignored. Forms prevent submitting negative or inverted ranges. A zero bound remains valid. The budget controls retain the catalog's PLN convention; cards display the API currency individually.

A single catalog effect handles list/filter requests, canceling obsolete subscriptions when criteria change. Per-view home/catalog load states prevent a late home response from hiding a catalog loading or error state. Loaded-empty results, errors with Retry, and skeleton loading each have their own presentation. The existing facades, repository ports, BFF adapter and generated clients remain the API boundary. The ordinary catalog still requests the existing 15-product page; pagination, sorting, search and additional facets are outside this task.

The catalog card shows only screen size and display type, which are supplied in the list DTO. It does not invent storage or show the camera field as a processor. The known Samsung S25 Green-name/Black-photo mismatch is retained as source data. Product details and customer/checkout layouts retain their existing designs until their planned tasks.

Additional browser scenarios verify featured-phone cart/favorite mutations through real registered customers, backend currencies, product links, brand shortcuts, desktop budgets, refresh/Back preservation, mobile drawer synchronization and empty-result recovery. Existing cart/photo/payment coverage remains active with selectors adapted to the shared card.
