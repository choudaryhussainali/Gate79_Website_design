# Gate79 website: fix prompt for Claude Code (one run)

Paste everything below the line into Claude Code, opened in `D:\Clients\Gate79\Website deign`.

---

# FIX BRIEF: rebuild the Gate79 site to match the references

## 0. Role, scope and rules

You are one senior team: art director, UI/UX lead, conversion copywriter and principal front-end engineer. The site in this folder was built from a brief, but it reads as a static, text-heavy, template-looking page set. Your job in this one run is to **rebuild the visual layer, section composition, media and motion of every page so it follows the reference sites in `D:\website references` closely**, while keeping Gate79's brand rules. Work until every item in section 12 passes, then stop.

Hard constraints (unchanged from the original build):
- Only HTML5, CSS3 and vanilla JavaScript. No frameworks, libraries, build tools, npm, CDNs or icon fonts. Google Fonts is the only external request.
- Opens straight from disk (`file://`) and on any static host. Relative paths only. One classic deferred `assets/js/main.js` (no ES modules).
- Keep: the colour tokens, the three font families, the `@layer` setup, semantic HTML, the `<!-- SAMPLE: replace with real data -->` comments, JSON-LD, sitemap, robots, manifest, accessibility work and the reduced-motion handling. Rewrite anything else that stands in the way.
- Don't write summaries, READMEs or commentary. The only new docs file allowed is `assets/img/IMAGE-LIST.md` (section 7.3). At the end, output the file tree and anything that blocked you.

Work in this order: 1) study the references, 2) logo files, 3) tokens and global components, 4) code-built visuals, 5) pages, 6) bugs, 7) QA in a headless browser.

---

## 1. What is wrong now (fix all of it)

1. **No media.** The only images are the logo. Work, team and case-study slots are empty grey boxes; service pages have no visuals at all.
2. **One template everywhere.** Every section is "numbered mono eyebrow, small headline, text or cards", left-aligned. The `01 CLIENTS … 10 QUESTIONS` section counter is on every section.
3. **Weak hierarchy.** H2 is 30px with 160px section padding; pages feel empty and wordy at once.
4. **Ice is about 17% of each page** (target 35%).
5. **Header shows only the 3D mark**, never the Gate79 name.
6. **Bugs:** testimonial slider shows 2.3 slides on desktop; logo wall clipped on mobile; services page scrolls sideways at 390px (stone rows use negative margins); breadcrumb `<ol>` keeps default padding; inner heroes are crammed; chart labels inside scaling SVG render ~26px; mobile timeline has no line; 12px Ice Deep labels fail contrast; footer contact lines mix sizes; cookie bar covers hero metrics; 1 MB mark PNG loaded for a 64px header slot.
7. **Copy:** 65 em dashes in body copy, repeated "what we did, what it earned and what comes next", the same +38% / −22% stats repeated on one page, "X & Y" invented brand names.

---

## 2. Study the references first (mandatory)

Open every PNG in `D:\website references` at full size and scroll each one top to bottom. They are full-page captures at 1366px wide of five sites:

| Site | Files | What to take from it |
|---|---|---|
| **ecommsyte** (Amazon agency, primary reference) | `ecommsyte-—-Strategy-Driven…`, `Services-—-ecommsyte…`, `About-Us-—-ecommsyte…`, `Testimonials-—-ecommsyte…`, `Careers-—-ecommsyte…`, `Contact-—-ecommsyte…` | Overall page system, header, centred section heads with an accent word, image-topped service cards, marquee ribbon, stat tiles, case-study tabs, team cards, insights layout, rounded dark CTA card, footer, contact page, services-page structure |
| **Ecommdots** (Amazon agency) | `Ecommdots-—-Global-Amazon…` | Dark service cards with a large ghost index number and a final CTA card in the accent colour; full-bleed "brands" image carousel with caption plates; case-study rows (image + overlapping white card with 3 big metrics, alternating sides); blog block (big feature + list of 3); team carousel; split "free audit" form section; huge outlined wordmark in the footer |
| **ASG Consulting** (surveyors) | `Building-Surveyors-Liverpool…`, `12-Trusted-Expert…`, `Schedule-of-Condition…`, `About-ASG…`, `Areas-We-Cover…`, `Property-Surveying-Guides…`, `Contact-Us…` | Inner-page hero with a dark info panel on the right; service-detail split blocks ("What it can include" ticks, "Who it's for", dark "Client outcome" panel); mono labels and pill tags; figure captions on images; resources grid with a featured article; contact page with "direct lines" list + form card + call band |
| **FIXO** (flooring) | `Flooring-Installers-Near-Me…`, `How-It-Works…`, `Flooring-Installation-LVP…`, `LVP-Flooring-Installation…`, `Flooring-Project-Gallery…`, `Flooring-Guides…` | Split hero (copy left, photo right bleeding to the edge, floating rating chip); **trust strip** of 4 icon items under the hero; **instant estimator** multi-step card on a dark band with stat tiles; **"old way vs our way"** comparison (dashed light card, arrow, dark card with ticks and 3 stats); 3-step process with image thumbnails joined by a dashed line and pill tags; gallery with filter pills, **before/after drag slider** and status badges; side-by-side comparison table; FAQ; callback form split card |
| **Mind Beyond Age** (health) | `mindbeyondage-com…`, `About-–-mindbeyondage…` | Hero with floating white chips on the image; image + floating badge split sections; small icon feature tiles beside an image; audience cards with full-image backgrounds and text overlay; 4 numbered step cards; stats band; testimonials cards; centred CTA card |

