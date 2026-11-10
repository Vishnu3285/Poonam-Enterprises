# Poonam Enterprises — Locks, Sales & Service Website (2026 Refresh)

A mobile-responsive website with **61 curated Godrej lock listings** across five collections: smart/digital, main-door rim, mortise/handles, padlocks and door knobs. Product descriptions, model/finish, official media references, indicative prices, search, filters, sorting, details modal, load-more and enquiry builder.

## Open (Mac or Windows)

The easiest local preview is **Poonam-Enterprises-Fullscreen-Mobile-Animated.html** (provided separately and in the ZIP root). Double-click to open it in Chrome or Safari. No build or install is required. It includes crisp, self-contained SVG preview illustrations for each product. Godrej-hosted original media is attempted when internet access permits.

For source development, open `website-source/index.html` or serve that directory with `python3 -m http.server 8000`. All assets should stay in their respective directories.

## Before publishing

1. **Set real contact information** in `config.js`: mobile, WhatsApp number (`91` + Indian mobile number), email, address, city and Maps link. Enquiries are prepared messages, not actually sent or stored, until WhatsApp is configured and the customer sends the message.
2. **Verify commercial rights and claims**. Check Godrej branded image reuse permission and any business partner/authorization claim. The site is a retailer showcase, not an official Godrej site. Preview illustrations are explicitly labelled; they are not actual product photographs.
3. **Verify all final prices and stock**. The manufacturer's public web-store listings were reviewed November 10, 2026. The shown prices are indicative online references, not live quotes or Poonam Enterprises' stock. Do not advertise these as guaranteed store prices.
4. **Deploy** to Vercel/Netlify/GitHub Pages. `api/products.js` is an optional free, self-hosted JSON catalogue endpoint for Vercel. It is **not an official Godrej API**. Static hosts work using `catalog-data.js`.

## Catalogue maintenance

- Edit `data/products.json` as the source of truth.
- Regenerate the browser version `catalog-data.js` with Python: `window.POONAM_CATALOG = ` + compact JSON source + `;`.
- The full source site uses local SVG fallback assets under `assets/product-fallbacks/`.

### Catalogue endpoint

`GET /api/products`, optionally `?category=knob&q=black` or `?category=smart`. JSON response has `meta`, `count`, `products`. Categories: `smart`, `rim`, `mortise`, `padlock`, `knob`.

### Official Godrej source categories

- https://shop.godrejsecure.com/categories/digital-locks
- https://shop.godrejsecure.com/categories/main-door-rim-locks
- https://shop.godrejsecure.com/categories/door-handle-locks
- https://shop.godrejsecure.com/categories/padlocks
- https://shop.godrejsecure.com/categories/door-knob-locks
- https://shop.godrejsecure.com/categories/door-locks?view=all

This is a curated local catalogue, **not** an official Godrej API, automatic scraper, partner inventory feed, or real-time pricing service.

## Latest visual improvements
- Full-bleed hero spanning entire screen width on desktop.
- Rebuilt phone hero (one column, full width), 320px to large tablets, menu and catalogue fit.
- Branded logo reveal on opening, gentle product floating animation, scroll reveals; reduced-motion accessibility support.
- Use **Poonam-Enterprises-Fullscreen-Mobile-Animated.html** for a self-contained local preview.
