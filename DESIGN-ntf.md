NamtanFilm Design System — Adapted from Claude (Anthropic)
1. Visual Theme & Atmosphere
NamtanFilm's interface is a literary salon reimagined as a fandom portal — warm, unhurried, and quietly emotional. The entire experience is built on a parchment-toned canvas (#f5f4ed) that deliberately evokes the feeling of high-quality paper rather than a digital surface. Where most fan sites lean into loud, chaotic aesthetics, NamtanFilm's design radiates human warmth, as if the website itself is a love letter written on beautiful stationery.

The signature move is the serif/sans split typographic system — Georgia (serif) for headlines carries the gravitas of a book title, while Inter + Noto Sans Thai (sans) handles all functional UI text. Combined with the dual-identity brand colors — Namtan Teal (#6cbfd0) and Film Gold (#fbdf74) — the visual language says "curated fandom" rather than "fan-made page." The serif headlines breathe at tight-but-comfortable line-heights (1.10–1.30), creating a cadence that feels more like reading an essay than scanning a fan site.

What makes NamtanFilm's design truly distinctive is its warm neutral palette inherited from Claude's system. Every gray has a yellow-brown undertone (#5e5d59, #87867f, #4d4c48) — there are no cool blue-grays anywhere. Borders are cream-tinted (#f0eee6, #e8e6dc), shadows use warm transparent blacks, and even the darkest surfaces (#141413, #30302e) carry a barely perceptible olive warmth. The brand's identity colors — Teal and Gold — are used sparingly as accent punctuation against this warm canvas, never overwhelming the editorial calm.

Key Characteristics:

Warm parchment canvas (#f5f4ed) evoking premium paper, not screens
Serif/Sans type split: Georgia (headlines) + Inter/Noto Sans Thai (UI/body)
Dual-identity brand accents: Namtan Teal (#6cbfd0) and Film Gold (#fbdf74)
Luna gradient (Teal → Gold) for union/couple moments — the highest-signal brand element
Exclusively warm-toned neutrals — every gray has a yellow-brown undertone
Ring-based shadow system (0px 0px 0px 1px) creating border-like depth without visible borders
Magazine-like pacing with generous section spacing and serif-driven hierarchy
ViewState system (namtan/film/both/lunar) subtly tints accents across the entire site

2. Color Palette & Roles
Primary
Anthropic Near Black (#141413): The primary text color and dark-theme surface — not pure black but a warm, almost olive-tinted dark that's gentler on the eyes. The warmest "black" in any major design system.
Namtan Teal (#6cbfd0): น้ำตาล's identity color — a soft, calming teal used for Namtan-specific accents, links, and badge moments. Deliberately gentle and approachable.
Film Gold (#fbdf74): ฟิล์ม's identity color — a warm, sunny gold used for Film-specific accents, highlights, and badge moments. Radiates warmth and energy.

Brand Accent Variants
Namtan Teal Light (#8ed0dd): Lighter variant for hover states and subtle backgrounds.
Namtan Teal Dark (#4a9aab): Darker variant for pressed states and text-on-light usage.
Film Gold Light (#fce89a): Lighter variant for hover states and subtle backgrounds.
Film Gold Dark (#d4b84e): Darker variant for pressed states and text-on-light usage.
Namtan Glow (rgba(108, 191, 208, 0.35)): Soft glow halo for Namtan-accented elements.
Film Glow (rgba(251, 223, 116, 0.35)): Soft glow halo for Film-accented elements.

Luna Gradient System
Luna Gradient: linear-gradient(135deg, #6cbfd0 0%, #fbdf74 100%) — the primary brand gradient representing NamtanFilm as a couple. Used only for the highest-signal brand moments: primary CTA, logo accent, achievement badges, hero flourishes.
Luna Gradient Reverse: linear-gradient(135deg, #fbdf74 0%, #6cbfd0 100%) — reversed direction for visual variety.
Luna Gradient Horizontal: linear-gradient(90deg, #6cbfd0 0%, #fbdf74 100%) — horizontal variant for gradient text treatment.
Luna Gradient Subtle: linear-gradient(135deg, rgba(108,191,208,0.15) 0%, rgba(251,223,116,0.15) 100%) — barely-visible wash for background tinting.
Luna Shimmer: linear-gradient(135deg, #6cbfd0 0%, #8ed0dd 30%, #fbdf74 70%, #fce89a 100%) — animated 4-stop shimmer (background-size: 200% 200%) for the Lunar ViewState.

Note: NamtanFilm's design is largely gradient-free like Claude's. The Luna gradient is the exception — it represents the emotional core of the brand (the couple together). Outside of Luna gradient moments, depth and visual richness come from the interplay of warm surface tones and light/dark section alternation, exactly as in Claude's system.

Secondary & Accent
Error Crimson (#b53333): A deep, warm red for error states — serious without being alarming.
Focus Blue (#3898ec): Standard blue for input focus rings — the only cool color in the entire system besides Namtan Teal, used purely for accessibility.

Surface & Background
Parchment (#f5f4ed): The primary page background — a warm cream with a yellow-green tint that feels like aged paper. The emotional foundation of the entire design.
Ivory (#faf9f5): The lightest surface — used for cards and elevated containers on the Parchment background. Barely distinguishable but creates subtle layering.
Pure White (#ffffff): Reserved for specific button surfaces and maximum-contrast elements.
Warm Sand (#e8e6dc): Button backgrounds and prominent interactive surfaces — a noticeably warm light gray.
Dark Surface (#30302e): Dark-theme containers, nav borders, and elevated dark elements — warm charcoal.
Deep Dark (#141413): Dark-theme page background and primary dark surface.

Neutrals & Text
Charcoal Warm (#4d4c48): Button text on light warm surfaces — the go-to dark-on-light text.
Olive Gray (#5e5d59): Secondary body text — a distinctly warm medium-dark gray.
Stone Gray (#87867f): Tertiary text, footnotes, and de-emphasized metadata.
Dark Warm (#3d3d3a): Dark text links and emphasized secondary text.
Warm Silver (#b0aea5): Text on dark surfaces — a warm, parchment-tinted light gray.

Semantic & Accent
Border Cream (#f0eee6): Standard light-theme border — barely visible warm cream, creating the gentlest possible containment.
Border Warm (#e8e6dc): Prominent borders, section dividers, and emphasized containment on light surfaces.
Border Dark (#30302e): Standard border on dark surfaces — maintains the warm tone.
Ring Warm (#d1cfc5): Shadow ring color for button hover/focus states.
Ring Subtle (#dedc01): Secondary ring variant for lighter interactive surfaces.
Ring Deep (#c2c0b6): Deeper ring for active/pressed states.

3. Typography Rules
Font Family
Headline: Georgia (serif) — the closest widely-available match to Anthropic Serif. Provides the same literary gravitas and book-title presence.
Body / UI (Latin): Inter — clean, modern sans-serif for all functional text.
Body / UI (Thai): Noto Sans Thai — renders Thai script at proper proportions. Loaded alongside Inter.
Code: JetBrains Mono or system monospace — for inline code and terminal display.
Note: Georgia serves as the serif headline font (matching Claude's Anthropic Serif role). Inter + Noto Sans Thai replace Anthropic Sans for body/UI, ensuring both English and Thai text render beautifully. All fonts are loaded via next/font/google with CSS variables for zero layout shift.

Hierarchy
Role	Font	Size	Weight	Line Height	Letter Spacing	Notes
Display / Hero	Georgia	64px (4rem)	normal (400)	1.10 (tight)	normal	Maximum impact, book-title presence
Section Heading	Georgia	52px (3.25rem)	normal (400)	1.20 (tight)	normal	Feature section anchors
Sub-heading Large	Georgia	36–36.8px (~2.3rem)	normal (400)	1.30	normal	Secondary section markers
Sub-heading	Georgia	32px (2rem)	normal (400)	1.10 (tight)	normal	Card titles, feature names
Sub-heading Small	Georgia	25–25.6px (~1.6rem)	normal (400)	1.20	normal	Smaller section titles
Feature Title	Georgia	20.8px (1.3rem)	normal (400)	1.20	normal	Small feature headings
Body Serif	Georgia	17px (1.06rem)	normal (400)	1.60 (relaxed)	normal	Serif body text (editorial passages)
Body Large	Inter / Noto Sans Thai	20px (1.25rem)	400	1.60 (relaxed)	normal	Intro paragraphs
Body / Nav	Inter / Noto Sans Thai	17px (1.06rem)	400–500	1.00–1.60	normal	Navigation links, UI text
Body Standard	Inter / Noto Sans Thai	16px (1rem)	400–500	1.25–1.60	normal	Standard body, button text
Body Small	Inter / Noto Sans Thai	15px (0.94rem)	400–500	1.00–1.60	normal	Compact body text
Caption	Inter / Noto Sans Thai	14px (0.88rem)	400	1.43	normal	Metadata, descriptions
Label	Inter / Noto Sans Thai	12px (0.75rem)	400–500	1.25–1.60	0.12px	Badges, small labels
Overline	Inter / Noto Sans Thai	10px (0.63rem)	400	1.60	0.5px	Uppercase overline labels
Micro	Inter / Noto Sans Thai	9.6px (0.6rem)	400	1.60	0.096px	Smallest text
Code	JetBrains Mono	15px (0.94rem)	400	1.60	-0.32px	Inline code, terminal

Principles
Serif for authority, sans for utility: Georgia carries all headline content with normal weight, giving every heading the gravitas of a published title. Inter/Noto Sans Thai handles all functional UI text — buttons, labels, navigation — with quiet efficiency.
Natural weight for serifs: All Georgia headings use normal weight (400) — Georgia's default weight already carries sufficient presence. No bold, no light. This creates a consistent "voice" across all headline sizes.
Relaxed body line-height: Most body text uses 1.60 line-height — significantly more generous than typical fan sites (1.4–1.5). This creates a reading experience closer to a book than a dashboard, and provides extra breathing room for Thai script.
Tight-but-not-compressed headings: Line-heights of 1.10–1.30 for headings are tight but never claustrophobic. The serif letterforms need breathing room that sans-serif fonts don't.
Micro letter-spacing on labels: Small sans text (12px and below) uses deliberate letter-spacing (0.12px–0.5px) to maintain readability at tiny sizes.
Thai-first readability: Noto Sans Thai is loaded as a co-primary font alongside Inter. Thai text should never be forced into Latin-only typefaces. Line-heights of 1.60 ensure Thai descenders and ascenders have sufficient space.

4. Component Stylings
Buttons
Warm Sand (Secondary)

Background: Warm Sand (#e8e6dc)
Text: Charcoal Warm (#4d4c48)
Padding: 0px 12px 0px 8px (asymmetric — icon-first layout)
Radius: comfortably rounded (8px)
Shadow: ring-based (#e8e6dc 0px 0px 0px 0px, #d1cfc5 0px 0px 0px 1px)
The workhorse button — warm, unassuming, clearly interactive

White Surface

Background: Pure White (#ffffff)
Text: Anthropic Near Black (#141413)
Padding: 8px 16px 8px 12px
Radius: generously rounded (12px)
Hover: shifts to secondary background color
Clean, elevated button for light surfaces

Dark Charcoal

Background: Dark Surface (#30302e)
Text: Ivory (#faf9f5)
Padding: 0px 12px 0px 8px
Radius: comfortably rounded (8px)
Shadow: ring-based (#30302e 0px 0px 0px 0px, ring 0px 0px 0px 1px)
The inverted variant for dark-on-light emphasis

Brand Namtan Teal

Background: Namtan Teal (#6cbfd0)
Text: Anthropic Near Black (#141413)
Radius: 8–12px
Shadow: ring-based (#6cbfd0 0px 0px 0px 0px, #4a9aab 0px 0px 0px 1px)
Namtan-identity CTA — used for Namtan-specific actions and when ViewState is "namtan"

Brand Film Gold

Background: Film Gold (#fbdf74)
Text: Anthropic Near Black (#141413)
Radius: 8–12px
Shadow: ring-based (#fbdf74 0px 0px 0px 0px, #d4b84e 0px 0px 0px 1px)
Film-identity CTA — used for Film-specific actions and when ViewState is "film"

Brand Luna Gradient

Background: linear-gradient(135deg, #6cbfd0 0%, #fbdf74 100%)
Text: Anthropic Near Black (#141413)
Radius: 8–12px
Shadow: 0 0 16px rgba(108, 191, 208, 0.25)
The primary CTA — the highest-signal button, used for "both/lunar" moments and the most important action on each page

Dark Primary

Background: Anthropic Near Black (#141413)
Text: Warm Silver (#b0aea5)
Padding: 9.6px 16.8px
Radius: generously rounded (12px)
Border: thin solid Dark Surface (1px solid #30302e)
Used on dark theme surfaces

Cards & Containers
Background: Ivory (#faf9f5) or Pure White (#ffffff) on light surfaces; Dark Surface (#30302e) on dark
Border: thin solid Border Cream (1px solid #f0eee6) on light; 1px solid #30302e on dark
Radius: comfortably rounded (8px) for standard cards; generously rounded (16px) for featured; very rounded (32px) for hero containers and embedded media
Shadow: whisper-soft (rgba(0,0,0,0.05) 0px 4px 24px) for elevated content
Ring shadow: 0px 0px 0px 1px patterns for interactive card states
Section borders: 1px 0px 0px (top-only) for list item separators
Brand accent: optional 3px top-border in Namtan Teal, Film Gold, or Luna gradient to indicate identity context

Inputs & Forms
Text: Anthropic Near Black (#141413)
Padding: 1.6px 12px (very compact vertical)
Border: standard warm borders
Focus: ring with Focus Blue (#3898ec) border-color — the only cool color moment
Radius: generously rounded (12px)

Navigation
Sticky top nav with warm background
Logo: NamtanFilm wordmark in Anthropic Near Black, optionally with Luna gradient accent
Links: mix of Near Black (#141413), Olive Gray (#5e5d59), and Dark Warm (#3d3d3a)
Nav border: 1px solid #30302e (dark) or 1px solid #f0eee6 (light)
CTA: Luna Gradient button or White Surface button
Active link: accent with current ViewState color (Teal/Gold/Gradient)
Hover: text shifts to foreground-primary, no decoration

Image Treatment
Artist photos and fan-community imagery
Generous border-radius on media (16–32px)
Embedded video players with rounded corners
Dark UI screenshots provide contrast against warm light canvas
Warm, editorial-style photography treatment — never harsh or over-processed

Distinctive Components
ViewState Cards

Four identity states: Namtan (teal), Film (gold), Both (gradient), Lunar (gradient + shimmer)
Each state subtly tints interactive elements across the entire page
ViewState toggle uses the respective brand colors with warm sand inactive states

Profile Cards

Artist profile cards with identity-colored accent borders
Namtan card: 3px left border in #6cbfd0
Film card: 3px left border in #fbdf74
Together/Lunar card: 3px left border with Luna gradient

Content Rows (Netflix-style)

Horizontal-scrolling content cards on Parchment or Dark Surface
Cards in Ivory with Border Cream borders
Category-filtered by ViewState (shows Namtan/Film/Both content)

Dark/Light Section Alternation

The page alternates between Parchment light and Near Black dark sections
Creates a reading rhythm like chapters in a book
Each section feels like a distinct environment

5. Layout Principles
Spacing System
Base unit: 8px
Scale: 3px, 4px, 6px, 8px, 10px, 12px, 16px, 20px, 24px, 30px
Button padding: asymmetric (0px 12px 0px 8px) or balanced (8px 16px)
Card internal padding: approximately 24–32px
Section vertical spacing: generous (estimated 80–120px between major sections)

Grid & Container
Max container width: approximately 1200px, centered
Hero: centered with editorial layout
Feature sections: single-column or 2–3 column card grids
Content rows: horizontal scroll with peek (Netflix-style)
Full-width dark sections breaking the container for emphasis

Whitespace Philosophy
Editorial pacing: Each section breathes like a magazine spread — generous top/bottom margins create natural reading pauses.
Serif-driven rhythm: The Georgia serif headings establish a literary cadence that demands more whitespace than sans-serif designs.
Content island approach: Sections alternate between light and dark environments, creating distinct "rooms" for each content block.

Border Radius Scale
Sharp (4px): Minimal inline elements
Subtly rounded (6–7.5px): Small buttons, secondary interactive elements
Comfortably rounded (8–8.5px): Standard buttons, cards, containers
Generously rounded (12px): Primary buttons, input fields, nav elements
Very rounded (16px): Featured containers, video players, tab lists
Highly rounded (24px): Tag-like elements, highlighted containers
Maximum rounded (32px): Hero containers, embedded media, large cards

6. Depth & Elevation
Level	Treatment	Use
Flat (Level 0)	No shadow, no border	Parchment background, inline text
Contained (Level 1)	1px solid #f0eee6 (light) or 1px solid #30302e (dark)	Standard cards, sections
Ring (Level 2)	0px 0px 0px 1px ring shadows using warm grays	Interactive cards, buttons, hover states
Whisper (Level 3)	rgba(0,0,0,0.05) 0px 4px 24px	Elevated feature cards, gallery images
Inset (Level 4)	inset 0px 0px 0px 1px at 15% opacity	Active/pressed button states
Brand Glow (Level 5)	0 0 16px rgba(brand-color, 0.25)	Brand-accented CTAs, Luna gradient buttons

Shadow Philosophy: NamtanFilm inherits Claude's shadow philosophy — communicating depth through warm-toned ring shadows rather than traditional drop shadows. The signature 0px 0px 0px 1px pattern creates a border-like halo that's softer than an actual border. When drop shadows do appear, they're extremely soft (0.05 opacity, 24px blur) — barely visible lifts that suggest floating rather than casting. The addition of "Brand Glow" (Level 5) creates a soft luminous halo behind Luna gradient CTAs — like stage lighting illuminating the most important action.

Decorative Depth
Light/Dark alternation: The most dramatic depth effect comes from alternating between Parchment (#f5f4ed) and Near Black (#141413) sections — entire sections shift elevation by changing the ambient light level.
Warm ring halos: Button and card interactions use ring shadows that match the warm palette — never cool-toned or generic gray.
Brand glow: Luna gradient buttons and brand-accented elements use soft colored glows (rgba(108,191,208,0.25) or rgba(251,223,116,0.25)) to draw attention without breaking the warm aesthetic.

7. Do's and Don'ts
Do
Use Parchment (#f5f4ed) as the primary light background — the warm cream tone is the foundation
Use Georgia at normal weight for all headlines — the serif consistency is intentional
Use Namtan Teal (#6cbfd0) for Namtan-specific elements and Film Gold (#fbdf74) for Film-specific elements
Use the Luna gradient (135deg, #6cbfd0 → #fbdf74) only for primary CTAs and the highest-signal brand moments
Keep all neutrals warm-toned — every gray should have a yellow-brown undertone
Use ring shadows (0px 0px 0px 1px) for interactive element states instead of drop shadows
Maintain the editorial serif/sans hierarchy — Georgia for content headlines, Inter/Noto Sans Thai for UI
Use generous body line-height (1.60) for a literary reading experience that works for both Thai and English
Alternate between light and dark sections to create chapter-like page rhythm
Apply generous border-radius (12–32px) for a soft, approachable feel
Match the ViewState context — Teal accents when Namtan, Gold when Film, Gradient when Both/Lunar

Don't
Don't use cool blue-grays anywhere — the palette is exclusively warm-toned
Don't use bold (700+) weight on Georgia headlines — normal weight is the ceiling for serifs
Don't introduce saturated colors beyond the brand palette — the system is deliberately muted except for Teal and Gold accents
Don't use sharp corners (< 6px radius) on buttons or cards — softness is core to the identity
Don't apply heavy drop shadows — depth comes from ring shadows and background color shifts
Don't use pure white (#ffffff) as a page background — Parchment (#f5f4ed) or Ivory (#faf9f5) are always warmer
Don't reduce body line-height below 1.40 — the generous spacing supports Thai readability and editorial personality
Don't use monospace fonts for non-code content — code fonts are strictly for code
Don't mix in sans-serif for headlines — the serif/sans split is the typographic identity
Don't overuse the Luna gradient — it loses its magic if everything is gradient. Use it for 1–2 hero moments per page maximum
Don't use the old brand colors (#1E88E5, #FDD835) — they've been replaced by #6cbfd0 and #fbdf74

8. Responsive Behavior
Breakpoints
Name	Width	Key Changes
Small Mobile	<479px	Minimum layout, stacked everything, compact typography
Mobile	479–640px	Single column, hamburger nav, reduced heading sizes
Large Mobile	640–767px	Slightly wider content area
Tablet	768–991px	2-column grids begin, condensed nav
Desktop	992px+	Full multi-column layout, expanded nav, maximum hero typography (64px)

Touch Targets
Buttons use generous padding (8–16px vertical minimum)
Navigation links adequately spaced for thumb navigation
Card surfaces serve as large touch targets
Minimum recommended: 44x44px

Collapsing Strategy
Navigation: Full horizontal nav collapses to hamburger on mobile
Feature sections: Multi-column → stacked single column
Content rows: Horizontal scroll maintained at all breakpoints (Netflix-style)
Hero text: 64px → 36px → ~25px progressive scaling
Profile cards: Side-by-side → stacked vertical
Section padding: Reduces proportionally but maintains editorial rhythm

Image Behavior
Artist photos and gallery images scale proportionally within rounded containers
Illustrations maintain quality at all sizes
Video embeds maintain 16:9 aspect ratio with rounded corners
No art direction changes between breakpoints

9. Agent Prompt Guide
Quick Color Reference
Namtan Accent: "Namtan Teal (#6cbfd0)"
Film Accent: "Film Gold (#fbdf74)"
Luna CTA: "Luna gradient (135deg, #6cbfd0 → #fbdf74)"
Page Background: "Parchment (#f5f4ed)"
Card Surface: "Ivory (#faf9f5)"
Primary Text: "Anthropic Near Black (#141413)"
Secondary Text: "Olive Gray (#5e5d59)"
Tertiary Text: "Stone Gray (#87867f)"
Borders (light): "Border Cream (#f0eee6)"
Dark Surface: "Dark Surface (#30302e)"

Example Component Prompts
"Create a hero section on Parchment (#f5f4ed) with a headline at 64px Georgia normal weight, line-height 1.10. Use Anthropic Near Black (#141413) text. Add a subtitle in Olive Gray (#5e5d59) at 20px Inter with 1.60 line-height. Place a Luna gradient CTA button (#6cbfd0 → #fbdf74) with Near Black text, 12px radius, and a soft glow shadow."
"Design a feature card on Ivory (#faf9f5) with a 1px solid Border Cream (#f0eee6) border and comfortably rounded corners (8px). Title in Georgia at 25px normal weight, description in Olive Gray (#5e5d59) at 16px Inter. Add a whisper shadow (rgba(0,0,0,0.05) 0px 4px 24px). Add a 3px top border in Namtan Teal (#6cbfd0)."
"Build a dark section on Anthropic Near Black (#141413) with Ivory (#faf9f5) headline text in Georgia at 52px normal weight. Use Warm Silver (#b0aea5) for body text. Borders in Dark Surface (#30302e)."
"Create a button in Warm Sand (#e8e6dc) with Charcoal Warm (#4d4c48) text, 8px radius, and a ring shadow (0px 0px 0px 1px #d1cfc5). Padding: 0px 12px 0px 8px."
"Design a ViewState toggle with four segments: Namtan (teal #6cbfd0), Film (gold #fbdf74), Both (Luna gradient), Lunar (Luna gradient + shimmer animation). Active segment gets brand color fill with Near Black text, inactive segments use Warm Sand background."
"Create an artist profile card on Ivory with a 3px left border in Film Gold (#fbdf74). Name in Georgia at 25px, role in Olive Gray at 15px Inter. Avatar with 32px border-radius."

Iteration Guide
Focus on ONE component at a time
Reference specific color names — "use Namtan Teal (#6cbfd0)" not "make it teal"
Always specify warm-toned variants — no cool grays
Describe serif vs sans usage explicitly — "Georgia for the heading, Inter for the label"
For shadows, use "ring shadow (0px 0px 0px 1px)" or "whisper shadow" — never generic "drop shadow"
Specify the warm background — "on Parchment (#f5f4ed)" or "on Near Black (#141413)"
Specify the ViewState context — "when ViewState is namtan, accent with Teal"
Use Luna gradient sparingly — only for primary CTAs and hero moments

10. Color Migration Reference (Old → New)
Old Color	New Color	Element
#1E88E5	#6cbfd0	Namtan primary
#1565C0	#4a9aab	Namtan secondary/dark
#64B5F6	#8ed0dd	Namtan light
rgba(30, 136, 229, *)	rgba(108, 191, 208, *)	Namtan glow/opacity variants
#FDD835	#fbdf74	Film primary
#F9A825	#d4b84e	Film secondary/dark
#FFF176	#fce89a	Film light
rgba(253, 216, 53, *)	rgba(251, 223, 116, *)	Film glow/opacity variants

Files that need updating: tailwind.config.ts, app/globals.css, and any component using hardcoded old color values.