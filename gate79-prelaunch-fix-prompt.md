# Gate79 website: pre-launch fix prompt (Claude Code)

Paste everything below the line into Claude Code, opened in `D:\Clients\Gate79\Website deign`.

This brief comes from a full review of the current build: 19 pages, automated checks at 320, 360, 390, 768, 1024, 1280, 1366 and 1920px, and 57 full-page screenshots compared against `D:\website references`. Every issue below was seen in a screenshot or measured by a script. Root causes are named where they were found, so fix the cause, not the symptom.

---

# BRIEF: make every page launch-ready, pixel-aligned and fully responsive

## 0. Rules for this run

- Stack stays as it is: plain HTML5, CSS3 (`@layer`, tokens.css / base.css / layout.css / components.css / pages.css), one deferred `assets/js/main.js`. No frameworks, no build step, and the site must still open from `file://`.
- Brand rules are fixed:
  - Colours: Ice `#95C3CF`, Black `#020101`, Stone `#E6E4E0`, White. Support colours: Graphite `#5B6168`, Ice Deep `#4F8A9A`, Carbon `#111416`, Line `#2A2F34`.
  - Text on Ice is always Black.
  - No gradients, blurs, glows or filters. Only the one existing shadow token.
  - Fonts: Archivo (stretch 112%) for headlines, Geist for body and UI, Geist Mono for numbers and labels.
  - The client logo PNGs are used exactly as supplied. Never redraw, recolour or crop them, and never place them on Ice.
  - The primary CTA everywhere is "Book a growth audit". No Amazon logos and no orange.
- Keep the current copy, section order and stock photos unless this brief says otherwise. Keep `SAMPLE` comments.
- Fix in the order of the sections below. Section 1 removes most of the visible breaks at once.
- Work until section 9 passes. Then output only the changed-file list and any blockers.

## 1. Global root-cause fixes (do these first)

### 1.1 Photo frames collapse or overflow: the biggest bug on the site

**Cause:** in `components.css` (around lines 1472–1478), `.ph` is `position:absolute; inset:0` inside media frames, but it also keeps `aspect-ratio: 16 / 10`. In Chromium, an absolutely positioned box with an aspect-ratio takes its height from the ratio rather than from the insets. Several parent frames (`.split__media` above all) also have no height of their own.

**Results:**
- On every service page and on about.html, the split images sit lower than their text and spill into the next section. Their "FIG." captions land on top of the next band.
- Team portraits fill only the top 60% of their 4:5 frame, which leaves an empty block of about 150px before the name.
- Process thumbnails on the home page show a Stone strip under the photo.

**Fix:**
- Every media frame owns its ratio, and the photo fills it:
  ```css
  .svc-card__media, .post-card__media, .feat-post__media, .case-row__media,
  .ba__layer, .article-cover, .vid-card__media { position: relative; overflow: hidden; }
  .svc-card__media, .post-card__media, .case-row__media { aspect-ratio: 16 / 10; }
  .step__media { aspect-ratio: 4 / 3; }
  .split__media { position: relative; aspect-ratio: 4 / 3; border-radius: 20px; overflow: hidden; }
  .team-card__media { position: relative; aspect-ratio: 4 / 5; border-radius: 16px; overflow: hidden; }
  .vid-card__media, .article-body figure .ph { aspect-ratio: 16 / 9; }
  /* inside a sized frame the .ph only fills */
  :is(.svc-card__media, .step__media, .case-row__media, .feat-post__media, .post-card__media,
      .team-card__media, .ba__layer, .split__media, .article-cover, .vid-card) > .ph {
    position: absolute; inset: 0; aspect-ratio: auto; inline-size: 100%; block-size: 100%;
  }
  ```
- Standalone `.ph`, where no parent frame exists, keeps `aspect-ratio: 16/10` in normal flow.
- Remove any fixed heights left over from the old `.viz` blocks.

### 1.2 Split sections stack into two rows on desktop

