# ADR-0004: Resolve one demo customer for profile and storefront features

- Status: Accepted
- Date: 2026-09-30

## Context

The storefront has no authentication yet. Users reads profiles by external ID and updates an individual record by customer GUID. Cart, favorites, and order history use that GUID. A fixed fallback customer GUID could show an unrelated profile and initiate operations against the wrong demo account.

## Decision

Start without a selected customer. On the profile screen, resolve a user-supplied external ID through the Users Kiota client and store its returned GUID and external ID in one browser-local `CustomerContext`. Cart, favorites, and orders read the GUID from this context. Changing or clearing the demo selection reloads the SPA to discard feature state and in-flight responses for the previous customer. Existing demo sessions and acceptance fixtures with only `localStorage.demoClientId` retain access to GUID-based features; they must supply an external ID for profile lookup. The profile edits individual and address data through Users; existing company name, tax ID, and addresses are edited through the Users company update operation.

## Consequences

The UI labels the selector as demo mode. Local storage is neither proof of identity nor an authorization boundary; backend authorization remains future work. Users currently has no GET profile by GUID, so an old GUID alone cannot load a profile. A failed lookup never replaces the selected customer. A 409 on update requires a reload before another save. Changing the demo customer reloads the app, which loses unsaved UI state but prevents a previous customer’s NgRx data from appearing under the new selection.

## Alternatives considered

- Keep a fallback GUID: silently targets a nonexistent or unrelated customer.
- Infer the external ID from the GUID: no API contract supports that lookup.
- Retain feature stores while switching customer: can briefly display stale cart, favorites, or orders.
