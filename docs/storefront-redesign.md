# Storefront redesign

Task WEB/STORE-03 implements the shared Angular shell from the [approved desktop and mobile Figma design](https://www.figma.com/design/ZRkPrMyrqoNcVn93FMUh07). The header, footer, mobile navigation and filter drawer are live. Home, catalog, product detail and customer/checkout page layouts are subsequent tasks; their existing behavior and API contracts remain in place.

## Shared presentation

`src/app/shared/presentation` contains standalone Angular components using the installed Angular Material controls and icons. The layout container owns customer state and passes counts into the header and mobile navigation. Navigation uses the existing routes and real links. Cart badges count quantities, favorites count saved products, and the menu opens the existing brand/price filter form. Desktop users can open filters above the catalog until the catalog sidebar is implemented. Applying filters closes the drawer, including on the current catalog route. Escape, backdrop dismissal and focus restoration use Material's drawer behavior.

The mobile navigation appears below 768px. Its reserved content space includes the device safe area, and all five destinations remain available. The shell provides a skip link, visible keyboard focus, navigation landmarks and active route announcements. Orders stays selected on order details.

`StorePhoneCard` is prepared for the next home/catalog task, with API-driven name, brand, photo, specifications and price inputs, a saved state, a disabled-actions input, and separate cart/favorite outputs. It has no facade, generated DTO or customer dependency. It links to the existing details route. Missing/broken photos have an accessible fallback; missing prices/currencies display “Price unavailable.” Numeric values retain their supplied currency, including zero amounts. Do not derive storage from the catalog list DTO or add a default currency. The card is intentionally not integrated into the old page layouts in this task.

## Theme

`src/styles/_storefront.scss` defines the Figma CSS tokens and Material overrides. Shared components use the `--store-*` colors, spacing and radii. `.store-container` centers content at a maximum of 1248px with responsive gutters; `.store-button` applies the 48px high, 8px radius Material button treatment. Typography uses the existing Roboto family, now including the 700 weight.

Legacy page SCSS imports the Sass-only `src/styles/_tokens.scss`, rather than importing the global stylesheet and emitting its CSS into every component. Remove compatibility tokens as those pages are migrated. New pages should use the CSS theme tokens. Fixed mobile purchase controls in the later product task must sit above `--store-mobile-nav-space`.

## Verification

Shell/component unit tests cover customer loading and guidance, reactive counts, navigation, order detail selection, errors, drawer close behavior, card outputs, disabled actions and missing data. `tests/acceptance/storefront-shell.spec.ts` checks five viewport widths, desktop/mobile filter access, Escape focus restoration and fixed mobile navigation. It runs with the existing real-container acceptance suite. No API, generated client, dependency or coverage threshold changes are required.
