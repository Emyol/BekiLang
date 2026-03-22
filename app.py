import os
import sys
import io
import traceback
import importlib.util
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Import Interpreter with hyphens using absolute paths for Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
interpreter_path = os.path.join(current_dir, "BekiLang-Compiler.py")

spec = importlib.util.spec_from_file_location("BekiLang", interpreter_path)
beki = importlib.util.module_from_spec(spec)
sys.modules["BekiLang"] = beki
spec.loader.exec_module(beki)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/run', methods=['POST'])
def run():
    data = request.json
    code = data.get('code', '')

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
        sys.stdout = old_stdout
        
    analysis_output = new_stdout.getvalue()
    
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
        
    result_dict["analysis"] = analysis_output
        
    return jsonify(result_dict)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
