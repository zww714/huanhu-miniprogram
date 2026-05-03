#!/usr/bin/env python3
import sys

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\index\index.tsx'
raw = open(fp, 'rb').read()

# Find ICONS area
pat = b'trending'
idx = raw.find(pat)
if idx >= 0:
    start = raw.rfind(b'const', 0, idx)
    end = raw.find(b'}', idx)
    if end > 0:
        end = raw.find(b'\n', end) + 1
    
    print(f'ICONS block from byte {start} to {end}')
    
    # Build correct replacement
    fire = '\U0001f525'
    eggplant = '\U0001f346'
    gamepad = '\U0001f3ae'
    phone = '\U0001f4f2'
    
    correct_line = f"const ICONS: Record<string, string> = {{\n  trending: '{fire}', chef: '{eggplant}', gamepad: '{gamepad}', camera: '{phone}'\n}}\n"
    correct_bytes = correct_line.encode('utf-8')
    
    new_raw = raw[:start] + correct_bytes + raw[end:]
    open(fp, 'wb').write(new_raw)
    print(f'Replaced {end-start} bytes with {len(correct_bytes)} bytes')
    
    # Verify
    verify = open(fp, 'rb').read()
    if b'const ICONS' in verify:
        print('const ICONS found OK')
    # Check no duplicate
    count = verify.count(b'trending')
    print(f'trending count: {count}')
    if count == 1:
        print('CORRECT - only one trending line')
    else:
        print(f'WARNING - expected 1 trending line, got {count}')
