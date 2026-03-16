import sys
import re

# =====================================================================
# BekiLang: A Philippine Gay Lingo Programming Language
# =====================================================================
# This is a full-blown interpreted language featuring:
# - Lexical Analysis (Tokenization)
# - Parsing (Abstract Syntax Tree Generation using Recursive Descent)
# - Semantic Analysis & Interpretation (Execution)
# - Variables, Loops, Conditionals, and I/O!
# =====================================================================

# --- 1. LEXER (Tokenization) ---

# BekiLang Keywords & Operators mappings
KEYWORDS = {
    "borta": "TYPE_INT",     # int
    "mema": "TYPE_FLOAT",    # float
    "chika": "TYPE_STRING",  # string
    "charot": "TYPE_CHAR",   # char
    "truch": "TYPE_BOOL",    # boolean
    "kunwari": "IF",         # if
    "eh_di": "ELSE",         # else
    "gorabel": "WHILE",      # while
    "parinig": "PRINT",      # print
    "korik": "TRUE",         # true
    "wiz": "FALSE",          # false
    "ay": "ASSIGN",          # =
    "periodt": "SEMI",       # ;
    "ganern": "SEMI",        # ;
    "dagdag": "PLUS",        # +
    "bawas": "MINUS",        # -
    "times": "MUL",          # *
    "divide": "DIV",         # /
    "mas_tarush": "GT",      # >
    "mas_chaka": "LT",       # <
    "parehas": "EQ",         # ==
    "wit_parehas": "NEQ",    # !=
    "at_saka": "AND",        # and
    "o_kaya": "OR",          # or
}

SYMBOLS = {
    '+': 'PLUS', '-': 'MINUS', '*': 'MUL', '/': 'DIV',
    '>': 'GT', '<': 'LT', '==': 'EQ', '!=': 'NEQ',
    '(': 'LPAREN', ')': 'RPAREN', '{': 'LBRACE', '}': 'RBRACE',
    ';': 'SEMI', '=': 'ASSIGN'
}

class Token:
    def __init__(self, type_, value, line):
        self.type = type_
        self.value = value
        self.line = line

    def __repr__(self):
        return f"Token({self.type}, {repr(self.value)})"

class Lexer:
    def __init__(self, text):
        self.text = text
        self.pos = 0
        self.current_char = self.text[self.pos] if self.text else None
        self.line = 1

    def advance(self):
        self.pos += 1
        if self.pos < len(self.text):
            self.current_char = self.text[self.pos]
        else:
            self.current_char = None

    def skip_whitespace(self):
        while self.current_char is not None and self.current_char.isspace():
            if self.current_char == '\n':
                self.line += 1
            self.advance()

    def skip_comment(self):
        while self.current_char is not None and self.current_char != '\n':
            self.advance()
        if self.current_char == '\n':
            self.line += 1
            self.advance()

    def get_number(self):
        result = ''
        dot_count = 0
        while self.current_char is not None and (self.current_char.isdigit() or self.current_char == '.'):
            if self.current_char == '.':
                dot_count += 1
            result += self.current_char
            self.advance()
        if dot_count == 0:
            return Token("INTEGER", int(result), self.line)
        else:
            return Token("FLOAT", float(result), self.line)

    def get_string(self, quote_type):
        result = ''
        self.advance() # skip opening quote
        while self.current_char is not None and self.current_char != quote_type:
            result += self.current_char
            self.advance()
        self.advance() # skip closing quote

        if quote_type == "'":
            return Token("CHAR", result, self.line)
        return Token("STRING", result, self.line)

    def get_id(self):
        result = ''
        while self.current_char is not None and (self.current_char.isalnum() or self.current_char == '_'):
            result += self.current_char
            self.advance()
        
        token_type = KEYWORDS.get(result, "IDENTIFIER")
        return Token(token_type, result, self.line)

    def get_next_token(self):
        while self.current_char is not None:
            if self.current_char.isspace():
                self.skip_whitespace()
                continue
            
            # String / Char literals
            if self.current_char in ('"', "'"):
                return self.get_string(self.current_char)

            if self.current_char.isalpha() or self.current_char == '_':
                return self.get_id()

            if self.current_char.isdigit():
                return self.get_number()

            if self.current_char in SYMBOLS:
                char = self.current_char
                self.advance()
                
                # Check for comments: `//`
                if char == '/' and self.current_char == '/':
                    self.skip_comment()
                    continue

                # Check for two-char operators like == or !=
                if char in ('=', '!') and self.current_char == '=':
                    char += '='
                    self.advance()
                return Token(SYMBOLS.get(char, "UNKNOWN"), char, self.line)

            # Fallback for unknown character
            char = self.current_char
            self.advance()
            return Token("UNKNOWN", char, self.line)

        return Token("EOF", None, self.line)