**Cause:** in `layout.css`, `.split > .split__copy` is placed on `grid-column: 1 / span 5` and `.split__media` on `7 / -1`. When the media comes first in the DOM (about.html "Who we are", the "Who it's for" splits, and the case-study challenge split), auto-placement pushes the copy onto row 2. You get the logo panel top-right and the text bottom-left with an empty quadrant.

**Fix:**
- Add `grid-row: 1` to both children at ≥ 960px.
- Align the columns to the top edge of the heading (`align-items: center` is fine once both share one row).
- Normalise the columns: copy `1 / span 5`, media `7 / -1`; flipped: media `1 / span 6`, copy `8 / -1`.
- Inside `.split__copy`, the gap between paragraphs is 16px (`mt-8` currently renders as a large gap). The heading-to-body gap is 20px.
- Below 960px the order is always heading, body, then media. Use `order` so mobile never opens with a photo above its heading.

### 1.3 Leftover "mock UI" labels on photos

All 108 `plate__head` / `plate__foot` / `plate-alert` blocks still sit on top of real photos. These are the labels from the old coded visuals ("Search terms · Week 32 / Auto", "Bids follow margin / Updated hourly", "Jan · Solid: ad-attributed sales · Jun", "Hijacker listing removed…"). On photos they read as fake UI and make every card look busy. Counts: index 19, services 18, insights 10, work 9, each service page 6, article 4, testimonials 3, case-study 1.

**Fix:**
- Delete every `.plate__head`, `.plate__foot` and `.plate-alert` inside `.ph`, plus their CSS.
- Keep only what carries real meaning, and restyle it as a single pill sitting on a solid plate:
  - Before/after badges: one "Before" or "After" pill per layer, top-left, 12px, Black plate with White text, or Ice plate with Black text.
  - Video duration: one Geist Mono pill, bottom-right.
  - Insight category: move it out of the image into the card body, where the date already sits.
  - Case-row result: no overlay. The metrics are already in the card.
- On split images, remove the "FIG. 0X" captions, or move them below the image as a 13px Graphite caption in normal flow.

### 1.4 Header and footer logo is blurry on every page

**Cause:** `assets/brand/gate79-horizontal-on-dark@80h.png` is actually 80×22px, but it is displayed at about 145×40.

**Fix:**
- Regenerate it from `gate79-horizontal-on-dark.png` (1676×468), scaled only, with no crop or edit:
  - `gate79-horizontal-on-dark@1x.png` at 144×40
  - `@2x` at 288×80
  - `@3x` at 432×120
- Markup:
  ```html
  <img class="brand__logo" src="assets/brand/gate79-horizontal-on-dark@1x.png"
       srcset="assets/brand/gate79-horizontal-on-dark@2x.png 2x, assets/brand/gate79-horizontal-on-dark@3x.png 3x"
       alt="Gate79" width="144" height="40">
  ```
- Sizes: header 40px tall on desktop and 32px below 768px. Footer 44px.
- Do the same for the footer logo, and for `-on-light` wherever it is used.
- Delete the broken `@80h` file and update every page (`../` paths in `/services/`).

### 1.5 Horizontal scroll and overflow

Measured `scrollWidth > innerWidth` on:

| Page | Width | Element | Fix |
|---|---|---|---|
| services.html | 320–1024 (up to 1064px wide at 1024) | `.jump__cap--start/--end` sit outside the scroller | Make the jump bar `overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none`. Remove the caps, or position them `inset-block:0` inside a `position:relative; overflow:hidden` wrapper. Add a 24px fade with a solid White pseudo-element at the right edge as the scroll hint (a solid block, no gradient), shown only when it overflows. At ≥ 1024 all six pills fit centred on one row. |
| index, listing-optimisation | 320 | `.stat-tile` | `min-inline-size:0` on grid children. Numbers use `font-size: clamp(28px, 9vw, 44px)`. Allow `overflow-wrap:anywhere` on labels. |
| amazon-advertising, account-management, creative | 320 | `.case-row__media` | Below 600px the case row is one column with media `inline-size:100%`, and the card no longer overlaps the image (`margin:0`). |
| creative-and-a-plus-content | 320 | `.versus__old/new` | Below 768px `.versus` is one column, with the round arrow badge turned 90° between the two cards. |
| work | 320 | `.case-row--panel` | Same as `.case-row__media`. Panel padding drops to 12px. |

