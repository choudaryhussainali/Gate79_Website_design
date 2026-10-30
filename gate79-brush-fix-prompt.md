# Gate79 website: fix the black-box title highlights and the hero headline (Claude Code prompt)

Paste everything below the line into Claude Code, opened in `D:\Clients\Gate79\Website deign`.

I tested this exact fix on a copy of the current build. All 45 highlighted words across home, about, listing optimisation, pricing and contact rendered correctly, at 1366 and 390.

---

# BRIEF: one clean brush highlight on every title, with no black boxes, on all 19 pages

## What is wrong (root cause, already diagnosed)

On every Ice band the accent word in the section title shows as a **solid black box with invisible text**. Examples:
- "A small senior team, **on the hook**"
- "The usual agency, **and us**"
- "Recent work, **numbers attached**"
- "Before **you ask**"

This happens because earlier fix passes stacked **five conflicting sets of `.accent` rules** across three files. The worst are near the end of `assets/css/pages.css`:

```css
.band--ice .section-head__title .accent.accent { background-image: none; background-color: var(--carbon); color: var(--white); }
.band--ice .section-head__title .accent.accent { color: var(--black); }
```

The first rule kills the brush and paints a Carbon block. The second then makes the text Black on that Carbon block, so it is invisible. The `.accent.accent` doubling gives them higher specificity than the brush rules, so the brush never wins.

There are also leftover `--brush: url(...)` custom-property rules. They are unreliable, because a `url()` inside a custom property can resolve against the wrong base.

The home hero, "Grow on Amazon, on purpose.", has no highlight and its letter-spacing is too tight.

**Do not patch on top again.** Delete every old title-accent rule, then add one canonical block.

## Step 1. Delete every old title-accent rule

Search all CSS files for `.accent`. **Delete** each rule below completely. Keep `.brand__word-accent` and any non-title `.accent` usage, such as body text, eyebrows and stats.

**`assets/css/pages.css`, near the end of the file:**
- Delete everything from the comment `/* ice band: carbon block + white type` down to the end of the block headed `/* ==== brush highlight: final cascade layer (wins) ==== */`, including its `@media (prefers-reduced-motion…)` block. That covers:
  - every `.band--ice .section-head__title .accent.accent` rule (the Carbon ones and the `--brush` one);
  - `.hero2__title .accent, .section-head__title .accent.accent { padding…; margin-inline… }`;
  - all `section:nth-of-type(…) .section-head__title .accent { --brush… }` lines.

**`assets/css/pages.css`, earlier in the file:**
- `.svc-block__title .accent` and `.band--ice .svc-block__title .accent` colour rules (near the top).
- `.nf__title .accent` colour rule (404 styles).
- `:is(.cta-card, .card--dark, .page-hero__panel, .band--black) .accent { color: var(--ice) }`.
- `.band--ice :is(.cta-card, .card--dark, .page-hero__panel, .t-featured, .versus__new) .accent { color: var(--ice); text-decoration: none; }`.

**`assets/css/components.css`:**
- The whole `/* ===== brush highlight on title accent words ===== */` block: every rule that sets `--brush`, the base `:is(.section-head__title, .cta-card__title, …) .accent` rule, and its reduced-motion block.

**`assets/css/layout.css`:**
- `.section-head__title .accent { color: … }` and `.band--ice .section-head__title .accent { color: var(--black); }`.

When you are done, `grep -n "accent" assets/css/*.css` must show **no** title-accent rule except the new block from step 2. In particular, there must be no `--brush`, no `.accent.accent`, and no `background-color` on any title `.accent`.

## Step 2. Add the one canonical block

Paste this at the **very end of `assets/css/pages.css`**, **outside any `@layer { }`**. Unlayered rules beat every layered rule, so nothing else can override it. Use the exact `url()` paths shown: they resolve from `assets/css/`, so they work on root pages and on `/services/` pages.