# --- 2. PARSER (AST Generating) ---

class ASTNode: pass
class BinOp(ASTNode):
    def __init__(self, left, op, right):
        self.left = left
        self.op = op
        self.right = right
class Num(ASTNode):
    def __init__(self, token):
        self.value = token.value
        self.type = token.type
class StringVal(ASTNode):
    def __init__(self, token):
        self.value = token.value
class BoolVal(ASTNode):
    def __init__(self, token):
        self.value = True if token.type == "TRUE" else False
class VarDecl(ASTNode):
    def __init__(self, var_type, var_name, expr):
        self.var_type = var_type
        self.var_name = var_name
        self.expr = expr
class Assign(ASTNode):
    def __init__(self, var_name, expr):
        self.var_name = var_name
        self.expr = expr
class Var(ASTNode):
    def __init__(self, token):
        self.var_name = token.value
class Print(ASTNode):
    def __init__(self, expr):
        self.expr = expr
class IfStmt(ASTNode):
    def __init__(self, condition, true_block, false_block):
        self.condition = condition
        self.true_block = true_block
        self.false_block = false_block
class WhileStmt(ASTNode):
    def __init__(self, condition, block):
        self.condition = condition
        self.block = block
class Block(ASTNode):
    def __init__(self, statements):
        self.statements = statements

