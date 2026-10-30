# Gate79 website: clipped badges, squeezed cards and alignment fix (Claude Code prompt)

Paste everything below the line into Claude Code, opened in `D:\Clients\Gate79\Website deign`.

---

# BRIEF: fix every clipped badge, squeezed card, orphaned row and misaligned element on all 19 pages

The client marked three problems on the home page screenshot:
1. The round icon badges on the service cards are cut in half.
2. The "A small senior team" number cards are squeezed into a narrow column, with the numbers showing 11 / 5 / 0 instead of 27 / 12 / 1.
3. The initials badges on the team photos are cut off.

A scan of the latest build with a headless browser found the same *kinds* of fault across the site. Fix each root cause below, then hunt for any other instance of the same pattern on every page. Don't stop at the ones listed.

Rules:
- Plain HTML/CSS/JS, as now.
- Brand rules unchanged: no gradients, text on Ice is Black, and the logo PNG is never altered.
- Don't change copy or photos.
- Finish when section 8 passes. Then output only the changed-file list and the QA table.

## 1. Pattern A: overlay badges clipped by `overflow: hidden`

**Root cause:**
- `.svc-card__badge` sits inside `.svc-card__media`, which has `overflow:hidden`, and it uses `inset-block-end:-22px` to overlap the photo edge. The parent cuts it exactly in half.
- `.team-card__badge` has the same problem, and components.css defines it **twice** with conflicting rules (absolute `bottom:-16px` around line 776, then relative `margin-top:-22px` around line 791).
- Found on: home services grid, home team, about team, and the "other services" cards on all six service pages, at every width.

**Fix (one pattern for every overlapping badge on the site):**
- Move the badge **out of the media element**, making it a sibling placed right after the media inside the card:
  ```html
  <article class="svc-card">
    <div class="svc-card__media"><picture>…</picture></div>
    <span class="svc-card__badge" aria-hidden="true"><svg class="icon">…</svg></span>
    <div class="svc-card__body">…</div>
  </article>
  ```
  ```css
  .svc-card { position: relative; overflow: visible; }
  .svc-card__badge {
    position: relative; z-index: 2;
    margin-block-start: -22px;            /* half the 44px badge overlaps the photo */
    margin-inline-start: var(--s-5);      /* lines up with the card text */
    inline-size: 44px; block-size: 44px; border-radius: 50%;
    display: grid; place-items: center;
    background: var(--white); box-shadow: var(--shadow);
    color: var(--black);                  /* icon at full contrast, not faint Ice Deep */
  }
  .svc-card__badge .icon { inline-size: 20px; block-size: 20px; }
  .svc-card__body { padding-block-start: var(--s-3); }  /* remove the old +26px compensation */
  ```
- **Team cards:** use the same structure. The initials badge is a 44px White circle with 13px Geist Mono initials in Black. It overlaps the **bottom-left** of the photo by half, never the top-left corner, where it is currently cut. Delete the duplicate `.team-card__badge` rule and keep one.
- Search the HTML for every other element that overlaps an edge using negative offsets or margins inside an `overflow:hidden` parent, and fix it the same way. Check at least: floating chips on the hero photo card, the "79" square on the hero, the "Reporting" chip on the dashboard photo, before/after pills, video duration pills, the "Most brands start here" pricing ribbon, the step number badges, and the footer wordmark (its SVG text is cut by 5–7px at the bottom; give the SVG a correct `viewBox` with room for descenders).
- Rule for the future: **a parent that crops a photo never contains anything meant to stick out of it.**

## 2. Pattern B: grid children with no column, which get squeezed

**Root cause:**
- On the home "A small senior team, on the hook for a number" section, `.stats-with-context` is a direct child of `.split`, but it has neither `.split__media` nor `.split__copy`.
- In the 12-column grid it is auto-placed into a **single 1/12 track**, about 85px wide. That leaves the labels at 1–2 words a line and empty space on the right.