Write a private spec in `/_notes/refs.md` (delete it at the end) covering, per site: grid and container width, section padding, headline sizes, card shapes (radius, padding, borders, shadow), button and pill shapes, image ratios and how images meet text, every interactive pattern, and the section order of each page. Then apply the decoded system in section 3. Where references differ, use the ecommsyte pattern unless this brief says otherwise.

**Priority rule.** References decide layout, composition, section order, component shapes, media treatment, interaction and motion. Gate79's brand rules (section 4) decide colour, typography, logo, voice and the no-gradient rule, and always win a conflict. Never copy a reference's colours, fonts, logos, photos or text.

---

## 3. The decoded reference system (apply site-wide)

These are the patterns shared by all five references, measured at 1366px.

**Container and rhythm**
- Content width ~1120–1200px. Set `--max: 1200px` (was 1440) with `--gutter: clamp(16px, 4vw, 40px)`. Backgrounds stay full-bleed.
- Section padding `clamp(64px, 8vw, 112px)` (was up to 160px). Adjacent sections on the same ground use 64px.
- Sections alternate grounds constantly; no two neighbouring sections share a colour unless one is a narrow ribbon.

**Section head (the dominant pattern, used on ~80% of sections)**
- Centred: small uppercase eyebrow in the accent colour (Geist Mono 500, 12px, 0.14em tracking, with a 24px hairline before it), a large headline of 2 lines max with **one or two accent-coloured words**, then a one-line centred lede in a dimmer tone, max 60ch.
- Left-aligned variant only for split sections (copy on one side, media on the other), as in the references' "About us", "Command center" and "Who we are" blocks.
- **Delete the numbered section counter** (`01 CLIENTS` etc.). Index numbers appear only where order matters: process steps, service numbers on cards, case-study numbers.

**Type scale (replace the current tokens)**
- `--t-display` hero H1: Archivo 600, stretch 112%, `clamp(2.5rem, 5vw, 4rem)`, lh 1.05.
- `--t-h1` inner-page H1: `clamp(2.25rem, 4.2vw, 3.5rem)`, lh 1.08.
- `--t-h2` section headline: Archivo 600, stretch 112%, `clamp(1.875rem, 3.4vw, 2.75rem)`, lh 1.12. (Was 30px max.)
- `--t-h3` card titles: Geist 600, `1.125rem–1.25rem`.
- Body 16–17px Geist, card body 14–15px, labels 12px mono.
- Accent word in headlines: Ice on Black; **Ice Deep on White/Stone** (large text only, allowed); **Black on Ice** with an Ice Deep underline or simply Black (never Ice-on-Ice).

**Shapes**
- Buttons and tags are **pills** (`border-radius: 999px`), as in every reference. Buttons 48px tall (40px small in header), 20–24px side padding, icon arrow on the right that nudges 3px on hover.
- Cards: radius 16px (`--r-md: 16px`), large panels and CTA cards 24px (`--r-lg: 24px`), image corners 12px inside cards. Card padding 24–32px.
- One soft neutral shadow is allowed for raised cards and floating chips, matching the references' depth: `--shadow: 0 1px 2px rgba(2,1,1,.04), 0 12px 32px rgba(2,1,1,.08)`. On Black/Carbon grounds use a 1px `--line` border instead. No coloured shadows, no glows.
- Pills/tags: 28px tall, 12px Geist 500, 1px border or soft fill (Stone on White, White on Stone, Carbon on Black, White on Ice).

