---
name: CopyrightStellar Design System
colors:
  surface: '#0e1414'
  surface-dim: '#0e1414'
  surface-bright: '#343a3a'
  surface-container-lowest: '#090f0f'
  surface-container-low: '#171d1d'
  surface-container: '#1b2121'
  surface-container-high: '#252b2b'
  surface-container-highest: '#303636'
  on-surface: '#dee4e3'
  on-surface-variant: '#bbc9c8'
  inverse-surface: '#dee4e3'
  inverse-on-surface: '#2b3231'
  outline: '#869393'
  outline-variant: '#3c4949'
  surface-tint: '#51dad9'
  primary: '#51dad9'
  on-primary: '#003737'
  primary-container: '#13b5b5'
  on-primary-container: '#004141'
  inverse-primary: '#006a6a'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#ffb691'
  on-tertiary: '#552100'
  tertiary-container: '#ec8a54'
  on-tertiary-container: '#632700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#73f6f6'
  primary-fixed-dim: '#51dad9'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f50'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783100'
  background: '#0e1414'
  on-background: '#dee4e3'
  surface-variant: '#303636'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
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
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system for this IP registry dApp centers on themes of security, immutable record-keeping, and high-tech utility. The target audience includes digital creators, legal professionals, and blockchain developers who require a platform that feels both innovative and legally authoritative.

The visual style is **Glassmorphism** executed with a professional, dark-mode lens. By layering translucent surfaces over deep, monochromatic backgrounds, the UI achieves a sense of spatial depth that suggests the multi-layered nature of smart contracts. The aesthetic is "Technical Elegance"—avoiding the neon-heavy tropes of consumer web3 in favor of a precise, tool-like interface that prioritizes information density and clarity.

## Colors
The palette is engineered for high legibility in low-light environments. 

- **Foundational Neutrals:** The background hierarchy moves from the deep midnight `#0a0a12` base to the `#1e1e3a` elevated surface, creating a clear container architecture without the use of blue or purple tones.
- **Teal Accent (#13b5b5):** Used for primary actions, success states, and blockchain confirmation indicators. It represents the "active" and "digital" nature of the Stellar Soroban network.
- **Amber Accent (#f59e0b):** Reserved for warnings, pending transactions, and intellectual property status alerts. Its high contrast against the teal ensures a clear functional distinction.
- **Neutral Greys:** `#e5e7eb` provides sharp, high-contrast text, while `#9ca3af` is used for metadata and secondary labels.

## Typography
This design system utilizes **Inter** exclusively to leverage its systematic, utilitarian character. 

- **Headings:** Set to Semi-bold (600) with tighter letter-spacing in larger sizes to maintain a compact, "architectural" feel.
- **Body Text:** Set to Regular (400). Line heights are generous (1.6x) to ensure long-form legal text and IP descriptions remain readable against dark backgrounds.
- **Labels:** Small caps or all-caps are used for metadata, transaction hashes, and status badges to differentiate data-points from narrative text.

## Layout & Spacing
The layout follows a 12-column fluid grid on desktop and a 4-column grid on mobile. 

- **Grid Dynamics:** Use a 24px gutter to provide significant breathing room between data-heavy cards. 
- **Sticky Elements:** The main navigation bar is fixed at 64px height with a `backdrop-filter: blur(10px)` to maintain context while scrolling.
- **Reflow:** On mobile devices, sidebars collapse into a bottom-drawer or a hamburger menu, and horizontal margins reduce to 16px.

## Elevation & Depth
Depth is created through transparency and blur rather than traditional drop shadows.

- **Glass Surfaces:** Foreground containers use `rgba(0, 0, 0, 0.45)` with a `10px` backdrop-blur. 
- **Strokes:** Surfaces are defined by a 1px inner border of `rgba(255, 255, 255, 0.1)` to simulate a light-catching edge.
- **Interactive Elevation:** Upon hover, elements should transition to a slightly higher opacity (e.g., `0.55`) and gain a subtle Teal (`#13b5b5`) outer glow with a 15px blur and 0.2 opacity.
- **Z-Index Strategy:** 
  - Level 0: Main Background (`#0a0a12`).
  - Level 1: Cards and content blocks.
  - Level 2: Modals, dropdowns, and the sticky navbar.

## Shapes
The shape language balances approachability with technical precision.

- **Standard Radius:** 8px (`rounded`) for buttons, input fields, and small UI components.
- **Large Radius:** 12px (`rounded-lg`) for main content cards and modals.
- **Pill Radius:** 9999px for status tags and toggle switches.

## Components

- **Buttons:** High-contrast Teal (`#13b5b5`) for primary actions with white text. Apply an inner shadow `inset 0 1px 0 rgba(255,255,255,0.2)` to create a tactile "pressed" look. Secondary buttons use a ghost style with a 1px Teal border.
- **Inputs:** Dark-themed backgrounds (`#0a0a12`) with a 1px border of `#1e1e3a`. Focus state triggers a 2px Teal ring and a subtle background glow.
- **Cards:** Utilize the glassmorphism style defined in Elevation. Headers within cards should have a subtle bottom border of `1px solid rgba(255,255,255,0.05)`.
- **Chips/Status:** For "Registered" IP, use Teal text on a low-opacity Teal background. For "Pending," use Amber text on a low-opacity Amber background.
- **Lists:** Rows in a data table should have a hover state that lightens the background to `rgba(255,255,255,0.03)` and shows a vertical Teal accent bar on the far left.
- **Navbar:** Sticky 64px height. Use a blur effect and a bottom stroke of `#1e1e3a`. The wallet connection status should be a distinct glass pill in the top right.