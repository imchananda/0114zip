Create a production-ready React web application using:

* React (with functional components)
* Tailwind CSS
* Framer Motion (for animations)
* Clean component architecture

Project: "NamtanFilm"

This is a high-end interactive data + fandom experience website for a female artist duo:

* Namtan (blue theme)
* Film (yellow theme)

---

## GLOBAL REQUIREMENTS

Design System:

* Dark mode (default) + Light mode toggle
* Glassmorphism UI (backdrop-blur, semi-transparent panels)
* Neon glow accents (blue #4FC3F7, yellow #FFD54F)
* Smooth rounded corners (2xl+)
* Consistent spacing scale

Typography:

* Modern sans-serif (clean, elegant)
* Clear hierarchy (hero, section, caption)

Layout:

* Max width container (1440px)
* Responsive (desktop-first, mobile optimized)

---

## ANIMATION SYSTEM (Framer Motion)

* Use motion.div for all animated elements
* Use variants for reusable animation states
* Use scroll-based animations:

  * whileInView
  * viewport={{ once: true }}

Animation style:

* Smooth easing: easeInOut
* Duration: 0.6–1.2s
* Subtle scale, opacity, y-axis transitions

Global animation tokens:

* fadeUp
* fadeIn
* staggerChildren
* hoverScale (scale: 1.03–1.08)

---

## PROJECT STRUCTURE

/components
/ui (Button, Card, Toggle, Badge)
HeroOrbit.jsx
ProfileSplit.jsx
DataDashboard.jsx
TrendMap.jsx
FashionSlider.jsx
BrandCollab.jsx
MagazineGrid.jsx
AwardsSection.jsx
FooterLuna.jsx

/pages
Home.jsx

---

## SECTION IMPLEMENTATION

1. HERO ORBIT

Create a full-screen hero section with:

* Centered title:
  "NAMTAN & FILM"
  Subtitle: "The Orbit of Us"

* Two circular profile images (left/right)

* Floating "Luna" element (small circle)

Animation:

* Orbit effect using rotate + absolute positioning
* Floating particles (small animated divs)
* Parallax on scroll (use useScroll + useTransform)

CTA:

* Button "Enter the Orbit"
* Glow effect on hover

---

2. PROFILE SPLIT

* 2-column grid (md:grid-cols-2)
* Left = Namtan (blue gradient)
* Right = Film (yellow gradient)

Each side includes:

* Image
* Name
* Bio
* Stats (followers, works)

Animation:

* Slide in from left/right
* Hover: slight zoom + glow border

Optional:

* Add draggable divider (advanced)

---

3. DATA DASHBOARD

* Grid layout (cards)

Cards:

* Followers total
* MIV
* EMV
* Engagement

Charts:

* Use simple SVG or mock chart bars

Animation:

* Count-up numbers (custom hook)
* Bars animate height
* Stagger children

---

4. TREND MAP

* Dark card with world map image (placeholder)

Overlay:

* Glowing dots (absolute positioned)
* Pulsing animation

Interaction:

* Hover dots → tooltip

---

5. FASHION SLIDER

* Horizontal scroll (overflow-x-auto)
* Card-based layout

Animation:

* Hover scale
* Scroll snap

---

6. BRAND COLLAB

* Grid of logos

Animation:

* Floating effect (y-axis loop)
* Hover → expand card

---

7. MAGAZINE

* Grid layout
* Covers with hover zoom + rotate

---

8. AWARDS

* Trophy cards

Animation:

* Glow pulse
* Hover → elevate

---

9. FOOTER (LUNA)

* Center mascot
* Floating animation
* Links

---

EXTRA FEATURES

* Dark/Light toggle (useState + Tailwind class toggle)
* Reusable Button component
* Reusable Card component
* Clean code, no inline chaos
* Use Tailwind classes (no CSS files)

---

IMPORTANT

* Write FULL working code (not pseudo)
* Include imports
* Use clean structure
* Avoid overcomplication
* Make it visually premium

---

OUTPUT FORMAT

* Provide:

  1. Home.jsx
  2. All components
  3. Tailwind config (if needed)
  4. Any helper hooks

Make it look like a premium Apple-level landing page with smooth animation and futuristic UI.
