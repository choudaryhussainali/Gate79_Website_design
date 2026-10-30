# Gate79 website: home hero rebuild, framed centred hero (Claude Code prompt)

Paste everything below the line into Claude Code, opened in `D:\Clients\Gate79\Website deign`.

---

# BRIEF: rebuild the home page hero to match the client's reference

The client's reference is a **light, centred hero inside a rounded white frame** that floats on a soft grey page. The frame contains:

- **The header:** the logo on the left; a pill-shaped nav group in the centre, where the active or hovered item becomes a white pill inside a light grey track; and a black pill CTA on the right with a white circular arrow button inside it.
- **A huge, tightly tracked two-line headline**, centred.
- **A two-line centred lede.**
- **A CTA row:** a black pill button with a white circle arrow, next to an overlapping avatar stack, a 5-star rating and a "Trusted by…" line.

Build exactly that composition for Gate79, with these rules:

- **No trust or logo bar** in the hero. The Ice marquee that already sits directly below the hero stays, and it is the first thing under the frame.
- **No gradients or blurred colour blobs.** The reference's soft blue/yellow wash is replaced by a flat White frame on a Stone page ground. This is a brand rule.
- **Stars are not orange.** Use Black.
- **The logo PNG is used as supplied** (`gate79-horizontal-on-light@1x/@2x/@3x.png`). Never alter it, and never place it on Ice.
- Fully responsive from 320px to 2560px, landscape phones included (section 6).
- Scope: `index.html`, the header behaviour on the home page only, and the related CSS/JS. Inner pages keep their current black header.

## 1. Remove from the current hero

Delete the following from `<section class="hero band band--black">`, along with their CSS where nothing else uses it:
- the black ground;
- the availability pill;
- the two-column grid;
- the photo card (`.hero__media`, `hero-operator` image);
- the "79" badge;
- the floating chips;
- the stats strip (`.hero__stats`, which also means the hero counters no longer need JS);
- the secondary "See the work" button.

The stats already appear further down the page, in the "small senior team" cards and the results band.

## 2. Page ground and frame

```html
<section class="hero-frame-wrap" aria-labelledby="hero-title">
  <div class="hero-frame">
    <!-- the home header lives here at the top (section 3) -->
    <div class="hero-frame__content">…</div>
  </div>
</section>
```

