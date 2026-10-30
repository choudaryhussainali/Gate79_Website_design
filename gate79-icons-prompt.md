# Gate79 website: premium icon system (Claude Code prompt)

Paste everything below the line into Claude Code, opened in `D:\Clients\Gate79\Website deign`. Run it after the pre-launch fix prompt, or in the same session.

---

# BRIEF: replace every icon on the site with one bespoke, premium Gate79 icon system

## 0. What is wrong today (measured in the current build)

1. **Most icons on the six service pages are blank.**
   - The sprite on those pages defines ids like `icon-check`, `icon-chart` and `icon-plus`.
   - The markup references `#i-check`, `#i-chart` and `#i-plus`.
   - So every `<use>` there points at nothing. That is why the benefit strip, the "What's included" list, the FAQ toggles, the stars, the arrows and the footer socials show empty circles.
   - The same mismatch hits contact.html (box, flag, image, megaphone, shield, tag), article.html (flag, shield), privacy.html and terms.html (arrows, socials), and services.html (arrow-up).
2. **Each page carries its own hand-copied sprite.** The sprites have drifted apart: index has 34 symbols, the service pages have 25 with different ids.
3. **The set is too small and generic (28 icons), so meanings are forced.**
   - `i-flag` is used 57 times and `i-shield` 44 times for unrelated ideas.
   - "Senior specialists only" uses a chart icon.
   - "Ambitious" uses an arrow.
   - The six services use stock pictograms (megaphone, tag, image, box, shield, flag) that look like a free UI kit.
4. **Strokes and containers are inconsistent.**
   - Check is drawn at 2px and everything else at 1.5px.
   - Icons sit in mixed containers: Stone circles, White circles and empty discs.
   - There is no duotone, depth or brand signature.
5. **`p-bottle`, `p-box`, `p-pouch`, `p-lamp`, `p-dumbbell` and `p-jar` are dead.** They are product silhouettes left over from the coded visuals, and nothing uses them now.

Goal: one sprite, drawn to one specification, with an icon for every meaning. It should look like it came from a design studio, sit naturally beside Archivo and Geist, and show the Gate79 brand in a quiet way.

## 1. Rules

- Inline SVG only. No icon fonts, emoji, PNG icons or CDN icon scripts. The site must still work from `file://`.
- Brand colours only:
  - Black `#020101` and Carbon `#111416` for strokes on light grounds.
  - Ice `#95C3CF` as the accent.
  - Ice Deep `#4F8A9A` for small accents on White or Stone.
  - White on dark grounds.
  - No gradients, glows, drop shadows or filters inside icons.
- Text and icons on Ice are always Black. The icon accent on Ice grounds becomes White, never Ice on Ice.
- No Amazon logos, smile arrows or anything that looks like an Amazon glyph.
- Base geometry may start from **Lucide** (ISC licence) or **Phosphor** (MIT). Every icon must be redrawn or adjusted to the spec in section 2, so the set reads as Gate79's own. Record the source and licence in `assets/icons/LICENSES.md`.

## 2. The drawing specification (every icon must follow it)

| Property | Value |
|---|---|
| Canvas | `viewBox="0 0 24 24"`; live area 20×20 (2px padding) |
| Keyline shapes | circle Ø20, square 18×18, portrait rectangle 16×20, landscape rectangle 20×16. Optical sizing: circles slightly larger than squares. |
| Stroke | `1.5` at 24px, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"`. One weight for every icon, including the check. |
| Corners | outer corners radius 2; inner corners radius 1; no sharp 90° outer corners |
| Angles | 0°, 45° or 90° only (except circles and the star) |
| Detail | at most 3 to 4 strokes of internal detail. Each icon must read clearly at 16px. Nothing thinner than the stroke, and no gaps under 2px. |
| Pixel fit | all straight strokes on the 0.75 / 0.25 half-pixel grid so they stay crisp at 1× |
| Duotone accent | Each content icon (not UI arrows or chevrons) has **one** secondary filled shape with `class="ia"` (icon accent). It is a small plane behind or inside the line drawing, taking about 15–25% of the live area, offset so the stroke stays readable. In CSS, `.ia { fill: var(--icon-accent); stroke: none; }`. |
| Brand signature | Where an icon contains a rectangle or panel, use the **gate notch**: a 2px-radius arch cut into the top edge, echoing the Gate79 mark. Use it on about 6 to 8 icons only (audit, store, report, roadmap, launch, account, the "79" badge). It should be a detail people notice the second time, not a gimmick. |
| Stroke scaling | Use CSS `--icon-stroke`: 1.5 at 20–24px, 1.25 at 32px, 1.1 at 40–48px, so large icons don't look heavy. Set it with `stroke-width: var(--icon-stroke)` on the `<svg>`. Symbols use `stroke-width="inherit"` or no stroke-width at all, so the CSS value applies. |

