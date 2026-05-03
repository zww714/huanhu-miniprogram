#!/usr/bin/env python3
import sys, os

# Check discover page
fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\discover\index.tsx'
raw = open(fp, 'rb').read()

have_good = b'\xe5\x85\xa8\xe9\x83\xa8' in raw  # 全部
print(f"HAS 全部 bytes: {have_good}")

if not have_good:
    # Find CATEGORIES area
    idx = raw.find(b'CATEGORIES')
    if idx >= 0:
        chunk = raw[idx:idx+60]
        print(f"CATEGORIES hex: {chunk.hex()}")
        print(f"CATEGORIES text: {repr(chunk.decode('utf-8'))}")

# Also check all other pages
base = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'
pages = ['index','discover','messages','profile','post-detail','publish','verify','skill-detail']
for pn in pages:
    f = os.path.join(base, pn, 'index.tsx')
    if os.path.exists(f):
        raw = open(f, 'rb').read()
        has_tech = b'\xe6\x8a\x80' in raw  # 技
        has_all = b'\xe5\x85\xa8' in raw   # 全
        print(f"{pn}: tech={has_tech} all={has_all} size={len(raw)}")
