---
name: BekiLang Studio
description: A compiler IDE laid out as today's tabloid front page - the verdict is the headline, each phase files its own story.
colors:
  paper: "#eeede9"
  paper-2: "#e3e1db"
  sheet: "#f9f8f5"
  ink: "#151515"
  ink-2: "#45443f"
  ink-3: "#66645e"
  rule-soft: "#c9c6be"
  red: "#d0201a"
  red-text: "#be1c15"
  on-red: "#ffffff"
  yellow: "#ffd60a"
  on-yellow: "#151515"
  error-wash: "rgba(208, 32, 26, 0.12)"
  bar-bg: "#151515"
  bar-fg: "#eeede9"
  syn-type: "#1f4fb8"
  syn-ctl: "#7a1fa2"
  syn-op: "#45443f"
  syn-end: "#806400"
  syn-str: "#0e6f44"
  syn-num: "#a3480b"
  syn-comment: "#6a6861"
  night-paper: "#131312"
  night-paper-2: "#1d1d1b"
  night-sheet: "#181816"
  night-ink: "#edebe6"
  night-ink-2: "#c2bfb7"
  night-ink-3: "#96938b"
  night-rule-soft: "#3a3936"
  night-red: "#d42a20"
  night-red-text: "#ff6b5e"
  night-error-wash: "rgba(255, 107, 94, 0.16)"
  night-bar-bg: "#2c2b28"
  night-syn-type: "#7fa8ff"
  night-syn-ctl: "#d99bff"
  night-syn-end: "#e9c44a"
  night-syn-str: "#6fd6a2"
  night-syn-num: "#ffaa6b"
  night-syn-comment: "#8a877f"
typography:
  display:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "clamp(3.25rem, 9.5vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.5rem, 4.4vw, 4.4rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 62"
  headline-section:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 900
    lineHeight: 0.95
    fontVariation: "'wdth' 62"
  title-bar:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "1.6rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.005em"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Archivo, 'Arial Narrow', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1.05
    fontVariation: "'wdth' 75"
  deck:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.45
  body-serif:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
  label-caps:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    letterSpacing: "0.06em"
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.7
    fontFeature: "'liga' 0, 'calt' 0"
  code-small:
    fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    fontFeature: "'liga' 0, 'calt' 0"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  gutter: "clamp(16px, 3vw, 40px)"
  column-gap: "clamp(20px, 2.6vw, 40px)"
  section: "clamp(20px, 2vw, 28px)"
  max-width: "1440px"
components:
  button-run:
    backgroundColor: "{colors.red}"
    textColor: "{colors.on-red}"
    rounded: "{rounded.none}"
    padding: "0 14px 0 18px"
    height: "56px"
  button-run-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
  button-line:
    backgroundColor: "{colors.bar-bg}"
    textColor: "{colors.bar-fg}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  button-line-hover:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
  select:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 40px 0 12px"
    height: "48px"
  section-bar:
    backgroundColor: "{colors.bar-bg}"
    textColor: "{colors.bar-fg}"
    typography: "{typography.title-bar}"
    rounded: "{rounded.none}"
    padding: "7px 12px 6px"
  headline-shout:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
    typography: "{typography.headline}"
    padding: "0 0.12em"
  headline-shout-error:
    backgroundColor: "{colors.red}"
    textColor: "{colors.on-red}"
  phase-cell:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "10px 12px 12px"
  phase-cell-pass:
    backgroundColor: "{colors.bar-bg}"
    textColor: "{colors.bar-fg}"
  phase-cell-fail:
    backgroundColor: "{colors.red}"
    textColor: "{colors.on-red}"
  editor:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: "16px 18px 16px 16px"
  editor-gutter:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-3}"
  keyword-chip:
    backgroundColor: "{colors.sheet}"
    typography: "{typography.code-small}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
    height: "32px"
  keyword-chip-hover:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
  dateline-link:
    textColor: "{colors.ink}"
    padding: "0 10px"
    height: "40px"
  dateline-link-hover:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.on-yellow}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
---

# Design System: BekiLang Studio

## Overview

**Creative North Star: "The Chismis Tabloid"**

