# Gate79 website: brush-stroke highlight on section titles (Claude Code prompt)

Paste everything below the line into Claude Code, opened in `D:\Clients\Gate79\Website deign`.

The brush artwork is already drawn and tested. Nine SVG files are in `assets/img/ui/` (`brush-ice-1..3.svg`, `brush-white-1..3.svg`, `brush-icedeep-1..3.svg`), and there is a preview at `assets/img/ui/brush-preview.png`.

---

# BRIEF: replace the accent-word colour with a hand-painted brush highlight on every section title

The client's reference is a poster where key words sit on a **thick, hand-painted highlighter stroke**. The stroke has:
- slightly ragged edges and a gentle tilt;
- dry-brush bristle ends that run a little past the word;
- solid black type on top.

Apply that effect to the accent words (`<span class="accent">`) in every section title on the site. Today those words are just coloured Ice Deep, or underlined on Ice bands.

It must feel premium and restrained, not like a children's poster:
- one highlight per title;
- solid brand colours (no gradients, glows, blend modes or filters);
- crisp at any size;
- a quiet draw-in on scroll.

## 1. Assets (already supplied, don't redraw)

`assets/img/ui/`:

| File | Use on | Fill |
|---|---|---|
| `brush-ice-1/2/3.svg` | White and Stone grounds | Ice `#95C3CF` |
| `brush-white-1/2/3.svg` | Ice grounds | White `#FFFFFF` |
| `brush-icedeep-1/2/3.svg` | Black and Carbon grounds | Ice Deep `#4F8A9A` |

Each SVG uses `viewBox="-16 0 660 100"` with `preserveAspectRatio="none"`, so it stretches to any word length while the ends stay brush-like. There are three shape variants so neighbouring sections don't look stamped. Each file is under 4 KB. Keep them as separate files: `background-image: url(...)` works from `file://` (a CSS mask would not).

## 2. The CSS (one block in components.css, replacing the old accent styles)

Delete the existing title accent rules: the `.accent` colour rules on section heads and CTA titles, and the Ice-band underline rule `.band--ice .accent { text-decoration… }` added in the last fix pass. Then add:

```css
/* ===== brush highlight on title accent words ===== */
:is(.section-head__title, .cta-card__title, .page-hero__title, .hero2__title, .svc-cta-card__title, .versus__title) .accent {
  --brush: url("../img/ui/brush-ice-1.svg");
  color: var(--black);
  background-image: var(--brush);
  background-repeat: no-repeat;
  background-position: 0 54%;
  background-size: 100% 1em;           /* the stroke height follows the font size */
  padding: .04em .2em;                  /* the stroke runs past the word, like the reference */
  margin-inline: -.08em;               /* keeps the word optically in place */
  -webkit-box-decoration-break: clone;  /* every wrapped line gets its own full stroke */
  box-decoration-break: clone;
  text-decoration: none;
}

/* three shape variants, cycled per section */
section:nth-of-type(3n+2) :is(.section-head__title, .cta-card__title) .accent { --brush: url("../img/ui/brush-ice-2.svg"); }
section:nth-of-type(3n)   :is(.section-head__title, .cta-card__title) .accent { --brush: url("../img/ui/brush-ice-3.svg"); }

/* Ice grounds: White stroke, Black text */
.band--ice :is(.section-head__title, .cta-card__title, .page-hero__title, .versus__title) .accent { --brush: url("../img/ui/brush-white-1.svg"); }
section.band--ice:nth-of-type(3n+2) .accent { --brush: url("../img/ui/brush-white-2.svg"); }
section.band--ice:nth-of-type(3n)   .accent { --brush: url("../img/ui/brush-white-3.svg"); }

/* Black and Carbon grounds and dark cards: Ice Deep stroke, White text (large text, 3.9:1 passes) */
:is(.band--black, .band--carbon, .cta-card, .card--dark, .svc-cta-card, .versus__new, .page-hero.band--black) .accent { --brush: url("../img/ui/brush-icedeep-1.svg"); color: var(--white); }
section.band--black:nth-of-type(3n+2) .accent { --brush: url("../img/ui/brush-icedeep-2.svg"); }
section.band--black:nth-of-type(3n)   .accent { --brush: url("../img/ui/brush-icedeep-3.svg"); }

/* a dark card on an Ice band keeps the dark-card treatment */
.band--ice :is(.cta-card, .card--dark, .versus__new) .accent { --brush: url("../img/ui/brush-icedeep-1.svg"); color: var(--white); }
```