**Fix:**
- Give it a real column: `.split > .stats-with-context { grid-column: 7 / -1; grid-row: 1; }` at ≥ 960px.
- Better still, make every direct child of `.split` use only `.split__copy` or `.split__media`, and add a rule that fails QA otherwise.
- **Stat card layout:** three full-width White cards stacked with a 16px gap. Each card has 28px padding and a 20px radius, laid out as a grid with `grid-template-columns: 96px 1fr` and `align-items: center`:
  - The number in Geist Mono, `clamp(36px, 3.4vw, 48px)`, Ice Deep, tabular figures, left-aligned in its 96px column.
  - The label at 16px semibold, then the context line at 14px Graphite. **Remove the `<br>`** and make label and context two block elements with a 4px gap.
  - Card and copy column are vertically centred against each other.
- **Mobile:** today the stat cards appear **above** the "Who we are" heading. The order must be eyebrow, heading, body, button, then the three cards. Use `order`, or put the cards after the copy in the DOM.
- Then check **every** `.split`, `.page-hero--split`, `.case-row`, pricing hero, contact hero and about mission/promise grid on all pages for any child without an explicit column. Fix each one the same way.

## 3. Pattern C: counters frozen on wrong numbers

**Root cause:**
- `main.js` animates `[data-count]` from 0 over 1200ms, starting when the number is 60% visible.
- If the page is scrolled quickly, captured by a full-page screenshot tool, or the tab is backgrounded (requestAnimationFrame pauses), people see mid-way values like 11 / 5 / 0. That is what the client's screenshot shows.

**Fix:**
- Only animate numbers of 10 or more. Small numbers (1, 4, 12) and every number inside cards in the body just render their final value. Keep the count-up only on the hero stat strip and the Black results band.
- Duration 900ms. Start at 70% visibility. If the element leaves the viewport, or `document.visibilityState` becomes hidden, before the animation ends, set the final text immediately.
- On `beforeprint`, set every counter to its final text.
- Never start from 0 for values with a prefix or suffix. Start from 60% of the target so "£18.4M" never shows as "£0.0M".
- Under `prefers-reduced-motion`, no animation at all (already handled; keep it).
- The final values are the ones written in the HTML. Verify each page's counters equal their `data-count` after a fast scroll.

## 4. Pattern D: orphaned last rows and uneven grids

Found in the screenshots:
- **Home logo wall:** 12 tiles in 5 columns leave a row of 2 (Tessel, Ashcombe). Use 6 columns at ≥ 1200 (2 full rows), 4 at 768–1199 (3 rows), and 3 below 768. Or add or remove tiles so every row is full.
- **About team:** 8 people in a 3-column grid leave 2 in the last row. Use 4 columns at ≥ 1100, 2 at 600–1099, and 2 compact columns below 600.
- **Case study "Five changes, in order":** 4 + 1. Use 5 across at ≥ 1200, 3 + 2 centred at 768–1199, and 1 column below.
- **Service page "Four numbers" Black band and the fit-check stats ("9% / 30 / 100%"):** 3 stats in a 2-column grid drop "100%" onto its own row. Use 3 equal columns.
- **About "Deep expertise at every stage" pills:** they wrap into ragged centred lines with tiny 11px text. Make them 14px, 36px tall, with an 8px gap, in a max-width 880px centred flex wrap. Or set them as a 3-column tick list.

General rule:
- For any grid of N items, choose column counts that divide N at each breakpoint.
- Where that's impossible, centre the last row with `justify-content:center` on a flex container that has fixed card widths. Don't leave it left-aligned and half-empty.

## 5. Pattern E: unequal heights and misaligned edges

- **Paired cards side by side must be the same height:**
  - fit check ("Where we'd say wait" vs "Where it works best");
  - about Mission vs Promise;
  - versus cards;
  - pricing tiers;
  - contact "other ways" cards.
