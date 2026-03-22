// script.js — Frontend logic for the BekiLang Studio web IDE
// Handles the editor, tab switching, run/clear actions, and rendering compiler output.

document.addEventListener('DOMContentLoaded', () => {
    // Grab all the DOM elements we'll need throughout the script.
    const runBtn = document.getElementById('runBtn');
    const clearBtn = document.getElementById('clearBtn');
    const codeInput = document.getElementById('codeInput');
    const consoleOutput = document.getElementById('consoleOutput');
    const analysisOutput = document.getElementById('analysisOutput');
    const storyOutput = document.getElementById('storyOutput');
    const symbolTableBody = document.getElementById('symbolTableBody');
    const customCursor = document.getElementById('custom-cursor');
    const lineNumbers = document.getElementById('lineNumbers');

    // ── Custom Cursor ──
    // Tracks the mouse to position the custom 💋 cursor element.
    // We hide it when the mouse leaves the window so it doesn't linger in a corner.
    let cursorVisible = true;
    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
        if (!cursorVisible) {
            customCursor.style.opacity = '0.7';
            cursorVisible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        customCursor.style.opacity = '0';
        cursorVisible = false;
    });

    // ── Tab Switching System ──
    // Simple tab UI — clicking a tab button activates the matching pane.
    // We deactivate everything first, then activate only the clicked one.
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            // Deactivate all
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanes.forEach(p => p.classList.remove('active'));

            // Activate clicked
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(`pane-${target}`).classList.add('active');
        });
    });

    // ── Default Code ──
    // Pre-fill the editor with a sample BekiLang program so users have something to run immediately.
    const defaultCode = `chika greeting ay "Welcome sa BekiLang Studio, Mhiema!" periodt
parinig greeting periodt

borta score ay 100 ganern
kunwari score parehas 100 {
    parinig "Perfect score ang Vaklang twooo!" ganern
}`;

    codeInput.value = defaultCode;

    // ── Helper: Animated Output Wrap ──
    // Wraps output content in a div with a bounce-in animation.
    // Every time output updates, it re-triggers the animation for visual feedback.
    const wrapAnimate = (content) => `<div style="animation: bounceInDown 0.5s ease">${content}</div>`;

    // ── Run Button ──
    // Sends the editor content to the Flask backend and renders the results
    // across the four output tabs: Console, Analysis, Symbol Table, and Story Time.
    runBtn.addEventListener('click', async () => {
        const code = codeInput.value;
        if (!code.trim()) {
            consoleOutput.innerHTML = wrapAnimate(`<span style="color:var(--hot-pink);">Wag naman walang code sis! Type ka in the Burn Book! 🙄</span>`);
            // Switch to console tab
            switchToTab('console');
            return;
        }

        // Show loading state while waiting for the server to respond.
        runBtn.classList.add('is-loading');
        runBtn.innerHTML = '💅 Slaying...';
        consoleOutput.innerHTML = wrapAnimate(`<span style="color:var(--glitter-gold);">Wait lang teh, nag-iisip ang BekiLang compiler... 💅</span>`);
        analysisOutput.innerHTML = wrapAnimate('Processing...');
        storyOutput.innerHTML = wrapAnimate('Gathering the tea...');
        symbolTableBody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

        // Switch to console tab while waiting
        switchToTab('console');

        try {
            const response = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const result = await response.json();

            if (response.ok) {
                // 1. Console Output
                // Join each printed line with <br> and highlight the BEKI SAYS prefix.
                if (result.console && result.console.length > 0) {
                    let consoleStr = result.console.join('<br>')
                        .replace(/💅 BEKI SAYS:/g, '<span style="color:var(--hot-pink); font-weight:bold;">💅 BEKI SAYS:</span>');
                    consoleOutput.innerHTML = wrapAnimate(consoleStr);
                } else {
                    consoleOutput.innerHTML = wrapAnimate(`<span style="color:var(--text-muted);">No output returned!</span>`);
                }

                // 2. Analysis Output
                // The compiler sends back plain text analysis logs.
                // We escape HTML entities first, then selectively re-add colored spans
                // for specific labels like [LEXER], [PARSER], and [SEMANTICS].
                // [LEXER] lines get special treatment: the token value column is given a
                // fixed inline-block width so the → arrow stays aligned across all rows.
                if (result.analysis) {
                    let formattedAnalysis = result.analysis
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/❌ Semantic Error:/g, '<span style="color:#ff3366;">❌ Semantic Error:</span>')
                        .replace(/❌ Syntax Error/g, '<span style="color:#ff3366;">❌ Syntax Error</span>')
                        .replace(/✅/g, '<span style="color:#00ff88;">✅</span>')
                        .replace(/\[LEXER\]\s+(.*?)\s+→\s+(\S+)/g, (_, val, type) =>
                            `<span style="color:#cc66ff;">[LEXER]</span>  ` +
                            `<span style="display:inline-block;min-width:200px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;">${val.trim()}</span>  →  ${type}`)
                        .replace(/\[PARSER\]/g, '<span style="color:#00ffff;">[PARSER]</span>')
                        .replace(/\[SEMANTICS\]/g, '<span style="color:#ffcc00;">[SEMANTICS]</span>');
                    analysisOutput.innerHTML = wrapAnimate(formattedAnalysis);
                } else {
                    analysisOutput.innerHTML = wrapAnimate(`<span style="color:var(--text-muted);">No analysis returned!</span>`);
                }

                // 3. Symbol Table
                // Render each symbol as a table row with a staggered fade-in animation.
                if (result.symbol_table && result.symbol_table.length > 0) {
                    symbolTableBody.innerHTML = result.symbol_table.map((sym, i) => `
                        <tr style="animation: fadeInDown 0.3s ${i * 0.05}s ease both;">
                            <td>${sym.name}</td>
                            <td>${sym.type}</td>
                            <td>${sym.level}</td>
                            <td>${sym.offset}</td>
                        </tr>
                    `).join('');
                } else {
                    symbolTableBody.innerHTML = `<tr><td colspan="4" style="color:var(--text-muted);">No variables declared yet.</td></tr>`;
                }

                // 4. Explainability Story
                // Each compiler phase contributes a list of plain-English sentences
                // describing what it found. We display them grouped by phase.
                if (result.story_lexer || result.story_parser || result.story_semantics) {
                    let storyHTML = `<span style="color:var(--hot-pink); font-weight:bold;">💅 1. Sabi ng Lexer (Ang Tagabasa ng Chismis):</span><br>`;
                    if (result.story_lexer && result.story_lexer.length > 0) {
                        // Show up to 5 lexer entries to keep the summary concise.
                        storyHTML += `   <span style="color:var(--text-primary)">Tiningnan ko yung words isa-isa. ${result.story_lexer.slice(0, 5).join(', ')}${result.story_lexer.length > 5 ? ' at iba pa!' : '.'}</span><br>`;
                    } else {
                        storyHTML += `   <span style="color:var(--text-muted)">Wala akong masyadong nakitang interesting na words, sis.</span><br>`;
                    }

                    storyHTML += `<br><span style="color:var(--hot-pink); font-weight:bold;">💅 2. Sabi ng Parser (Ang Marites na taga-connect ng kwento):</span><br>`;
                    if (result.story_parser && result.story_parser.length > 0) {
                        storyHTML += result.story_parser.map(s => `   <span style="color:var(--text-primary)">- ${s}</span>`).join('<br>') + '<br>';
                    } else {
                        storyHTML += `   <span style="color:var(--text-muted)">- Walang matinong statements na na-parse.</span><br>`;
                    }

                    storyHTML += `<br><span style="color:var(--hot-pink); font-weight:bold;">💅 3. Sabi ng Semantic Analyzer (Ang Judge ng Katotohanan):</span><br>`;
                    if (result.story_semantics && result.story_semantics.length > 0) {
                        storyHTML += result.story_semantics.map(s => `   <span style="color:var(--text-primary)">- ${s}</span>`).join('<br>') + '<br>';
                    } else {
                        storyHTML += `   <span style="color:var(--text-muted)">- Walang naganap na action sa memorya.</span><br>`;
                    }
                    storyOutput.innerHTML = wrapAnimate(storyHTML);
                } else {
                    storyOutput.innerHTML = wrapAnimate(`<span style="color:var(--text-muted);">No story generated.</span>`);
                }

            } else {
                consoleOutput.innerHTML = wrapAnimate(`<span style="color:#ff3366;">Gosh! Internal Server Error: ${response.statusText}</span>`);
            }
        } catch (error) {
            // Network error or server completely down.
            consoleOutput.innerHTML = wrapAnimate(`<span style="color:#ff3366;">Naku teh, walang internet o patay ang server! 😭</span>`);
        } finally {
            // Always restore the button label, whether it succeeded or failed.
            runBtn.classList.remove('is-loading');
            runBtn.innerHTML = 'Slay Ko \'To! ✨';
        }
    });

    // ── Clear Button ──
    // Resets all output panels back to their placeholder text.
    clearBtn.addEventListener('click', () => {
        consoleOutput.innerHTML = wrapAnimate('Nalinis na ang chika! 🧽');
        analysisOutput.innerHTML = 'Waiting for analysis...';
        storyOutput.innerHTML = 'Waiting for the tea...';
        symbolTableBody.innerHTML = `<tr><td colspan="4">No variables declared yet.</td></tr>`;
        switchToTab('console');
    });

    // ── Tab Switch Helper ──
    // Reusable function to programmatically switch tabs (e.g. auto-switching
    // to Console when the user clicks Run).
    function switchToTab(tabName) {
        tabBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        tabPanes.forEach(p => p.classList.remove('active'));

        const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const targetPane = document.getElementById(`pane-${tabName}`);
        if (targetBtn && targetPane) {
            targetBtn.classList.add('active');
            targetBtn.setAttribute('aria-selected', 'true');
            targetPane.classList.add('active');
        }
    }

    // ── Line Numbers ──
    // Counts lines in the textarea and updates the gutter on every keystroke.
    // We also sync the gutter's scroll position with the textarea so they stay aligned.
    const updateLineNumbers = () => {
        const lines = codeInput.value.split('\n').length;
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    };

    codeInput.addEventListener('input', updateLineNumbers);
    codeInput.addEventListener('scroll', () => {
        lineNumbers.scrollTop = codeInput.scrollTop;
    });

    // Initialize line numbers on page load (default code is already in the editor).
    updateLineNumbers();

    // ── Staggered Entrance Animations ──
    // Uses IntersectionObserver to trigger the cheat sheet card animations
    // only when they scroll into view — avoids animating things the user can't see yet.
    const animateElements = document.querySelectorAll('.cheat-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `strutIn 0.5s ${index * 0.1}s var(--transition-snappy) both`;
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(el => observer.observe(el));
});
