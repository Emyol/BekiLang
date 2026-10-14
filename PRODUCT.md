# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- **Evaluators**: the professor and classmates watching a compiler-design project demo, often on a projector. They check that each compiler phase (lexical, syntax, semantic) works and that the symbol table is correct.
- **Learners**: people who open the Studio to write BekiLang programs and see how a compiler reads them. They need the keywords close at hand and errors they can understand.

## Product Purpose

BekiLang Studio is the web IDE for BekiLang. A user writes a program, runs it, and sees four views of the result: program output, the raw phase-by-phase analysis log, the symbol table (identifier, type, level, offset), and "Story Time", a plain-language narration of what each phase did. Success means a first-time visitor can write and run a program in under a minute, and an evaluator can follow every compiler phase without reading the source.

## Positioning

A real compiler pipeline (lexer, recursive-descent parser, semantic checker, interpreter) that explains itself in Taglish beki voice. The explainability layer (Story Time) and the Swardspeak keyword set are the parts nobody else has.

## Operating Context

- Flask dev server (`python app.py`), single page at `/`, one endpoint `POST /api/run` taking `{ code }`.
- Response: `status` (`success` | `error`), `error_message`, `console[]` (lines prefixed `💅 BEKI SAYS:`), `analysis` (plain-text log with `[LEXER]`, `[ PARSER ]`, `[SEMANTICS]` lines), `symbol_table[]` (`name`, `type`, `level`, `offset`), `story_lexer[]`, `story_parser[]`, `story_semantics[]`.
- Compilation stops at the first error. Partial console output and symbol table are still returned.
- Used on laptops, projectors, and phones.

## Capabilities and Constraints

- Types: `borta` int, `mema` float, `chika` string, `charot` char, `truch` bool (`korik` / `wiz`).
- Assignment `ay`; terminators `periodt` / `ganern`; print `parinig`; if/else `kunwari` / `eh_di`; while `gorabel`; operators `dagdag bawas times divide mas_tarush mas_chaka parehas wit_parehas at_saka o_kaya`; comments `//`.
- Stack: Flask + Jinja template + vanilla static CSS/JS. No build step.
- The keyword cheat sheet must stay visible on the main page.
- The interface must work on phones as well as desktop and projector.

## Brand Commitments

- Name: BekiLang / BekiLang Studio.
- Voice: playful Taglish beki voice ("Mhiema", "teh", "periodt", "Pak!"). Keep it in headings, empty states, and messages, but every control must also state plainly what it does.
- The previous neon pink/cyan look is not a commitment; the palette is open.

## Evidence on Hand

- `BekiLang_Documentation.md`: full language guide with examples.
- Compiler messages and Story Time sentences are authored in the compiler. The UI renders them and must not invent new compiler claims.

## Product Principles

1. The compiler pipeline is the hero: make lexer → parser → semantics visible and legible.
2. Errors teach. Surface the error message where people look, in plain view, with the recovery hint.
3. Personality in the words, clarity in the controls.
4. Reference within reach: keywords are never more than a glance away.

## Accessibility & Inclusion

Must be readable on a projector from the back of a room (high contrast, generous code size) and usable on phones (touch targets, no horizontal page scroll). Keyboard run shortcut and visible focus states.