**Recurring components (build each once in `components.css`, reuse everywhere)**
1. **Header** (ecommsyte): Black bar, `gate79-horizontal-on-dark.png` on the left at 36px tall (40px desktop), centred nav with a Services dropdown (6 services with icons, two columns) and an About dropdown (About, Testimonials), pill CTA "Book a growth audit" in Ice on the right. Sticky, 72px tall, turns solid with a hairline after 24px, hides on scroll down and shows on scroll up. Active link: Ice text with a 2px Ice bar under it.
2. **Marquee ribbon** (ecommsyte, Ecommdots): a 56px Ice band directly under heroes with the service names or proof points in Archivo 600 18px, separated by small Black dots, scrolling slowly (40s loop), paused on hover, static under reduced motion.
3. **Trust strip** (FIXO, Mind Beyond Age): 4 items in a row on White, each a 40px Ice-tinted icon circle + bold label + one-line sub-label. 2×2 on mobile.
4. **Stat tile**: card with a big Archivo number, a one-line label. On Black: Carbon tile with `--line` border, Ice number. On Ice: White tile, Black number. Count-up on view.
5. **Image-topped service card** (ecommsyte): 16:10 media on top (code-built visual, section 7), a 36px icon badge overlapping the media's bottom-left corner, title, 2-line description, 2 pill tags, "Explore service →" link. The 3×2 grid ends with a **CTA card** (Ecommdots) in Black with an Ice pill button: "Not sure where to start? Book a growth audit".
6. **Split section**: media on one side (rounded 20px, with one or two floating White chips overlapping its edges, Mind Beyond Age/ecommsyte), copy on the other with eyebrow, headline, paragraph, 3 ticked points and a CTA pair.
7. **Process steps** (FIXO): 3 or 4 steps in a row, each with a 4:3 thumbnail card (code-built visual) carrying a numbered Black circle at its corner, a title, 2 lines of text and a pill tag ("10 working days"), joined by a dashed hairline between thumbnails on desktop and a vertical line on mobile.
8. **Old way vs Gate79 way** (FIXO): left card dashed border on White, title "The usual agency", 5 lines with small × marks; centre Ice circle with an arrow; right card Black with "The Gate79 way", 6 lines with Ice ticks and 3 small stats at the bottom.
9. **Case-study block** (ecommsyte tabs + Ecommdots rows): on Home, a tab bar of 4 pills switching a big card (copy, quote line with an Ice left rule, 4 metric chips, visual on the right). On Work, alternating rows: large image on one side, a White card overlapping it by 64px with brand name in Archivo, category label, three big metrics in a row with a 2px Ice Deep rule on the left, 2 short paragraphs and a link.
10. **Logo wall** (ecommsyte): 2 rows of 6 White rounded tiles (Stone ground), each holding a sample brand logotype set in a different neutral style (see 7.1) so it reads as real logos, not grey text. Mobile: 2 rows scrolling as a marquee in opposite directions.
11. **Testimonial cards** (ecommsyte, Mind Beyond Age): 3-column cards with 5 stars, a quote, avatar (initials circle), name, role and company. Plus one **featured quote** card full-width in Black (Testimonials page and Home). Below the grid: centred line "Brands we work with stay for the report" + pill link to the Testimonials page.
12. **Team card** (ecommsyte): 4:5 portrait, initials badge overlapping the photo's bottom-left, name, role pill, 2-line bio.
13. **Insights block** (ecommsyte, ASG, FIXO): one featured card (image left 55%, text right) and three image cards below with category pill, title, date and read time.
14. **FAQ** (ecommsyte contact, FIXO): centred, max 760px, White rows with 12px radius and 8px gap between rows, a + in an Ice circle that turns to ×.
15. **CTA card** (ecommsyte): a rounded 24px **Black card inside the container** on a light or Ice section, with eyebrow, headline (accent word in Ice), one line, and an Ice pill button on the right (stacked on mobile). This replaces the full-width Ice CTA band at the end of pages.
16. **Inner-page hero** (ecommsyte + ASG): Black band, breadcrumb (mono, Ice current item) above a **centred** H1 with the second line in Ice, a centred lede, and 1–2 pill CTAs. Service pages use the ASG variant: copy left, a Carbon info panel right with 3 rows (icon, label, value: "Ideal for", "First 30 days", "Pairs with").
17. **Footer** (ecommsyte + Ecommdots): Black. Top: horizontal logo on dark, 2-line blurb, round social icons; 3 link columns (Company, Services, Resources); "Get in touch" column with icons. Then a newsletter row. Then a **huge outlined "GATE79"** wordmark set in Archivo 600 at ~16vw, 1px Graphite stroke, transparent fill (this is the name set as type in the footer as a graphic, like Ecommdots; it is not the logo, so give it `aria-hidden="true"`). Bottom bar: © line, legal links, back-to-top round button.

---

## 4. Brand rules (these win every conflict)

