---
name: AniTrack
description: A Letterboxd for anime — log, rate, and obsess.
colors:
  void: "#0f0f0f"
  ember: "#1a1212"
  deep-ember: "#1f1414"
  ember-border: "#2e1a1a"
  crimson: "#dc2626"
  deep-crimson: "#b91c1c"
  warm-white: "#f0e0e0"
  dusty-rose: "#a89090"
  pale-red: "#fef2f2"
  destructive: "#f97316"
  chart-crimson: "#dc2626"
  chart-deep: "#b91c1c"
  chart-mid: "#ef4444"
  chart-light: "#f87171"
  chart-pale: "#fca5a5"
typography:
  display:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 3.75rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  "2xl": "16px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.crimson}"
    textColor: "{colors.pale-red}"
    rounded: "{rounded.lg}"
    padding: "8px 24px"
  button-primary-hover:
    backgroundColor: "{colors.deep-crimson}"
    textColor: "{colors.pale-red}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.dusty-rose}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.deep-ember}"
    textColor: "{colors.warm-white}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.xl}"
    padding: "24px"
  anime-card:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.lg}"
    padding: "8px"
  input:
    backgroundColor: "{colors.void}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
---

# Design System: AniTrack

## 1. Overview

**Creative North Star: "The Personal Archive"**

AniTrack is the visual equivalent of a meticulously kept shelf of physical media — each anime logged is a title that belongs to someone, a record of real time spent and genuine feeling. The UI is dark by design and by identity, not by fashion. It recedes so the content — cover art, titles, ratings — can be the loudest thing on screen.

The system rejects three failure modes by name: **MyAnimeList's cluttered database aesthetic** (overwhelming tables, no visual personality, legacy tracker layout), **generic SaaS templates** (cream or warm-tinted backgrounds, rounded ghost-card grids, hero-metric dashboards, AI-scaffold section markers), and **the chaotic otaku-site** (competing colour families, banner overload, visual noise that competes with the content). What remains is something quieter and more deliberate — a space for obsessives who want their watch history to look as considered as it feels.

Density is controlled. Colour is restrained to a single crimson axis. Typography leans on weight contrast, not size contrast. Motion is purposeful — a direct response to action, never decoration.