class Parser:
    def __init__(self, lexer):
        self.lexer = lexer
        self.current_token = self.lexer.get_next_token()

    def error(self, message):
        raise Exception(f"❌ Syntax Error (Linya {self.current_token.line}): Ay, shunga ka sis! Nakakaloka ang grammar! {message}. Found '{self.current_token.value}'")

    def eat(self, token_type):
        if self.current_token.type == token_type:
            self.current_token = self.lexer.get_next_token()
        else:
            if token_type == "SEMI":
                self.error("Nalimutan mo ang tuldok sis! Tapusin mo ang statement with 'periodt' or 'ganern' para pak!")
            elif token_type == "RBRACE":
                self.error("Nawawala ang pinto sis! Missing closing '}' brace")
            elif token_type == "RPAREN":
                self.error("Hindi mo sinara ang kwento mo! Missing closing ')' parenthesis")
            else:
                self.error(f"Ew, hinahanap ko ang {token_type} pero iba ang binigay mo")

    def program(self):
        statements = []
        while self.current_token.type != "EOF":
            statements.append(self.statement())
        return Block(statements)

    def statement(self):
        if self.current_token.type in ("TYPE_INT", "TYPE_FLOAT", "TYPE_STRING", "TYPE_CHAR", "TYPE_BOOL"):
            return self.declaration()
        elif self.current_token.type == "IDENTIFIER":
            return self.assignment()
        elif self.current_token.type == "PRINT":
            return self.print_statement()
        elif self.current_token.type == "IF":
            return self.if_statement()
        elif self.current_token.type == "WHILE":
            return self.while_statement()
        elif self.current_token.type == "LBRACE":
            return self.block()
        else:
            self.error("Hala sis, hindi ko ma-gets ang statement mo")

    def declaration(self):
        print("[PARSER] Checking statement structure...")
        print("[PARSER] Expected rule: [DATATYPE] [ID] [ASSIGN] [EXPR] [SEMI]")
        var_type = self.current_token.type
        self.eat(var_type)
        var_name = self.current_token.value
        self.eat("IDENTIFIER")
        self.eat("ASSIGN")
        expr = self.expr()
        self.eat("SEMI")
        print("[PARSER] Actual structure matches expected rule perfectly.")
        return VarDecl(var_type, var_name, expr)

    def assignment(self):
        print("[PARSER] Checking statement structure...")
        print("[PARSER] Expected rule: [ID] [ASSIGN] [EXPR] [SEMI]")
        var_name = self.current_token.value
        self.eat("IDENTIFIER")
        self.eat("ASSIGN")
        expr = self.expr()
        self.eat("SEMI")
        print("[PARSER] Actual structure matches expected rule perfectly.")
        return Assign(var_name, expr)

    def print_statement(self):
        self.eat("PRINT")
        expr = self.expr()
        self.eat("SEMI")
        return Print(expr)

    def if_statement(self):
        self.eat("IF")
        cond = self.expr()
        true_block = self.block()
        false_block = None
        if self.current_token.type == "ELSE":
            self.eat("ELSE")
            false_block = self.block()
        return IfStmt(cond, true_block, false_block)

    def while_statement(self):
        self.eat("WHILE")
        cond = self.expr()
        block = self.block()
        return WhileStmt(cond, block)

    def block(self):
        self.eat("LBRACE")
        statements = []
        while self.current_token.type != "RBRACE" and self.current_token.type != "EOF":
            statements.append(self.statement())
        self.eat("RBRACE")
        return Block(statements)

    def expr(self):
        node = self.comp_expr()
        while self.current_token.type in ("AND", "OR"):
            op = self.current_token
            if op.type == "AND": self.eat("AND")
            elif op.type == "OR": self.eat("OR")
            node = BinOp(left=node, op=op, right=self.comp_expr())
        return node

    def comp_expr(self):
        node = self.arith_expr()
        while self.current_token.type in ("GT", "LT", "EQ", "NEQ"):
            op = self.current_token
            self.eat(op.type)
            node = BinOp(left=node, op=op, right=self.arith_expr())
        return node

    def arith_expr(self):
        node = self.term()
        while self.current_token.type in ("PLUS", "MINUS"):
            op = self.current_token
            self.eat(op.type)
            node = BinOp(left=node, op=op, right=self.term())
        return node

    def term(self):
        node = self.factor()
        while self.current_token.type in ("MUL", "DIV"):
            op = self.current_token
            self.eat(op.type)
            node = BinOp(left=node, op=op, right=self.factor())
        return node

    def factor(self):
        token = self.current_token
        if token.type in ("INTEGER", "FLOAT"):
            self.eat(token.type)
            return Num(token)
        elif token.type in ("STRING", "CHAR"):
            self.eat(token.type)
            return StringVal(token)
        elif token.type in ("TRUE", "FALSE"):
            self.eat(token.type)
            return BoolVal(token)
        elif token.type == "IDENTIFIER":
            self.eat("IDENTIFIER")
            return Var(token)
        elif token.type == "LPAREN":
            self.eat("LPAREN")
            node = self.expr()
            self.eat("RPAREN")
            return node
        
        self.error(f"Ew, anong factor 'yan sis? {token.value}")


# --- 3. INTERPRETER (Execution Engine) ---