Each symbol is written like this:
```html
<symbol id="i-audit" viewBox="0 0 24 24">
  <path class="ia" d="…"/>                     <!-- accent plane, filled -->
  <path d="…"/>                                <!-- line drawing, stroked -->
</symbol>
```
With these defaults:
```css
.icon { inline-size: var(--icon-size, 24px); block-size: var(--icon-size, 24px); flex: none;
        fill: none; stroke: currentColor; stroke-width: var(--icon-stroke, 1.5);
        stroke-linecap: round; stroke-linejoin: round; }
.icon .ia { fill: var(--icon-accent, var(--ice)); stroke: none; }
.icon--sm { --icon-size: 16px; } .icon--md { --icon-size: 20px; }
.icon--lg { --icon-size: 32px; --icon-stroke: 1.25; } .icon--xl { --icon-size: 40px; --icon-stroke: 1.1; }
.icon--solid .ia { fill: currentColor; }      /* stars, play */
```
Accent by ground: on White and Stone, `--icon-accent: var(--ice)`. On Black and Carbon, `--icon-accent: rgba(149,195,207,.28)` with a White stroke. On Ice, `--icon-accent: var(--white)` with a Black stroke. In a pressed or active state, the accent becomes Ice Deep.

## 3. One sprite, one source

- Create `assets/icons/src/<name>.svg`, one file per icon, already drawn to section 2.
- Create `tools/build-icons.mjs` (Node, dev-only, no dependencies). It should:
  1. Read `src/*.svg`, strip the width and height, and check that each icon has `viewBox="0 0 24 24"`, has no inline colours, and has at most one `.ia` element.
  2. Write `assets/icons/sprite.svg` (for reference).
  3. Inject the **identical** sprite into every HTML page, between `<!-- ICONS:START -->` and `<!-- ICONS:END -->`, immediately after `<body>`, as `<svg width="0" height="0" style="position:absolute" aria-hidden="true">…</svg>`. Remove the old per-page sprites.
  4. Fail the build if any page references an id that is not in the sprite, or if any sprite id is unused across the site.
- Every `<use>` uses `href="#i-name"`. Delete every `icon-*` id and the dead `p-*` symbols.
- Add a `README` line on how to add an icon: draw to spec, drop it in `src/`, run `node tools/build-icons.mjs`.

## 4. The icon set (about 56 icons, each with one meaning)

### 4.1 The six signature service icons (bespoke, the most important)

These appear on service cards, the services page section tiles, the mobile menu, the footer service list (at 16px, optional) and each service page hero pill. Draw them as a family that shares one construction: the same outer keyline square with radius 4, the accent plane in the same position (lower-left quadrant), and the gate notch on top.

| id | Service | Concept (draw this, not a megaphone/tag/box) |
|---|---|---|
| `i-svc-ads` | Amazon advertising | A target ring (two concentric arcs, open at the top-right) with an upward-right arrow leaving it. The accent fills the inner circle. Reads as "spend that hits and climbs". |
| `i-svc-listing` | Listing optimisation | A product-page card: a small image square top-left, three text lines, with a magnifier lens overlapping the lower-right corner. The accent fills the image square. |
| `i-svc-creative` | Creative & A+ Content | A camera aperture (6 blades, simplified to 3 visible strokes) inside a rounded frame with one corner crop mark. The accent is a blade segment. |
| `i-svc-account` | Account management | A stacked-boxes stack (2 boxes) with a heartbeat or pulse line running across the front. The accent fills the lower box face. Reads as "operations in health". |
| `i-svc-brand` | Brand Store & Registry | A storefront arch (the gate notch as the doorway) with a small shield-check badge at the lower-right. The accent fills the doorway. |
| `i-svc-launch` | Launch & expansion | A globe outline with a single meridian and one curved route line ending in a pin. The accent fills the pin head. |

