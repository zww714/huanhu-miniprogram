#!/usr/bin/env python3
"""Fix all PUA (Private Use Area) corrupted characters across all pages"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

base = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'
pages = ['index', 'post-detail', 'skill-detail']

for pn in pages:
    fp = os.path.join(base, pn, 'index.tsx')
    raw = open(fp, 'rb').read()
    text = raw.decode('utf-8')
    orig = text
    
    # Remove all PUA characters (U+E000-U+F8FF)
    # These are corrupted remnants of double-encoding
    cleaned = ''
    removed_count = 0
    for ch in text:
        cp = ord(ch)
        if 0xE000 <= cp <= 0xF8FF:
            removed_count += 1
        else:
            cleaned += ch
    
    # Also fix specific known corrupted strings (replacement chars)
    # Fix '? ' -> "' " (where ? should be closing quote)
    # Check for unclosed strings
    
    if cleaned != orig:
        open(fp, 'w', encoding='utf-8').write(cleaned)
        print(f'{pn}: Removed {removed_count} PUA chars')
    else:
        print(f'{pn}: No PUA chars found')
    
    # Verify no PUA remain
    verify = open(fp, 'r', encoding='utf-8').read()
    remaining = sum(1 for c in verify if 0xE000 <= ord(c) <= 0xF8FF)
    print(f'  Remaining PUA: {remaining}')
