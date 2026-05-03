#!/usr/bin/env python3
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\post-detail\index.tsx'
raw = open(fp, 'rb').read()

# Find exact corruption at the loved/liked ternary
for term in [b'liked ?', b"{liked ?", b"'broken" if False else b"broken"]:
    pass

# Search for the corrupted pattern
import re
# Find any ? ' X ?  pattern (broken ternary strings)
pat = b"\\x20\\x3f\\x20\\x27[^']+\\x3f\\x20\\x3a\\x20\\x27"
matches = list(re.finditer(pat, raw))
print(f"Found {len(matches)} occurrences of ternary corruption pattern")

for m in matches[:3]:
    chunk = raw[m.start():m.end()]
    text = chunk.decode('utf-8', errors='replace')
    print(f"  Bytes: {chunk.hex()}")
    print(f"  Text: {repr(text)}")

# Try to find the corruption directly - look for String ? String pattern
# already fixed in previous run - verify  
idx = raw.find(b"\xe9\x92\x82")
if idx >= 0:
    chunk = raw[idx:idx+20]
    print(f"\nRemaining 鉂 at {idx}: {chunk.hex()}")
else:
    print("\nNo 鉂 found - fix might have worked!")
    # Check if the 'liked ?' line is now correct
    for i, line in enumerate(raw.decode('utf-8').split('\n'), 1):
        if 'liked' in line and '?' in line:
            print(f"L{i}: {repr(line[:80])}")