### 4.2 Content and value icons (replace the forced meanings)

| id | Use it for | Drawing |
|---|---|---|
| `i-audit` | growth audit, "Audit" step, audit-covers list | Clipboard with gate notch, check plus 2 lines; accent on the clip |
| `i-plan` | "Plan", dated plans, 90-day plan | Calendar sheet with a route line between two dots; accent on the header band |
| `i-run` | "Run", weekly execution | Two gears (one large, one small) partly overlapping; accent fills the small gear centre |
| `i-report` | monthly report, "Reports people read" | Document with gate notch, a 3-bar mini chart inside; accent on the tallest bar |
| `i-tacos` | TACoS band, efficiency | Gauge (half arc) with needle and a band segment; accent on the band |
| `i-growth` | sales lift, ambitious, scale | Rising line with 3 nodes ending in an arrow head; accent plane under the line (area) |
| `i-margin` | margin-led bids, contribution | Coin stack (2 coins) with a percentage mark; accent on the top coin face |
| `i-harvest` | search-term harvesting | Funnel with 3 dots entering and 1 leaving; accent fills the funnel neck |
| `i-keyword` | keyword maps, term research | Magnifier containing a text cursor `|` and two short lines; accent fills the lens |
| `i-test` | live-page testing, A/B, MYE | Split square (A | B) with a small check on B; accent fills half B |
| `i-image-order` | gallery order, main images | Three stacked frames fanned slightly, the front one with a mountain glyph; accent on the front frame |
| `i-copy` | titles, bullets, house copy | Pen nib over two text lines; accent fills the nib slit area |
| `i-forecast` | demand forecasting, lead times | Bar chart with a dotted projection line; accent on the projected bar |
| `i-inventory` | stock, reorder points | Shelf unit with 2 boxes and a level line; accent fills one box |
| `i-health` | account health, daily checks | Shield with a pulse line inside; accent fills the lower half of the shield |
| `i-watch` | hijacker watch, monitoring | Eye with a small alert dot; accent fills the iris |
| `i-recover` | fee recovery, reimbursements | Circular arrow around a pound sign; accent fills the circle segment |
| `i-registry` | Brand Registry | Badge rosette with check; accent fills the rosette centre |
| `i-store` | Brand Store pages | Browser window with gate-notch header and 3 tiles; accent on one tile |
| `i-review` | reviews, Vine, review-mined | Speech bubble with a small star inside; accent fills the bubble tail area |
| `i-video` | product video | Rounded frame with play triangle; accent fills the triangle |
| `i-localise` | EU research, localisation | Speech bubble pair with "A" and "文"-free alternative: two bubbles with different line patterns (no real script glyphs); accent fills one bubble |
| `i-compliance` | VAT, compliance readiness | Document with a stamp circle at the lower right; accent fills the stamp |
| `i-handover` | handover playbook | Two arrows exchanging around a document; accent on the document |
| `i-senior` | senior specialists, the people | Single person bust with a small star/chevron rank on the shoulder; accent fills the bust |
| `i-team` | one team, whole channel | Three overlapping busts; accent fills the middle |
| `i-independent` | independent of Amazon | Open padlock-free alternative: a key inside a circle; accent fills the key bow |
| `i-transparent` | open, flat fees published | Price tag with an eye cut-out; accent fills the tag |
| `i-precise` | precise, data-led | Crosshair with a centre dot; accent fills the centre |
| `i-fast` | fast, responsive, reply time | Stopwatch with a tick at 2 o'clock; accent fills a quarter-wedge |
| `i-accountable` | accountable, signed-off targets | Handshake-free: a signed document with a pen line signature and check; accent on the signature area |
| `i-assured` | assured, safe | Shield with check (the one generic shield, used only here); accent fills the shield |
| `i-channel` | whole-channel view | Four connected nodes in a square loop; accent fills one node |
| `i-79` | 79-point standard, scored | Rounded square with gate notch containing "79" drawn as strokes (not text); accent fills the square |

