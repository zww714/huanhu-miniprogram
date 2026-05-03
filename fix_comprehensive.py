#!/usr/bin/env python3
"""Comprehensive scan + fix for index.tsx corrupted characters"""
import sys

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\index\index.tsx'
raw = open(fp, 'rb').read()
text = raw.decode('utf-8')
lines = text.split('\n')

# Identify ALL corrupted characters (non-CJK, non-ASCII)
# Then find the corrupted strings they're in
corrupted_chars = set()
corrupted_lines_info = []

for i, line in enumerate(lines, 1):
    bad_in_line = []
    for ch in line:
        cp = ord(ch)
        if cp > 127 and not (0x4e00 <= cp <= 0x9fff) and not (0x3000 <= cp <= 0x303f):
            bad_in_line.append(ch)
            if len(bad_in_line) <= 3:
                corrupted_chars.add(ch)
    
    if bad_in_line:
        corrupted_lines_info.append((i, line.rstrip()))

print(f"Found {len(corrupted_lines_info)} lines with corrupted characters")
print(f"Unique corrupted chars: {len(corrupted_chars)}")

# For each corrupted line, try to determine the correct version
# based on context
for ln, content in corrupted_lines_info[:5]:
    # Show first 3 for debugging
    print(f"\nL{ln}: {repr(content[:100])}")

# For the specific issues I know about, create byte-level fixes
byte_fixes = []

# Fix: '∞'}人已报名  (the '∞' infinity symbol got corrupted)
# corrupted: 鈭?}浜哄凡鎶ュ悕
# The infinity symbol ∞ is U+221E, UTF-8: e2 88 9e
# Let me find the corrupted bytes
# Looking at the line 917: {act.participants}/{act.maxParticipants || '鈭?}浜哄凡鎶ュ悕
# The corrupted part starts after '|| '

pattern = b"'\\xe9\\x92\\xad?}\\xe6\\xb5\\x9c\\xe5\\x93\\x84\\xe5\\x87\\xa1\\xe9\\x8e\\xb6\\xe3\\x83\\xa5\\xe6\\x82\\x95"
replacement = b"'\\xe2\\x88\\x9e'}\\xe4\\xba\\xba\\xe5\\xb7\\xb2\\xe6\\x8a\\xa5\\xe5\\x90\\x8d"

# Check if the pattern exists
print(f"\nSearching for specific corrupted patterns...")

idx = raw.find(b"\\xe9\\x92\\xad")  # 鈭
if idx >= 0:
    chunk = raw[idx:idx+30]
    print(f"Found 鈭 at {idx}: hex={chunk[:20].hex()}")
    print(f"Text: {repr(chunk[:20].decode('utf-8', errors='replace'))}")
else:
    print("鈭 not found directly, trying sub-patterns...")
    # The byte sequence might include the ? character
    for pat in [b'\\xe5\\x87\\xa1', b'\\xe6\\xb5\\x9c']:
        idx2 = raw.find(pat)
        if idx2 >= 0:
            chunk2 = raw[idx2:idx2+25]
            print(f"Found at {idx2}: {chunk2[:25].hex()}")