Also add a dev-only guard, then remove it before handing over. Do **not** put `overflow-x:hidden` on `body` to hide these problems.

### 1.6 Text size and tap targets

- Nothing renders below 12px. Today `.float-chip__label`, chip spans, `.plate-alert` (11.5px) and some Geist Mono labels render at 10–11px. Mono eyebrows are 12px with letter-spacing .12em.
- Every interactive element is at least 44×44px on touch:
  - The consent checkbox on contact.html is 20×20. Make it a 24px box inside a 44px label hit area.
  - Footer social icons, filter pills, accordion buttons, slider dots and the back-to-top button also need the full hit area.
- Body text is never below 16px on mobile. Card body text is at least 15px.

### 1.7 Cookie bar covers content

At every width it sits on top of the hero, the marquee, the trust strip and the form headings.

**Fix:**
- Desktop: a compact bar fixed bottom-left, `max-inline-size: 380px`, 16px padding, text 14px, buttons 40px.
- Mobile: a full-width bottom sheet with 12px side gutters and a max height of 140px. "Accept" and "Settings" sit side by side.
- Show it 1.2s after load, never on top of an open menu. Add `padding-block-end` equal to its height on `body` while it is visible, so the last content can scroll clear.
- After a choice it never returns: store the consent in `localStorage` inside try/catch.

### 1.8 Reveal and lazy-load hardening

- Photos sometimes show as empty dark panels during fast scroll.
- Give every `.ph` a Stone (`--stone`) background, never Line or Carbon, so an image that hasn't loaded yet looks like a calm placeholder.
- Above-the-fold images use `loading="eager"`, and the first one gets `fetchpriority="high"`. Everything else stays lazy.
- Reveal observer: change to `{ rootMargin: '0px 0px 15% 0px', threshold: 0 }` so content is already visible as it enters the viewport.
- Add a fallback: if the `IntersectionObserver` callback hasn't fired within 1.5s of a section entering the viewport, add `.is-in`.
- Under `prefers-reduced-motion`, everything is visible immediately.

### 1.9 Weight and housekeeping

- Delete `assets/img/stock/raw/` (61 MB of unprocessed downloads). Keep `CREDITS.md` and update it if any file is renamed.
- CSS is 112 KB and the budget is 60 KB:
  - Delete every `.viz*`, `.plate*`, `.chart*` and `.float-chip` rule that is no longer used.
  - Remove duplicate blocks appended at the end of components.css and pages.css. For example, `.page-hero--split` is defined twice with different `align-items`, and `.ph` is defined twice. Merge them into one rule each.
  - Run a quick unused-selector check against all 19 HTML files.
- Photo reuse: `case-halcott` appears on 4 pages and several others appear 3 times. Allow at most 2 uses across the site and never 2 on the same page. Pull new photos from Unsplash or Pexels under the same rules as before, and log them in CREDITS.md.

## 2. Header and navigation

- Desktop:
  - 72px bar: logo left, nav centred, CTA right. Nav items are 15px with 32px gaps.
  - The active item gets a 2px Ice underline 6px below the text, the same width as the text.
  - The "About" dropdown caret is optically aligned with the text baseline.
- Sticky behaviour: after 80px of scroll, the bar shrinks to 60px with a solid Black background and the shadow token. No transparency or blur.
- Mobile (< 768px):
  - Logo (32px tall) and the burger only. Hide the header CTA pill below 480px, because it currently squeezes the logo to about 50px wide.
  - The menu opens as a full-screen Black sheet with 28px links, the CTA pill at the bottom, and focus trapped inside. It closes on Escape and on link tap.
- Breadcrumb: Geist Mono 12px, `HOME / SERVICES / ADVERTISING`. Its left edge lines up with the H1 on split heroes, and it sits centred on centred heroes.