Every run is today's front page. The Studio is set like a cheap, loud, well-ruled tabloid: grey newsprint stock, ink-black rules, reverse-type section bars, one rationed tabloid red and a highlighter-yellow marker pen. The compiler's verdict is the headline, the three phases are bylined reporters, the symbol table is a data box, and the keyword reference runs at the back as the classifieds. The voice is playful and the furniture is newspaper, but the hierarchy is strict: a visitor reads the verdict at a glance, then follows the stories down.

Density is editorial rather than dashboard: generous condensed headlines over tight, well-ruled columns of serif prose and monospaced data. Loudness comes from width and weight of type, from reverse bars and from the red, never from glow, gradients or depth. The system explicitly refuses the dark neon IDE-with-tabs default, and the old pink/cyan look is not carried forward.

There are two editions sharing one structure: the Day edition (newsprint) and the Night edition (dark stock), swapped by tokens only. Night is a recolour of the same paper, not a different product.

**Key Characteristics:**
- Grey newsprint ground with a lighter "sheet" for anything the user writes or the compiler prints.
- Heavy condensed all-caps Archivo headlines; Source Serif 4 for prose; JetBrains Mono for code and data.
- Ink rules in three weights carry all structure; no shadows, no radius.
- One rationed red (nameplate, Run, errors) and one highlighter yellow (success shout, hover, selection, focus).
- Reverse-type ink bars head every section.
- Motion is print-like: a headline "pressed" in from the top edge and a departure-board flip on the phase strip.

## Colors

A near-monochrome newsprint palette of warm greys and ink, punctuated by exactly two spot inks: tabloid red and highlighter yellow.

