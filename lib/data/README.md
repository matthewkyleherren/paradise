# `profiles.json`

The static catalogue behind `/profile/[section]/[profile]`. There is no CMS and
no commerce backend behind these pages — the page reads this file and nothing
else, so it renders identically offline.

It was extracted from the WE+AR TRBL site (a separate rebuild living in
`../newkiko`), which stored its catalogue as a Shopify-shaped stub. This file is
that data flattened into only what a page needs, with image paths rewritten to
local assets.

Read it through `lib/profiles.ts` rather than importing the JSON directly — the
accessors there are the only place the shape is assumed.

## Top level

| Key | Type | Notes |
|---|---|---|
| `currency` | `string` | ISO 4217 code. `"EUR"`. Not present in the original export; chosen when the file was generated. |
| `discount.amount` | `number` | Percentage off, as an integer (`10` = 10%). Carried over from the source; **nothing currently reads it**. |
| `accessory` | `object` | See below. |
|  `profiles` | `array` | Two entries: `iki-sweat` and `iki-tee`. |

## `accessory`

A single bundled item (the IKI screen) that ships with every garment rather than
being sold on its own. It has **no page of its own** and is deliberately absent
from `profiles`.

Same fields as a profile entry minus `sizes` and `collections`, plus a bare `images`
object. Its only role now is documentation of where the bundled price came from;
the page no longer displays a price at all.

```jsonc
{
  "id": 2286722121785,
  "title": "IKI",
  "slug": "iki",
  "type": "iki",
  "price": "100.00",
  "compareAtPrice": null,
  "description": "<ul>…</ul><p>…</p>",
  "images": { "wmns": { "cart": { "desktop": { … } } } }
}
```

> `accessory.images` is nearly empty on purpose — see [Missing assets](#missing-assets).

## A profile entry

```jsonc
{
  "id": 2286722744377,           // original Shopify product id; not used for routing
  "title": "SWEAT",              // display name, and the header toggle label
  "slug": "iki-sweat",           // the [profile] route segment
  "type": "iki+sweat",           // original product_type; groups garment + bundled IKI
  "price": "250.00",             // string, not number — two decimals, no symbol
  "compareAtPrice": "350.00",    // string or null; the pre-bundle "was" price
  "description": "<ul>…</ul>",   // trusted HTML, see below
  "sizes": [{ "id": 19438…, "title": "S" }],
  "collections": { "mns": { … }, "wmns": { … } }
}
```

`price` and `compareAtPrice` are **strings** because the source stored them that
way; `lib/profiles.ts` does the `Number()` conversion. Neither is rendered any
more — the page dropped sizes and buy — but both are kept so commerce can be
reattached without re-running the export.

### `description`

Raw HTML, injected with `dangerouslySetInnerHTML`. It is **authored copy from a
static file, never user input**, which is the only reason that is acceptable
here. If this file ever becomes writable by anyone but a developer, sanitise it
or move to a structured format.

Only `<ul>`, `<li>`, `<p>`, `<span>` and `<br>` appear in practice. The `<li>`
items are authored in caps (spec lines); the `<p>` copy is sentence case.

> Worth knowing: the app's global reset applies `text-transform: uppercase` with
> the universal selector, which hits those inline `<span>`s **directly**. A
> `text-transform: none` on the `<p>` alone does not reach them — inheritance
> loses to a direct match. `Description.module.scss` names the descendants
> explicitly for this reason. Removing that rule silently uppercases all body copy.

### `collections`

Keyed by section — `mns` or `wmns` — which is the `[section]` route segment.
Each holds up to three image types:

| Type | Shape | Used by |
|---|---|---|
| `main` | `{ desktop: Image[], mobile: Image[] }` | the gallery — 4 slides each |
| `preview` | `{ desktop: Image \| null, mobile: Image \| null }` | a collection/index page (not built) |
| `cart` | `{ desktop: Image \| null, mobile: Image \| null }` | a basket page (not built) |

`main` is always an **array** in slide order. `preview` and `cart` collapse to a
**single object or `null`**, since only one ever applies. A viewport key may be
absent entirely — `cart` frequently only has `desktop`.

Only `main` is read today. `getGallery()` falls back from `mobile` to `desktop`
when a mobile set is missing.

### An image

```jsonc
{
  "src":   "/profiles/iki-sweat-1_mns-main-desktop.5e267408.jpg",
  "webp":  "/profiles/iki-sweat-1_mns-main-desktop.56f4a774.webp", // or null
  "width": 1920,
  "height": 1080
}
```

`src` is the jpg/png fallback, `webp` the modern sibling, rendered as a
`<picture>` with a `<source>`. `webp` is `null` when no webp shipped; `src`
falls back to the webp if *that* is the only format present, so `src` is always
usable on its own.

Paths are public-relative — the files live in `public/profiles/` (65 files,
~11 MB) and are served statically.

The filenames still carry the original encoding
`<name>_<section>-<type>-<viewport>.<hash>.<ext>`, which is what the export
parsed to build `collections`. The hashes are the original site's; they mean
nothing here and are kept only so files stay one-to-one with the source.

## Missing assets

The source was mirrored incompletely, so 9 referenced images had no file on disk
and were dropped rather than emitted as dead paths:

- All `iki_*` variants except `wmns-cart-desktop` — hence the near-empty
  `accessory.images`.
- The `tee-alone*-cart-mobile` crops.

**No `main` image is affected** — all four gallery slides exist for both entries
in both sections, at both viewports. The gaps are confined to `preview` and
`cart`, neither of which has a page yet.

## Regenerating

There is no committed generator — the export was a one-off against
`../newkiko/frontend/src/stubs/productsAll.js` and `../newkiko/assets/`. To redo
it you would re-parse that stub, group images by the filename encoding above,
resolve each against the assets directory (preferring an exact stem match, then
any extension), and copy the survivors into `public/profiles/`.

If a real backend arrives, replace the accessors in `lib/profiles.ts` and delete
this file; nothing else imports it.