## 3. Home page (index.html)

1. **Hero: make it the million-dollar moment.**
   - Today at 1366 it is copy plus a small floating logo mark. The stats wrap onto two rows and no chips are visible. On mobile, a huge cropped "79" mark fills the bottom.
   - Rebuild it as a 12-column split, following the ecommsyte hero:
     - **Left (cols 1–7):**
       - Availability pill.
       - H1 "Grow on Amazon, on purpose." at `clamp(44px, 6.2vw, 88px)`, with "on purpose." in Ice.
       - Lede at 18px, max 52ch.
       - Two pill buttons.
       - Then a single-row stat strip of three items divided by 1px Line rules. Each item is a number in Geist Mono at 32px plus a 12px label. It never wraps at ≥ 1024. On mobile it becomes a 3-column grid with smaller numbers.
     - **Right (cols 8–12):** one tall 4:5 photo card with a 24px radius. Use a founder or operator at a desk with screens, cool light, from the stock set or a new Unsplash/Pexels photo. Two floating solid White chips overlap its edges (shadow token, 12px radius, 14px text):
       - "TACoS 14% → 9%" with a small Ice dot.
       - "Buy Box 97%".
       - An Ice square badge with "79" in Archivo sits on the top-left corner.
   - Remove the big logo mark from the hero; the header already carries the logo.
   - Mobile order: pill, H1, lede, buttons, photo card (16:10, chips inside its bottom edge), stats.
   - Hero height is `min(100svh, 860px)` on desktop. The marquee must be visible above the fold at 1366×768.
2. **Marquee ribbon (Ice):** 20px Archivo, 64px tall, constant speed, paused under reduced motion. The duplicated track must loop seamlessly with no gap.
3. **Value strip (4 icon items):** icons sit in 40px Stone circles and are visibly drawn (some service pages show empty circles, see 4.2). Four columns at ≥ 1024, two at 600–1023, one below.
4. **Services grid:**
   - **Icon badge:** the badge is half-hidden under the image edge. Place it as a 44px White circle with the shadow token, overlapping the image's bottom-left by 50% (`inset-block-start: calc(var(--media-h) - 22px)`), with `z-index` above the media and `overflow: visible` on the card. Or move it inside the body above the title. Pick one and use it on every service card on the site.
   - **Tags:** show as Stone pills (12px, 28px tall) with an 8px gap. Right now they are unstyled text.
   - **"Explore service" link:** sits at the card bottom. Cards stretch to equal height with `display:flex; flex-direction:column` and `margin-block-start:auto` on the link.
   - **CTA card ("Not sure where to start?"):** the whole text is underlined because the card is an `<a>`. Set `text-decoration:none` on the card and add a hover underline only on the inner button text. Black card, title 24px White with "Start with the audit." in Ice, body 15px at 70% White, Ice pill button. Centre the content vertically and match the other cards' height.
5. **About + numbers ("A small senior team…"):** the three stat cards are about 140px wide, so their labels break to 1–2 words a line.
   - Desktop: the copy takes cols 1–6. The stats take cols 7–12 as a 3-row stack of wide White cards: the number on the left (Geist Mono 40px, Ice Deep), title and description on the right, and a 24px gap between number and text.
   - Close the big gap between paragraphs.
   - Mobile: the same cards at full width.
6. **Process ("From audit to a running plan"):**
   - Four step cards on one row at ≥ 1024, two by two at 600–1023, a vertical timeline below 600.
   - The step number badges are cut off at the top. Make them a 36px Ice circle with Black Geist Mono, inside the card padding.
   - The photo fills the 4:3 frame (fixed by 1.1).
   - Duration chip: a Stone pill below the text, left-aligned.
   - Remove the dashed timeline line on desktop. On mobile, keep it aligned to the centre of the number badges.
7. **Dashboard split ("The Gate79 way / One report every month"):**
   - The image is misaligned and its captions overflow into the next section.
   - Rebuild it as a clean 6/6 split: photo (4:3, 24px radius) with one floating White chip "Reporting · One report every month" over its top-left edge (fully inside the section), then the copy with a tick list and the two buttons.
   - Image and copy share one vertical centre.
