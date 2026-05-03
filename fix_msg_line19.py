#!/usr/bin/env python3
"""Fix messages line 19 corruption"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\messages\index.tsx'
raw = open(fp, 'rb').read()

# Find the unique pattern around line 19
# Look for '22px' Text tag with corruption
pat = b">\xe9\x92\x83\x3f\x2f\x54\x65\x78\x74\x3e"
# This is: >鉃?/Text>
# The > before closes the style attribute, then 鉃?/Text> is the content + corrupted close

print(f"Pattern length: {len(pat)}")
idx = raw.find(pat)
if idx >= 0:
    print(f"Found at byte {idx}")
    # Replace with >➕</Text>
    rep = b">\xe2\x9e\x95\x3c\x2f\x54\x65\x78\x74\x3e"
    raw = raw.replace(pat, rep)
    open(fp, 'wb').write(raw)
    print("Fixed!")
else:
    print("Pattern not found")
    # Try different approaches
    # Find '22px' near 'Text'
    idx2 = raw.find(b'22px')
    if idx2 >= 0:
        chunk = raw[idx2:idx2+60]
        print(f"'22px' area: {chunk.hex()}")
        print(f"text: {repr(chunk.decode('utf-8', errors='replace'))}")
    
    # The corrupted char might not be 鉃. Let me check all bytes after the style close
    for i in range(idx2, min(idx2+50, len(raw))):
        if raw[i] == 0x3e:  # > closing the style
            next_bytes = raw[i+1:i+15]
            print(f"After style close: {next_bytes.hex()}")
            break
