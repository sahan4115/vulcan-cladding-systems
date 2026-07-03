# Product

## Register

brand

## Users

Architects, contractors and façade consultants specifying cladding for high-rise
residential schemes in the UK. They arrive top-of-funnel (often from a spec search or
referral), assessing in seconds whether Vulcan is a credible, premium British
manufacturer worth a conversation. They are technical people, but this surface is not
where they read specs — it is where they decide to trust.

## Product Purpose

An Awwwards-calibre homepage for Vulcan Cladding Systems, a British B2B manufacturer of
fire-rated aluminium plank and bar cladding (VulcaLap®, VulcaBar®, VulcaFrame®). The
homepage sells the feeling — "the warmth of timber, the certainty of aluminium" — and
routes qualified visitors to a conversation. Success = a specifier starts contact.

## Brand Personality

Engineered, warm, assured. A precision manufacturer that makes something beautiful:
every section should feel machined (straight edges, exact alignment) but never cold
(timber tones, warm imagery, generous type). Three words: precise, warm, certain.

## Anti-references

- Consumer-style trust furniture (star ratings, review widgets) — off-tone for B2B specifiers.
- Spec-sheet homepages: no dimensions, spans, fixing methods or tables on this surface.
- **Never show HOW fire certification is achieved** — only that it is (A2, CWCT, ISO 9001/14001).
- Generic SaaS landing grammar: kicker labels above every heading, icon-card grids, rounded pills.
- The old vulcansystems.co.uk template look (dated stock-block layout).

## Design Principles

1. **Sell the sizzle** — benefit-led copy and imagery; certification named, never explained.
2. **Machined, not boxy** — sharp corners everywhere; the skewed plank is the only angle,
   used as a micro-mark (separators, markers), never as section-scale decoration.
3. **One light theme, deliberate navy blocks** — dark sections are colour commitments,
   not a theme flip.
4. **Motion is material** — scroll and cursor interactions should feel like the product
   (planks, light on aluminium), always gated behind `prefers-reduced-motion`.
5. **The plank is the brand** — when in doubt, express ideas through the cladding itself.

## Accessibility & Inclusion

- Every animation has a reduced-motion path (static or crossfade); GSAP work is gated
  behind `prefers-reduced-motion` and `gsap.matchMedia()` breakpoints.
- Text on navy blocks keeps ≥4.5:1 (white / high-alpha white, lblue only for large text
  and labels).
- Keyboard: skip link, focus-visible styles on all interactive elements.
