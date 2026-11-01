# Storefront final audit — WEB/STORE-07

This audit completes the redesign sequence against the [approved Figma file](https://www.figma.com/design/ZRkPrMyrqoNcVn93FMUh07). The starting point is merged WEB/STORE-06, commit `3c80d757e2944d4ffa7c74eca861f319d537a9e5`.

## Findings and fixes

| Finding reproduced in Chromium | Resulting behavior |
| --- | --- |
| Mobile Tab targets could land behind the fixed bottom navigation or details purchase bar. | Root scroll padding reserves the visible viewport for keyboard targets, including the detail action bar and device safe area. |
| A details link near the bottom of the catalog opened the new page at a deep scroll offset with focus on the document body. | New page navigation starts at the top, focuses main content and sets a meaningful route title. Query-only filtering preserves its focus context. |
| Back restored into the short loading layout before catalog data arrived. | Deferred history restoration waits for sufficient content height. User interaction, subsequent navigation and component destruction cancel pending restoration. The browser regression delays the actual BFF request, retains its real response, and checks restoration plus user cancellation. |
| Some aria labels omitted visible label text or badge content; linked photo alt text repeated the phone name. | Add-button names begin with “Add to cart”; hero/nav links use their native text, cart icons have an accessible text label, linked card photos are decorative beside their named link, and failed thumbnail names include “Unavailable”. |
| Mobile catalog cards and detail/404 feedback could skip heading levels. | Contextual headings preserve hierarchy across normal, loading, empty and error states without changing the visual design. |
| Blocked Google Fonts requests exposed icon ligature text. | The same source Roboto/Material Icons fonts are compressed as local WOFF2 assets with complete glyph sets and original license notices. Font readiness and zero external font requests are checked. |

## Screen coverage

| Screen | Figma desktop/mobile nodes | Audit coverage |
| --- | --- | --- |
| Home | `8:2087` / `8:2237` | Hero, brands, featured phone cards, navigation and footer |
| Catalog | `8:2404` / `8:2760` | Cards, budgets, active filters, drawer, empty results |
| Phone details | `8:3104` / `8:3216` | Real gallery, price/specs, fixed purchase bar, missing/broken images |
| Cart | `14:851` / `14:959` | API photos, quantities, estimates, unavailable products, checkout |
| Favorites | `14:1086` / `14:1180` | Shared phone cards, saved state, add/remove/clear, empty state |
| Profile | `14:1295` / `14:1517` | Selection, individual/company fields, required/email validation, saves |
| Orders | `14:1765` / `14:1840` | Real IDs, status, saved totals, detail navigation |
| Order/payment | `14:1935` / `14:1998` | Saved purchase snapshots, hosted checkout, verified payment/invoice states |

Static state exports remain local, non-empty 24px SVGs rendered inside 48px symbols. API phone photography stays dynamic. Full IDs, company forms, metadata, complete specifications and existing recovery controls remain intentionally longer than the abbreviated Figma examples. The known Samsung S25 source-name/photo color mismatch remains catalog data.

## Verification

- Local production build/lint, handwritten-code unit coverage, source checks, pinned contract regeneration and npm audit use the existing `scripts/ci.sh` gates.
- Four added browser scenarios cover sixteen normal-page accessibility scans at 390/1440px, 320px layout reflow and five additional scans: filter dialog, empty catalog, missing product, missing order and failed gallery photos. No axe rules or page regions are excluded. JSON evidence includes the engine, passed rules, violations and incomplete items.
- Native keyboard checks exercise browsing, details, cart and profile controls above sticky/fixed UI, focus trapping/restoration, skip links and history behavior. The earlier viewport matrix at 360/390/768/1024/1440 remains active.
- The complete suite retains all 22 earlier cart, customer, gallery, catalog, Stripe signature/fulfillment, retry/resume and duplicate-event scenarios. Real-container CI results and image/security evidence are recorded in the WEB/STORE-07 pull request.
- Local browser runs use a temporary API fixture because Docker is unavailable in this workspace. CI runs the real BFF and service containers; only external image/provider boundaries are isolated as documented in the test scenarios.

Coverage here is Chromium automation plus keyboard/layout and design inspection. Screen-reader/user testing and other browser engines remain future validation. The audit makes no changes to backend contracts, payment rules, coverage thresholds or deployment configuration.