Map **every** current icon slot to the closest id above. Use these examples: "Senior specialists only" → `i-senior`, "Data-led, always" → `i-precise`, "Ambitious" → `i-growth`, "Daily hijacker watch" → `i-watch`, "Fee recovery monthly" → `i-recover`, "Plans, not promises" → `i-plan`, "Independent" → `i-independent`. Within one strip or grid, no two items share an icon. Write the full slot → id table into `assets/icons/MAP.md` so it can be reviewed.

### 4.3 Contact and utility

`i-mail`, `i-phone`, `i-pin`, `i-clock`, `i-calendar`, `i-search`, `i-filter`, `i-download`, `i-external`. All are line icons with an accent.

### 4.4 UI icons (no accent, pure line, extra-careful optical tuning)

| id | Spec |
|---|---|
| `i-arrow-right` | 14px shaft, head of two 5px strokes at 45°. Used in buttons at 16px. |
| `i-arrow-up-right` | the same construction at 45°, for card corners and external links |
| `i-arrow-up` | back-to-top |
| `i-chevron-down`, `i-chevron-right` | 6px arms, for the nav caret and breadcrumbs |
| `i-plus-minus` | **one** symbol with two paths: a horizontal bar and a vertical bar (`class="pm-v"`). The FAQ and accordion rotate `.pm-v` 90° and fade it out when open, so the plus becomes a minus. |
| `i-check` | 1.5 stroke like everything else. For tick lists, use the 20px tick inside a 24px Ice circle (Black stroke). |
| `i-cross` | for "Where we'd say wait" and errors |
| `i-menu` / `i-close` | burger (2 lines, unequal: 18px and 12px, right-aligned, a premium detail) and close |
| `i-play` | solid, rounded-corner triangle, optically shifted 1px right |
| `i-star`, `i-star-half` | solid, with rounded points (radius 1) |
| `i-quote` | a custom heavy quote mark for testimonials, solid Ice |
| `i-grip` | before/after slider handle: two vertical chevrons |

### 4.5 Social

`i-linkedin`, `i-instagram`, `i-x`. These are simplified monochrome glyphs drawn to the same canvas and optical size, with no accent. Use them only in the footer and contact page, at 20px inside a 44px circle.

## 5. Containers: one system, used everywhere

Add these to components.css and replace every ad-hoc wrapper (`trust__icon`, `proof__icon`, `value-card__icon`, `svc-card__badge`, `icon-tile`, `tick` and so on) with these, keeping the old class names only as aliases if that's easier:

| Class | Size / shape | On White | On Stone | On Ice | On Black |
|---|---|---|---|---|---|
| `.ico` (bare) | icon only | Carbon stroke, Ice accent | Carbon, Ice | Black, White | White, Ice 28% |
| `.ico-tile` | 48×48, radius 14, icon 24 | Stone fill, 1px Line-10% border | White fill | White fill | Carbon fill, 1px Line border |
| `.ico-tile--lg` | 64×64, radius 18, icon 32 (stroke 1.25) | used for the six service tiles and value cards | | | |
| `.ico-badge` | 44px circle, White, shadow token, icon 20 | overlapping card media (service cards) | | | |
| `.ico-tick` | 24px circle, Ice fill, Black check 16 | tick lists everywhere | White fill on Ice grounds | | Ice fill, Black check |
| `.ico-btn` | 44×44 circle, 1px border, icon 20 | social, slider arrows, back-to-top, card arrows | | | |

Details:
- The icon is optically centred, not just geometrically: the play icon moves 1px right and arrows sit on the centre line.
- **Inside a tile, the icon's accent plane must not touch the tile edge.**
- On each ground, a tile has 3:1 contrast against its surroundings (a border, or a fill different from the ground).

## 6. Motion (subtle, premium, optional for the user)

Pointer devices only. Nothing at all under `prefers-reduced-motion`.