**Logo**
- The client logo PNGs are used exactly as supplied: never redraw, recolour, crop, mask, skew, add effects, or animate beyond an opacity/translate fade. Scale with `height` + `width:auto`.
- Files in `assets/brand/`: `gate79-mark.png` (3D emblem, 1626×967), `gate79-horizontal-on-dark.png` and `gate79-horizontal-on-light.png` (1676×468), `gate79-stacked-on-dark.png` (1404×1246), favicons and app icon. If a horizontal file is missing, copy it from `D:\Clients\Gate79\Logos\` or search `D:\` for a `logo-files` folder. Verify pixel sizes match.
- Header and footer use `gate79-horizontal-on-dark.png`. The bare mark is for the hero, About and 404 only.
- **Performance:** keep the originals untouched, and alongside them make proportionally scaled copies for small slots (`gate79-horizontal-on-dark@80h.png` at 80px tall for the 40px header, `gate79-mark@600w.png`, `gate79-mark@1200w.png`) with a high-quality resampler (Lanczos) and no other change. Use `srcset` so large originals load only where they are shown large.
- The logo never sits on Ice or any mid-blue. Clear space ≥ a quarter of the mark's height. Minimums: mark 64px, horizontal 32px, stacked 120px.
- "Gate79" in text: one word, capital G. Never "GATE79" in running text (the footer outline graphic is decorative and `aria-hidden`).

**Colour** (tokens unchanged): Ice `#95C3CF`, Black `#020101`, Stone `#E6E4E0`, White `#FFFFFF`, Graphite `#5B6168`, Ice Deep `#4F8A9A`, Carbon `#111416`, Line `#2A2F34`.
- **Map the references' palettes onto the brand**: their cream/off-white grounds → White and Stone; their charcoal/navy/black bands → Black (cards on them → Carbon); their orange/red/teal accent → **Ice** (fills, pills, buttons, numbers on dark) and **Ice Deep** (accent words, links, icons on light).
- **Balance per page: White + Stone ≈ 40%, Ice ≈ 35%, Black ≈ 25%.** The references use many light sections; reach 35% Ice by making these Ice grounds wherever they appear: marquee ribbons, the about/stats split, "old way vs Gate79 way", case-study section, FAQ section, newsletter band, the band holding the CTA card, and pricing's featured tier. Follow the per-page colour plans in section 6 exactly, then measure (section 12).
- Text on Ice is always Black. Never White on Ice, Ice on White, or Ice on Stone. Small text (under 18px) on White/Stone is Black or `rgba(2,1,1,.72)`; Ice Deep only for 18px+ text, icons, underlined links and the eyebrow line. **Make eyebrows on light grounds Black text with an Ice Deep hairline** (fixes the contrast failure).
- **No gradients anywhere**: the references use gradient heroes, orange glows, red smoke and gradient CTA cards. Replace each with flat colour. No glassmorphism, no blur, no noise. The neutral `--shadow` token is the only shadow.

**Type**: Archivo (variable width; headlines at stretch 112%), Geist (body/UI), Geist Mono (labels, data). Sentence case headings. `text-wrap: balance` on headings.

