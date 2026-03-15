import os
import sys
import io
import traceback
import importlib.util
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Import Interpreter with hyphens using absolute paths for Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
interpreter_path = os.path.join(current_dir, "BekiLang-Interpreter.py")

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
    
    try:
        beki.run_bekilang(code)
    except Exception as e:
        print(f"🔥 Oh no, server error teh! {str(e)}")
        traceback.print_exc()
    finally:
        sys.stdout = old_stdout
        
    output = new_stdout.getvalue()
    return jsonify({"output": output})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
