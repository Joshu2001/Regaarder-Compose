import subprocess

lines = open("scratch/App_test8.jsx", "r", encoding="utf-8").read().splitlines()

for num_to_remove in range(1, 10):
    test_lines = lines.copy()
    removed = 0
    i = 33013
    while i > 0 and removed < num_to_remove:
        if "</div>" in test_lines[i]:
            test_lines.pop(i)
            removed += 1
        i -= 1
    
    with open(f"scratch/App_test_auto_{num_to_remove}.jsx", "w", encoding="utf-8") as f:
        f.write("\n".join(test_lines))
    
    result = subprocess.run(["node", "-e", f"require('@babel/core').transformFileSync('scratch/App_test_auto_{num_to_remove}.jsx', {{presets: ['@babel/preset-react']}})"], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"SUCCESS with {num_to_remove} div tags removed!")
        break
    else:
        print(f"Failed with {num_to_remove} div tags removed")
        err_lines = result.stderr.splitlines()
        for ln in err_lines[-15:]:
            if 'SyntaxError' in ln:
                print(ln)