```css
/* ===== Gate79 brush highlight: canonical, unlayered, single source of truth ===== */
:is(.section-head__title, .page-hero__title, .hero2__title, .cta-card__title, .versus__title, .svc-block__title, .nf__title) .accent {
  color: var(--black);
  background-color: transparent;
  background-image: url("../img/ui/brush-ice-1.svg");
  background-repeat: no-repeat;
  background-position: 0 54%;
  background-size: 100% 1em;
  padding: .04em .2em;
  margin-inline: -.08em;
  border-radius: 0;
  text-decoration: none;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
section:nth-of-type(3n+2) :is(.section-head__title, .page-hero__title, .svc-block__title) .accent { background-image: url("../img/ui/brush-ice-2.svg"); }
section:nth-of-type(3n)   :is(.section-head__title, .page-hero__title, .svc-block__title) .accent { background-image: url("../img/ui/brush-ice-3.svg"); }

/* Ice grounds: White stroke, Black text */
.band--ice :is(.section-head__title, .page-hero__title, .svc-block__title, .versus__title) .accent { background-image: url("../img/ui/brush-white-1.svg"); color: var(--black); }
section.band--ice:nth-of-type(3n+2) :is(.section-head__title, .page-hero__title, .svc-block__title) .accent { background-image: url("../img/ui/brush-white-2.svg"); }
section.band--ice:nth-of-type(3n)   :is(.section-head__title, .page-hero__title, .svc-block__title) .accent { background-image: url("../img/ui/brush-white-3.svg"); }

/* Black / Carbon grounds and dark cards: Ice Deep stroke, White text */
:is(.band--black, .band--carbon) :is(.section-head__title, .page-hero__title, .svc-block__title, .nf__title) .accent,
:is(.cta-card, .card--dark, .versus__new, .t-featured) :is(.cta-card__title, .versus__title, .section-head__title, h2, h3) .accent {
  background-image: url("../img/ui/brush-icedeep-1.svg"); color: var(--white);
}
section.band--black:nth-of-type(3n+2) :is(.section-head__title, .page-hero__title) .accent { background-image: url("../img/ui/brush-icedeep-2.svg"); }
section.band--black:nth-of-type(3n)   :is(.section-head__title, .page-hero__title) .accent { background-image: url("../img/ui/brush-icedeep-3.svg"); }

/* draw-in, once */
@media (prefers-reduced-motion: no-preference) {
  .js :is(.section-head__title, .cta-card__title, .svc-block__title) .accent {
    background-size: 0% 1em;
    transition: background-size 700ms cubic-bezier(.65, 0, .35, 1) 150ms;
  }
  .js :is(.is-in, [data-reveal].is-in) :is(.section-head__title, .cta-card__title, .svc-block__title) .accent,
  .js :is(.section-head__title, .cta-card__title, .svc-block__title).is-in .accent { background-size: 100% 1em; }
  .js :is(.page-hero__title, .hero2__title) .accent { animation: g79-brush 800ms cubic-bezier(.65, 0, .35, 1) 350ms both; }
  @keyframes g79-brush { from { background-size: 0% 1em; } to { background-size: 100% 1em; } }
}

.hero2__title { letter-spacing: -.03em; }
```

Colour map (the only three combinations allowed):

| Ground | Stroke | Text |
|---|---|---|
| White or Stone | Ice `brush-ice-1/2/3.svg` | Black |
| Ice band | White `brush-white-1/2/3.svg` | Black |
| Black, Carbon, or dark card (CTA card, `.card--dark`, versus "Gate79 way", featured testimonial) | Ice Deep `brush-icedeep-1/2/3.svg` | White |

Also check:
- `main.js` adds `document.documentElement.classList.add('js')` before anything else. If it doesn't, add it.
- The reveal observer adds `.is-in` to the `[data-reveal]` wrappers around section heads. If any section head has no reveal wrapper, its stroke must still show: add `data-reveal` to it, or the stroke stays at 0%.

## Step 3. Home hero headline

In `index.html`, change the H1 to:

```html
<h1 class="hero2__title" id="hero-title">Grow on Amazon,<br class="hero2__br"> <span class="accent">on purpose.</span></h1>
```

- That puts an Ice brush behind "on purpose." on the light hero, with Black text and a paint-in on load.
- The tracking eases to `-.03em` (in the block above). Delete any other `letter-spacing` on `.hero2__title` tighter than that.
- Remove any border, outline or box around the H1 or its wrapper, if one exists.

## Step 4. Content rules (keep it premium)

- One highlighted phrase per title, of 1 to 3 words, at the end of the line. If a title has two accent spans, keep the more important one. If a span is longer than 3 words, shorten it to the key words.
- No highlight on body text, eyebrows, card titles, buttons, nav, stats or the footer wordmark.
- Use these SVGs exactly as they are. Don't redraw them, recolour them or add filters.

## Step 5. QA (Playwright, then stop)

For all 19 pages at 1366, 768, 390 and 320, scroll through the page, wait 1.5s, and then, for every `h1 .accent, h2 .accent, h3 .accent`:

1. **Fail** if the computed `background-color` is anything other than `rgba(0, 0, 0, 0)`. This is the black-box bug.
2. **Fail** if the computed `background-image` is `none`, or isn't one of the nine `brush-*.svg` files.
3. **Fail** on a wrong pairing:
   - Ice band with anything other than `brush-white-*` and Black text;
   - White or Stone with anything other than `brush-ice-*` and Black text;
   - Black, Carbon or dark card with anything other than `brush-icedeep-*` and White text.
   No Ice-on-Ice, no White stroke on White or Stone, and no Black text on a dark ground.
4. **Fail** if `background-size` isn't `100% …` once revealed.
5. **Fail** if `scrollWidth > innerWidth` at 320, or if there is any console error, including a 404 on a `brush-*.svg`, especially on `/services/` pages.

Then take an element screenshot of every highlighted title at 1366 and 390, and look at them yourself. Confirm:
- [ ] "A small senior team, **on the hook**", "The usual agency, **and us**", "Recent work, **numbers attached**" and "Before **you ask**" show Black text on a White brush stroke on the Ice band, with no box.
- [ ] The home hero reads "Grow on Amazon," then "**on purpose.**" on an Ice brush stroke, with comfortable tracking and nothing boxed.
- [ ] Wrapped accents on mobile have a full stroke on each line.
- [ ] Neighbouring sections use different stroke shapes.
- [ ] Under `reducedMotion: 'reduce'`, the strokes are present immediately.

Output only the changed-file list and a pass/fail table (page × width).