8. **Versus ("The usual agency, and us"):**
   - Keep as is on desktop.
   - On mobile, the arrow badge points down. The two cards have equal padding (28px) and equal radius.
9. **Logo wall:** 5 columns at ≥ 1024, 3 at 600–1023, a 2-column grid below 600. No clipped tiles at the edges: it currently bleeds off both sides on mobile. Tiles are 88px tall with the wordmarks centred.
10. **Results band (Black):** the stat tiles share the same height and the numbers are aligned to the same baseline. Two columns on mobile, with numbers `clamp(28px, 8vw, 44px)` so "£18.4M" never overflows.
11. **Case tabs:**
    - The metric chips are cramped: use a 2×2 grid with 12px gaps, the number at 22px and the label at 12px.
    - Tabs scroll horizontally on mobile on one row (no wrapping to two rows).
    - The image sits beside the card at ≥ 960 (media cols 1–7, card cols 6–12 overlapping by one column, card vertically centred) and below the card on mobile.
12. **Testimonials:** the grid is centred, but the closing line "Brands we work with stay for the report." and the button are left-aligned. Centre both under the grid with 32px spacing. Stars are 16px Ice Deep.
13. **Team (home):** fixed by 1.1. Then the initials badge becomes a 40px White circle overlapping the photo's bottom-left corner (fully visible, not clipped by `overflow:hidden`; put it outside the media element). The name follows 28px below. The role is a fit-content Stone pill (it currently stretches full width). The bio is 14px Graphite.
14. **Insights preview, CTA card, footer:** keep. The footer's outlined "GATE79" wordmark is centred and never wider than the container.

## 4. Inner pages

### 4.1 services.html
- **Hero:** add the image the references use. Below the centred hero copy, show a 3-photo strip (16:10, 20px radius, 24px gaps) using three of the service photos. Or make it a split hero with one large photo. Pick the strip, matching the ecommsyte services page.
- **Jump bar:** see 1.5. It becomes sticky under the header (`top: 60px`) on desktop, and highlights the section currently in view.
- **Six service sections:** heading block with the 44px icon tile on the left of eyebrow + H2 + lede, aligned to the card grid's left edge. Three sub-service cards per section with equal heights and the "Get this service" pill at the bottom. Keep the alternating White / Stone / Ice grounds.

### 4.2 Six service pages (services/*.html)
- **Hero (Black, split):**
  - Copy cols 1–7; the "Ideal for / First 30 days / Pairs with" panel cols 9–12, vertically centred.
  - The "SERVICE 01" pill sits 16px below the breadcrumb, not touching it.
  - Hero padding is 120px top and 96px bottom on desktop.
- **Benefit strip:** the four circles are empty because the icons are missing. Add the matching line icons (24px, Ice Deep stroke 1.75) from the site sprite. Also remove the large empty gap under the strip: it is a reveal element or spacer that never shows, so delete the spacer or fix the reveal.
- **"What it is" / "Who it's for" splits:** fixed by 1.1 and 1.2. Each split section gets its own padding (`--section-y`), and no image overlaps the next band. "Who it's for" chips wrap on a left-aligned flex row under the copy (they currently float centred and away from the heading).
- **"What's included":** 2-column list at ≥ 768. Each item has a 32px Stone icon circle with a drawn check or icon (currently empty), a 16px semibold title and 15px body, with 28px row gaps. Separate the items with 1px Line rules, as on about.html "Six reasons".
- **"How we run it" (Ice):** four White step cards, already good. Make the cards equal height. The number badge is a Black-text Stone square.
- **"Fit check":**
  - The black circle between the two cards is an empty 56px disc. Either put a "vs" label or an arrow icon in it, or delete it and use a 32px gap.
  - The "Where we'd say wait" card should not use a dashed border. Use a 1px Line border with a 24px radius, to match the site's cards.
