import subprocess
lines = open('scratch/test_deck2.jsx', 'r', encoding='utf-8').read().splitlines()

for i in range(1, 10):
    test_lines = lines.copy()
    test_lines.insert(-2, '</div>\n' * i)
    with open(f'scratch/test_deck_{i}.jsx', 'w', encoding='utf-8') as f: f.write('\n'.join(test_lines))
    res = subprocess.run(['node', '-e', f"require('@babel/core').transformFileSync('scratch/test_deck_{i}.jsx', {{presets: ['@babel/preset-react']}})"], capture_output=True, text=True)
    if res.returncode == 0:
        print(f'SUCCESS! Missing {i} div tags!')
        break
    else:
        print(f'Failed with {i} div tags. {res.stderr.splitlines()[-5:]}')
