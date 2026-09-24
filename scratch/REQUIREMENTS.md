# Requirements: Free Shipping Progress Bar (CartSummaryList Heading slot)

## Task Summary
Add a "free shipping progress bar" to the `CartSummaryList` drop-in container's `Heading` slot in the `commerce-cart` block. The bar shows how much more the shopper needs to spend to qualify for free shipping. Cart total is read from the `storefront-cart` drop-in's event bus (`cart/data`).

## Project Analysis (via `dropins:analyze_project`)
- Project: `@adobe/aem-boilerplate-commerce` v10.0.0
- Installed drop-in: `@dropins/storefront-cart` v3.3.1
- Commerce endpoint configured: yes (`config.json` → `commerceEndpoint`)
- Target block: `blocks/commerce-cart/commerce-cart.js` (already renders `CartSummaryList` with a `Heading` slot showing "Your Bag")

## Verified APIs (via dropins MCP server — AUTHORITATIVE)
- **Slot:** `CartSummaryList` → `Heading` slot exists, `contextType: DefaultSlotContext` (no extra props; use `ctx.appendChild`/`ctx.replaceWith` etc.)
- **Event:** `cart/data` — emitted by `storefront-cart`, payload type `Cart | null`
- **Cart model fields** (from `@dropins/storefront-cart/data/models/cart-model.d.ts`):
  - `total.includingTax: { value: number; currency: string }`
  - `subtotal.excludingTax` / `subtotal.includingTax`
  - `totalQuantity: number`

## Open Questions (NEED USER INPUT)

1. **Free shipping threshold amount & currency** — no existing config/placeholder for this was found in the project. What amount should trigger free shipping (e.g. `75` USD)? Should it be:
   - (a) hardcoded in the block JS,
   - (b) an author-configurable block config field (e.g. `free-shipping-threshold` row in the block table), or
   - (c) read from an existing placeholders sheet entry?
2. **Which cart amount to compare against the threshold?** `total.includingTax` (grand total) or `subtotal.excludingTax`?
3. **Copy/wording** — exact text for "X more to qualify" and "you qualify" states? Should this use the existing `placeholders` (fetched via `fetchPlaceholders()`) already used elsewhere in this block, or hardcoded strings?
4. **Placement relative to existing Heading content** — the `Heading` slot currently renders "Your Bag" text. Should the progress bar be added below/after that text (same slot), or should it replace the heading content entirely?

## User Answers
1. Threshold: author-configurable block field (`free-shipping-threshold`)
2. Comparison amount: `subtotal.excludingTax`
3. Copy source: new placeholder keys (via `fetchPlaceholders()` / `placeholders.Global`)
4. Placement: below the existing "Your Bag" heading text

## Phase 1: Complete ✅
Date: 2026-09-24

## Phase 2: Complete ✅
User Approved: Yes
Approval Date: 2026-09-24

## Phase 3: Implementation Approach Selected
Approach: Option B (Direct Implementation)
Selection Date: 2026-09-24

## Phase 4: Implementation Started
Date: 2026-09-24

### Files Changed
- `blocks/commerce-cart/commerce-cart.js` — new `free-shipping-threshold` config, progress bar built in `Heading` slot, updated via existing `cart/data` event handler using `getPriceFormatter` from `@dropins/tools/lib.js`
- `blocks/commerce-cart/commerce-cart.css` — `.cart-free-shipping-progress` styles
- `blocks/commerce-cart/README.md` — documented new config row and placeholder keys

## Phase 4: Implementation Complete
Date: 2026-09-24

### Plan

1. **Block config** — add `free-shipping-threshold` row to `readBlockConfig()` destructure in `blocks/commerce-cart/commerce-cart.js`. Parse with `parseFloat`; if missing/NaN/<=0, feature is disabled (no progress bar rendered). Document new row in `blocks/commerce-cart/README.md` config table.
2. **Markup** — inside the existing `Heading` slot callback (after the "Your Bag" text), create a `.cart-free-shipping-progress` wrapper with a message element and a track/fill bar (native `document.createElement`, no template literals), appended via `ctx.appendChild`.
3. **Live updates** — reuse the existing `events.on('cart/data', ...)` subscription (already in the block, `{ eager: true }`) to recompute progress each time cart data changes:
   - `subtotalValue = cartData?.subtotal?.excludingTax?.value ?? 0`
   - `currency = cartData?.subtotal?.excludingTax?.currency`
   - `remaining = threshold - subtotalValue`
   - If `remaining <= 0`: show "qualified" placeholder text, fill = 100%
   - Else: show "remaining away from free shipping" placeholder text (with formatted amount interpolated), fill = `min(100, subtotalValue / threshold * 100)`%
4. **Currency formatting** — use `getPriceFormatter({ currency })` from `@dropins/tools/lib.js` (same utility the drop-ins use internally) to format the remaining amount.
5. **Copy** — two new placeholder keys read via existing `placeholders` object (already fetched with `fetchPlaceholders()` in this block):
   - `placeholders.Global.FreeShippingProgressMessage` — expected to contain a `{amount}` token, e.g. `"{amount} away from free shipping"`
   - `placeholders.Global.FreeShippingQualifiedMessage` — e.g. `"You've qualified for free shipping!"`
   - Fallback to sensible hardcoded English strings if placeholders are not authored yet (consistent with graceful-degradation pattern used elsewhere in this block).
6. **Styling** — add `.cart-free-shipping-progress` styles to `blocks/commerce-cart/commerce-cart.css` (track/fill bar, spacing), using existing CSS custom properties/tokens from the block where available.
7. **No new files** — changes confined to `commerce-cart.js`, `commerce-cart.css`, and `README.md`.

### Security & Performance
- No external API calls added; purely derived from already-subscribed event data.
- No user input is rendered as HTML (text content only via `textContent`), avoiding XSS risk.

### Testing Approach
- Manual browser verification (Tester skill): add items to cross below/above threshold, verify message + fill width update reactively via `cart/data` events, verify graceful hide/disable when `free-shipping-threshold` is unset.
