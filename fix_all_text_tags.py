#!/usr/bin/env python3
"""Fix all ?/Text> patterns across all pages"""
import os, sys
sys.stdout.reconfigure(encoding='utf-8')

base = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'

for pn in sorted(os.listdir(base)):
    fp = os.path.join(base, pn, 'index.tsx')
    if not os.path.exists(fp):
        continue
    
    raw = open(fp, 'rb').read()
    orig = raw
    
    # Find the pattern: corrupted bytes (exactly 4 bytes) followed by /Text>
    # The pattern is: [corrupted 3 bytes] [0x3F instead of 0x3C] /Text>
    # Fix: remove corrupted bytes + ? and insert <
    
    # Fix: replace ?/Text> with </Text>
    raw = raw.replace(b'\x3f\x2f\x54\x65\x78\x74\x3e', b'\x3c\x2f\x54\x65\x78\x74\x3e')
    
    n = raw.count(b'\x3c\x2f\x54\x65\x78\x74\x3e') - orig.count(b'\x3c\x2f\x54\x65\x78\x74\x3e')
    if n > 0:
        open(fp, 'wb').write(raw)
        print(f'{pn}: fixed {n} occurrences')
    else:
        print(f'{pn}: no changes')

print()
print('All done!')
