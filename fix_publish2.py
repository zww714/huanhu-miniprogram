#!/usr/bin/env python3
"""Fix publish page - byte-level fixes"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\publish\index.tsx'
raw = open(fp, 'rb').read()
orig = raw

# Fix: '鎶能鑳戒氦鎹?' -> '技能交换' (missing closing quote before comma)
# corrupted starts at ' \xe9\x8e\xb6 ... 鎶
# Actually, let me find the exact corruption by scanning

# Find the line with PREDEFINED_TAGS
idx = raw.find(b'PREDEFINED_TAGS')
if idx >= 0:
    chunk = raw[idx:idx+150]
    print(f'Before fix: {repr(chunk.decode("utf-8"))}')

# The corrupted sequence has '鎶能鑳戒氦鎹? where ? = 0x3f instead of 0x27
# Let me find the specific byte pattern: 
# ', '鎶...鎹? -> '技能交换'
# The corrupted text:  '鎶€鑳戒氦鎹? -> '技能交换'
# I need to find: 27 e98eb6 ... 3f 2c

# Find the byte sequence: 鎶 (e9 8e b6) perhaps
# The multi-char corrupted tag spans many bytes
# Let me search for a unique sub-pattern

# Pattern: after a proper closing ' and comma, find the opening '
# Looking at the hex: ...27 2c 20 27 e9 8e b6 ...
# That's the ' before 鎶

# Find: 2c 20 27 e9 8e b6 (", '" + corrupted char)
search = b'\x2c\x20\x27\xe9\x8e\xb6'
if search in raw:
    # From here, find the ? (0x3f) that should be ' (0x27)
    pos = raw.find(search)
    start = pos + 3  # after ', '
    end = raw.find(b'\x3f\x2c\x20\x27', start)  # find ?,
    if end > 0:
        corrupted_bytes = raw[start:end]
        print(f'Corrupted bytes ({len(corrupted_bytes)}): {corrupted_bytes.hex()}')
        # Replace with '技能交换'
        correct = b"'\xe6\x8a\x80\xe8\x83\xbd\xe4\xba\xa4\xe6\x8d\xa2'"
        raw = raw[:start] + correct + raw[end+1:]  # skip the ?
        print('Fix 1 applied')
    else:
        print('No ?, found')
else:
    print('Pattern not found')

# Also fix the visibility array
# Find VISIBILITY
idx2 = raw.find(b'VISIBILITY')
if idx2 >= 0:
    chunk2 = raw[idx2:idx2+80]
    print(f'VISIBILITY area: {repr(chunk2.decode("utf-8"))}')

if raw != orig:
    open(fp, 'wb').write(raw)
    print(f'Written: {len(orig)} -> {len(raw)} bytes')

# Show result
idx3 = raw.find(b'PREDEFINED_TAGS')
if idx3 >= 0:
    chunk3 = raw[idx3:idx3+150]
    print(f'After fix: {repr(chunk3.decode("utf-8"))}')
