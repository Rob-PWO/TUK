# TACKLEUK - Website Redesign (Conversion-First Prototype)

A ground-up redesign of the Tackleuk storefront, built as **live, self-contained
HTML pages** for stakeholder review. Brand identity (logo wordmark + navy / cyan-blue /
red colour scheme) is retained; everything else is rebuilt around modern e-commerce
conversion best practice.

> **Status:** High-fidelity, interactive prototype. No backend - cart, wishlist and
> "recently viewed" persist in `localStorage` so the flows feel real end-to-end.

---

## Pages

| File | Page | Highlights |
|------|------|-----------|
| `index.html` | **Homepage** | Hero slider, image-rich **mega menu**, predictive search, category tiles, new-products carousel, **deal-of-the-week countdown**, brand rail, social proof, newsletter |
| `category.html` | **Category / PLP** | Faceted **filters** (brand, price, capacity, colour, rating, stock), sort, grid/list toggle, **active-filter chips**, quick-add / quick-view, inline Klarna promo, load-more + pagination, SEO copy |
| `product.html` | **Product / PDP** | Gallery + thumbs, conversion-optimised buy box, **dispatch countdown**, Klarna messaging, **sticky buy bar**, trust block, tabbed details, ratings breakdown + reviews, related products |
| `basket.html` | **Basket** | Line items with qty steppers, **free-delivery progress**, savings callout, voucher, delivery-method selector, express PayPal, cross-sell ("complete your setup") |
| `checkout.html` | **Checkout** | Distraction-reduced single-page flow, **express checkout** (PayPal/Klarna), guest checkout, address lookup, payment **accordion**, sticky order summary, trust reinforcement |

---

## Conversion features built in

- **Urgency & stock cues** - free-delivery progress bar, low-stock badges ("Only 3 left"),
  live "order within HH:MM:SS for same-day dispatch" countdown, "X people viewing now".
- **Frictionless add-to-cart** - slide-in **cart drawer** with cross-sell, sticky buy bar
  on PDP, quick-add and **quick-view** modal from every grid, toast confirmations.
- **Smart discovery** - predictive search with popular terms + product suggestions, and a
  visual **mega menu**.
- **Trust & social proof** - Trustpilot strip, verified-review cards, ratings breakdown,
  price-match / 30-day-returns / secure-checkout reassurance, Klarna messaging, payment marks.
- **Mobile-first** - responsive down to 360px with an app-style bottom nav, off-canvas
  filters, and full-width CTAs.

All interactions are real: add items, watch the basket count, free-delivery bar and
subtotal update; open the drawer; toggle wishlist hearts; filter; switch tabs. State
survives page navigation via `localStorage`.

---

## Design system

- **Brand:** Navy `#0A2540` + brand cyan-blue `#1391DB` (primary CTA). Red `#D81E2C`
  reserved for deals/urgency, green `#16894E` for in-stock/savings - your scheme, working harder.
- **Type:** Manrope (display) + Inter (body), via Google Fonts.
- **Tokens & components:** `assets/css/tuk.css` - CSS custom properties, a lean utility
  layer, and componentised UI (buttons, cards, drawer, modal, filters, forms…). One file,
  no framework, no build step.
- **Behaviour:** `assets/js/tuk.js` - dependency-free, defensive (every feature checks for
  its elements), so one script powers all pages.

### Imagery
Product/lifestyle visuals are **crafted on-brand SVGs** (`assets/img/`) so the prototype
renders identically everywhere with zero broken images and a consistent look. They are
placeholders - real product photography drops straight into the same `<img>` slots.
Regenerate with `python3 tools/generate_assets.py`.

---

## Preview locally

No build step. Either open `index.html` directly, or serve the folder:

```bash
cd TUK
python3 -m http.server 8000
# then visit http://localhost:8000
```

Recommended for sharing: enable **GitHub Pages** on this branch (Settings → Pages →
deploy from branch) for a public showcase URL.

---

## Next steps / ideas

- Swap SVG placeholders for real product photography.
- Wire to the real product catalogue / cart API.
- Add: PDP image zoom, size/variant guides, recently-viewed rail render, back-in-stock
  alerts, exit-intent offer, A/B test CTA colour & copy.
- Accessibility audit (focus traps in drawer/modal are scaffolded; extend ARIA live regions).
