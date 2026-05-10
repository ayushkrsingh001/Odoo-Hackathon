---
name: Traveloop Visual Identity
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  padding-card: 24px
  stack-gap: 16px
---

## Brand & Style

The design system is built on a "Precision-Driven Serenity" philosophy. It targets high-intent travelers and planners who value both the emotional inspiration of travel and the logistical clarity of a SaaS tool. The brand personality is professional yet inviting—bridging the gap between a high-end travel magazine and a high-performance productivity suite.

The aesthetic follows a **Premium Minimalism** style. It utilizes heavy whitespace to reduce cognitive load during complex itinerary planning, while borrowing "soft-UI" cues for warmth. By mixing the lifestyle-centric elegance of Airbnb with the structured, block-based utility of Notion, the system creates a workspace that feels both like a journal and a command center.

## Colors

This design system uses a restricted, high-clarity color palette. 

- **Primary Blue (#2563EB):** Used for primary actions, active navigation states, and key interactive markers. It signals trust and reliability.
- **Accent Teal (#14B8A6):** Reserved for "success" states, budget indicators, or secondary highlights like "Eco-friendly" tags or finalized bookings.
- **Neutral Grays:** Gray-900 is the standard for high-contrast typography. Gray-50 and Gray-100 are utilized extensively for layout "blocks" and section partitioning to create depth without using borders.

The background is strictly white (#FFFFFF) for primary content areas, utilizing #F9FAFB for sidebars, secondary panels, or "card" tracks to maintain a clean, structured appearance.

## Typography

The design system relies exclusively on **Inter** to achieve a neutral, systematic feel. High readability is prioritized through generous line heights and slight negative letter spacing on larger headlines to keep the bold weights feeling "tight" and premium.

- **Headings:** Use Semibold (600) or Bold (700) weights. Navigation and category headers should use high-contrast sizing to create a clear Information Architecture.
- **Body Text:** Standardized at 16px for desktop to ensure comfort during long planning sessions.
- **Labels:** Used for metadata (dates, flight numbers, price tags). These should often use the Gray-500/600 range to sit back from primary content.

## Layout & Spacing

The layout utilizes a **12-column fixed grid** for desktop, centered within the viewport. To mimic a "productivity" feel, the system employs a modular block approach where different modules (Itinerary, Map, Budget) live in distinct containers with generous internal padding.

- **Margins & Gutters:** Desktop uses 40px outer margins with 24px gutters.
- **Rhythm:** A 4px/8px baseline grid ensures vertical consistency. 
- **Mobile Reflow:** On mobile, the 12-column grid collapses to a single column. Horizontal scrolling "card carousels" are used for flight or hotel options to save vertical space while maintaining the large card format.

## Elevation & Depth

This design system avoids heavy borders in favor of **Ambient Shadows** and **Tonal Layering**. Depth is used to signify interactivity and "modality."

- **Level 0 (Base):** White background.
- **Level 1 (Subtle):** #F9FAFB surfaces, used for sidebar navigation or inactive card states. No shadow.
- **Level 2 (Floating):** Standard cards. Features a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Overlay):** Modals and dropdowns. Features a more pronounced shadow to lift the element clearly off the canvas: `0px 10px 32px rgba(0, 0, 0, 0.10)`.

Transitions between elevations should be smooth (200ms ease-in-out) to maintain the "premium" feel.

## Shapes

The shape language is defined by **Large Rounded Corners**, which soften the technical nature of a SaaS tool and evoke a friendlier, travel-friendly vibe.

- **Cards & Containers:** Use 24px (XL) radius to define major content areas.
- **Interactive Elements:** Buttons and Input fields use a 12px (LG) radius, providing a distinct but complementary "pill-lite" appearance.
- **Visual Cues:** Avoid sharp 90-degree angles anywhere in the UI to maintain the approachable aesthetic.

## Components

### Buttons
- **Primary:** Solid #2563EB with white text. 12px radius. Heavy horizontal padding (24px).
- **Secondary:** #F3F4F6 background with Gray-900 text. Used for "Add to Trip" or "Save for Later."
- **Ghost:** No background, Primary Blue text. Used for less critical actions or "See More" links.

### Cards
Cards are the core unit of this design system. They must feature 24px padding and 24px corner radius. Images within cards should have a top-only 24px radius or a nested 16px radius if padded.

### Inputs & Search
Inspired by Google Travel, the search inputs should be large with a 12px radius. Use icons (e.g., Lucide or Phosphor) to prefix inputs like "Location" or "Dates" to provide instant visual context.

### Chips
Used for tags like "Non-stop," "Breakfast Included," or "Refundable." These use #F3F4F6 backgrounds, 100px (full) roundedness, and 12px Medium typography.

### Progress Indicators
For multi-step booking or itinerary building, use a thin Primary Blue line at the top of the container to show progress without cluttering the layout.