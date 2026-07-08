import re
import sys

def search_file(filepath, pattern):
    print(f"Searching for: {pattern}")
    compiled_re = re.compile(pattern, re.IGNORECASE)
    
    # Try different encodings
    for encoding in ['utf-8', 'utf-16', 'utf-16-le', 'utf-16-be', 'latin-1']:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                lines = f.readlines()
            print(f"Successfully read with {encoding}, total lines: {len(lines)}")
            
            matches = 0
            for idx, line in enumerate(lines):
                if compiled_re.search(line):
                    print(f"Line {idx+1}: {line.strip()}")
                    matches += 1
                    if matches >= 100:
                        print("Truncating results at 100 matches")
                        break
            return
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"Error reading with {encoding}: {e}")
            return

if __name__ == "__main__":
    filepath = r"c:\Users\user\Downloads\Project MOAT\Regaarder Compose\src\App.jsx"
    pattern = sys.argv[1] if len(sys.argv) > 1 else "Omni"
    search_file(filepath, pattern)
