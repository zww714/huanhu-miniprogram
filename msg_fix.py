#!/usr/bin/env python3
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\messages\index.tsx'
raw = open(fp, 'rb').read()

# Find the area with showToast or 添加好友
idx = raw.find(b'showToast')
if idx >= 0:
    chunk = raw[idx:idx+100]
    print('Hex:', chunk.hex())
    text = chunk.decode('utf-8')
    print('Text:', repr(text))

# Find any remaining `<` | `>` issues near Text tags
import re
text = raw.decode('utf-8')
lines = text.split('\n')
for i, line in enumerate(lines, 1):
    if 'Text>' in line:
        # Check for malformed closing
        if '/Text>' in line and '</Text>' not in line:
            print(f'L{i}: MALFORMED: {repr(line[:80])}')
