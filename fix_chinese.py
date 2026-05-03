#!/usr/bin/env python3
"""Replace corrupted lines in index.tsx with correct content"""
import os

BASE = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'

def fix_lines(filepath, line_fixes):
    """
    line_fixes: dict of {line_number (1-indexed): correct_line_content_after_newline}
    """
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    # Decode as UTF-8 (the file IS valid UTF-8 with wrong characters)
    text = raw.decode('utf-8')
    lines = text.split('\n')
    
    changed = False
    for line_num, new_content in line_fixes.items():
        idx = line_num - 1
        if idx < len(lines):
            old = lines[idx]
            lines[idx] = new_content
            if old != new_content:
                changed = True
                print(f'  Line {line_num}: replaced {len(old)} chars with {len(new_content)} chars')
    
    if changed:
        new_text = '\n'.join(lines)
        with open(filepath, 'wb') as f:
            f.write(new_text.encode('utf-8'))
        return True
    return False

# ────────────────────────────────────
# FIX: index.tsx
# ────────────────────────────────────
print('=== Fixing index.tsx ===')

lines_to_fix = {}

# Lines 7-11: Constants with corrupted Chinese
# Line 7: TABS
lines_to_fix[7] = "const TABS = ['\u6280\u80fd\u4ea4\u6362', '\u5174\u8da3\u642d\u5b50', '\u793e\u533a\u6d3b\u52a8']"
# Line 8: ACTIVITY_CATEGORIES
lines_to_fix[8] = "const ACTIVITY_CATEGORIES = ['\u5168\u90e8', '\u6280\u80fd\u4ea4\u6362', '\u5174\u8da3', '\u5fd7\u613f', '\u5176\u4ed6']"
# Line 9: PARTNER_CATEGORIES
lines_to_fix[9] = "const PARTNER_CATEGORIES = ['\u5168\u90e8', '\u5b66\u4e60', '\u8fd0\u52a8', '\u6e38\u620f', '\u97f3\u4e50', '\u65c5\u884c', '\u6444\u5f71', '\u5176\u4ed6']"
# Line 11-13: ICONS
lines_to_fix[11] = "  trending: '\U0001f525', chef: '\U0001f346', gamepad: '\U0001f3ae', camera: '\U0001f4f2'"

fp = os.path.join(BASE, 'index', 'index.tsx')
result = fix_lines(fp, lines_to_fix)
print(f'  Index page fixed: {result}')

# ├█ FINAL CHECK █┤
print()
print('=== Verifying discover ===')
with open(os.path.join(BASE, 'discover', 'index.tsx'), 'rb') as f:
    raw = f.read()
try:
    text = raw.decode('utf-8')
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if 'CATEGORIES' in line:
            print(f'  Line {i+1}: {line.strip()[:80]}')
        if '\u2192/Text>' in line:
            print(f'  WARNING: Still has corrupt closing tag on line {i+1}')
except Exception as e:
    print(f'  ERROR: {e}')

print()
print('Done.')