**Voice**: senior consultant to founder, specific and calm. Primary CTA site-wide "Book a growth audit". Gate79 is independent of Amazon: no Amazon logos, smile arrows, orange or "partner" badges (the references show Amazon marks and partner claims; don't copy those).

---

## 5. Global changes to existing files

- `tokens.css`: update `--max`, `--gutter`, `--section-y`, type scale, `--r-md: 16px`, `--r-lg: 24px`, add `--r-pill: 999px`, `--shadow`, `--header-h: 72px`.
- `layout.css`: centred `.section-head` default with a `.section-head--split` variant; remove the numbered eyebrow markup from every page.
- `components.css`: build the 17 components in section 3. Remove the old icon-square + tick-list service card, the outline-only card grid and the half-width FAQ.
- Header and footer markup must be identical on every page (paths adjusted in `/services/`). Add the Services and About dropdowns (click/tap to open, hover-intent on desktop, Esc closes, `aria-expanded`), and the mobile full-screen menu with the services listed under an accordion.
- Add `testimonials.html` (ecommsyte has a dedicated page) to nav, footer and `sitemap.xml`.

---

## 6. Page blueprints (section order, ground colour, reference source)

Every inner page starts with the inner-page hero (component 16) and ends with the CTA card (component 15) and the footer. `[Ice]`, `[Black]`, `[White]`, `[Stone]` = section ground.

### 6.1 Home `index.html`
1. **Hero** [Black] (ecommsyte + FIXO split). Left: small pill badge "Taking on 3 new brands this quarter" (SAMPLE), H1 "Grow on Amazon, **on purpose.**" (accent in Ice), lede (keep current, shortened to 2 lines), CTAs "Book a growth audit" (Ice pill) + "See the work" (outline pill), then a row of 3 stats (SAMPLE). Right: the **3D mark at 480–560px wide** on Black, with 3 floating White chips around it (code-built, ecommsyte "Best Seller badge" style): "Buy Box held · 97%", "TACoS 9.2% ↓", "Rank #1 · 9 of 14 terms". Chips float on a slow 6s up/down loop (translate only), static under reduced motion.
2. **Marquee ribbon** [Ice]: the six services.
3. **Trust strip** [White]: "Senior specialists only", "90-day first term", "One monthly report", "Independent of Amazon".
4. **Services** [Stone]: centred head "Everything the channel needs, **run as one**", 3×2 grid of image-topped service cards + the Black CTA card as a 7th tile (so the grid is 3+3+1 centred, or make it 4×2 at 1280+ with the CTA as the 8th, your call after checking the reference).
5. **About + numbers** [Ice] (ecommsyte "About us"): left copy "A small senior team, **on the hook for a number**", 2 short paragraphs, "About Gate79" pill. Right: 3 stacked White stat cards each with a context line beside it (ecommsyte layout).
6. **How we work** [White] (FIXO 3-step with thumbnails, extended to 4): Audit, Plan, Run, Report, each with a code-built thumbnail (audit scorecard, 90-day plan Gantt, weekly change log, monthly report page) and a pill ("10 working days", "Signed-off targets", "Weekly", "Monthly").
7. **Old way vs Gate79 way** [Ice] (FIXO comparison component).
8. **Command center split** [White] (ecommsyte): left a large code-built dashboard visual (section 7.2 V1) with a floating White chip "One report · every month"; right eyebrow, headline "One dashboard, **one report**, one team", paragraph, 3 ticks, CTA pair.
9. **Logo wall** [Stone]: "Brands that **took growth seriously**" + 12 logo tiles (SAMPLE).
10. **Results** [Black] (ecommsyte "Numbers that move your bottom line"): left headline + line + pill; right 2×2 Carbon stat tiles. Use each sample stat **once on the page**.
11. **Case studies** [Ice] (ecommsyte tabbed card): tabs "Home & kitchen", "Beauty", "Pets", "Supplements" switching a White card with copy, Ice Deep-ruled quote line, 4 metric chips and a code-built visual (listing before/after or chart). ARIA tabs, arrow-key navigation.
12. **Testimonials** [White]: 3 cards + link to the Testimonials page. Remove the slider on Home.
13. **Team** [Stone] (ecommsyte): "Specialists who treat your brand **like their own**", 4 team cards (SAMPLE), pill link to About.
14. **Insights** [White]: featured card + 3 cards.
15. **FAQ** [Ice]: 6 questions (keep current answers).
16. **CTA card** [White ground, Black card]: "The way in, **and the way up.**" + "Book a growth audit".

### 6.2 Services overview `services.html` (ecommsyte Services page)
1. Inner hero [Black], centred: "Six services. **One accountable team.**" + 2 CTAs.
2. Marquee ribbon [Ice].
3. Section head [White] "Deep expertise at **every stage**" + a row of 6 numbered **jump pills** (anchor links, sticky under the header on desktop while scrolling the page).
4. **Six service blocks**, alternating [White] and [Stone]: each opens with a 48px icon tile, "SERVICE 01" mono label, H2 service name, one-line description; then a **row of 3 sub-service cards** (image-topped, ecommsyte), each with a code-built 16:10 visual, title, 4 dot-bullets and a "Get this service →" pill button linking to the service page section. Make one of the six blocks [Ice] so the page hits its Ice share.
5. Engagement models [Ice]: 3 cards (Full channel / Advertising only / Launch).
6. FAQ [Stone], CTA card [White].

### 6.3 Service pages `/services/*.html` (ASG service template + FIXO service page)
1. Inner hero, split variant [Black]: breadcrumb, pill "Service 01", H1 with the accent line in Ice, lede, 2 CTAs; right Carbon info panel (Ideal for / First 30 days / Pairs with).
2. Trust strip [White] (4 proof points specific to this service).
3. **What it is** split [White] (ASG): copy left with 2 paragraphs; right a large code-built visual for this service (section 7.2) with a caption plate "FIG. 01 · …" in mono, as ASG does.
4. **Who it's for** split, flipped [Stone]: visual left, copy right with a row of audience pills.
5. **What's included** [White] (ASG): 2-column grid of 6 White cards each with an Ice Deep tick in a soft circle, bold lead phrase + one line.
6. **How we run it** [Ice]: 3–4 numbered step cards (Mind Beyond Age style: Black number tile, title, 2 lines).
7. **Where it works best / where we'd say wait** [White] (FIXO comparison variant).
8. **Metrics we report on** [Black]: 4 Carbon stat tiles with the metric name and a one-line definition.
9. **Related case study** [Stone]: one Ecommdots case-study row.
10. FAQ [Ice] (4–5 questions), **Other services** [White]: 3 image-topped cards. CTA card.
Alternate the hero info panel accent and visuals per page; every page keeps its own unique copy.

### 6.4 Work `work.html` (Ecommdots "Driving measurable growth" + FIXO gallery)
1. Inner hero [Black] centred "Work you can **measure**".
2. Results stat strip [Ice]: 4 White stat tiles.
3. Filter pills [White] (All, Advertising, Listings, Creative, Launch, Expansion) with animated reflow, then **alternating case-study rows** (component 9) for 9 sample cases, each with a code-built visual (listing mock, chart, A+ module, search grid). Rows 1, 4, 7 sit on a Stone rounded panel as in Ecommdots.
4. **Before/after strip** [Stone] (FIXO gallery): 3 cards, the first a draggable before/after slider comparing two main-image/listing mockups, the others status-badged ("Live", "In test").
5. Testimonial featured quote [Black], CTA card [Ice ground].

### 6.5 Case study `case-study.html`
Inner hero split [Black] with 3 metric tiles in a Carbon panel on the right (ASG info-panel position); at-a-glance table [White]; challenge split with visual [Stone]; what we did as numbered step cards [Ice]; results with 2 SVG charts in White cards [White]; **before/after slider** of the main image [Stone]; featured client quote [Black]; next case study large link card [Ice]; CTA card.

### 6.6 About `about.html` (ecommsyte About + ASG About + Mind Beyond Age About)
1. Inner hero [Black] centred: "A gate is a way in. **Seventy-nine is our standard.**"
2. Who we are split [White]: left a Black rounded panel holding the **stacked logo on dark** (ecommsyte's brand card position) with service pills under it; right eyebrow, headline, 2 paragraphs, 3 ticks, CTA.
3. Our expertise [Stone]: centred head + a wrap of ~15 capability pills with Ice Deep ticks (ecommsyte).
4. Mission / promise [White]: two cards side by side, left White with border, right Black (ecommsyte vision/mission).
5. Principles [Ice]: 2×3 White value cards with icon tiles (Precise, Assured, Ambitious, Open + 2 more).
6. Numbers [Black]: 4 Carbon stat tiles.
7. Why brands choose us [White]: 2-column icon list (ecommsyte).
8. Team [Stone]: 8 team cards (SAMPLE).
9. Our journey [Black] (ecommsyte timeline): two columns, "Milestones" (2024 founded … 2026) and "How we work" credentials, vertical Ice line with dots, year pills.
10. CTA card [Ice ground].

### 6.7 Testimonials `testimonials.html` (new; ecommsyte Testimonials)
Inner hero [Black] "Don't take our word for it. **Take theirs.**"; featured Black quote card + 9 testimonial cards in a 3×3 grid [Stone]; "Happy partners are a by-product of results" split with 2×2 stat tiles [Black]; video testimonial slots as 16:9 cards with a play button (Ecommdots), code-built poster frames [White]; CTA card [Ice ground]. All quotes SAMPLE.

### 6.8 Pricing `pricing.html` (FIXO estimator + FIXO comparison table)
1. Inner hero [Black] "Clear fees, **tied to growth**".
2. **"Find your starting point" estimator** [Black → keep on Black to frame it] (FIXO Instant estimator): left headline, lede and 2×2 Carbon stat tiles; right a White card with a 4-step form (monthly Amazon revenue band, marketplaces, biggest problem, current ad spend), a step progress bar, Back/Next pills, and a result panel that recommends a tier and service with a "Book a growth audit" link carrying the answers as query parameters to `contact.html` (which pre-fills the form). It recommends; it never promises results.
3. Three tiers [White]: middle tier on an Ice card with a Black "Most brands start here" pill; monthly/quarterly toggle.
4. Comparison table [Stone] (FIXO side-by-side): row labels left, three tier columns, stacked cards on mobile.
5. What every engagement includes [Ice]: 2-column tick cards.
6. FAQ [White], CTA card [Ice ground].

### 6.9 Insights `insights.html` and `article.html` (ASG resources + FIXO blog + ecommsyte insights)
- `insights.html`: inner hero [Black] with a search field (filters cards client-side); featured article card [White]; category filter pills; 9 article cards with a code-built 16:10 cover each (a distinct visual per category: a chart, a listing tile, an A+ module, a map, etc.), category pill, date, read time, arrow button; newsletter band [Ice].
- `article.html`: hero [Stone] with breadcrumb, category pill, title, author row with initials avatar, date, read time; a 16:9 code-built cover image under the hero; sticky TOC + reading progress (keep); body as now with the pull quote set large in Archivo; callouts on Ice; author card; related articles (3 cards) [Stone]; CTA card.

### 6.10 Contact `contact.html` (ecommsyte Contact + ASG Contact + FIXO callback)
1. Inner hero [Black] centred "Let's map your **next chapter of growth.**"
2. Audit form split [Stone]: left eyebrow, "Book your **growth audit**", lede, 4 icon proof lines; right a White form card (current fields, pill submit, success state). Pre-fill from estimator query parameters.
3. "Just have a question?" split [White]: small form card left; right heading, contact lines with icon tiles (email, reply time, hours, office), social circle icons.
4. What happens next [Ice]: 3 numbered step cards.
5. FAQ [White]; footer. (No CTA card on this page.)

### 6.11 Utility pages
`privacy.html`, `terms.html`: article layout on White, hero [Stone]. `404.html` [Black]: 3D mark at 280px, "This gate leads **nowhere.**", 3 pill links.

---

## 7. Media: this is the biggest change

The references are image-led: every service card, case study, article and team member has a picture. The current site has none. Fill every slot.

### 7.1 Rule
- **No empty grey boxes may ship.** Every media slot shows either a supplied photo or a finished code-built visual.
- Look for supplied photos first in `D:\Clients\Gate79\Website images\` (and its subfolders). If photos exist there, copy them into `assets/img/` with the filenames in 7.3, convert to WebP + JPEG fallback at 1x/2x, and use `<picture>` with `width`, `height`, `loading="lazy"` and `decoding="async"`.
- Where no photo exists, use the code-built visual in 7.2 now, and wire the slot so dropping in the photo file later replaces it (use `<picture>` with the visual as the inline fallback, or a `data-photo` attribute your JS checks). Photos never get filters, gradients or overlays.

### 7.2 Code-built visuals (inline SVG or HTML/CSS, brand colours only, crisp at any size)
Build these as reusable snippets. They replace stock-style imagery with product-real visuals that sell an Amazon agency better than photos. Style: flat Black/Carbon or White/Stone panels, Ice and Ice Deep highlights, Graphite context lines, Geist/Geist Mono text, 1px hairlines, 12px radius. No Amazon logo or orange anywhere.

| ID | Visual | Used on |
|---|---|---|
| V1 | Growth dashboard: KPI row (Sales, TACoS, Buy Box %, Sessions) + 90-day line chart + small bar chart, "Live" pill | Home command-center split, Reporting thumbnail |
| V2 | Search results page grid: 8 product tiles (shape + price + stars), one highlighted with an Ice outline and a "#1" pill | Listing optimisation, Home service card |
| V3 | Listing detail mock: image gallery column, title lines, bullet lines, price, Buy Box panel | Listing optimisation, case studies |
| V4 | Main-image before/after: two product-on-white compositions (a simple SVG product shape: bottle, box, pouch, lamp) with the "after" cleaner, larger, infographic badges | Creative service, before/after sliders |
| V5 | A+ content module stack: 3 stacked modules (hero banner, 3-column feature, comparison chart) | Creative & A+ service, article cover |
| V6 | Campaign structure tree: campaign → ad groups → targets, with TACoS bands | Advertising service |
| V7 | Bid rule table: rows of search terms with bids, arrows up/down, spend bars | Advertising service, Run thumbnail |
| V8 | Inventory forecast: stock line with reorder point, stockout shaded flat Stone band | Account management |
| V9 | Account health card: rating gauges as flat bars (not donuts), "Healthy" pill, case log rows | Account management |
| V10 | Brand protection: Brand Store page wireframe + a "hijacker detected" alert card | Brand Store & Registry |
| V11 | Marketplace map: simplified flat world/Europe outline with UK, DE, FR, IT, ES, US dots and launch dates | Launch & expansion |
| V12 | Launch timeline: 90-day Gantt with Vine, ads, reviews, stock rows | Launch & expansion, Plan thumbnail |
| V13 | Audit scorecard: 5 areas with scores out of 10 and a total "62/100" | Audit thumbnail, contact page |
| V14 | Monthly report page: A4 page mock with headline numbers and 3 short paragraphs (grey lines) | Report thumbnail |
| V15 | Product still life set: 6 flat SVG product silhouettes on Stone/White plinths with directional flat shadow shapes (no blur) for case-study and work-card images in each category (home, beauty, pets, sport, supplements, furniture) | Work rows, case-study tabs, insights covers |
| V16 | Logo tiles: 12 distinct sample wordmarks (vary weight, case, serif vs sans, a small symbol) in Black/Graphite only | Logo wall |
| V17 | Team portrait fallback: Carbon 4:5 tile with large initials in Archivo, a thin arch line motif from the mark's silhouette (drawn as a simple quarter-arch hairline, not the logo) | Team cards until photos arrive |
| V18 | Video poster: Carbon 16:9 with initials, name and a 56px Ice play circle | Testimonials video slots |

Make each visual animate subtly when it enters the viewport (chart lines draw, bars grow from 0, a chip fades in last), all off under reduced motion.

### 7.3 `assets/img/IMAGE-LIST.md`
Write a short table of every photo slot that currently uses a fallback: filename, size (e.g. `team-01.jpg`, 960×1200, 4:5), where it appears, and the art direction (cool directional studio light from upper left, flat backgrounds, one product per frame, real team unposed, no handshakes, rockets, cash or people pointing at screens). Slots: 8 team portraits, 9 case-study product shots, 1 office/workspace image for the About split, 3 video posters.

---

## 8. Motion (match the references, keep it calm)

- Page load: header fades in, hero badge, headline lines rise 24px with a mask, lede, CTAs, stats, then the hero visual and its chips fade in. Under 1.2s.
- Section reveals: section heads rise; card grids stagger 60ms; images scale from 1.04 to 1 inside their frame while fading in.
- Marquee ribbons and mobile logo rows: slow continuous scroll, pause on hover.
- Hover (hover-capable devices only): cards lift 4px and their shadow deepens one step; image inside scales 1.04; pill buttons darken one step and the arrow nudges 3px; nav dropdowns fade and drop 8px.
- Floating hero chips: slow 6s vertical drift, staggered.
- Count-ups on stat tiles, chart draws on visuals.
- `prefers-reduced-motion: reduce`: all of the above off, final states shown.
- Animate only `transform` and `opacity`. rAF-throttled, passive listeners.

---

## 9. Responsiveness

Flawless from 320px to 2560px. Test at 320, 360, 390, 414, 768, 834, 1024, 1280, 1366, 1440, 1920, 2560.
- 3-column grids → 2 at 768–1023 → 1 below 768. Split sections stack media first (except forms: copy first).
- Hero on mobile: copy, CTAs full width, then the mark at 240–280px wide with chips repositioned around it (or hidden below 360px), then stats in a 3-column row of small numbers.
- Jump pills and filter pills scroll horizontally in their own container with edge fade masks made from flat colour blocks (no gradients: use a solid end cap).
- Tables become stacked cards. Footer columns stack to 2 then 1. The outlined footer wordmark scales with the viewport and never causes horizontal scroll.
- `100svh`/`100dvh`, safe-area insets, 16px minimum input font size, 44px touch targets.

---

## 10. Bug fixes (all must be verified fixed)

1. Testimonial slider showing 2.3 slides: removed from Home (grid instead); if any slider remains, it shows exactly one slide per view and clips correctly.
2. Mobile logo wall clipped and misaligned: rebuild per component 10.
3. Services page horizontal scroll at 390px and 12px overhang on desktop: remove negative margins, no element wider than its container.
4. Breadcrumb list padding: reset `padding:0; margin:0; list-style:none` on `.breadcrumbs ol`.
5. Inner-hero crowding: 16px between breadcrumb and badge, 20px to H1, 20px to lede, 32px to CTAs.
6. Chart labels inside SVGs: keep text in HTML outside the SVG, or use `vector-effect` and a fixed font size via a non-scaling wrapper so labels stay 12–13px at any width.
7. Mobile timelines: vertical hairline joining the step markers.
8. Eyebrow contrast on light grounds (section 4).
9. Footer contact lines: one font size and line height for all.
10. Cookie notice: a compact Carbon card bottom-left (max 420px wide) that never covers hero content on first load (delay it 1.5s and offset it above the fold content on mobile, or place it at bottom with the hero padded accordingly).
11. Header logo weight: header uses the 80px-tall scaled copy.
12. Insights card link labels: each card's link says "Read the article".
13. Keep zero console errors and zero broken links, including from `/services/`.

---

## 11. Copy edits

- Remove every em dash from site copy (use a full stop, comma, colon or "to"). Target: zero.
- Say "what we did, what it earned and what comes next" once on the whole site (Home hero or the report step), nowhere else.
- Each sample metric appears once per page. Vary the numbers across pages so they read as separate engagements.
- Replace the "X & Y" nature brand names with plainer, varied sample names (one-word coinages, surnames, initials), all marked SAMPLE.
- Headlines: vary rhythm; no more than one clipped two-fragment headline ("Numbers first. Always.") per page.
- Cut body copy on Home by about 40%: card descriptions 1–2 lines, section ledes 1 line, split-section paragraphs 2 short ones max.
- Keep the TACoS article, the FAQ answers and the problem rows; they're good.
- Banned words and patterns from the original brief still apply.

---

## 12. Final QA (run in a headless browser, fix, re-run, then stop)

Use Playwright (or Puppeteer) against `file://` and a local static server. For every page at 390px and 1366px, take full-page screenshots after scrolling through (disable `scroll-behavior: smooth` in the test so reveals trigger), compare them side by side with the matching reference screenshot, and fix anything that looks less finished than the reference.

- [ ] Every page's section order matches its blueprint in section 6, and each section visibly matches the named reference pattern.
- [ ] No empty grey media boxes anywhere; every slot has a code-built visual or photo.
- [ ] Header shows the horizontal logo; logo files unaltered, never on Ice, min sizes and clear space respected.
- [ ] Colour balance per page measured from full-page 1366px screenshots by nearest-colour pixel count: White+Stone 35–45%, Ice 30–40%, Black+Carbon 20–30%. Print the table and fix pages outside range.
- [ ] Zero gradients (`grep -i gradient` on all CSS and HTML returns nothing), no blur, only the neutral shadow token.
- [ ] Only Archivo, Geist, Geist Mono; H2 at least 40px on desktop.
- [ ] No numbered section-counter eyebrows remain.
- [ ] Zero em dashes in visible copy; no banned words; "Gate79" spelled correctly.
- [ ] No horizontal scroll from 320 to 2560px (`document.documentElement.scrollWidth === innerWidth` at each tested width).
- [ ] All 13 bugs in section 10 fixed.
- [ ] Keyboard: dropdowns, menu, tabs, estimator, before/after slider (arrow keys), filters and FAQ all work; focus visible; reduced motion respected.
- [ ] No console errors; no broken links or assets.
- [ ] Lighthouse 95+ in all categories on Home, a service page and Contact.
- [ ] `assets/img/IMAGE-LIST.md` exists; `/_notes/` deleted.

Output only the final file tree and any blockers.