- Use `align-items: stretch` on the grid, and `display:flex; flex-direction:column` in the card with the CTA or footer row at `margin-block-start:auto`.
- **Centred heads need centred content:**
  - On service pages, the "Who it's for" chips are centred while their heading and paragraph are left-aligned. Left-align them.
  - Audit every section: whatever sits under a centred head (toggles, pills, buttons, footnotes) is centred, and whatever sits under a left-aligned head is left-aligned.
- **Icon list rows** (benefit strips, "What's included", "Six reasons", contact list): the icon's top aligns with the cap height of the title (`align-items:start` plus a 2px top offset on the icon), and every row in a strip has the same structure.

## 6. Pattern F: low contrast and faint icons

- **About "Promise" card** (Black card next to "Mission"): the title and body render in dark text on Carbon and are almost invisible. Use White text, with the eyebrow in Ice.
- **Service card badges and icon circles:** the icon colour is Ice Deep at 18px on White, which reads faint. Use Black or Carbon icons at 20px with a 1.5 stroke (see `gate79-icons-prompt.md` if you're running it as well).
- Check every text and background pair with a contrast script: body text at least 4.5:1, large text and icons at least 3:1. Fix any failures with Carbon or White. Never lighten the brand colours.

## 7. Mobile specifics seen at 390px

- **Hero stat strip:** labels wrap to 3 lines ("AVG SALES LIFT, 90 DAYS"). Use 11px uppercase Geist Mono with `letter-spacing:.06em` and a max of 2 lines, or shorten the visible label to "Avg sales lift" with the period in a tooltip-free subline. Use a 3-column grid with the dividers kept.
- **Hero photo card:** the "79" square and the chips must sit fully inside the viewport, with 16px gutters. No part should be hidden under the cookie bar.
- **The cookie bar overlaps the hero card on first load.** Make it a slim bottom sheet: 12px gutters, text 13px, buttons 40px, max height 120px. Add body bottom padding while it's visible.
- **"Other services" cards** on service pages: titles wrap in 163px columns. Use one column below 480px.
- **Pricing and article tables:** don't squeeze. Use a horizontal scroll wrapper with `min-width: 640px` on the table, a sticky first column and a 24px right fade hint (a solid block, no gradient).

## 8. QA (Playwright, then stop)

For all 19 pages at 320, 390, 768, 1024, 1366 and 1920:

1. Disable smooth scroll, scroll through at 300px steps (fast, 90ms per step, to reproduce the counter bug), wait 2s and take a full-page screenshot.
2. **Clipping test:** fail if any badge, chip, pill, icon, number or text box is cut by more than 2px by an ancestor with `overflow:hidden|clip`. Marquees, sliders and scroll containers are exempt.
3. **Squeeze test:** fail if any text block of 3 or more lines averages fewer than 3 words per line in a box narrower than 200px.
4. **Counter test:** fail if any `[data-count]` element's text doesn't equal its final HTML value.
5. **Grid test:** fail if a direct child of `.split` lacks `.split__copy` or `.split__media`, or if any grid's last row is less than half full while not centred.
6. **Height test:** fail if paired cards in the same row differ in height by more than 2px.
7. **Contrast test:** fail on text below 4.5:1 (body) or 3:1 (large text and icons).
8. Fail if `scrollWidth > innerWidth`, and on any console error.

Then look at the 1366 and 390 screenshots of the home page, about.html, one service page, pricing and the case study yourself, and confirm:

- [ ] Every service card badge is a full circle, half on the photo and half on the card, with a clearly visible icon.
- [ ] Every team initials badge is a full circle at the photo's bottom-left.
- [ ] "A small senior team" shows three wide cards reading 27, 12 and 1, beside the copy on desktop and below it on mobile.
- [ ] No orphaned last rows. No paired cards of unequal height.
- [ ] The Promise card is readable.

Output only the changed-file list and a pass/fail table (page × width).