**Key Characteristics:**
- Pure near-black background (#0f0f0f) with red-tinted tonal surface lifts, no shadows at rest
- One primary accent (Crimson #dc2626) and one supporting accent (Deep Crimson #b91c1c)
- Weight-driven hierarchy: 900 display → 700 headline → 500 label → 400 body
- Taut, precise components: 8px radius, clear border edges, no ghost-card pairing
- Flat tonal elevation; depth from surface colour steps, not box-shadows

## 2. Colors: The Void-and-Crimson Palette

One dark axis, one accent axis. The background recedes; the crimson commands.

### Primary
- **Crimson** (#dc2626): The single brand accent. Primary CTAs, interactive highlights, the logo mark, focus rings, and the nav active-state indicator. Its rarity is the point — every crimson element is an invitation to act.
- **Deep Crimson** (#b91c1c): Supporting accent. Used for hover states on primary buttons, secondary interactive states, and the chart secondary series. One step darker than Crimson — same family, denotes depth.

### Neutral
- **The Void** (#0f0f0f): Page background. Pure near-black — nothing sits behind it.
- **Ember** (#1a1212): Card and primary surface background. Lifts off The Void with a faint red tint — registers as a distinct layer without needing a heavy border.
- **Deep Ember** (#1f1414): Secondary/muted surface. Used for secondary containers, nav hover states, skeleton placeholder blocks, and nested surfaces.
- **Ember Border** (#2e1a1a): All borders, dividers, and input outlines. A dark red-tinted neutral that defines edges without competing for attention.
- **Warm White** (#f0e0e0): Primary foreground text. Contrast against The Void ≈14:1, against Ember ≈11:1. Used for all body copy, headings, and interactive labels. The slight red warmth harmonises with the crimson accent.
- **Dusty Rose** (#a89090): Secondary and helper text. Passes AA (≈4.5:1) on Ember and The Void. Never used for multi-line body paragraphs — only metadata, timestamps, and helper text.
- **Pale Red** (#fef2f2): Text on coloured (crimson) surfaces. Primary-foreground.
- **Alert Orange** (#f97316): Destructive actions and error states only. Clearly distinct from the brand crimson — reads as warning, not brand.

### Named Rules
**The One Axis Rule.** The crimson accent axis is the only expressive colour in the system. No greens for success, no blues for info, no purple nostalgia. Meaning is conveyed through weight, position, and context — not a second accent colour.

**The Rarity Principle.** Crimson appears on ≤15% of any given screen surface. If a page feels red, the accent is being overused. Pull back to borders and interactive state only; let the cover art carry the visual energy.

## 3. Typography

**Display / Body Font:** Geist Sans (with `system-ui, sans-serif` fallback)
**Mono Font:** Geist Mono (for tabular data, code snippets, and numeric sequences)

**Character:** A single-family system that earns its hierarchy through weight contrast alone. The geometric neutrality of Geist doesn't compete with anime cover art; it organises information around it. No decorative serifs, no expressive display faces — the content is already expressive enough.

### Hierarchy
- **Display** (900 weight, `clamp(2.5rem, 5vw, 3.75rem)`, 1.1 line-height, -0.02em letter-spacing): Hero headlines and the single most prominent statement per page. `text-wrap: balance` always. Never exceed 3.75rem.
- **Headline** (700 weight, 1.875rem / 30px, 1.2 line-height, -0.01em letter-spacing): Section headings (h2). The Letterboxd-style section label: "Your Feed", "This Season", "Reviews".
- **Title** (700 weight, 1.25rem / 20px, 1.3 line-height): Card headings, dialog titles, sidebar section names, profile display names.
- **Body** (400 weight, 0.875rem / 14px, 1.6 line-height): All prose — descriptions, reviews, bio text, activity feed copy. Max 65–75ch line length. Apply `text-wrap: pretty` on paragraphs ≥3 lines.
- **Label** (500 weight, 0.75rem / 12px, 1.4 line-height, +0.02em letter-spacing): Metadata chips, status badges, form labels, nav link text, timestamps, format indicators.

### Named Rules
**The Weight-Not-Size Rule.** Hierarchy is expressed through font-weight before font-size. A title at 14px/700 outranks body at 14px/400. Reserve size increases for genuine level jumps (title → headline → display) — not for minor emphasis within a tier.

**The 14px Floor Rule.** No body text below 14px (0.875rem). The 10px format strip on AnimeCard is the sole permitted exception, and only because it is all-caps and secondary-secondary metadata.

## 4. Elevation

AniTrack uses **flat tonal layering** — no box-shadows at rest. Depth is expressed through surface colour steps: The Void (bg) → Ember (card) → Deep Ember (nested element). Each step is a slightly lighter tint of the same near-black-red family, not a shadow.

One exception is permitted and intentional: interactive cards (AnimeCard, sidebar airing items) acquire `box-shadow: 0 8px 24px rgba(220, 38, 38, 0.15)` on hover — a crimson ambient glow that signals lift and interactivity, not structural depth.

Modals use a full-screen scrim at `rgba(0, 0, 0, 0.6)`. The backdrop-filter blur on the navbar (backdrop-blur-sm) is functional — it prevents the sticky nav from merging with page content — not decorative.

### Named Rules
**The Tonal Stack Rule.** New surfaces must use one of three existing surface tokens: The Void / Ember / Deep Ember. Do not introduce ad-hoc rgba() intermediate tones. If three layers aren't enough, reconsider the information architecture.

**The Shadow Exception Rule.** Box-shadows are reserved for two cases only: (1) hover state on interactive cards (crimson ambient glow), and (2) modal backdrop scrim. A shadow at rest is decoration masquerading as architecture.

## 5. Components

### Buttons
Taut and precise — 8px radius, clear intent on every variant. No ghost-card pattern: never pair a 1px border with a drop shadow greater than 8px blur on the same element. Pick one signal.

- **Shape:** 8px radius (rounded-lg). Pill (rounded-full) only for icon-only toggles and genre tag chips.
- **Primary:** Crimson fill (#dc2626), Pale Red text, 8px vertical / 24px horizontal padding, 14px/500 type. Hover: darken to #b91c1c, no shadow added. Focus-visible: 2px ring-offset, Crimson ring.
- **Ghost:** Transparent background, Dusty Rose text. Hover: Deep Ember background (#1f1414), Warm White text. Used for secondary and nav actions.
- **Outline:** 1px Ember Border stroke, Warm White text, transparent fill. Hover: border shifts to rgba(220, 38, 38, 0.5). Used for peer-level alternatives to a primary action.
- **Destructive:** Alert Orange fill on primary variant; Alert Orange text on ghost variant. Always spatially separated from non-destructive actions — never adjacent in a button group.
- **Disabled:** 38% opacity applied to the entire button. Cursor not-allowed. The border must remain visible — disabled is not invisible.
- **Loading:** Spinner replaces label copy; pointer events disabled. Width holds constant; no layout collapse.

### Cards / Containers
- **Corner style:** 8px (rounded-lg) for inline flow cards (AnimeCard, activity items, airing schedule items). 12px (rounded-xl) for featured surfaces (profile header, stat cards, CTA panels, dialogs). 16px (rounded-2xl) is the ceiling — not for regular cards.
- **Background:** Ember (#1a1212). Any nested content container uses Deep Ember (#1f1414).
- **Border:** 1px Ember Border (#2e1a1a) at rest. Shifts to rgba(220, 38, 38, 0.5) on hover for interactive cards.
- **Shadow strategy:** None at rest. Crimson ambient glow on interactive card hover only (see Elevation).
- **Internal padding:** 12px (p-3) compact; 16px (p-4) standard; 24px (p-6) featured.
- **Anti-pattern:** No nested cards. If the design demands a container inside a container, use a list item pattern instead of a second card border.

### Anime Card (Signature Component)
The primary content unit of the product — what users see most. The 2:3 cover image is the card; everything else serves it.

- **Aspect ratio:** 2:3 (poster). Non-negotiable — every anime card in every grid.
- **Score badge:** Positioned top-right, inside the image. `background: rgba(--void, 0.8)`, `backdrop-filter: blur`, 1px border at rgba(ember-border, 0.5), 6px radius. Shows a 10px filled yellow star (lucide `Star`, `fill-yellow-400`) + numeric score. No colour-only score coding.
- **Format strip:** Gradient overlay (transparent → black/80%) at bottom of image. Format text at 10px / 500 / uppercase / white/70%. Disappears if no format data.
- **Title:** 12px / 500 weight below the image. 2-line clamp. On hover: shifts to Crimson.
- **Hover state:** Border to Crimson/50%, crimson ambient shadow, cover `scale(1.05)`, card `-translateY(2px)`. All transitions 200ms ease-out.

### Inputs / Fields
- **Style:** The Void background (#0f0f0f), 1px Ember Border (#2e1a1a) stroke, 8px radius.
- **Label:** Always visible above the field — never placeholder-only. 14px / 500 weight / Warm White.
- **Placeholder:** Dusty Rose (#a89090). Contrast ≥4.5:1 on The Void — verified.
- **Focus:** 2px Crimson ring, 2px ring-offset in The Void colour. Border colour holds — ring is the primary focus signal.
- **Error:** Red Alert text below the field; input border shifts to Red Alert. Error copy states cause + fix ("Password must be at least 8 characters").
- **Disabled:** 38% opacity on the entire field group.
- **Password toggle:** Icon button at right edge inside field, minimum 44px hit area.

### Navigation
- **Style:** `position: sticky; top: 0; z-index: 50`. The Void background at 90% opacity, `backdrop-filter: blur(8px)`. 1px Ember Border bottom edge. 64px height (h-16).
- **Logo:** Crimson, 18–20px / 700 weight. Routes to `/home` when authenticated, `/` when public.
- **Primary nav (desktop, authenticated):** Horizontal link row between search and avatar. Active state: Warm White text + Deep Ember background. Inactive: Dusty Rose text, hover to Warm White + Deep Ember/60%. 8px radius on the link pill.
- **Mobile:** Nav link row collapses; avatar dropdown carries all destinations.
- **User dropdown:** Ember background (#1a1212), Ember Border edges. Sign Out item in Alert Orange, separated by a divider. Dropdown z-index: 50 (above content, below modals).

### Star Rating
Half-star precision (0.5–5 scale). Filled star: Crimson (user's own rating) or yellow-400 (AniList community score display). Empty star: Ember Border. Hover: incremental left-to-right highlight at 150ms transition. Click/tap: commits the rating at the hovered position.

### Genre Badge
Compact identification chip. Deep Ember background (#1f1414), Warm White text (#f0e0e0), 4px radius, 3px vertical / 10px horizontal padding, 11px / 500 weight. No coloured border — shape alone signals the chip. On interactive contexts (filter chips), hover adds 1px Crimson/40% border.

## 6. Do's and Don'ts

### Do:
- **Do** let cover art carry the visual energy. Every surrounding element — nav, cards, typography — should recede so the anime images lead.
- **Do** use font-weight contrast (700 vs 400) before font-size contrast to establish hierarchy within a tier.
- **Do** keep the accent to Crimson (#dc2626) and Deep Crimson (#b91c1c). No third brand colour. No green-for-success interpretations.
- **Do** show skeleton loading states for any async content that takes > 300ms. Use Deep Ember (#1f1414) skeleton blocks on Ember surfaces.
- **Do** verify WCAG AA (4.5:1) whenever Dusty Rose (#a89090) text appears on a non-standard surface. It passes on The Void and Ember — double-check on any intermediate tint.
- **Do** give every interactive element a visible focus ring: 2px Crimson ring, 2px ring-offset at The Void colour.
- **Do** apply `text-wrap: balance` to all h1–h3 to prevent ragged line breaks at narrow widths.
- **Do** spatially separate destructive actions (delete, sign out) from primary actions — never adjacent in the same button group.

### Don't:
- **Don't** build anything that resembles MyAnimeList — no data-table sprawl, no crowded metadata columns with every field displayed, no legacy list-first layout with no visual hierarchy.
- **Don't** use warm-tinted or cream backgrounds, ghost-card grids paired with drop shadows, hero-metric templates, or numbered section markers (01 / 02 / 03). These are the generic SaaS patterns AniTrack explicitly rejects.
- **Don't** introduce competing colour families, flashy decorative overlays, or visual noise that competes with anime cover art. The content is already expressive.
- **Don't** use gradient text (`background-clip: text` + gradient background). Use Crimson solid for emphasis.
- **Don't** use `border-left` > 1px as a coloured accent stripe on cards, alerts, or callouts. Use a tinted background or a full border instead.
- **Don't** pair a 1px border AND a `box-shadow` > 8px blur on the same element at rest. Pick one signal.
- **Don't** exceed 16px border-radius on cards or panels. 12px (rounded-xl) is the container ceiling. Pill radius is for tags and toggle buttons only.
- **Don't** use colour alone to convey score quality — always pair with the star icon and a numeric value.
- **Don't** put primary navigation items behind a dropdown on desktop. When authenticated, the main sections (Home, Diary, Lists, Stats) must be visible in the navbar.
- **Don't** add a third surface token. If The Void / Obsidian / Deep Indigo aren't enough, simplify the layout rather than introducing a fourth intermediate tone.
