// script.js — Frontend logic for BekiLang Studio ("Chismis Tabloid" edition)
// Handles the editor (syntax highlighting, line numbers, indentation, shortcuts),
// sends code to the Flask backend, and renders the result as a front page:
// the verdict headline, the phase strip, program output, symbol table,
// Story Time, and the full analysis log.

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    const codeInput = $('codeInput');
    const highlight = $('highlight');
    const highlightCode = $('highlightCode');
    const gutter = $('gutter');
    const errorMarker = $('errorMarker');
    const caretPos = $('caretPos');
    const editorHint = $('editorHint');
    const editorEl = $('editor');
    const runBtn = $('runBtn');
    const clearBtn = $('clearBtn');
    const exampleSelect = $('exampleSelect');
    const verdict = $('verdict');
    const headline = $('headline');
    const headlineShout = $('headlineShout');
    const headlineRest = $('headlineRest');
    const deck = $('deck');
    const recovery = $('recovery');
    const gotoLineBtn = $('gotoLineBtn');
    const consoleOutput = $('consoleOutput');
    const symbolTableBody = $('symbolTableBody');
    const memoryHint = $('memoryHint');
    const analysisOutput = $('analysisOutput');
    const toast = $('toast');
    const themeToggle = $('themeToggle');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
    const DEFAULT_HINT = editorHint.textContent;

    // localStorage can throw (private mode, blocked storage), so every access is guarded.
    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } },
    };

    // ── Example programs ──
    // Pulled from the BekiLang guide. The error examples are deliberately broken
    // so people can see how each compiler phase complains.
    const EXAMPLES = [
        {
            label: 'Hello, Mhiema (if statement)',
            code: `chika greeting ay "Welcome sa BekiLang Studio, Mhiema!" periodt
parinig greeting periodt

borta score ay 100 ganern
kunwari score parehas 100 {
    parinig "Perfect score ang Vaklang twooo!" ganern
}`,
        },
        {
            label: 'If / else: party o bawal?',
            code: `borta edad ay 15 periodt
borta threshold ay 18 periodt

kunwari edad mas_chaka threshold {
    parinig "Bawal pa lumabas ang mga bata!" ganern
} eh_di {
    parinig "Gorabel, party na!" periodt
}`,
        },
        {
            label: 'While loop: bilangan',
            code: `borta count ay 1 periodt
gorabel count mas_chaka 4 {
    parinig "Bilang: " dagdag count ganern
    count ay count dagdag 1 periodt
}`,
        },
        {
            label: 'Concert night: every data type',
            code: `// Variable declarations
chika user ay "Mhiema" periodt
borta tickets ay 2 ganern
truch is_vip ay korik periodt
mema presyo ay 1499.50 ganern
charot section ay 'A' periodt

parinig "Welcome sa concert, " dagdag user ganern

// Logic and conditions
kunwari is_vip parehas korik at_saka tickets mas_tarush 0 {
    parinig "Pak na pak! VIP ka, pasok!" periodt
    gorabel tickets mas_tarush 0 {
        parinig "Ticket scanned! Remaining: " dagdag tickets ganern
        tickets ay tickets bawas 1 periodt
    }
} eh_di {
    parinig "Sorry teh, uwi na!" ganern
}`,
        },
        {
            label: 'Error: nakalimutan ang periodt',
            code: `borta x ay 5 periodt
parinig x
borta y ay 2 periodt`,
        },
        {
            label: 'Error: maling type',
            code: `borta x ay 5 periodt
chika y ay 3 periodt`,
        },
        {
            label: 'Error: invalid token',
            code: `borta x ay 5 periodt
parinig x @ 2 periodt`,
        },
    ];

    EXAMPLES.forEach((ex, i) => {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = ex.label;
        exampleSelect.appendChild(opt);
    });

    // ── Syntax highlighting ──
    // The textarea sits on top with transparent text; a <pre> underneath shows the
    // colored version. Keyword groups mirror the KEYWORDS table in the compiler.
    const KEYWORD_GROUPS = {
        type: ['borta', 'mema', 'chika', 'charot', 'truch'],
        ctl: ['kunwari', 'eh_di', 'gorabel', 'parinig'],
        lit: ['korik', 'wiz'],
        end: ['periodt', 'ganern'],
        op: ['ay', 'dagdag', 'bawas', 'times', 'divide', 'mas_tarush', 'mas_chaka',
            'parehas', 'wit_parehas', 'at_saka', 'o_kaya'],
    };
    const KEYWORD_CLASS = new Map();
    Object.entries(KEYWORD_GROUPS).forEach(([cls, words]) => words.forEach((w) => KEYWORD_CLASS.set(w, cls)));

    const TYPE_KEYWORD = { int: 'borta', float: 'mema', string: 'chika', char: 'charot', bool: 'truch' };

    // comment | "string" | 'char' | number | word
    const TOKEN_RE = /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"?)|('(?:[^'\\\n]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

    const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    function highlightSource(src) {
        let out = '';
        let last = 0;
        for (const m of src.matchAll(TOKEN_RE)) {
            const text = m[0];
            let cls = null;
            if (m[1]) cls = 'comment';
            else if (m[2] || m[3]) cls = 'str';
            else if (m[4]) cls = 'num';
            else if (m[5]) cls = KEYWORD_CLASS.get(text) || null;
            out += escapeHtml(src.slice(last, m.index));
            out += cls ? `<span class="tok-${cls}">${escapeHtml(text)}</span>` : escapeHtml(text);
            last = m.index + text.length;
        }
        // Trailing blank lines keep the overlay scrollable as far as the textarea.
        return out + escapeHtml(src.slice(last)) + '\n\n';
    }

    let errorLine = null;

    function renderEditor() {
        const src = codeInput.value;
        highlightCode.innerHTML = highlightSource(src);
        const count = src.split('\n').length;
        let nums = '';
        for (let i = 1; i <= count; i++) {
            nums += (i === errorLine ? `<span class="is-error">${i}</span>` : i) + (i < count ? '\n' : '');
        }
        gutter.innerHTML = nums;
        syncScroll();
    }

    function syncScroll() {
        highlight.scrollTop = codeInput.scrollTop;
        highlight.scrollLeft = codeInput.scrollLeft;
        gutter.style.transform = `translateY(${-codeInput.scrollTop}px)`;
    }

    function lineHeightPx() {
        return parseFloat(getComputedStyle(highlight).lineHeight) || 26;
    }

    function updateCaret() {
        const before = codeInput.value.slice(0, codeInput.selectionStart);
        const lines = before.split('\n');
        caretPos.textContent = `Ln ${lines.length}, Col ${lines[lines.length - 1].length + 1}`;
    }

    // ── Error line marking ──
    function markErrorLine(line) {
        errorLine = line;
        if (line) {
            const padTop = parseFloat(getComputedStyle(highlight).paddingTop) || 16;
            errorMarker.style.top = `${padTop + (line - 1) * lineHeightPx()}px`;
            errorMarker.hidden = false;
        } else {
            errorMarker.hidden = true;
        }
        renderEditor();
    }

    // Moves the caret to a line (optionally selecting a word on it) and scrolls it into view.
    function gotoLine(line, word) {
        const lines = codeInput.value.split('\n');
        const idx = Math.max(0, Math.min(line, lines.length) - 1);
        let start = 0;
        for (let i = 0; i < idx; i++) start += lines[i].length + 1;
        let selStart = start + (lines[idx].length - lines[idx].trimStart().length);
        let selEnd = selStart;
        if (word) {
            const m = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).exec(lines[idx]);
            if (m) { selStart = start + m.index; selEnd = selStart + word.length; }
        }
        codeInput.focus({ preventScroll: true });
        codeInput.setSelectionRange(selStart, selEnd);
        codeInput.scrollTop = Math.max(0, idx * lineHeightPx() - codeInput.clientHeight / 3);
        syncScroll();
        updateCaret();
        const rect = editorEl.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            editorEl.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
        }
    }

    // ── Editing helpers ──
    // execCommand('insertText') keeps the browser's undo stack intact (Ctrl+Z works);
    // setRangeText is the fallback for browsers that dropped execCommand.
    function insertText(text) {
        codeInput.focus({ preventScroll: true });
        const ok = document.execCommand && document.execCommand('insertText', false, text);
        if (!ok) {
            codeInput.setRangeText(text, codeInput.selectionStart, codeInput.selectionEnd, 'end');
            codeInput.dispatchEvent(new Event('input'));
        }
    }

    function replaceAll(text) {
        codeInput.focus({ preventScroll: true });
        codeInput.select();
        insertText(text);
        codeInput.setSelectionRange(0, 0);
        codeInput.scrollTop = 0;
        syncScroll();
        updateCaret();
    }

    function currentLineInfo() {
        const value = codeInput.value;
        const pos = codeInput.selectionStart;
        const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
        const lineText = value.slice(lineStart, pos);
        return { lineStart, beforeCaret: lineText, indent: lineText.match(/^[ \t]*/)[0] };
    }

    let escapeArmed = false;

    codeInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            run();
            return;
        }

        if (e.key === 'Escape') {
            escapeArmed = true;
            editorHint.textContent = 'Tab now moves focus out of the editor.';
            return;
        }

        if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            if (escapeArmed) {
                escapeArmed = false;
                editorHint.textContent = DEFAULT_HINT;
                return; // let focus move on
            }
            e.preventDefault();
            const { lineStart, indent } = currentLineInfo();
            if (e.shiftKey) {
                const remove = Math.min(4, indent.length);
                if (remove > 0) {
                    const caret = codeInput.selectionStart;
                    codeInput.setSelectionRange(lineStart, lineStart + remove);
                    insertText('');
                    codeInput.setSelectionRange(caret - remove, caret - remove);
                }
            } else {
                insertText('    ');
            }
            return;
        }

        if (escapeArmed) {
            escapeArmed = false;
            editorHint.textContent = DEFAULT_HINT;
        }

        // Auto-indent: keep the current indentation, add a level after "{".
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            const { beforeCaret, indent } = currentLineInfo();
            const extra = beforeCaret.trimEnd().endsWith('{') ? '    ' : '';
            insertText('\n' + indent + extra);
            return;
        }

        // Typing "}" on an indented blank line outdents it one level.
        if (e.key === '}' && codeInput.selectionStart === codeInput.selectionEnd) {
            const { beforeCaret } = currentLineInfo();
            if (/^ {4,}$/.test(beforeCaret)) {
                e.preventDefault();
                const caret = codeInput.selectionStart;
                codeInput.setSelectionRange(caret - 4, caret);
                insertText('}');
            }
        }
    });

    let saveTimer = null;
    codeInput.addEventListener('input', () => {
        if (errorLine) markErrorLine(null); // the user is fixing it; drop the stale mark
        else renderEditor();
        updateCaret();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => store.set('beki-code', codeInput.value), 300);
    });
    codeInput.addEventListener('scroll', syncScroll);
    ['click', 'keyup', 'select', 'focus'].forEach((ev) => codeInput.addEventListener(ev, updateCaret));
    codeInput.addEventListener('blur', () => {
        escapeArmed = false;
        editorHint.textContent = DEFAULT_HINT;
    });

    // Ctrl/Cmd+Enter runs from anywhere on the page, not just inside the editor.
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target !== codeInput) {
            e.preventDefault();
            run();
        }
    });

    $('runKbd').textContent = isMac ? '⌘ ↵' : 'Ctrl ↵';
    runBtn.setAttribute('title', isMac ? 'Run (⌘ + Enter)' : 'Run (Ctrl + Enter)');

    // ── Toast ──
    let toastTimer = null;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
    }

    // ── Verdict headline ──
    function setVerdict({ state, shout, rest, deckText, recoveryText, line, animate = true }) {
        verdict.dataset.state = state;
        headlineShout.textContent = shout;
        headlineRest.textContent = rest ? ` ${rest}` : '';
        deck.textContent = deckText;
        if (recoveryText) {
            recovery.replaceChildren();
            const label = document.createElement('strong');
            label.textContent = 'Recovery strategy: ';
            recovery.append(label, recoveryText);
            recovery.hidden = false;
        } else {
            recovery.hidden = true;
        }
        if (line) {
            gotoLineBtn.querySelector('span').textContent = `Go to line ${line}`;
            gotoLineBtn.dataset.line = String(line);
            gotoLineBtn.hidden = false;
        } else {
            gotoLineBtn.hidden = true;
        }
        if (animate) pressHeadline();
    }

    // The one authored moment: the new headline is "printed" in from the top edge.
    function pressHeadline() {
        if (!headline.animate) return;
        if (reducedMotion.matches) {
            headline.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
            return;
        }
        headline.animate(
            [
                { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-6px)' },
                { clipPath: 'inset(0 0 0% 0)', transform: 'translateY(0)' },
            ],
            { duration: 360, easing: EASE_OUT }
        );
    }

    gotoLineBtn.addEventListener('click', () => {
        const line = Number(gotoLineBtn.dataset.line);
        if (line) gotoLine(line);
    });

    // ── Phase strip ──
    const PHASE_STATES = {
        idle: { label: 'Waiting', icon: 'ph-circle-dashed' },
        running: { label: 'Checking…', icon: 'ph-circle-notch' },
        pass: { label: 'Pasado', icon: 'ph-check' },
        fail: { label: 'Sablay', icon: 'ph-x' },
        skip: { label: 'Skipped', icon: 'ph-minus' },
    };
    const phaseEls = Array.from(document.querySelectorAll('.phase'));
    let phaseTimers = [];

    function applyPhase(el, state) {
        const meta = PHASE_STATES[state];
        el.dataset.state = state;
        const icon = el.querySelector('.phase__state i');
        icon.className = `ph-bold ${meta.icon}`;
        el.querySelector('.phase__state span').textContent = meta.label;
    }

    // Cells keep their positions and flip in place, one after another, like a departure board.
    function setPhases(states, animate = false) {
        phaseTimers.forEach(clearTimeout);
        phaseTimers = [];
        phaseEls.forEach((el, i) => {
            if (!animate) { applyPhase(el, states[i]); return; }
            phaseTimers.push(setTimeout(() => {
                applyPhase(el, states[i]);
                if (el.animate && !reducedMotion.matches) {
                    el.animate(
                        [{ transform: 'rotateX(-75deg)', opacity: 0.35 }, { transform: 'rotateX(0)', opacity: 1 }],
                        { duration: 280, easing: EASE_OUT }
                    );
                }
            }, 140 + i * 110));
        });
    }

    // ── Program output ──
    function renderConsole(lines, { stopped = false, emptyText }) {
        consoleOutput.replaceChildren();
        if (!lines.length && !stopped) {
            consoleOutput.append(emptyParagraph(emptyText));
            return;
        }
        if (!lines.length && stopped) {
            consoleOutput.append(emptyParagraph('No output: the compiler stopped before anything was printed.'));
            return;
        }
        const ol = document.createElement('ol');
        ol.className = 'console__lines';
        lines.forEach((line) => {
            const li = document.createElement('li');
            li.textContent = line;
            ol.appendChild(li);
        });
        if (stopped) {
            const li = document.createElement('li');
            li.className = 'is-stop';
            li.textContent = 'Compilation stopped here.';
            ol.appendChild(li);
        }
        consoleOutput.appendChild(ol);
        consoleOutput.scrollTop = 0;
    }

    function emptyParagraph(text) {
        const p = document.createElement('p');
        p.className = 'empty';
        p.textContent = text;
        return p;
    }

    // ── Symbol table ──
    function renderSymbols(table) {
        symbolTableBody.replaceChildren();
        if (!table || !table.length) {
            const tr = document.createElement('tr');
            tr.className = 'symbols__empty';
            const td = document.createElement('td');
            td.colSpan = 4;
            td.textContent = 'No variables declared yet.';
            tr.appendChild(td);
            symbolTableBody.appendChild(tr);
            memoryHint.hidden = true;
            return;
        }
        table.forEach((sym) => {
            const tr = document.createElement('tr');

            const nameTd = document.createElement('td');
            const nameBtn = document.createElement('button');
            nameBtn.type = 'button';
            nameBtn.className = 'sym-name';
            nameBtn.dataset.name = sym.name;
            nameBtn.setAttribute('aria-label', `${sym.name}: jump to its declaration`);
            const nameText = document.createElement('span');
            nameText.textContent = sym.name;
            const nameIcon = document.createElement('i');
            nameIcon.className = 'ph-bold ph-arrow-up-left';
            nameIcon.setAttribute('aria-hidden', 'true');
            nameBtn.append(nameText, nameIcon);
            nameTd.appendChild(nameBtn);

            const typeTd = document.createElement('td');
            const typeWrap = document.createElement('span');
            typeWrap.className = 'sym-type';
            const kw = document.createElement('code');
            kw.textContent = TYPE_KEYWORD[sym.type] || sym.type;
            const plain = document.createElement('span');
            plain.textContent = sym.type;
            typeWrap.append(kw, plain);
            typeTd.appendChild(typeWrap);

            const levelTd = document.createElement('td');
            levelTd.className = 'num';
            levelTd.textContent = sym.level;
            const offsetTd = document.createElement('td');
            offsetTd.className = 'num';
            offsetTd.textContent = sym.offset;

            tr.append(nameTd, typeTd, levelTd, offsetTd);
            symbolTableBody.appendChild(tr);
        });
        memoryHint.hidden = false;
    }

    symbolTableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.sym-name');
        if (!btn) return;
        const name = btn.dataset.name;
        const line = findDeclarationLine(codeInput.value, name);
        if (line) gotoLine(line, name);
        else showToast(`Hindi ko makita kung saan dineclare si ${name}.`);
    });

    // ── Locating lines in the source ──
    function stripComment(line) {
        const i = line.indexOf('//');
        return i === -1 ? line : line.slice(0, i);
    }

    function findDeclarationLine(code, name) {
        const types = KEYWORD_GROUPS.type.join('|');
        const decl = new RegExp(`\\b(?:${types})\\s+${name}\\s+ay\\b`);
        const any = new RegExp(`\\b${name}\\b`);
        const lines = code.split('\n');
        let idx = lines.findIndex((l) => decl.test(stripComment(l)));
        if (idx === -1) idx = lines.findIndex((l) => any.test(stripComment(l)));
        return idx === -1 ? null : idx + 1;
    }

    function findTextLine(code, needle) {
        const idx = code.split('\n').findIndex((l) => stripComment(l).includes(needle));
        return idx === -1 ? null : idx + 1;
    }

    // ── Error parsing ──
    // The compiler raises messages like "❌ Syntax Error (Linya 3): ...\n🛠 Recovery Strategy: ...".
    // We pull out which phase failed, the line (when given), the detail, and the recovery hint.
    function parseError(message, code) {
        const clean = String(message || '').replace(/^\s*❌\s*/, '');
        const [first, ...restLines] = clean.split('\n');
        const recoveryLine = restLines.find((l) => /Recovery Strategy/i.test(l));
        const recoveryText = recoveryLine ? recoveryLine.replace(/^.*Recovery Strategy:\s*/i, '').trim() : '';

        let phase = null;
        let label = 'Error';
        if (/^Lexical Error/i.test(first)) { phase = 'lexer'; label = 'Lexical error'; }
        else if (/^Syntax Error/i.test(first)) { phase = 'parser'; label = 'Syntax error'; }
        else if (/^Semantic Error/i.test(first)) { phase = 'semantics'; label = 'Semantic error'; }

        const detail = first.replace(/^(Lexical|Syntax|Semantic) Error(\s*\(Linya \d+\))?:\s*/i, '').trim();

        let line = null;
        const lineMatch = first.match(/Linya (\d+)/);
        if (lineMatch) {
            line = Number(lineMatch[1]);
        } else if (phase === 'lexer') {
            // e.g. "anong pinagsasabi mong ''@''?" holds the Python repr of the bad token(s)
            const bad = first.match(/mong '(.*)'\?/);
            if (bad) {
                const token = bad[1].split(', ')[0].replace(/^'+|'+$/g, '');
                if (token) line = findTextLine(code, token);
            }
        } else if (phase === 'semantics') {
            const ident = first.match(/'([A-Za-z_][A-Za-z0-9_]*)'/);
            if (ident) line = findDeclarationLine(code, ident[1]);
        }

        return { phase, label, detail: detail || clean, recoveryText, line };
    }

    // ── Story Time ──
    const STORY = {
        lexer: $('storyLexer'),
        parser: $('storyParser'),
        semantics: $('storySemantics'),
    };

    function fillReport(article, { intro, items, max = Infinity, emptyText, failed = false, stopNote }) {
        const body = article.querySelector('.report__body');
        body.replaceChildren();
        article.classList.toggle('is-failed', failed);
        if (!items.length) {
            body.appendChild(emptyParagraph(emptyText));
        } else {
            if (intro) {
                const p = document.createElement('p');
                p.textContent = intro;
                body.appendChild(p);
            }
            const ul = document.createElement('ul');
            items.slice(0, max).forEach((text) => {
                const li = document.createElement('li');
                li.textContent = text;
                ul.appendChild(li);
            });
            body.appendChild(ul);
            if (items.length > max) {
                const more = document.createElement('p');
                more.className = 'report__more';
                more.textContent = `At ${items.length - max} pang iba!`;
                body.appendChild(more);
            }
        }
        if (stopNote) {
            const note = document.createElement('p');
            note.className = 'report__more';
            note.textContent = stopNote;
            body.appendChild(note);
        }
    }

    function renderStory(result, failedPhase) {
        const order = ['lexer', 'parser', 'semantics'];
        const failIdx = failedPhase ? order.indexOf(failedPhase) : -1;
        const skipped = (phase) => failIdx !== -1 && order.indexOf(phase) > failIdx;
        const skipText = `Hindi na umabot dito. The compiler stopped at the ${failedPhase === 'lexer' ? 'Lexer' : 'Parser'}.`;

        fillReport(STORY.lexer, {
            intro: 'Tiningnan ko yung words isa-isa.',
            items: result.story_lexer || [],
            max: 6,
            emptyText: 'Wala akong masyadong nakitang interesting na words, sis.',
            failed: failedPhase === 'lexer',
            stopNote: failedPhase === 'lexer' ? 'Dito na-stop ang kwento: may token na hindi ko kilala.' : '',
        });
        fillReport(STORY.parser, {
            items: result.story_parser || [],
            emptyText: skipped('parser') ? skipText : 'Walang matinong statements na na-parse.',
            failed: failedPhase === 'parser',
            stopNote: failedPhase === 'parser' ? 'Dito na-stop ang kwento: sablay ang grammar.' : '',
        });
        fillReport(STORY.semantics, {
            items: result.story_semantics || [],
            emptyText: skipped('semantics') ? skipText : 'Walang naganap na action sa memorya.',
            failed: failedPhase === 'semantics',
            stopNote: failedPhase === 'semantics' ? 'Dito na-stop ang kwento: hindi pumasa sa judge.' : '',
        });
    }

    function resetStory() {
        Object.values(STORY).forEach((article) => {
            article.classList.remove('is-failed');
            const body = article.querySelector('.report__body');
            body.replaceChildren(emptyParagraph('Waiting for the tea.'));
        });
    }

    // ── Analysis log ──
    // The compiler prints a terminal-style report (box-drawing headers, [LEXER] rows, banners).
    // We split it into its three phases and render tokens as a compact table.
    function parseAnalysis(text) {
        const sections = [];
        let current = { key: 'other', title: 'Compiler', tokens: [], lines: [], notes: [] };
        sections.push(current);
        const open = (key, title) => {
            current = { key, title, tokens: [], lines: [], notes: [] };
            sections.push(current);
        };
        let inSymbolTable = false;

        String(text || '').split('\n').forEach((raw) => {
            const t = raw.trim();
            if (!t) return;
            if (/^[┌└╔╚╠]/.test(t)) return;
            if (t.startsWith('║')) {
                if (/LEXICAL ANALYSIS/.test(t)) open('lexer', 'Lexical analysis');
                else if (/SYNTAX ANALYSIS/.test(t)) open('parser', 'Syntax analysis');
                else if (/SEMANTIC ANALYSIS/.test(t)) open('semantics', 'Semantic analysis');
                return; // banners and symbol-table rows are shown elsewhere on the page
            }
            if (/FINAL SYMBOL TABLE/.test(t)) { inSymbolTable = true; return; }
            if (inSymbolTable) return;

            let m;
            if ((m = t.match(/^\[LEXER\]\s+(.*?)\s+→\s+(\S+)$/))) {
                current.tokens.push({ value: m[1], type: m[2] });
            } else if (/^\[LEXER\]/.test(t)) {
                current.notes.push('Showing the first 30 tokens only.');
            } else if ((m = t.match(/^\[\s*PARSER\s*\]\s*(.*)$/))) {
                current.lines.push({ text: m[1] });
            } else if ((m = t.match(/^\[SEMANTICS\]\s*(.*)$/))) {
                current.lines.push({ text: m[1] });
            } else if ((m = t.match(/^💅\s*BEKI SAYS:\s*(.*)$/))) {
                current.lines.push({ text: m[1], cls: 'is-say' });
            } else if ((m = t.match(/^✓\s*(.*)$/))) {
                current.lines.push({ text: m[1], cls: 'is-ok' });
            } else if (/^❌/.test(t)) {
                current.lines.push({ text: t.replace(/^❌\s*/, ''), cls: 'is-err' });
            } else if (/^🛠/.test(t)) {
                current.lines.push({ text: t.replace(/^🛠\s*/, ''), cls: 'is-err' });
            } else if (/^🔥/.test(t)) {
                current.lines.push({ text: t.replace(/^🔥\s*/, ''), cls: 'is-err' });
            } else {
                current.lines.push({ text: t });
            }
        });

        return sections.filter((s) => s.tokens.length || s.lines.length || s.notes.length);
    }

    function renderAnalysis(text) {
        analysisOutput.replaceChildren();
        const sections = parseAnalysis(text);
        if (!sections.length) {
            analysisOutput.appendChild(emptyParagraph('The compiler did not send back a log.'));
            return;
        }
        sections.forEach((s) => {
            const wrap = document.createElement('section');
            wrap.className = 'log-section';
            const h = document.createElement('h3');
            h.className = 'log-section__title';
            h.textContent = s.tokens.length ? `${s.title}: ${s.tokens.length} tokens` : s.title;
            wrap.appendChild(h);

            if (s.tokens.length) {
                const ul = document.createElement('ul');
                ul.className = 'tokens';
                s.tokens.forEach((tok) => {
                    const li = document.createElement('li');
                    const v = document.createElement('span');
                    v.className = 'tokens__value';
                    v.textContent = tok.value;
                    v.title = tok.value;
                    const ty = document.createElement('span');
                    ty.className = 'tokens__type';
                    ty.textContent = tok.type;
                    li.append(v, ty);
                    ul.appendChild(li);
                });
                wrap.appendChild(ul);
            }
            s.notes.forEach((n) => {
                const p = document.createElement('p');
                p.className = 'log-note';
                p.textContent = n;
                wrap.appendChild(p);
            });
            if (s.lines.length) {
                const ol = document.createElement('ul');
                ol.className = 'log-lines';
                s.lines.forEach((line) => {
                    const li = document.createElement('li');
                    if (line.cls) li.className = line.cls;
                    li.textContent = line.text;
                    ol.appendChild(li);
                });
                wrap.appendChild(ol);
            }
            analysisOutput.appendChild(wrap);
        });
    }

    // ── Rendering a full result ──
    const stripBeki = (line) => String(line).replace(/^💅\s*BEKI SAYS:\s?/, '');

    function renderResult(result, code) {
        const lines = (result.console || []).map(stripBeki);
        const symbols = result.symbol_table || [];

        if (result.status === 'success') {
            setVerdict({
                state: 'success',
                shout: 'Kabog!',
                rest: 'Walang error, sis!',
                deckText: `${lines.length} ${lines.length === 1 ? 'line' : 'lines'} of chika, ${symbols.length} ${symbols.length === 1 ? 'variable' : 'variables'} in memory. Pak!`,
            });
            setPhases(['pass', 'pass', 'pass'], true);
            markErrorLine(null);
            renderConsole(lines, { emptyText: 'Tahimik si Beki: no parinig statement ran.' });
            renderStory(result, null);
        } else {
            const err = parseError(result.error_message, code);
            if (!err.phase) {
                setVerdict({
                    state: 'network',
                    shout: 'Naku, teh!',
                    rest: 'Server error',
                    deckText: err.detail || 'The compiler crashed while reading your code. Check the terminal running app.py.',
                });
                setPhases(['idle', 'idle', 'idle']);
            } else {
                setVerdict({
                    state: 'error',
                    shout: 'Jusko day!',
                    rest: err.line ? `${err.label} sa linya ${err.line}` : err.label,
                    deckText: err.detail,
                    recoveryText: err.recoveryText,
                    line: err.line,
                });
                const states = {
                    lexer: ['fail', 'skip', 'skip'],
                    parser: ['pass', 'fail', 'skip'],
                    semantics: ['pass', 'pass', 'fail'],
                }[err.phase];
                setPhases(states, true);
            }
            markErrorLine(err.line);
            renderConsole(lines, { stopped: true });
            renderStory(result, err.phase);
        }

        renderSymbols(symbols);
        renderAnalysis(result.analysis);
        revealVerdictOnSmallScreens();
    }

    // On phones the verdict sits below the editor; bring it into view after a run.
    function revealVerdictOnSmallScreens() {
        const rect = verdict.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.6 || rect.bottom < 0) {
            verdict.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        }
    }

    // ── Run ──
    let busy = false;

    async function run() {
        if (busy) return;
        const code = codeInput.value;

        if (!code.trim()) {
            markErrorLine(null);
            setVerdict({
                state: 'error',
                shout: 'Walang code, sis!',
                rest: '',
                deckText: 'Type ka muna sa Burn Book, or load an example from the menu above the editor.',
                animate: true,
            });
            setPhases(['idle', 'idle', 'idle']);
            codeInput.focus();
            return;
        }

        busy = true;
        runBtn.setAttribute('aria-busy', 'true');
        runBtn.querySelector('.btn__label').textContent = 'Running';
        setVerdict({
            state: 'loading',
            shout: 'Teka lang,',
            rest: 'nag-iisip ang compiler…',
            deckText: 'Reading your code through the lexer, parser and semantic analyzer.',
            animate: false,
        });
        setPhases(['running', 'running', 'running']);

        try {
            const response = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
            const result = await response.json();
            renderResult(result, code);
        } catch (error) {
            setVerdict({
                state: 'network',
                shout: 'Naku, teh!',
                rest: 'Hindi maabot ang server',
                deckText: `The Studio couldn't reach the compiler (${error.message}). Make sure python app.py is still running, then press Run again.`,
            });
            setPhases(['idle', 'idle', 'idle']);
        } finally {
            busy = false;
            runBtn.removeAttribute('aria-busy');
            runBtn.querySelector('.btn__label').textContent = 'Run';
        }
    }

    runBtn.addEventListener('click', run);

    // ── Clear output ──
    function resetOutputs(deckText) {
        setVerdict({
            state: 'idle',
            shout: 'Wala pang chika.',
            rest: 'Run mo na, sis!',
            deckText: deckText || 'Write in the Burn Book or load an example, then press Run. The compiler will spill everything here.',
            animate: false,
        });
        setPhases(['idle', 'idle', 'idle']);
        markErrorLine(null);
        renderConsole([], { emptyText: 'No output yet. Every parinig line lands here when you run.' });
        renderSymbols([]);
        resetStory();
        analysisOutput.replaceChildren(emptyParagraph('Run your code to see the full compiler log.'));
    }

    clearBtn.addEventListener('click', () => {
        resetOutputs();
        showToast('Nalinis na ang chika!');
    });

    // ── Examples ──
    exampleSelect.addEventListener('change', () => {
        const ex = EXAMPLES[Number(exampleSelect.value)];
        exampleSelect.value = '';
        if (!ex) return;
        replaceAll(ex.code);
        resetOutputs('New program loaded. Press Run to hear the chika.');
        showToast(`Loaded "${ex.label}". ${isMac ? '⌘' : 'Ctrl'}+Z brings back your code.`);
    });

    // ── Cheat sheet: keyword chips insert at the caret ──
    document.querySelector('.classifieds').addEventListener('click', (e) => {
        const chip = e.target.closest('button.kw');
        if (!chip) return;
        const word = chip.textContent.trim();
        codeInput.focus({ preventScroll: true });
        const before = codeInput.value.slice(0, codeInput.selectionStart);
        const needsSpace = before.length && !/\s$/.test(before);
        insertText(`${needsSpace ? ' ' : ''}${word} `);
        editorEl.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
        showToast(`Added "${word}" to the editor.`);
    });

    // ── Day / Night edition ──
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => {
        const set = document.documentElement.getAttribute('data-theme');
        return set ? set === 'dark' : darkQuery.matches;
    };
    function syncThemeToggle() {
        const dark = isDark();
        themeToggle.setAttribute('aria-pressed', String(dark));
        themeToggle.querySelector('i').className = `ph-bold ${dark ? 'ph-sun' : 'ph-moon'}`;
        const [label, aside] = themeToggle.querySelectorAll('span');
        label.textContent = dark ? 'Day edition' : 'Night edition';
        aside.textContent = dark ? 'light mode' : 'dark mode';
    }
    themeToggle.addEventListener('click', () => {
        const next = isDark() ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        store.set('beki-theme', next === 'dark' ? 'night' : 'day');
        syncThemeToggle();
    });
    darkQuery.addEventListener('change', syncThemeToggle);
    syncThemeToggle();

    // ── Dateline ──
    try {
        $('datelineDate').textContent = new Intl.DateTimeFormat('fil-PH', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        }).format(new Date());
    } catch (e) {
        $('datelineDate').textContent = new Date().toDateString();
    }

    // ── Boot ──
    // Restore the last draft if there is one; otherwise start with the first example.
    codeInput.value = store.get('beki-code') || EXAMPLES[0].code;
    setPhases(['idle', 'idle', 'idle']);
    renderEditor();
    updateCaret();

    // Recompute the error marker position when fonts finish loading or the layout changes.
    const refreshMarker = () => { if (errorLine) markErrorLine(errorLine); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshMarker);
    window.addEventListener('resize', refreshMarker);
});
