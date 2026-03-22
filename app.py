# app.py — Flask backend for the BekiLang web IDE
# Serves the HTML page and exposes a single API endpoint that runs BekiLang code.
# The compiler lives in BekiLang-Compiler.py and gets imported dynamically below.

import os
import re
import sys
import io
import traceback
import importlib.util
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# BekiLang-Compiler.py has a hyphen in its filename, so we can't do a normal import.
# importlib lets us load it by file path instead — a bit hacky but it works.
current_dir = os.path.dirname(os.path.abspath(__file__))
interpreter_path = os.path.join(current_dir, "BekiLang-Compiler.py")

spec = importlib.util.spec_from_file_location("BekiLang", interpreter_path)
beki = importlib.util.module_from_spec(spec)
sys.modules["BekiLang"] = beki
spec.loader.exec_module(beki)

# Regex to strip ANSI color/style escape codes (e.g. \033[96m) from compiler output.
# The compiler uses them for terminal colors, but the browser can't render them —
# they'd show up as garbage like [96m if we don't remove them first.
ANSI_ESCAPE = re.compile(r'\x1b\[[0-9;]*m')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/run', methods=['POST'])
def run():
    data = request.json
    code = data.get('code', '')

    # Redirect stdout so we can capture the compiler's analysis logs.
    # The compiler prints a lot to stdout — we want that text to send back as "analysis".
    old_stdout = sys.stdout
    new_stdout = io.StringIO()
    sys.stdout = new_stdout

    result_dict = None
    try:
        result_dict = beki.run_bekilang(code, return_dict=True)
    except Exception as e:
        print(f"🔥 Oh no, server error teh! {str(e)}")
        traceback.print_exc()
    finally:
        # Always restore stdout, even if something blows up.
        sys.stdout = old_stdout

    analysis_output = new_stdout.getvalue()

    # Fallback result in case the compiler itself crashed unexpectedly.
    if not result_dict:
        result_dict = {
            "status": "error",
            "error_message": "A critical server error occurred",
            "symbol_table": [],
            "console": [],
            "story_lexer": [],
            "story_parser": [],
            "story_semantics": []
        }

    # Strip ANSI codes before sending to the browser — the frontend handles its own styling.
    result_dict["analysis"] = ANSI_ESCAPE.sub('', analysis_output)

    return jsonify(result_dict)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
