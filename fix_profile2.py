#!/usr/bin/env python3
"""Fix profile page corrupted strings using hex byte sequences"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
raw = open(fp, 'rb').read()
orig = raw

# The corrupted bytes for '我戠殑鎶€鑳?' 
# Let me find and fix by searching for a unique sequence
# Search for '我戠殑' which is e6 88 91 e6 88 a0 e6 ae 91
import re

# Find all string literals that contain corrupted characters
text = raw.decode('utf-8')
lines = text.split('\n')
for i in range(10, 18):
    print(f'L{i}: {repr(lines[i].strip()[:80])}')
    
# Now find the exact hex bytes of the corrupted strings
# by scanning for 'label:'
idx = raw.find(b'label:')
while idx >= 0:
    chunk = raw[idx:idx+60]
    print(f'\nlabel area at byte {idx}:')
    print(f'  hex: {chunk.hex()}')
    idx = raw.find(b'label:', idx+1)
    if idx > 60:
        idx = -1  # only show first

# Fix by replacing the exact bytes found
# I'll print the hex and the user can provide fixes
