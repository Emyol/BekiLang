document.addEventListener('DOMContentLoaded', () => {
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
    const defaultCode = `chika greeting ay "Welcome sa BekiLang Studio, Mhiema!" periodt
parinig greeting periodt

borta score ay 100 ganern
kunwari score parehas 100 {
    parinig "Perfect score ang Vaklang twooo!" ganern
}`;

    codeInput.value = defaultCode;

    // ── Helper: Animated Output Wrap ──
    const wrapAnimate = (content) => `<div style="animation: bounceInDown 0.5s ease">${content}</div>`;

    // ── Run Button ──
    runBtn.addEventListener('click', async () => {
        const code = codeInput.value;
        if (!code.trim()) {
            consoleOutput.innerHTML = wrapAnimate(`<span style="color:var(--hot-pink);">Wag naman walang code sis! Type ka in the Burn Book! 🙄</span>`);
            // Switch to console tab
            switchToTab('console');
            return;
        }

        // Loading state
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
                if (result.console && result.console.length > 0) {
                    let consoleStr = result.console.join('<br>')
                        .replace(/💅 BEKI SAYS:/g, '<span style="color:var(--hot-pink); font-weight:bold;">💅 BEKI SAYS:</span>');
                    consoleOutput.innerHTML = wrapAnimate(consoleStr);
                } else {
                    consoleOutput.innerHTML = wrapAnimate(`<span style="color:var(--text-muted);">No output returned!</span>`);
                }

                // 2. Analysis Output
                if (result.analysis) {
                    let formattedAnalysis = result.analysis
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/❌ Semantic Error:/g, '<span style="color:#ff3366;">❌ Semantic Error:</span>')
                        .replace(/❌ Syntax Error/g, '<span style="color:#ff3366;">❌ Syntax Error</span>')
                        .replace(/✅/g, '<span style="color:#00ff88;">✅</span>')
                        .replace(/\[LEXER\]/g, '<span style="color:#cc66ff;">[LEXER]</span>')
                        .replace(/\[PARSER\]/g, '<span style="color:#00ffff;">[PARSER]</span>')
                        .replace(/\[SEMANTICS\]/g, '<span style="color:#ffcc00;">[SEMANTICS]</span>');
                    analysisOutput.innerHTML = wrapAnimate(formattedAnalysis);
                } else {
                    analysisOutput.innerHTML = wrapAnimate(`<span style="color:var(--text-muted);">No analysis returned!</span>`);
                }

                // 3. Symbol Table
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
                if (result.story_lexer || result.story_parser || result.story_semantics) {
                    let storyHTML = `<span style="color:var(--hot-pink); font-weight:bold;">💅 1. Sabi ng Lexer (Ang Tagabasa ng Chismis):</span><br>`;
                    if (result.story_lexer && result.story_lexer.length > 0) {
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
            consoleOutput.innerHTML = wrapAnimate(`<span style="color:#ff3366;">Naku teh, walang internet o patay ang server! 😭</span>`);
        } finally {
            runBtn.classList.remove('is-loading');
            runBtn.innerHTML = 'Slay Ko \'To! ✨';
        }
    });

    // ── Clear Button ──
    clearBtn.addEventListener('click', () => {
        consoleOutput.innerHTML = wrapAnimate('Nalinis na ang chika! 🧽');
        analysisOutput.innerHTML = 'Waiting for analysis...';
        storyOutput.innerHTML = 'Waiting for the tea...';
        symbolTableBody.innerHTML = `<tr><td colspan="4">No variables declared yet.</td></tr>`;
        switchToTab('console');
    });

    // ── Tab Switch Helper ──
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
    const updateLineNumbers = () => {
        const lines = codeInput.value.split('\n').length;
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    };

    codeInput.addEventListener('input', updateLineNumbers);
    codeInput.addEventListener('scroll', () => {
        lineNumbers.scrollTop = codeInput.scrollTop;
    });

    // Initialize line numbers
    updateLineNumbers();

    // ── Staggered Entrance Animations ──
    const animateElements = document.querySelectorAll('.cheat-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `strutIn 0.5s ${index * 0.1}s var(--transition-snappy) both`;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(el => observer.observe(el));
});
