document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('runBtn');
    const clearBtn = document.getElementById('clearBtn');
    const codeInput = document.getElementById('codeInput');
    const consoleOutput = document.getElementById('consoleOutput');
    const analysisOutput = document.getElementById('analysisOutput');
    const storyOutput = document.getElementById('storyOutput');
    const symbolTableBody = document.getElementById('symbolTableBody');

    const defaultCode = `chika greeting ay "Welcome sa BekiLang Studio, Mhiema!" periodt
parinig greeting periodt

borta score ay 100 ganern
kunwari score parehas 100 {
    parinig "Perfect score ang Vaklang twooo!" ganern
}`;

    // Load default
    codeInput.value = defaultCode;

    runBtn.addEventListener('click', async () => {
        const code = codeInput.value;
        if (!code.trim()) {
            consoleOutput.innerHTML = `<span style="color:#ff66ff;">Wag naman walang code sis! Type ka in the Burn Book! 🙄</span>`;
            return;
        }

        consoleOutput.innerHTML = `<span style="color:#ffd700;">Wait lang teh, nag-iisip ang BekiLang compiler... 💅</span>`;
        analysisOutput.innerHTML = "Processing...";
        storyOutput.innerHTML = "Gathering the tea...";
        symbolTableBody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;
        
        runBtn.innerHTML = "💅 Running...";
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
                    consoleOutput.innerHTML = result.console.join("<br>")
                        .replace(/💅 BEKI SAYS:/g, '<span style="color:#ff00ff; font-weight:bold;">💅 BEKI SAYS:</span>');
                } else {
                    consoleOutput.innerHTML = "<span style='color:#888;'>No output returned!</span>";
                }

                // 2. Analysis Output
                if (result.analysis) {
                    let formattedAnalysis = result.analysis
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/❌ Semantic Error:/g, '<span style="color:#ff3366;">❌ Semantic Error:</span>')
                        .replace(/❌ Syntax Error/g, '<span style="color:#ff3366;">❌ Syntax Error</span>')
                        .replace(/✅/g, '<span style="color:#00ff00;">✅</span>')
                        .replace(/\[LEXER\]/g, '<span style="color:#cc66ff;">[LEXER]</span>')
                        .replace(/\[PARSER\]/g, '<span style="color:#00ffff;">[PARSER]</span>')
                        .replace(/\[SEMANTICS\]/g, '<span style="color:#ffcc00;">[SEMANTICS]</span>');
                    analysisOutput.innerHTML = formattedAnalysis;
                } else {
                     analysisOutput.innerHTML = "<span style='color:#888;'>No analysis returned!</span>";
                }

                // 3. Symbol Table
                if (result.symbol_table && result.symbol_table.length > 0) {
                    symbolTableBody.innerHTML = result.symbol_table.map(sym => `
                        <tr>
                            <td>${sym.name}</td>
                            <td>${sym.type}</td>
                            <td>${sym.level}</td>
                            <td>${sym.offset}</td>
                        </tr>
                    `).join("");
                } else {
                    symbolTableBody.innerHTML = `<tr><td colspan="4" style="color:#888;">No variables declared yet.</td></tr>`;
                }

                // 4. Explainability Story
                if (result.story_lexer || result.story_parser || result.story_semantics) {
                    let storyHTML = `<span style="color:var(--neon-magenta); font-weight:bold;">💅 1. Sabi ng Lexer (Ang Tagabasa ng Chismis):</span><br>`;
                    if (result.story_lexer && result.story_lexer.length > 0) {
                       storyHTML += `   Tiningnan ko yung words isa-isa. ${result.story_lexer.slice(0, 5).join(', ')}${result.story_lexer.length > 5 ? ' at iba pa!' : '.'}<br>`;
                    } else {
                       storyHTML += `   Wala akong masyadong nakitang interesting na words, sis.<br>`;
                    }

                    storyHTML += `<br><span style="color:var(--neon-magenta); font-weight:bold;">💅 2. Sabi ng Parser (Ang Marites na taga-connect ng kwento):</span><br>`;
                    if (result.story_parser && result.story_parser.length > 0) {
                        storyHTML += result.story_parser.map(s => `   - ${s}`).join("<br>") + "<br>";
                    } else {
                        storyHTML += `   - Walang matinong statements na na-parse. Naloka agad ako bago makabuo ng logic!<br>`;
                    }

                    storyHTML += `<br><span style="color:var(--neon-magenta); font-weight:bold;">💅 3. Sabi ng Semantic Analyzer (Ang Judge ng Katotohanan):</span><br>`;
                    if (result.story_semantics && result.story_semantics.length > 0) {
                        storyHTML += result.story_semantics.map(s => `   - ${s}`).join("<br>") + "<br>";
                    } else {
                        storyHTML += `   - Walang naganap na action sa memorya. Di pumasa sa standards ko!<br>`;
                    }
                    storyOutput.innerHTML = storyHTML;
                } else {
                    storyOutput.innerHTML = "<span style='color:#888;'>No story generated.</span>";
                }

            } else {
                consoleOutput.innerHTML = `<span style="color:#ff3366;">Gosh! Internal Server Error: ${response.statusText}</span>`;
            }
        } catch (error) {
            consoleOutput.innerHTML = `<span style="color:#ff3366;">Naku teh, walang internet o patay ang server! 😭</span>`;
        } finally {
            runBtn.innerHTML = "Run Mhiema! ✨";
        }
    });

    clearBtn.addEventListener('click', () => {
        consoleOutput.innerHTML = "Nalinis na ang chika! 🧽";
        analysisOutput.innerHTML = "Waiting for analysis...";
        storyOutput.innerHTML = "Waiting for the tea...";
        symbolTableBody.innerHTML = `<tr><td colspan="4">No variables declared yet.</td></tr>`;
    });

    // Line Numbers Logic
    const lineNumbers = document.getElementById('lineNumbers');

    const updateLineNumbers = () => {
        const lines = codeInput.value.split('\n').length;
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    };

    codeInput.addEventListener('input', updateLineNumbers);

    codeInput.addEventListener('scroll', () => {
        lineNumbers.scrollTop = codeInput.scrollTop;
    });

    // Initialize line numbers on load
    updateLineNumbers();
});
