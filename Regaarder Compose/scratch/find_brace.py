lines = open('scratch/test_deck3.jsx', 'r', encoding='utf-8').read().splitlines()

# Simple bracket matcher ignoring strings and comments (basic approximation)
import re

text = '\n'.join(lines)

# Remove comments
text = re.sub(r'//.*', '', text)
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)

# Remove strings
text = re.sub(r'"(?:\\\\.|[^\\\\"])*"', '""', text)
text = re.sub(r"'(?:\\\\.|[^\\\\'])*'", "''", text)
text = re.sub(r'`(?:\\\\.|[^\\\\`])*`', '``', text)

open_brace = []
for i, char in enumerate(text):
    if char == '{':
        open_brace.append(i)
    elif char == '}':
        if open_brace:
            open_brace.pop()

print('Unclosed braces count:', len(open_brace))
if open_brace:
    # Print lines around the last unclosed brace
    idx = open_brace[-1]
    line_idx = text[:idx].count('\n')
    print('Last unclosed brace near line:', line_idx + 1)
    print('\n'.join(lines[line_idx-2:line_idx+3]))