- **Buttons and text links:** the arrow moves 3px on hover over 180ms with `cubic-bezier(.2,.7,.2,1)`.
- **Card corner arrow (`i-arrow-up-right`):** moves 2px up and 2px right, and its `.ico-btn` fills Black with a White stroke.
- **Service tiles on card hover:** the accent plane slides 1px and its opacity goes from .85 to 1. The tile border turns Ice Deep. No rotation, bounce or scale above 1.04.
- **Tick lists on reveal:** the check strokes draw in using `stroke-dasharray`, staggered 40ms, played once.
- **FAQ:** the plus turns into a minus (section 4.4) over 200ms.
- **Stars:** static. No sparkle or shimmer anywhere.

## 7. Placement fixes found in the review

- **Service cards (home, services.html, "Other services"):** use the `.ico-badge` with the matching `i-svc-*`, overlapping the image's bottom-left by 50%, fully visible (today it's cut under the image).
- **services.html section heads:** `.ico-tile--lg` with `i-svc-*` to the left of the eyebrow and H2, top-aligned with the eyebrow.
- **Service page benefit strips, "What's included" lists, the contact "audit covers" list, about "Six reasons" and value cards:** `.ico-tile` with the mapped content icons. No empty circles may remain.
- **Tick lists:** `.ico-tick`. Cross lists ("Where we'd say wait", "The usual agency"): a 24px Stone circle with `i-cross` in Graphite.
- **Process steps:** add the `i-audit`, `i-plan`, `i-run` and `i-report` tiles next to the step number badge.
- **Fit check:** the empty black disc between the cards becomes an `.ico-btn` with a Black fill and `i-arrow-right`, or is removed.
- **Mobile menu:** each service link starts with its `i-svc-*` at 20px inside a 36px Stone tile.
- **Testimonials:** `i-quote` at 40px in Ice on the featured card. Stars at 16px in Ice Deep, with a 2px gap.
- **Header:** `i-menu` / `i-close` for the burger, swapped with a 200ms crossfade. Nav caret `i-chevron-down` at 16px, rotating 180° when open.
- **Footer:** socials in `.ico-btn` (border Line, White stroke; hover fills Ice with a Black stroke). Back-to-top in an `.ico-btn` with `i-arrow-up`.
- **Pricing table:** included = `.ico-tick` at small size (20px); not included = the text "Not included" in Graphite (keep it as text for clarity).

## 8. Accessibility

- Decorative icons get `aria-hidden="true"` and `focusable="false"`. Icon-only controls get an `aria-label` on the control, not the SVG.
- Icons never carry meaning alone. Every icon sits beside a text label, except social, menu and close, which have labels.
- Hit areas are at least 44×44 on every icon-only control.
- Stroke colour contrast against its container is at least 3:1 (check Ice Deep on Stone; use Carbon if it fails).

## 9. Deliver and verify

1. Build `qa/icons.html` (dev-only, not linked from the site). It is a specimen sheet showing every icon at 16, 20, 24, 32 and 48px, on all four grounds (White, Stone, Ice, Black), plus each container variant, with the id under each. Screenshot it at 2× to `qa/shots/icons.png` and **look at it yourself**. Redraw any icon that:
   - is blurry at 16px,
   - looks heavier or lighter than its neighbours,
   - has an accent that touches the stroke awkwardly,
   - or reads as a different idea than its label.
2. Run `node tools/build-icons.mjs`. It must report 0 missing ids, 0 unused ids, and the same sprite hash on all 19 pages.
3. Grep for zero `icon-` ids, `p-` symbols, `<use href="#` targets missing from the sprite, `fill="#`, `stroke="#` and `linear-gradient` inside SVGs.
4. Screenshot every page at 1366 and 390 (smooth scroll off, scroll to the bottom). Confirm:
   - [ ] no empty icon circles anywhere, including all six service pages, contact, article, privacy and terms;
   - [ ] no two items in the same strip or grid share an icon;
   - [ ] the six service icons look like one family and appear identically everywhere that service is named;
   - [ ] the FAQ plus turns into a minus, the menu icon swaps, and the arrows move on hover;
   - [ ] the icons look crisp at 1× and 2× (also check at 125% Windows scaling: 1708px viewport at DPR 1.25).
5. Output only the changed-file list, `assets/icons/MAP.md`, the path to the specimen screenshot, and any blockers.