- **`.hero-frame-wrap`:** `background: var(--stone)`; `padding: var(--frame-gap)`, where `--frame-gap: clamp(8px, 2.2vw, 32px)`.
- **`.hero-frame`:**
  - `background: var(--white)`;
  - `border-radius: clamp(16px, 2vw, 28px)`;
  - `border: 1px solid rgba(2,1,1,.06)`;
  - `box-shadow: var(--shadow)` (the site's single shadow token);
  - `min-block-size: min(calc(100svh - 2 * var(--frame-gap)), 860px)`;
  - `display: grid; grid-template-rows: auto 1fr;`;
  - `max-inline-size: 1440px; margin-inline: auto;` so at 2560px the frame stays centred with Stone around it.
- **`.hero-frame__content`:**
  - `display: grid; place-items: center; text-align: center;`;
  - `padding-block: clamp(48px, 9vh, 120px) clamp(56px, 10vh, 128px)`;
  - `padding-inline: clamp(16px, 4vw, 48px)`.
- The Ice marquee follows straight after `.hero-frame-wrap`, at full width. Remove any top margin, so the Stone padding is the only gap between the frame and the marquee.

## 3. Header inside the frame (home page only)

Keep **one** header element and one nav markup. Don't duplicate the nav. The home page header starts as an "inset" variant inside the frame, then becomes the normal sticky bar on scroll.

**Inset state** (top of the home page). Add `class="site-header site-header--inset"` to the header on index.html only, and move it inside `.hero-frame` as its first child.

- **Layout:** a 3-zone grid: logo `auto`, nav `1fr` (centred), actions `auto`. `padding: clamp(16px, 2.4vw, 32px) clamp(16px, 4vw, 72px) 0`. The background is transparent (the White frame shows through), and the position is static.
- **Logo:** `assets/brand/gate79-horizontal-on-light@1x.png` with `srcset` 2x and 3x, at 36px tall (30px below 768px). Use the dark-logo files only in the dark sticky state.
- **Nav pill track:**
  - `.site-nav__list` becomes an inline flex row: `background: var(--stone)`, `border-radius: 999px`, `padding: 4px`, `gap: 2px`.
  - Each link and dropdown button is 40px tall, `padding-inline: 16px`, `border-radius: 999px`, Geist 15px weight 500, `color: var(--graphite)`.
  - **Hover and focus:** `background: var(--white); color: var(--black); box-shadow: 0 1px 2px rgba(2,1,1,.08);`.
  - **Current page** (`aria-current="page"`): the same white pill. On the home page, no item is current.
  - The dropdown carets stay (14px chevrons). The dropdown panels open below the track exactly as they do now: Black panel, White text.
- **Right CTA:** "Book a growth audit", as a **Black pill with an inner White circle**:
  ```html
  <a class="btn-pill" href="contact.html">Book a growth audit<span class="btn-pill__dot" aria-hidden="true"><svg class="icon"><use href="#i-arrow-up-right"/></svg></span></a>
  ```
  - `.btn-pill`: `display:inline-flex; align-items:center; gap:12px; block-size:44px; padding-inline: 18px 4px; border-radius:999px; background:var(--black); color:var(--white); font: 500 14px/1 Geist;`
  - `.btn-pill__dot`: 36px circle, White, with a 16px Black arrow icon.
  - Hover: the dot rotates the arrow 45° (from ↗ to →) over 200ms, and the pill background becomes Carbon. No glow.

**Sticky state.** When the user scrolls past about 120px, the existing behaviour takes over.
- An IntersectionObserver on a sentinel at the bottom of the hero header toggles `.is-stuck`.
- When stuck, the header becomes `position: fixed`, full width, Black, 64px tall, with the dark logo and the current nav styling (White text, no Stone track). It slides in with `transform: translateY(-100%) → 0` over 240ms.
- Reserve no extra space: the inset header stays in the frame as normal flow, and a cloned visual is **not** needed. Implement it with one header that switches classes, plus a placeholder `div` of equal height left in the frame, so the layout doesn't jump.
- Under reduced motion, the bar simply appears.

**Below 1024px:**
- The pill nav is hidden. The header shows the logo on the left and, on the right, the "Book a growth audit" pill (hidden below 640px) plus the menu button.
- The menu button is a 44px Black circle with the White two-line burger.
- The existing full-screen mobile menu opens from it, unchanged.

## 4. Hero content

```html
<div class="hero-frame__content">
  <h1 class="hero2__title" id="hero-title">Grow on Amazon,<br class="hero2__br"> on purpose.</h1>
  <p class="hero2__lede">Listings, advertising, creative, operations and analytics, run as one accountable team with one number to hit. From the first audit to the monthly report, every move is tied to growth you can see.</p>
  <div class="hero2__actions">
    <a class="btn-pill btn-pill--lg" href="contact.html">Book a growth audit<span class="btn-pill__dot" aria-hidden="true"><svg class="icon"><use href="#i-arrow-up-right"/></svg></span></a>
    <div class="hero2__proof">
      <ul class="avatar-stack" aria-hidden="true"> … 4 × <li><img …></li> … </ul>
      <div class="hero2__rating">
        <span class="stars" role="img" aria-label="Rated 4.9 out of 5"> 5 × star svg (last one half) </span>
        <span class="hero2__trust">Trusted by 27 brands</span>  <!-- SAMPLE: replace with real data -->
      </div>
    </div>
  </div>
</div>
```

- **Headline (`.hero2__title`):**
  - Archivo, `font-stretch: 100%`, weight 600;
  - `font-size: clamp(40px, 7.6vw, 112px)`, `line-height: .98`, `letter-spacing: -.045em`;
  - `color: var(--black)`, max width 14ch, centred, `text-wrap: balance`.
  - It sits on exactly two lines at ≥ 768px ("Grow on Amazon," / "on purpose."). The `<br>` is hidden below 480px, so mobile wraps naturally.
  - "on purpose." stays Black. The reference uses one colour.
  - If Archivo at 100% looks too wide, use `font-stretch: 92%`. The goal is the reference's tight, dense headline.
- **Lede (`.hero2__lede`):**
  - Geist, `font-size: clamp(16px, 1.25vw, 18px)`, `line-height: 1.55`, `color: var(--graphite)`.
  - Max 60ch, so it breaks into 2 lines at desktop.
  - `margin-block: clamp(20px, 2.4vw, 28px) clamp(28px, 3.2vw, 40px)`.
- **Actions row:** `display:flex; align-items:center; justify-content:center; gap: 28px; flex-wrap: wrap;`.
- **`.btn-pill--lg`:** 56px tall, `padding-inline: 24px 6px`, 16px text, 44px dot with a 18px icon.
- **Avatar stack:**
  - Four 40px circles, overlapping by 12px (`margin-inline-start:-12px` from the second one on), each with a 2px White ring (`box-shadow: 0 0 0 2px var(--white)`).
  - Use the team portraits `team-01`, `team-03`, `team-04` and `team-08` (the cool-toned ones), as WebP, `object-fit:cover; object-position: 50% 30%`, and `loading="eager"` because they are above the fold.
- **Rating:**
  - 5 stars at 16px in **Black**, 2px gap. Use the sprite star, and make the fifth star a half star (a clipped fill).
  - Below it, "Trusted by 27 brands" in Geist 14px Graphite. Left-aligned within the proof block.
- **Load motion:** headline, lede and actions rise 12px and fade in, staggered 0 / 80 / 160ms, over 500ms. None under reduced motion. No layout shift: reserve sizes, and set width and height on all images.

## 5. Header on all other pages

No change, apart from adding the same `.btn-pill` style to their header CTA, so the CTA looks identical sitewide (Black pill with White dot on light grounds; on the dark header, an Ice pill with a Black dot).

## 6. Responsive spec (test every row)

| Width | Frame | Header | Headline | Actions |
|---|---|---|---|---|
| ≥ 1440 | 32px Stone gap, max 1440px wide, centred; min-height min(100svh − 64px, 860px) | full pill nav centred | 112px, 2 lines | button and proof side by side |
| 1024–1439 | gap scales | full pill nav; nav padding-inline 14px | ~78–108px | side by side |
| 768–1023 | 16px gap, radius 20px | logo, CTA pill, burger | ~58–76px, 2 lines | side by side, centred |
| 480–767 | 12px gap | logo, CTA pill, burger | 44–58px | stacked: button, then the proof block centred under it (16px gap) |
| 320–479 | 8px gap, radius 16px | logo (30px) and burger only | 40–44px, natural wrap, max 3 lines | button full width (max 360px); proof centred under it |
| Landscape phones (height < 500px) | min-height auto | as per width | `clamp(32px, 6vw, 56px)` | side by side |

- No horizontal scroll at any width. The frame never touches the viewport edge.
- The marquee must be at least partly visible above the fold at 1366×768 and at 390×844. If it isn't, reduce `.hero-frame__content` padding at that height using a `@media (max-height: 820px)` rule.
- Tap targets are at least 44px everywhere. The nav pill items are 40px tall inside a 48px track, which is acceptable because the track padding counts toward the hit area. Check with the QA script.

## 7. Colour balance note

The home page loses its large Black hero, so check the page balance against the brand target (White+Stone 40%, Ice 35%, Black 25%):
- the marquee right below stays **Ice**;
- the results band and footer stay **Black**.

If Black drops much below 20%, make the "The usual agency, and us" band Black. Don't touch the hero.

## 8. QA (Playwright, then stop)

1. Screenshot the home page top (first viewport) at 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 390×844, 360×740, 320×640 and 844×390 (landscape). Compare each against the reference:
   - the frame on a Stone ground;
   - the header inside the frame;
   - the pill nav track;
   - the Black pill CTA with White dot;
   - a huge centred two-line headline;
   - a two-line lede;
   - the button with avatar stack, stars and trust line.
2. Scroll to 400px and screenshot: the Black sticky header must be in place, with no jump in content.
3. Fail on: horizontal overflow; any element touching or crossing the frame edge; any font under 12px; tap targets under 44px (under 1024px); images with `naturalWidth === 0`; console errors; and any gradient, blur, or orange or red colour in the hero.
4. Keyboard: Tab from the top reaches the logo, each nav item (the dropdowns open with Enter or Space), the header CTA, then the hero button, all with visible focus rings.

Output only the changed-file list and the screenshot paths.
