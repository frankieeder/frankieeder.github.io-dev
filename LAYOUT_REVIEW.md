# Layout Architecture Review

Branch: `new-layout` → `frankieeder-com/new-layout`

---

## Summary

The new layout introduces a flexbox tile grid backed by Mustache partials and a flattened multi-photo card model. The core composition idea is sound: each `.content` tile is a self-contained card whose text metadata is visually hidden in the DOM and surfaced only inside the lightbox. The multi-photo flattening in `flattenMultiPhotoCards` (`render.js:25`) is clever and avoids duplicating content rows. However, video lightbox support is completely broken (`openVideoLightBox` calls `.src` and `.style.display` on null, since `lightbox-video-container` is commented out in `index.html`). At 197 individual `<img>` elements rendered eagerly with no lazy loading, page weight will be heavy on photo-dense filters. Those two issues aside, this is **ship with tweaks** — the structural decisions are worth keeping.

---

## Strengths

- **Tile flattening is correct.** `flattenMultiPhotoCards` (`render.js:25–82`) splits multi-photo scrollboxes into individual tiles at render time without altering the source data, preserving a single canonical entry in `content.js`.
- **Partial hierarchy is shallow.** `contents.mustache` delegates to nine partials; each partial is focused on one media type. Adding a new embed type is a two-file change (new partial + one `{{#type_x}}` block in `contents.mustache`).
- **Metadata hidden-but-present pattern.** Text elements rendered with `.content-text-element` (CSS: `position:absolute; clip`) are invisible on the card but DOM-queryable for `populateLightboxText`. Clean separation of tile and lightbox concerns.
- **Background video + nav integration.** `pauseBackgroundVideo` / `playBackgroundVideo` wrap the Vimeo Player API correctly. Nav and Vimeo background from `main` are not touched.
- **`constrainVideoHeights`.** Dynamically caps video tiles at 300 px and recalculates width from aspect ratio, preventing oversized video tiles breaking the flex row.
- **BUY PRINT dropdown.** The dropdown hover/click toggle logic (`render.js:362–440`) landed cleanly in the lightbox; CSS positions it above the button correctly.
- **`_lq` / `_thumb` suffix convention.** Consistent naming lets `image.mustache` swap between thumbnail and full-resolution paths with a single string replace.

---

## Concerns

### P0 — Blocking

**Video lightbox crashes on open** (`render.js:510–513`, `index.html:102–104`)

`openVideoLightBox` does:
```
videoContainer.style.display = 'block';
lightboxVideo.src = autoplayUrl;
```
Both `videoContainer` and `lightboxVideo` are retrieved via `getElementById("lightbox-video-container")` and `getElementById("lightbox-video")`, which are commented out in `index.html`. Both references are null; accessing `.style` and `.src` throws a TypeError and the lightbox never opens. Every Vimeo and YouTube tile on the site is broken for click-to-expand. The video container block in `index.html` must be uncommented (or recreated) for this to work. Note: PR #16 (BUY PRINT) also references these IDs — the S1 worker extracting this branch should uncomment the container block first.

**Image alt text is always `"pic"`** (`image.mustache:4–5`)

Both the thumb and full-resolution `<img>` tags render `alt="pic"` unconditionally. Screen readers announce every photo tile as "pic". The `caption` field already exists in some `scrollcontent` entries (`content.js:554–558`) and could be plumbed through. This is not a minor cosmetic issue — it fails WCAG 1.1.1 for a portfolio site where images are the primary content.

---

### P1 — Should fix soon

**No keyboard path into or out of the lightbox** (`render.js`, `index.html`)

Tiles open via `onclick="openLightBox(this, ...)"` on an `<a>` tag. The `<a>` has no `href`, so it is not in the tab order unless given `tabindex="0"`. The close button is a `<span>` (`index.html:99`), also not focusable. No `keydown` listener handles Escape to close. Users who navigate by keyboard cannot open or close the lightbox at all.

**No `aria-modal` or focus trap on lightbox** (`index.html:98`)

When the lightbox opens, focus stays behind it. A screen reader user tabbing forward will reach tiles underneath rather than the lightbox controls. The lightbox `<div>` has no `role="dialog"` or `aria-modal="true"`. Focus should move to the close button on open and return to the triggering element on close.

**Mobile breakpoint is a single blunt reset** (`stylesheet.css:880–898`)

One `@media (max-width: 768px)` block forces `flex-direction: column`. There is nothing at 768–1280 px (the tablet range). Cards that rely on `width: fit-content` at desktop may render unexpectedly wide or narrow in portrait tablet. The `column-gap: 7.5px` applied in the mobile breakpoint has no effect because `flex-direction` is column there; the value is dead.

**`openLightBox` path-derives the high-res URL from thumb URL** (`render.js:344`)

```
var im_path = img_elem.firstElementChild.src.replace('_thumb', '');
```
This string replace is correct when the image is a thumbnail, but if a tile renders the `_lq` (low-quality) version via the `{{^type_photo_scrollbox}}` branch in `image.mustache`, clicking it will attempt to load `…_lq.jpg` directly in the lightbox (no `_thumb` to replace), which may be the correct file or may differ from the intended full-res path. Needs an explicit high-res field or a consistent naming convention enforced.

**`vimeo_embed.mustache` passes `thumbnail` flag through two branches inconsistently**