- **Metrics (Black):** keep.
- **Related case study:** remove the overlay labels (1.3). The overlapping White card is fine at ≥ 960. Below 960 it stacks under the image with no overlap.
- **FAQ:** keep, but the toggle circle must show a drawn plus/minus icon (it currently shows an empty Ice disc).

### 4.3 work.html
- **Hero stat tiles (Ice band):** fine. Make sure the numbers never wrap.
- **Filter pills:** centred, one row, horizontally scrollable on mobile. "All" selected is a Black pill with White text.
- **Case rows:** alternate image left and right. The card overlaps the image by one column and is vertically centred. On Stone panel rows the panel padding is 24px. Remove all overlay labels (1.3).
- **Before/after:** each layer shows a single "Before" or "After" pill. The drag handle is a 44px White circle with arrows, keyboard operable.

### 4.4 case-study.html
- **Coded charts are still on the page:** the `.chart-duo` / `.chart-card` SVG line charts in "What the 90 days earned". This breaks the no-coded-charts rule. Replace them with a 4-tile stat grid (the number in Geist Mono 48px, a label, and a one-line "from → to" in Graphite), or with a single photo plus stat tiles. Delete the chart CSS and JS.
- **"Five changes, in order":** 4 + 1 leaves an orphan card. Use a 5-column row at ≥ 1200, 3 + 2 centred at 768–1199, and one column on mobile. Or turn it into a numbered vertical timeline.
- **"The challenge" split:** fixed by 1.2. The image aligns with the heading.
- **Hero right panel:** the three stat tiles fill the panel evenly and align with the H1 baseline.

### 4.5 about.html
- **"Who we are" split:** fixed by 1.2. The brand panel (stacked logo on Black, correct, not on Ice) is in the right column and the copy in the left, on one row.
- **Team (8 people):** fixed by 1.1, same card spec as home 3.13. Four columns at ≥ 1200, three at 900–1199, two at 600–899. **Below 600 use a 2-column grid** with smaller cards, not one card per row: today the team alone is about 6,000px of scroll on mobile.
- **Portrait set consistency:** the current set mixes an orange wall, a red top, a pure-black studio and a blue backdrop. Replace any portrait with a warm or saturated background with one on plain grey or charcoal, same framing (head and shoulders, eyes at about 38% from the top), and set `object-position: 50% 30%` so no face is cropped at the forehead. At most one portrait may show strong colour clothing.
- **"Six reasons":** good. Keep the icon circles drawn.
- **"Our story" timeline (Black):** fine. On desktop, put the milestones and the "How we work" rhythm side by side (6/6) instead of one long column.

### 4.6 pricing.html
- **Hero quiz:** left copy and right quiz card share one vertical centre. The four stat tiles under the copy line up with the quiz card's bottom edge.
- **Billing toggle:** centre the Monthly/Quarterly segmented control and "Quarterly billing saves 5%" under the section head. Today both are left-aligned under a centred head.
- **Tier cards:** equal height. The buttons align on one baseline with `margin-block-start:auto`. The "Most brands start here" ribbon sits centred on the Growth card's top edge without being clipped. The Growth card is Ice with Black text and a Black button (correct).
- **Comparison table:** on mobile, a sticky first column and horizontal scroll inside a rounded wrapper, with a "Swipe to compare" hint. Never squeeze 4 columns into 390px.

### 4.7 contact.html
- **Left "What the audit covers" list:** the four White circles are empty, so add drawn icons. Align the circles to the first line of each title.
- **Form card:**
  - Two-column fields at ≥ 768, one column below.
  - Inputs are 52px tall with 16px text (prevents iOS zoom) and an Ice Deep 2px focus ring.
  - Marketplace chips are 44px tall.
  - Fix the consent checkbox (1.6).
  - The submit button is full-width on mobile.
- **"Other ways to reach us":** cards equal height, aligned to the form's left edge.

### 4.8 testimonials.html
- **Featured quote card:** the cookie bar covers it today (fixed by 1.7). The quote is 28px Archivo, max 30ch per line.
- **Review grid:** 3 columns at ≥ 1024, 2 at 600–1023, 1 below. Cards are equal height per row and the author row is pinned to the bottom.
- **Video posters:** one duration pill and a centred 64px play button. The name and role go **below** the poster in the card body, not over the photo.

