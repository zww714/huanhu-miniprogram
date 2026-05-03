#!/usr/bin/env python3
"""Batch fix ALL corrupted lines in index.tsx"""
import sys, re

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\index\index.tsx'
raw = open(fp, 'rb').read()
orig = raw

# ── Byte-level replacements ──
# Each tuple: (corrupted_bytes_hex, replacement_bytes_hex)
fixes = []

# L910: isFull ? '宸叉弧' : '鎶ュ悕' -> isFull ? '已满' : '报名'
# corrupted hex: 27e5aeb8e58f89e5bca7  ( ' 宸 叉 弧 )
# correct hex:   27e5b7b2e6bba1      ( ' 已 满 )
fixes.append(('27e5aeb8e58f89e5bca7', '27e5b7b2e6bba1'))
# corrupted hex: 27e98eb6e383a5e68295  ( ' 鎶 ュ 悕 )
# correct hex:   27e68aa5e5908d       ( ' 报 名 )
fixes.append(('27e98eb6e383a5e68295', '27e68aa5e5908d'))

# L916: '∞'}人已报名  corrupted '鈭?}浜哄凡鎶ュ悕
# corrupted: e988ad3f7de6b59ce59384e587a1e98eb6e383a5e68295
# correct:   e2889e277d  e4babae5b7b2e68aa5e5908d
#   (∞ = e2 88 9e, then '} = 27 7d, then 人已报名)
fixes.append(('e988ad3f7de6b59ce59384e587a1e98eb6e383a5e68295', 'e2889e277de4babae5b7b2e68aa5e5908d'))

# L21: '宸插姞鍏ュ叴瓒ｇ粍' -> '已加入兴趣组'
fixes.append(('27e5aeb8e68f92e5a79ee98d8fe383a5e58fb4e79392efbd87e7b28d', '27e5b7b2e58aa0e585a5e585b4e8b6a3e7bb84'))

# L141: 和全校同学交换技能  -> correct (already mostly OK)
# Let me check what's actually there

# L149: 分享你的特长，学习感兴趣的知识  -> needs fix
# corrupted: e98d92e59795e99fa9e6b5a3e78ab5e6ae91e99097e5bd92e69ab1...
# This is complex. Let me find the specific text in the hex dump

# L910 was already fixed above, L916 was already fixed

# Let me also try a more systematic approach:
# Read the file, find all corrupted text, and replace it with known correct values

text = raw.decode('utf-8')

# Mapping of corrupted string -> corrected string (using actual chars from the report)
# These are the exact corrupted strings found in the file

# L21 toast title
replacements = {
    '宸插姞鍏ュ叴瓒ｇ粍': '已加入兴趣组',
    # These appear in the hex dump
    '宸叉弧': '已满',
    '鎶ュ悕': '报名',  
}

# Apply text-level replacements
for bad, good in replacements.items():
    text = text.replace(bad, good)

# Write back
new_raw = text.encode('utf-8')
if new_raw != orig:
    open(fp, 'wb').write(new_raw)
    print(f"Text fixes applied: {len(orig)} -> {len(new_raw)} bytes")
else:
    print("No text fixes applied")

# Now apply byte-level fixes  
new_raw2 = open(fp, 'rb').read()
changes = 0
for bad_hex, good_hex in fixes:
    bad_bytes = bytes.fromhex(bad_hex)
    good_bytes = bytes.fromhex(good_hex)
    if bad_bytes in new_raw2:
        new_raw2 = new_raw2.replace(bad_bytes, good_bytes)
        changes += 1
        print(f"  Byte fix {changes}: {len(bad_bytes)}b -> {len(good_bytes)}b")

if changes > 0:
    open(fp, 'wb').write(new_raw2)
    print(f"Total: {changes} byte fixes applied")
else:
    print("No byte fixes were needed")
