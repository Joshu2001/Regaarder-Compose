lines = open('scratch/App_test8.jsx', 'r', encoding='utf-8').read().splitlines()
deck_start = 32533 # ) : (
deck_end = 33014 # )}
code = 'const React = require("react");\nconst DeckMode = () => (\n' + ' '.join([' ']) + '\n'.join(lines[deck_start:deck_end]) + '\n);\n'
with open('scratch/test_deck2.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
