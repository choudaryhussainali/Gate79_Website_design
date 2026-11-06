# Gate79 v2 reskin map

Scope: colour reskin only. Layout, copy, structure unchanged.

## 1. Brand tokens (assets/css/tokens.css)
| Token | v1 value | Role |
|---|---|---|
| --ice | #95C3CF | primary brand accent: pills, links, stars, header pill, eyebrows |
| --black | #020101 | page ground, dark bands, primary text |
| --stone | #E6E4E0 | light band background |
| --white | #FFFFFF | cards, hero frame, dark-band type |
| --graphite | #5B6168 | body text on light |
| --ice-deep | #4F8A9A | hover/link accent, stars, dark-ground strokes |
| --carbon | #111416 | dark card panels |
| --line | #2A2F34 | dark-ground hairlines |

## 2. Hard-coded colours outside tokens (assets/css/pages.css)
- rgba(149, 195, 207, .07/.18/.5) x5 — marquee fade masks + ghost treatments (rgba of --ice)
- rgba(255, 255, 255, .02/.05/.08/.14/.78) — whites on dark bands (keep white unless brand says otherwise)
- #E3E1DC (line 592) — one stone-family literal
- rgba(2, 1, 1, ...) — brand black alphas (body copy, shadows) — track --black
- rgba(79, 138, 154, .8) — footer ghost wordmark 79 (rgba of --ice-deep)
- rgba(2, 1, 1, .14) — footer ghost wordmark GATE

## 3. Brush stroke artwork (assets/img/ui/brush-*.svg)
Nine files, three colour families (fill only; masks are structural):
- brush-ice-1/2/3.svg — fill #95C3CF (light grounds)
- brush-white-1/2/3.svg — fill #FFFFFF (Ice band)
- brush-icedeep-1/2/3.svg — fill #4F8A9A (dark grounds/cards)
Reskin: recolour the fill attribute in each family to the new palette equivalents.

## 4. Pre-rendered brand files (assets/brand/, root)
- favicon-16/32/180.png, gate79-app-icon.png, gate79-horizontal-on-dark@1x/2x/3x.png — PNGs in current brand colours
- og-image — embeds the stacked mark
- site.webmanifest — theme_color + background_color = #020101
Reskin: regenerate from the new palette (or replace with supplied files).

## 5. Swap procedure (when assets arrive)
1. Recolour the 8 tokens in tokens.css.
2. Update the ice-derived rgba literals + footer ghost fills to the new accent's rgba.
3. Recolour the nine brush SVGs (three fills x three variants).
4. Regenerate favicons/app icon/og-image or drop in supplied files.
5. Update webmanifest theme/background colours.
6. Sweep v2 with qa/responsive-check.js + qa/accent-final.js logic for regression.