In `thumbnail` mode the template renders only a `data-vimeo-id` div with no iframe. `prepVimeoThumbnails` (`render.js:670`) expects these to be inside `.thumbnails div` elements. But `contents.mustache` applies `.thumbnails.thumbsmall` only when `{{#thumbnail}}` is set on the scrollbox row, not on individual Vimeo items — coupling the scrollbox wrapper style to the Vimeo partial's internal branching in a non-obvious way.

**10 sequential template fetches block render** (`render.js:194–208`)

`getTemplates()` issues 10 `fetch()` calls, all waited on with `Promise.all`. Modern browsers parallelise these, but on a slow connection or over HTTP/1.1 they queue. Templates are static and cache-busted only by `Date.now()`, meaning every page navigation re-fetches all 10 files. Bundling partials into a single JSON or inlining them would eliminate this.

---

### P2 — Follow-up

**`!important` overuse** (`stylesheet.css:196–205, 390, 882–895`)

Eight `!important` declarations on `#contents` and `.content` suggest the rules are fighting a pre-existing specificity baseline. This will make future overrides difficult without stacking more `!important`.

**`content.js` mixes `rows` as array and as object** (`content.js:16` vs `content.js:18`)

Most entries use `rows: [...]` (array), but the newsletter entry uses `rows: {...}` (plain object). Mustache iterates both, but it is an inconsistency that will silently fail if any code ever counts rows or maps over them.

**Commented-out dead code in `render.js`** (`render.js:730–810`)

~80 lines of commented-out `styleVimeoEmbeds` and old `prepVimeoThumbnails` logic. No functional impact but increases maintenance surface.

**`border-right` separator on `.content` tiles** (`stylesheet.css:402–404`)

Each tile has `border-right: 15px solid rgba(255,255,255,0.4)`. The last tile and any tile in a multi-photo group that is not the last item remove the border via separate rules. This logic is repeated in three separate selectors and would break if tile grouping logic changes.

**No intermediate breakpoint for 1280–1920 px** (`stylesheet.css`)

Wide monitors above ~1600 px will render tiles at their natural `fit-content` widths with no maximum column count. Large photo tiles may dominate the row, leaving a single card per visual row at 1920 px even in multi-card views.

**`thumbnail` mode is nearly unused** (`content.js:2196`)

The `thumbnail: true` Vimeo flag appears only once and is commented out. If this feature is not intended to be used going forward, the `{{#thumbnail}}` branches in `vimeo_embed.mustache` and the related `.thumbnails` / `.thumbsmall` CSS classes are dead weight.

---

## Recommendations

Each item below is small enough to be its own PR.

1. **Uncomment `lightbox-video-container` in `index.html`.** One line change. Unblocks all video lightboxes. Do this before the S1 extract PR merges; otherwise the S1 worker will need to recover the block from git history. (`index.html:102–104`)

2. **Add `tabindex="0"`, `role="button"`, and Escape key handler to lightbox.** In `image.mustache`, change `<a onclick=...>` to include `tabindex="0" role="button"`. In `render.js`, add a `document.addEventListener('keydown', ...)` that calls `closeLightBox()` on Escape and moves focus to the close button on open. This fixes P0 accessibility and P1 keyboard nav in one small PR.

3. **Add a real `alt` text field to `image.mustache` and `photo_scrollbox.mustache`.** Plumb `caption` (already present on some `scrollcontent` items) as the `alt` attribute. Fall back to `title` from the parent card via a new optional `alt` field in the data. Fixes WCAG 1.1.1.

4. **Add a 768–1280 px tablet breakpoint.** A few lines of CSS capping `.content` at a reasonable max-width (e.g. `calc(50% - 20px)`) for tablet widths would prevent the tile row from collapsing to one column too early or stretching too wide.

5. **Bundle mustache templates.** Serve all partials as a single JSON file (`static/templates/partials.json`) fetched once. Eliminates 9 of 10 fetch round-trips and makes cache busting trivial. One version query param on the JSON covers all templates.

6. **Consolidate tile separator logic.** Replace the three-selector border-right pattern with a CSS `gap` on the flex container and a `.content + .content` rule, or use a pseudo-element. Removes the multi-photo group class dependency from the separator style.

---

## Open Questions

- **Video lightbox centering** — PR S2 is described as addressing video lightbox centering. Is the commented-out `lightbox-video-container` intentional pending that PR, or accidental? The S1 worker needs to know whether to uncomment it or defer to S2.

- **Thumbnail Vimeo tiles** — Is the `thumbnail: true` Vimeo path intended to ship? If not, the `{{#thumbnail}}` branches and `.thumbnails` CSS can be deleted. If yes, it needs a working example in `content.js`.

- **`width: fit-content` on `.content` at desktop** — Tiles size to their content. Wide landscape photos will be wider than portrait photos in the same row. Is the intended design a masonry-like variable-width row, or should tiles have a fixed max-width? This affects whether the tablet breakpoint recommendation above is a fix or a design change.

- **`ext` field defaulting** — `image.mustache` defaults missing `ext` to `jpeg` (`{{^ext}}jpeg{{/ext}}`). Most entries in `content.js` omit `ext` and rely on this default. Is `jpeg` the canonical extension for all images without an explicit `ext`, or is `jpg` more common on disk? A mismatch causes 404s silently.
