document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('runBtn');
    const clearBtn = document.getElementById('clearBtn');
    const codeInput = document.getElementById('codeInput');
    const consoleOutput = document.getElementById('consoleOutput');

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
        runBtn.innerHTML = "💅 Running...";
        try {
            const response = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const result = await response.json();
            
            if (response.ok) {
                // Formatting specific BekiLang output lines for syntax highlighting in console
                let formattedOutput = result.output
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");

                formattedOutput = formattedOutput
                    .replace(/❌ Semantic Error:/g, '<span style="color:#ff3366;">❌ Semantic Error:</span>')
                    .replace(/❌ Syntax Error/g, '<span style="color:#ff3366;">❌ Syntax Error</span>')
                    .replace(/✅/g, '<span style="color:#00ff00;">✅</span>')
                    .replace(/\[LEXER\]/g, '<span style="color:#cc66ff;">[LEXER]</span>')
                    .replace(/\[PARSER\]/g, '<span style="color:#00ffff;">[PARSER]</span>')
                    .replace(/\[SEMANTICS\]/g, '<span style="color:#ffcc00;">[SEMANTICS]</span>')
                    .replace(/💅 BEKI SAYS:/g, '<span style="color:#ff00ff; font-weight:bold;">💅 BEKI SAYS:</span>');
                
                consoleOutput.innerHTML = formattedOutput || "<span style='color:#888;'>No output returned!</span>";
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
