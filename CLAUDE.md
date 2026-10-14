# BekiLang

A toy programming language built on Philippine gay lingo (Swardspeak), with a compiler pipeline
(lexer → parser → semantic analysis/interpreter) and a Flask web IDE, BekiLang Studio.

- Run the web IDE: `python app.py` → http://127.0.0.1:5000
- Compiler entry point: `run_bekilang()` in `BekiLang-Compiler.py` (loaded by `app.py` via importlib)
- Web UI: `templates/index.html`, `static/style.css`, `static/script.js`
- Product context: `PRODUCT.md`. Visual system: `DESIGN.md`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for Emyol/BekiLang, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily). See `docs/agents/domain.md`.