### 4.9 insights.html and article.html
- **Insights:**
  - The featured post is a 7/5 split with the image left.
  - The journal grid is 3 / 2 / 1 columns.
  - The category and date sit in the card body (1.3).
  - The search field is 48px tall with a visible label for screen readers.
  - The newsletter band input and button sit on one row at ≥ 600, stacked below.
- **Article:**
  - Body column at most 68ch, 18px / 1.7.
  - The "On this page" table of contents is sticky in a left rail at ≥ 1200 and a collapsible block above the body below that.
  - Body figures are 16:9 with captions below.
  - The data table scrolls horizontally on mobile inside a rounded wrapper.
  - The "Key takeaways" box is Ice with Black text, 24px radius, 32px padding.
  - The author box aligns with the body column, not the full container.

### 4.10 privacy.html, terms.html, 404.html
- **Legal pages:** body column at most 72ch, H2s at 24px with 48px above, and a sticky table of contents at ≥ 1200.
- **404:** centred, with the Gate79 mark (on Black or White, never Ice), the H1 "This gate is closed.", and two pills: "Back to home" and "Book a growth audit".

## 5. Premium polish across the site (the "million-dollar" layer)

1. **One spacing scale, used everywhere:**
   - Section padding: `clamp(72px, 9vw, 128px)`.
   - Head-to-content gap: 56px desktop, 40px mobile.
   - Card padding: 28px desktop, 22px mobile.
   - Grid gaps: 24px.
   - Audit every page for one-off margins.
2. **One radius scale:**
   - 12px: chips and inputs.
   - 16px: small cards.
   - 24px: large cards, media and CTA card.
   - 999px: pills.
3. **Section heads:**
   - Eyebrow (Geist Mono 12px, with the 24px rule) 16px above the H2.
   - H2 `clamp(32px, 4.2vw, 56px)` with a max of 18ch and balanced lines (`text-wrap: balance`).
   - Lede 18px Graphite, max 56ch, 16px below.
   - The accent word is Ice on Black grounds and Ice Deep on White or Stone. It is never Ice on Ice.
4. **Buttons:**
   - 48px tall (44px on mobile), 22px horizontal padding, 15px semibold.
   - The arrow icon moves 3px right on hover.
   - Focus is a 2px offset ring in Ice Deep.
   - Same component on every page.
5. **Card hover (pointer devices only):** lift 4px with the shadow token, image scale 1.04 over 400ms. Nothing under reduced motion.
6. **Typography:**
   - `text-wrap: pretty` on paragraphs.
   - No widows in headings.
   - Tabular numbers (`font-variant-numeric: tabular-nums`) on all stats and prices.
7. **Colour balance per page:** roughly White+Stone 40%, Ice 35%, Black 25%. The service pages currently drift Black-heavy (hero, metrics, footer). Make sure each has at least one full Ice band ("How we run it" already is) and that the FAQ band is Ice.
8. **Images:**
   - Consistent cool, neutral grading across sets. Swap any photo with strong orange or red dominance: the team portrait with the orange wall, the kitchen shot with red pans used 4×, and the pink desk on work.html.
   - Faces never cropped.
   - Product shots are centred in frame.

## 6. Responsiveness spec

Test and fix at 320, 360, 390, 414, 600, 768, 834, 1024, 1180, 1280, 1366, 1440, 1920 and 2560px, plus 844×390 landscape.

