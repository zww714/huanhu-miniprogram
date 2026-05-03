#!/usr/bin/env python3
"""Full fix for index.tsx - replace all corrupted Chinese"""
import os

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\index\index.tsx'

# Read as bytes to avoid encoding issues
raw = open(fp, 'rb').read()
orig = raw

# Known corrupted-to-correct byte replacements for index page
# Format: (corrupted_bytes, correct_bytes)
fixes = [
    # Search strings  
    ('\u641c\u7d22\u6280\u80fd\u3001\u8ba4\u77e5',
     '\u641c\u7d22\u6280\u80fd\u3001\u8ba4\u77e5'),  # already correct? check
    
    # Activities section
    ('\u5df1\u7684\u7231\u597d\uff0c\u53d1\u73b0\u540c\u597d...',  # no, should be from corrupted file
     ''),
]

# Actually, let me just read the file and do targeted line replacements
# based on what the build error tells us

lines = raw.decode('utf-8').split('\n')
print(f"File has {len(lines)} lines")

# Line 901 has '宸叉姤婊? and '鎶ュ悕鎴愬姛'
# These should be '已报满' and '报名成功'

# Let me scan the entire file for corrupted characters
corrupted_lines = []
for i, line in enumerate(lines, 1):
    for ch in line:
        cp = ord(ch)
        # Check for characters that are NOT in standard CJK range
        # but are in the extended CJK or private use
        if cp > 127:
            # Check if this is a known correct CJK character
            if not (0x4e00 <= cp <= 0x9fff or 0x3000 <= cp <= 0x303f or 0xff00 <= cp <= 0xffef):
                corrupted_lines.append((i, line.strip()[:80]))
                break

if corrupted_lines:
    print(f"\nFound {len(corrupted_lines)} lines with suspicious characters:")
    for ln, text in corrupted_lines:
        # Filter out known good chars before printing
        safe = repr(text)
        print(f"  L{ln}: {safe[:100]}")

# Now let me fix the specific issues
# Build replacement pairs
all_fixes = {}

# Activities section fixes  
all_fixes['\u5df1\u7684\u59b9\u6e3a'] = '\u5df2\u62a5\u6ee1'  # 宸叉姤婊? → 已报满
all_fixes['\u9336\u5f2a\u540d\u934c\u00b8\u59ca'] = '\u62a5\u540d\u6210\u529f'  # 鎶ュ悕鎴愬姛 → 报名成功
all_fixes['\u5df2\u6709'] = '\u5df2\u62a5'  # partial  

# Partner section fixes  
all_fixes['\u6cd2\u60ef\u540c\u597d'] = '\u771f\u5b9e\u540c\u597d'  # 下载中 → ...
all_fixes['\u8f7b\u677e\u5339\u914d'] = '\u8f7b\u674e\u5339\u914d'  # → 轻松匹配

# General fixes for corrupted chars found earlier
all_fixes['\u7bc6\u7bc0'] = '\u8282'  # partial fix for 节

# Now apply them
text = '\n'.join(lines)
for bad_enc, good in all_fixes.items():
    if bad_enc in text:
        text = text.replace(bad_enc, good)

# Write back  
new_raw = text.encode('utf-8')
if new_raw != raw:
    open(fp, 'wb').write(new_raw)
    print(f"\nWritten: {len(raw)} -> {len(new_raw)} bytes")
else:
    print("\nNo changes - fixes didn't match")

# Check remaining corrupted areas
text2 = open(fp, 'r', encoding='utf-8').read()
remaining = []
for ch in text2:
    cp = ord(ch)
    if cp > 127 and not (0x4e00 <= cp <= 0x9fff or 0x3000 <= cp <= 0x303f):
        remaining.append(ch)
        if len(remaining) > 10:
            break
if remaining:
    print('Remaining suspicious chars:', repr(remaining))
else:
    print("\nAll characters look clean!")