Notes:
- `background-image: var(--brush)` must be set on the `.accent` element itself, not a pseudo-element. With `box-decoration-break: clone`, each wrapped line gets its own stroke on mobile, which a pseudo-element can't do.
- `url()` paths are relative to the CSS file (`assets/css/` → `../img/ui/`). That works from both `/` and `/services/` pages.
- **Never** use Ice text on an Ice stroke, a White stroke on White or Stone, or Black text on a Black ground. The three ground rules above cover every case. Check every page (section 6).

## 3. Draw-in animation (subtle, once)

The stroke paints in from left to right when the title enters the viewport, like a marker being dragged.

```css
@media (prefers-reduced-motion: no-preference) {
  .js :is(.section-head__title, .cta-card__title, .page-hero__title) .accent {
    background-size: 0% 1em;
    transition: background-size 700ms cubic-bezier(.65, 0, .35, 1) 150ms;
  }
  .js .is-in :is(.section-head__title, .cta-card__title) .accent,
  .js :is(.section-head__title, .cta-card__title).is-in .accent,
  .js .page-hero__title .accent { background-size: 100% 1em; }
}
```

- Hook it into the existing reveal observer, which already adds `.is-in` to `[data-reveal]` section heads. The page hero titles paint on load after 300ms.
- The text is fully visible from the start. Only the stroke animates, so nothing is hidden if JS fails.
- No `.js` class on `<html>` means no animation: the stroke shows at full size. Add `document.documentElement.classList.add('js')` at the top of main.js if it isn't there yet.
- Under reduced motion, the stroke is simply there.

## 4. Which words get it (content rules, so it stays premium)

- **One highlighted phrase per title,** at most 3 words. It is the payoff of the line, usually its end, as in the reference ("Better **Days**… Do **Today.**").
- Audit every `.accent` in titles across all 19 pages. If a title has more than one accent span, keep the most important one and remove the others. If an accent is longer than 3 words, shorten the span to the key 1–3 words. Examples:
  - "Everything the channel needs, **run as one**" ✔
  - "Specialists who treat your brand **like their own**" ✔
  - "A small senior team, on the hook **for a number**" → shorten from "on the hook for a number".
  - "Clear fees, **tied to growth**" ✔
- **Not applied** to body text, eyebrows, card titles, buttons, nav, stats, the footer wordmark, or the home hero H1 (it stays clean Black, as the hero reference has no highlight).
- **Don't** highlight a word that starts a line at 320px if its stroke would touch the screen edge. The 16px container gutter must stay clear, because the stroke overhang is only .2em.

## 5. Typography tune-up so the effect reads like the reference

The reference works because the type is **heavy and tight** and the stroke sits **behind the full x-height and caps**. So, for section titles only:
- `.section-head__title`: Archivo, keep `font-stretch: 112%`, weight **650–700** (currently 600), `letter-spacing: -.015em`, `line-height: 1.12` (the stroke needs a little line gap so wrapped strokes don't touch).
- Sizes stay as they are: `clamp(32px, 4.2vw, 56px)`.
- Check that the stroke covers from just above the x-height to just below the baseline (the `0 54%` position and `1em` height do this). Descenders (g, y, p) may poke out of the bottom edge, as they do in the reference ("Days", "Today"). That's intended.

## 6. Responsive and QA (Playwright, then stop)

1. Screenshot every section title on all 19 pages at 1366, 768, 390 and 320, after scrolling so the animation has finished. Check:
   - [ ] every accent phrase has a stroke, with the right colour for its ground (Ice on White/Stone, White on Ice, Ice Deep with White text on Black);
   - [ ] text on top is fully legible, with nothing invisible (no Black-on-Black or Ice-on-Ice);
   - [ ] wrapped accents on mobile have a full stroke on **each** line, with nothing cut mid-word;
   - [ ] no stroke crosses the viewport edge or causes horizontal scroll at 320px;
   - [ ] neighbouring sections use different brush variants;
   - [ ] at most one highlight per title, of 3 words or fewer;
   - [ ] no gradient, filter, mix-blend-mode or text-shadow anywhere in the effect.
2. Record the draw-in on the home page at 1366 (`page.video` or 6 stepped screenshots) to confirm a smooth left-to-right paint, once per title, with no layout shift.
3. Check reduced motion (`emulateMedia({ reducedMotion: 'reduce' })`): the strokes are present immediately.
4. Check performance: the nine SVGs load once (cached), with no layout shift, and the CLS stays at 0.

Output only the changed-file list and the screenshot paths.
