#!/usr/bin/env python3
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
text = open(fp, 'r', encoding='utf-8').read()

# Fix: missing {{...}} braces around the object mapping
# Find the problematic line
for i, line in enumerate(text.split('\n'), 1):
    if 'skills:' in line and 'followers' in line and 'following' in line:
        stripped = line.strip()
        print(f'L{i}: {repr(stripped)}')
        
        # The current line has: { skills: 'skills', ... }[key]
        # It should have: {{ skills: 'skills', ... }[key]}
        # Fix: add outer { at beginning and } at end
        if stripped.startswith('{') and not stripped.startswith('{{'):
            # Count braces: find the closing }
            brace_count = 0
            for j, ch in enumerate(stripped):
                if ch == '{':
                    brace_count += 1
                elif ch == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        # This is the matching }
                        # The current line is: { ... }[key]}
                        # We need: {{ ... }[key]}
                        # Add one more { at start and one more } at end
                        new_line = '{' + line.strip() + '}'
                        old_line = line
                        text = text.replace(old_line, new_line + '\n', 1)
                        print(f'Fixed: added outer braces')
                        break
            break

if text != open(fp, 'r', encoding='utf-8').read():
    open(fp, 'w', encoding='utf-8').write(text)
    print('Written')
