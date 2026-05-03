#!/usr/bin/env python3
"""Final comprehensive fix for all remaining corrupted pages"""
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

base = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'

# ── Common corrupted-emoji patterns ──
# All ?/Text> patterns should already be fixed by fix_all_text_tags.py
# Now fix string content patterns

def fix_page(pn, hex_fixes):
    """Apply byte-level hex fixes to a page"""
    fp = os.path.join(base, pn, 'index.tsx')
    raw = open(fp, 'rb').read()
    orig = raw
    for bad_hex, good_hex in hex_fixes:
        bad = bytes.fromhex(bad_hex)
        good = bytes.fromhex(good_hex)
        while bad in raw:
            raw = raw.replace(bad, good)
    if raw != orig:
        open(fp, 'wb').write(raw)
        print(f'{pn}: fixed ({len(orig)} -> {len(raw)} bytes)')
        return True
    return False

# ── Profile page fixes ──
# '我戠殑鎶€鑳?' -> '我的技能'
# '我戠殑鍙戝竷' -> '我的发布'
# '我戠殑鏀惰棌' -> '我的收藏'

fix_page('profile', [
    # '我戠殑鎶€鑳?'  (my skills)
    ('27e68891e688a0e6ae91e98eb6e282ace991b93f27', '27e68891e79a84e68a80e883bd27'),
    # '我戠殑鍙戝竷'  (my posts)  
    ('27e68891e688a0e6ae91e98b997e68890e9878727', '27e68891e79a84e58f91e5b88327'),
    # '我戠殑鏀惰棌'  (my favorites)
    ('27e68891e688a0e6ae91e98e09be694b6e6a38c27', '27e68891e79a84e694b6e8978f27'),
])

# ── Verify page fixes ──
fix_page('verify', [
])

# ── Publish page fixes ──
fix_page('publish', [
])

# ── Skill-detail page fixes ──
fix_page('skill-detail', [
])

# Now scan all pages for remaining corrupted ?} patterns
print('\n--- Remaining corruption scan ---')
for pn in sorted(os.listdir(base)):
    fp = os.path.join(base, pn, 'index.tsx')
    if not os.path.exists(fp):
        continue
    raw = open(fp, 'rb').read()
    text = raw.decode('utf-8')
    
    # Check for non-CJK non-ASCII characters
    bad_chars = []
    for ch in text:
        cp = ord(ch)
        if cp > 127 and not (0x4e00 <= cp <= 0x9fff) and not (0x3000 <= cp <= 0x303f) and not (0xff00 <= cp <= 0xffef):
            bad_chars.append(f'U+{cp:04X}')
            if len(bad_chars) >= 5:
                break
    
    if bad_chars:
        print(f'{pn}: remaining corruptions: {bad_chars}')
    else:
        print(f'{pn}: CLEAN')

print('\nDone! Build to verify.')