- The container is `min(1200px, 100% - 2 × gutter)` with gutters of 16px (< 600), 24px (600–1023) and 32px (≥ 1024). At 2560 the content stays centred at 1200px and bands stay full-bleed.
- Every grid child has `min-width: 0`. No fixed pixel widths on cards.
- Headlines use `clamp()` and never overflow at 320. Long words like "optimisation" may hyphenate (`hyphens: auto` with `lang="en-GB"`).
- Touch devices get no hover-only information.
- Landscape phones: the hero is not taller than the viewport, and the sticky header is at most 56px.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` (the site stays light; just make sure nothing breaks).

## 7. Accessibility

- Contrast is at least 4.5:1 for body text and 3:1 for large text. Check Ice Deep on Stone and Graphite on Stone; darken the text to Carbon if they fail.
- Every icon-only control has an `aria-label`. Decorative SVGs have `aria-hidden="true"`.
- Tabs, accordions, sliders and the menu are fully keyboard operable with visible focus.
- One H1 per page. Headings in order. Landmarks: header, nav, main, footer.
- Every image has real `alt` text. Decorative duplicates use `alt=""`.

## 8. Deploy readiness

- Every page has a unique `<title>` (at most 60 characters) and meta description (at most 155), canonical, Open Graph and Twitter tags with a 1200×630 `og-image.jpg` (logo on Black, generated from the supplied PNG), `theme-color #020101`, a favicon set from the mark (16, 32, 180, 512 and an SVG if a clean one exists, otherwise PNG only), and `site.webmanifest`.
- Add `robots.txt`, `sitemap.xml` (19 URLs, relative to a `https://gate79.co.uk/` placeholder marked SAMPLE), and JSON-LD: `Organization` on home and `Service` on each service page. Add `Article` on article.html and `FAQPage` where an FAQ exists.
- All internal links are relative and work from `file://` and from a static host. There are no `href="#"` dead links: point unfinished links to the right page or remove them.
- The forms post nowhere yet. Add a `data-endpoint` attribute and a success state shown in place. Leave a `<!-- TODO: connect form endpoint -->` comment.
- Add a `_headers` file (Netlify/Cloudflare style) with cache rules: 1 year immutable for `/assets/`, and no-cache for HTML.
- Keep the DEMO comment about stock photos at the top of each `<main>`.

## 9. QA (run it, look at it, then stop)

Write `qa/check.js` (Playwright, dev-only, not linked from the site). For every page at the widths in section 6, it should:

1. Disable smooth scroll, scroll to the bottom in 400px steps, wait for images, and save a full-page screenshot to `qa/shots/<width>-<page>.png`.
2. Fail if `document.documentElement.scrollWidth > innerWidth`, listing the offending elements.
3. Fail on any element whose right edge exceeds the viewport while not inside a scroll container.
4. Fail on any `img` with `naturalWidth === 0`, or one displayed at more than 1.1× its natural size (catches blurry logos).
5. Fail on computed `font-size < 12px` for visible text, and on interactive elements smaller than 44×44 at widths under 1024.
6. Fail on `.plate__head`, `.plate__foot`, `.plate-alert`, `.viz`, `.chart-` or `linear-gradient`/`radial-gradient` anywhere in the HTML or CSS.
7. Fail if any `.ph` box overflows its parent media frame, or any `.split__media` sits on a different grid row from its `.split__copy` at ≥ 960.
8. Fail on console errors.
9. Report the total CSS size (must be 60 KB or less) and the image weight per page (home 3.5 MB or less, others 2.5 MB or less).

Then open the 1366, 768 and 390 screenshots of every page yourself and confirm:

- [ ] Every split has image and copy side by side on one row at desktop, vertically centred, with nothing spilling into the next section.
- [ ] Every photo fills its frame: no empty strips, no gaps under team photos.
- [ ] No labels sit on photos except Before/After, video duration and the play button.
- [ ] The header and footer logos are crisp.
- [ ] The home hero reads as one confident composition with the photo card and chips, and the stats sit on one row.
- [ ] All centred section heads have centred content beneath them (toggles, footers, buttons).
- [ ] Every icon circle shows an icon.
- [ ] The cookie bar never hides the hero CTA or a form heading.
- [ ] Services jump bar, filter pills and case tabs scroll cleanly on mobile with no page-level horizontal scroll.
- [ ] `assets/img/stock/raw/` is gone. No image is used more than twice site-wide.

Output only the changed-file list, the QA summary table (page × width: pass/fail) and any blockers.