class Interpreter:
    def __init__(self, parser):
        self.parser = parser
        self.GLOBAL_SCOPE = {}  # Symbol table

    def error(self, message):
        raise Exception(f"❌ Semantic Error: {message}\n🛠 Recovery Strategy: Type Coercion or Discard Assignment. (Naloka ang system!)")

    def visit(self, node):
        method_name = f'visit_{type(node).__name__}'
        visitor = getattr(self, method_name, self.generic_visit)
        return visitor(node)

    def generic_visit(self, node):
        raise Exception(f"No visit_{type(node).__name__} method")

    def visit_Block(self, node):
        for stmt in node.statements:
            self.visit(stmt)

    def visit_VarDecl(self, node):
        var_name = node.var_name
        if var_name in self.GLOBAL_SCOPE:
            self.error(f"Ginamit mo na ang '{var_name}', sis! Wag paulit-ulit.")
            return
        
        value = self.visit(node.expr)
        t = node.var_type
        
        print(f"[SEMANTICS] Checking Type Compatibility...")
        
        # Semantic Type Checking
        failed_check = False
        if t == "TYPE_INT" and not isinstance(value, int):
            self.error(f"Ay chaka! Ang '{var_name}' ay 'borta' (int), pero binigyan mo ng '{value}' na hindi whole number. Taray mo sis!")
            failed_check = True
        elif t == "TYPE_FLOAT" and not isinstance(value, (float, int)):
            self.error(f"Ano ba 'yan! Ang '{var_name}' ay 'mema' (float), pero ang '{value}' hindi decimal. Mema-lagay lang?")
            failed_check = True
        elif t == "TYPE_STRING" and not isinstance(value, str):
            self.error(f"Maling chika! Ang '{var_name}' ay 'chika' (string), ba't mo nilagyan ng '{value}'? Spill the real tea!")
            failed_check = True
        elif t == "TYPE_BOOL" and not isinstance(value, bool):
            self.error(f"Imbento! Ang '{var_name}' ay 'truch' (boolean), pero ang '{value}' hindi truch or wiz. Ano ba talaga?")
            failed_check = True
            
        if not failed_check:
            print(f"[SEMANTICS] Variable '{var_name}' is declared as '{t}'. Value is '{value}'.")
            print("[SEMANTICS] Types match. No coercion needed.")
            print(f"[SEMANTICS] Binding variable '{var_name}' to Symbol Table.")
            self.GLOBAL_SCOPE[var_name] = value

    def visit_Assign(self, node):
        var_name = node.var_name
        if var_name not in self.GLOBAL_SCOPE:
            self.error(f"Who's that girl? Sino si '{var_name}'? Di ko siya kilala! I-declare mo muna sis bago mo i-assign.")
            return
        self.GLOBAL_SCOPE[var_name] = self.visit(node.expr)

    def visit_Var(self, node):
        var_name = node.var_name
        if var_name not in self.GLOBAL_SCOPE:
            self.error(f"Sino si '{var_name}'? Walang ganyang pangalan dito uy.")
            return 0
        return self.GLOBAL_SCOPE[var_name]

    def visit_Print(self, node):
        value = self.visit(node.expr)
        if isinstance(value, bool):
            print("💅 BEKI SAYS: " + ("korik" if value else "wiz"))
        else:
            print(f"💅 BEKI SAYS: {value}")

    def visit_IfStmt(self, node):
        condition = self.visit(node.condition)
        if condition:
            self.visit(node.true_block)
        elif node.false_block is not None:
            self.visit(node.false_block)

    def visit_WhileStmt(self, node):
        safety_net = 0
        while self.visit(node.condition):
            self.visit(node.block)
            safety_net += 1
            if safety_net > 10000:
                self.error("Hala sis, na-stuck tayo sa infinite loop! In-abort ko na!")

    def visit_Num(self, node):
        return node.value

    def visit_StringVal(self, node):
        return node.value

    def visit_BoolVal(self, node):
        return node.value

    def visit_BinOp(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        op = node.op.type

        # String Concatenation Handling
        if op == "PLUS" and (isinstance(left, str) or isinstance(right, str)):
            return str(left) + str(right)

        if op == "PLUS": return left + right
        elif op == "MINUS": return left - right
        elif op == "MUL": return left * right
        elif op == "DIV": 
            if right == 0: 
                self.error("Hala siya! Division by zero! Anong kalokohan ito, gusto mo ba sumabog ang universe?")
                return 0
            return left / right
        elif op == "GT": return left > right
        elif op == "LT": return left < right
        elif op == "EQ": return left == right
        elif op == "NEQ": return left != right
        elif op == "AND": return left and right
        elif op == "OR": return left or right

# --- 4. RUNNER ---
def print_ast(node, level=0):
    indent = "  " * level
    if node is None: return
    name = type(node).__name__
    if name == "Block":
        print(f"{indent}Block:")
        for stmt in node.statements: print_ast(stmt, level + 1)
    elif name == "BinOp":
        print(f"{indent}BinOp({node.op.type})")
        print_ast(node.left, level + 1)
        print_ast(node.right, level + 1)
    elif name == "VarDecl":
        print(f"{indent}VarDecl({node.var_type}, {node.var_name})")
        print_ast(node.expr, level + 1)
    elif name == "Assign":
        print(f"{indent}Assign({node.var_name})")
        print_ast(node.expr, level + 1)
    elif name == "IfStmt":
        print(f"{indent}IfStmt")
        print_ast(node.condition, level + 1)
        print_ast(node.true_block, level + 1)
        if node.false_block: print_ast(node.false_block, level + 1)
    elif name == "WhileStmt":
        print(f"{indent}WhileStmt")
        print_ast(node.condition, level + 1)
        print_ast(node.block, level + 1)
    elif name == "Print":
        print(f"{indent}Print")
        print_ast(node.expr, level + 1)
    elif name in ("Num", "StringVal", "BoolVal", "Var"):
        val = getattr(node, 'value', getattr(node, 'var_name', ''))
        print(f"{indent}{name}({val})")

def run_bekilang(code):
    print("✨ ========================================== ✨")
    print("🦋  BekiLang Interpreter Booting up... Pak!   🦋")
    print("✨ ========================================== ✨\n")
    try:
        print("--- STARTING LEXICAL ANALYSIS ---")
        temp_lexer = Lexer(code)
        tokens = []
        unknown_count = 0
        unknown_tokens = []
        while True:
            tok = temp_lexer.get_next_token()
            if tok.type == "EOF": break
            tokens.append(tok)
            if tok.type == "UNKNOWN":
                unknown_count += 1
                unknown_tokens.append(tok.value)
            if len(tokens) <= 30:
                val_repr = f"'{tok.value}'" if isinstance(tok.value, str) else str(tok.value)
                print(f"[LEXER] Found {val_repr:<10} -> Identified as {tok.type}")
            elif len(tokens) == 31:
                print("[LEXER] ... (and more)")
            
        print(f"✓ Lexical Analysis Complete. {unknown_count} Unknown Tokens.\n")

        if unknown_count > 0:
            bad = ', '.join(repr(t) for t in unknown_tokens)
            raise Exception(f"❌ Lexical Error: Ay tarush, anong pinagsasabi mong '{bad}'? That's an Invalid Token / Identifier sa BekiLang!\n🛠 Recovery Strategy: Panic Mode Recovery. (Nag-walk out si bakla)")

        print("--- STARTING SYNTAX ANALYSIS ---")
        lexer = Lexer(code) # Reset lexer for parser
        parser = Parser(lexer)
        tree = parser.program()
        # print_ast(tree) # Un-comment to see raw AST
        print("✓ Syntax Analysis Complete. No structural errors.\n")

        print("--- STARTING SEMANTIC ANALYSIS ---")
        interpreter = Interpreter(parser)
        interpreter.visit(tree)
        
        print("✓ Semantic Analysis Complete.\n")
        print("\n✅ Status: COMPILATION SUCCESS (Kabog! Walang Error, Sis!)")
        
        print("\n📊 --- FINAL SYMBOL TABLE (Memory Map) --- 📊")
        for k, v in interpreter.GLOBAL_SCOPE.items():
            print(f"  Variable '{k}' -> Value: {repr(v)} (Type: {type(v).__name__})")
            
    except Exception as e:
        print(f"\n{e}")
        print("🚦 Status: COMPILATION FAILED (Jusko day, ang daming mali! I-debug mo na besh!)")


if __name__ == "__main__":
    # If the user runs the script without an argument, play a full demo!
    sample_code = """
    chika greeting ay "Hello, Mga Accla!" periodt
    parinig greeting periodt

    borta age ay 18 ganern
    borta threshold ay 18 ganern
    
    parinig "Ilang taon na me? " dagdag age periodt

    kunwari age mas_tarush threshold o_kaya age parehas threshold {
        parinig "Aba, legal na si bakla!" ganern
    } eh_di {
        parinig "Naku, bata pa, uwi na!" ganern
    }

    truch maganda_ako ay korik periodt
    kunwari maganda_ako {
        parinig "Truth! Gandang palaban!" periodt
    }

    parinig "Magbibilang tayo pataas, bongga!" ganern
    borta count ay 1 periodt
    gorabel count mas_chaka 6 {
        parinig "Current bilang: " dagdag count ganern
        count ay count dagdag 1 periodt
    }
    """
    
    print("Pili ka ng gagawin, Sis:")
    print("1) Run built-in Demo")
    print("2) Type your own BekiLang Code")
    choice = input("Choice (1 or 2): ")

    if choice == '1':
        run_bekilang(sample_code)
    else:
        print("\nEnter your BekiLang code below (Type 'pak_na' on an empty line to run):")
        user_code = ""
        while True:
            line = input()
            if line.strip() == "pak_na":
                break
            user_code += line + "\n"
        run_bekilang(user_code)