### Primary
- **Tabloid Red** (#d0201a): the nameplate plate, the Run button, the error verdict shout, and the failed phase cell. It is a fill colour; it carries white type (On-Red, #ffffff). Night edition uses Night Red (#d42a20).
- **Headline Red Ink** (#be1c15): red as text on paper - error headline continuation, error line numbers in the gutter, a failed reporter's name and byline rule, and the console stop line. Night edition lifts it to Night Red Ink (#ff6b5e) to keep contrast on dark stock.

### Secondary
- **Highlighter Yellow** (#ffd60a): the marker pen. Fills the success headline shout, every hover on interactive items, text selection, the skip link, and the editor's focus ring. Always paired with ink text (On-Yellow, #151515). It does not change between editions.

### Tertiary
- **Syntax inks** (Type Blue #1f4fb8, Control Purple #7a1fa2, Terminator Ochre #806400, String Green #0e6f44, Literal Rust #a3480b, Comment Grey #6a6861, operators in Ink 2): darkened so code reads on newsprint from the back of a room. The same inks colour the keyword chips in the cheat sheet and the type column in the symbol table, so a keyword looks identical wherever it appears. Night edition swaps to the lighter `night-syn-*` set.

### Neutral
- **Newsprint** (#eeede9): the page ground. Night: #131312.
- **Newsprint Shade** (#e3e1db): recessed furniture - the editor's line-number gutter and the cheat sheet's example boxes. Night: #1d1d1b.
- **Fresh Sheet** (#f9f8f5): the lighter stock for surfaces that hold user code or compiler output - editor, select, console, symbol table, transcript body, keyword chips. Night: #181816.
- **Press Ink** (#151515): body text, every heavy rule and container stroke, the focus outline, the toast. Night: #edebe6.
- **Ink 2** (#45443f): secondary text - decks, field labels, table headers, reporter roles. Night: #c2bfb7.
- **Ink 3** (#66645e): tertiary text - meta, empty states, line numbers, hints, colophon. Night: #96938b.
- **Soft Rule** (#c9c6be): hairline column rules and row dividers. Night: #3a3936.
- **Reverse Bar** (#151515 fill, #eeede9 type): section bars and passed phase cells. Night lifts the bar to #2c2b28 so it still reads as a bar on dark stock.
- **Error Wash** (rgba(208, 32, 26, 0.12)): the full-width band behind the offending line in the editor. Night: rgba(255, 107, 94, 0.16).

### Named Rules
**The Rationed Red Rule.** Red appears only on the nameplate, the Run button and error states. It never decorates, never marks success, and never fills a container that is not one of those three.

**The Highlighter Rule.** Yellow is a marker pen, not a surface. It marks the success shout, hover, selection and focus; it never becomes a panel, card or section background.

**The Two Editions Rule.** Day and Night share every component and differ only in token values. A new surface must read correctly in both by using tokens, never literal greys.

## Typography

**Display Font:** Archivo variable (with Arial Narrow, sans-serif), self-hosted, using its width axis down to 62%
**Body Font:** Source Serif 4 (with Georgia, serif), roman and italic
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Cascadia Mono, Consolas), ligatures off

**Character:** A tabloid press pairing. Squeezed, black, all-caps Archivo shouts the headlines; Source Serif 4 sets the reporting in calm newspaper columns; JetBrains Mono is reserved for anything the compiler reads or writes. Archivo at normal width also runs the UI controls.

### Hierarchy
- **Display** (900, clamp(3.25rem, 9.5vw, 6rem), 0.86, width 62%, uppercase): the "BekiLang" nameplate only.
- **Headline** (900, clamp(2.5rem, 4.4vw, 4.4rem), 0.95, width 62%, uppercase, balanced): the verdict headline, with its first phrase set as a shout block.
- **Headline Section** (900, clamp(2.25rem, 5vw, 3.75rem), 0.95, width 62%, uppercase): page-level section heads that stand outside the front grid, such as the cheat sheet.
- **Title Bar** (900, 1.6rem, 1, width 62%, uppercase): reverse-bar section titles.
- **Title** (900, 1.5rem, 1.05, width 75%, uppercase): reporter names, classified ad titles; phase names use the same face at 1.25rem.
- **Deck** (Source Serif 4, 400, 1.125rem, 1.45, max 62ch): the standfirst under the verdict headline.
- **Body Serif** (Source Serif 4, 400, 1.0625rem, 1.55, max 65ch): Story Time reports. Italic serif at 1-1.25rem carries asides: the tagline, reporter roles, ad subtitles, section notes, the colophon.
- **Body** (Archivo, 400, 1rem, 1.5): UI text, buttons (700), definitions.
- **Label** (Archivo, 700, 0.8125rem): field labels; bar meta text sits at 0.875rem 500 beside each bar title.
- **Label Caps** (Archivo, 800, 0.75rem, 0.06em, uppercase): table column headers and transcript sub-section titles only.
- **Code** (JetBrains Mono, 400/600, 15.5px, 1.7): the editor; scales to clamp(15.5px, 0.2rem + 0.9vw, 17px) at 1280px and up, 14.5px under 720px. Console and chips use 0.9375rem.

### Named Rules
**The Three Presses Rule.** Archivo shouts and labels, Source Serif 4 reports, JetBrains Mono quotes the machine. Code, identifiers, keywords, output and symbol data are always mono; prose about them is always serif.

**The Width Is Volume Rule.** Loudness is set by Archivo's width axis at weight 900: 62% for headlines and bars, 75% for titles and the Run label, normal width for UI. Never fake a headline with a larger regular-width weight.

**The Tabular Rule.** Every number that lines up with another (line numbers, caret position, console counters, level and offset) uses tabular figures.

## Layout

A centred front page capped at 1440px with a fluid gutter of clamp(16px, 3vw, 40px). Above it sits the masthead: the red nameplate plate, then a dateline row (date, beat, page nav) closed by a heavy 4px ink rule.

The front grid at 1280px and up is the tabloid split: a 7fr lead column for the editor and a 5fr right column stacking verdict, program output and symbol table, separated by a 1px soft column rule centred in the column gap of clamp(20px, 2.6vw, 40px). Story Time and the transcript then run full width beneath. Story Time is three equal bylined columns with 1px soft rules between them. The cheat sheet sits outside the grid as the classifieds: CSS multi-column (three columns of at least 20rem) with soft column rules, ads never broken across columns.

Responsive steps:
- **1279px and below:** the editor goes full width; verdict below it; output and symbol table pair up side by side.
- **860px and below:** Story Time stacks into one column (rules turn horizontal); the dateline beat is dropped.
- **719px and below:** everything is one column, the tagline left-aligns, the toolbar becomes a two-cell grid (Clear and Run), the keyboard hint and keyboard legend hide, code drops to 14.5px.

Rhythm: sections open with clamp(20px, 2vw, 28px) of top space; inside components the steps are 4, 8, 12 and 16px, with 10px and 14px used for bar and toolbar trims. Touch targets stay at 40px or taller for navigation and 44-56px for buttons and selects.

### Named Rules
**The Front Page Rule.** The first viewport always shows the nameplate, the editor with Run, and the verdict. New content goes below the fold as another bylined section, never above the verdict.

**The Ruled Column Rule.** Columns are separated by 1px Soft Rule lines, not by cards, gaps alone or background changes.

## Elevation & Depth

The system is completely flat. There is no box-shadow or text-shadow anywhere; depth is printed, not lit. Hierarchy comes from three things: tonal stock (Newsprint ground, Fresh Sheet for working surfaces, Newsprint Shade for recessed furniture), ink rules in three weights, and reverse-type bars. The one texture is the halftone dot screen on the nameplate plate (white dots at 28% opacity on a 7px grid, masked to fade in from the right), which reads as cheap four-colour press, not as depth.

Rule vocabulary:
- **Heavy rule** (4px solid Press Ink): closes the dateline, tops the phase strip, underlines the cheat sheet head.
- **Container rule** (2px solid Press Ink): editor, select, buttons, console, symbol table, transcript body, reporter byline underline, table header underline, bar top edge.
- **Hairline** (1px solid Soft Rule): column rules, table rows, phase cell dividers, ad separators. A 1px dotted Soft Rule is reserved for the token list in the transcript.

### Named Rules
**The Flat Newsprint Rule.** No shadows, glows, blurs or gradients on surfaces. If something needs to stand forward, give it a heavier ink rule or put it in a reverse bar.

## Shapes

Every corner is square (0px radius) - buttons, inputs, select, chips, panels, toast, even the scrollbar thumb. The geometry is rectangles and rules: blocks of reverse type, ruled boxes, and small 7px square bullets in Story Time lists. The shout highlight is a square-ended marker band that clones across line breaks.

### Named Rules
**The Sharp Corner Rule.** Radius is 0 everywhere. A rounded corner reads as app chrome and breaks the newsprint.

## Components

### Buttons
Blunt, inked and tactile: rectangular slugs that press down slightly when pushed.
- **Shape:** square corners (0px), 2px Press Ink stroke, Archivo 700 label, icon at 1.15em to the left of the label.
- **Run (primary):** Tabloid Red fill and stroke, white type, 56px tall. Stacks a 75%-width 900-weight "RUN" over a small beki aside line, with an outlined keyboard legend (Ctrl/Cmd + Enter) at the end. The only red button on the page.
- **Ghost:** transparent with ink stroke, 48px tall (Clear output).
- **Line:** reverse-bar fill (Press Ink, newsprint type), 44px tall; appears under an error verdict to jump to the offending line.
- **Hover / Focus:** hover only on fine pointers. Ghost and Line go Highlighter Yellow; Run goes Press Ink with newsprint type. Focus is a 3px Press Ink outline at 2px offset. Active presses scale to 0.97 over 140ms. While running, Run shows a spinning notch icon and a progress cursor.

### Chips (keyword chips)
- **Style:** Fresh Sheet fill, 1px Soft Rule stroke, square corners, JetBrains Mono 600 at 0.9375rem, 32px min height, text in the keyword's syntax ink (type blue, control purple, terminator ochre italic, literal rust, operators in ink).
- **State:** clicking inserts the keyword at the editor caret. Hover goes Highlighter Yellow with ink text and stroke; active scales to 0.96. A non-interactive variant (`//`) shares the look without hover.

### Cards / Containers
There are no cards. Containers are ruled boxes hanging under a section bar.
- **Corner Style:** square (0px).
- **Background:** Fresh Sheet.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 2px Press Ink on three sides; the bar above supplies the top edge.
- **Internal Padding:** 10-16px; table cells 8px 14px.

### Inputs / Fields
- **Style:** native select restyled: Fresh Sheet fill, 2px ink stroke, square corners, 48px tall, 600 weight, a bold caret icon on the right. Label sits above in Label style.
- **Focus:** the global 3px ink outline.
- **Editor:** a ruled Fresh Sheet box with a Newsprint Shade gutter (line numbers in Ink 3, tabular, right-aligned, Soft Rule divider). Syntax highlighting is layered under a transparent textarea. On focus-within the whole editor takes a 3px Highlighter Yellow outline. An error line gets the Error Wash band across the full width and its gutter number turns Headline Red Ink, weight 600. A status line below shows caret position.

### Navigation
- **Dateline nav:** inline links in Archivo 700 with a bold Phosphor icon, 40px tall, 10px side padding, no underline. Hover fills Highlighter Yellow. The theme toggle sits here as "Night edition / Day edition" with a plain "dark mode / light mode" clarifier in Ink 3.
- **Mobile:** the dateline stacks to one column and the nav aligns left.

### Section Bar (signature)
The reverse-type bar that heads every section: Reverse Bar fill, 2px ink top edge, a Title Bar heading in newsprint type followed by a plain-language meta line ("Code editor", "Program output") at 82% opacity. The transcript's bar doubles as a disclosure summary with a caret that rotates 180deg on open.

### Verdict Headline (signature)
The front-page headline in Headline style. Its first phrase is a shout block: Highlighter Yellow on success, Tabloid Red with white type on error (the rest of the headline turns Headline Red Ink), and unmarked ink while idle or loading (Ink 3 for the rest while loading). Under it run the serif deck and, on error, a smaller Archivo recovery line. Each new verdict is "pressed" in: clipped from the top edge down with a 6px drop, 360ms on the shared ease-out; a 160ms fade under reduced motion.

### Phase Strip (signature)
Three equal cells (Lexer, Parser, Semantics) under a 4px heavy rule, divided by hairlines. Each cell has a 75%-width name, a small role line and a state line with icon. States restyle in place like a departure board: idle and running in ink, pass in Reverse Bar, fail in Tabloid Red, skip in Ink 3 with the name struck through. On a run, cells flip one after another (rotateX from -75deg, 280ms, staggered 110ms).

### Data box (symbol table, console, transcript)
Ruled Fresh Sheet boxes. The symbol table uses Label Caps headers over a 2px ink underline, hairline rows, mono identifiers with a soft underline that highlight yellow on hover and jump to the declaration, and right-aligned tabular numbers. The console numbers its output lines in Ink 3; a stop line switches to Archivo bold in Headline Red Ink.

### Toast
A Press Ink slab with newsprint type, 600 weight, bottom-centre, max 440px; rises 16px and fades in (220ms ease-out).

## Do's and Don'ts

### Do:
- **Do** head every new section with the reverse-type Section Bar: a 62%-width all-caps title plus a plain-language meta line saying what the panel is.
- **Do** keep red for the nameplate, Run and errors; use Headline Red Ink (#be1c15 day, #ff6b5e night) when red is text on paper.
- **Do** use Highlighter Yellow (#ffd60a) with ink text for hover, selection, focus on the editor and the success shout.
- **Do** put user code and compiler output on Fresh Sheet inside a 2px Press Ink box; set it in JetBrains Mono with ligatures off.
- **Do** separate columns with 1px Soft Rule lines and close major bands with the 4px heavy rule.
- **Do** pair every icon with a visible text label and mark the icon aria-hidden.
- **Do** gate hover styles behind fine-pointer media queries and keep colour changes (but drop movement) under reduced motion.
- **Do** define any new colour as a token with both a Day and a Night value.

### Don't:
- **Don't** round corners; radius is 0px everywhere.
- **Don't** add box-shadows, glows, blurs or gradient fills; the only texture is the nameplate halftone.
- **Don't** use red for success, decoration or a second primary button.
- **Don't** use yellow as a panel or section background.
- **Don't** set headlines in regular-width Archivo or in the serif; headlines are 900 weight on the 62% or 75% width axis, all caps.
- **Don't** wrap content in floating cards; hang ruled boxes under a bar instead.
- **Don't** return to the dark neon IDE-with-tabs look or the old pink/cyan palette.
