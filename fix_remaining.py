#!/usr/bin/env python3
"""Fix all remaining corrupted pages"""
import sys, os

base = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'

# ── Fix messages page ──
fp = os.path.join(base, 'messages', 'index.tsx')
raw = open(fp, 'rb').read()
orig = raw

# 鑱婂ぉ -> 聊天 (e7 91 b1 e5 a8 89 e5 a4 89 -> e8 81 8a e5 a4 a9)
raw = raw.replace(b'\xe7\x91\xb1\xe5\xa8\x89\xe5\xa4\x89', b'\xe8\x81\x8a\xe5\xa4\xa9')
# 閫氳褰? -> 通讯录 (e9 96 ab e6 b0 ae e8 86 86 e8 a4 b0 3f -> e9 80 9a e8 ae af e5 bd 95)
raw = raw.replace(b'\xe9\x96\xab\xe6\xb0\xae\xe8\x86\x86\xe8\xa4\xb0\x3f', b'\xe9\x80\x9a\xe8\xae\xaf\xe5\xbd\x95')

if raw != orig:
    open(fp, 'wb').write(raw)
    print("messages: fixed")

# ── Fix profile page ──
fp = os.path.join(base, 'profile', 'index.tsx')
raw = open(fp, 'rb').read()
orig = raw

# Check for common corrupted patterns
# 鎴? -> 我 (e9 8e b4 -> e6 88 91)
raw = raw.replace(b'\xe9\x8e\xb4', b'\xe6\x88\x91')  # 鎴 -> 我
# 鐨? -> 的 (e9 8e bf -> e7 9a 84)
raw = raw.replace(b'\xe9\x8e\xbf', b'\xe7\x9a\x84')  # 鐨 -> 的

if raw != orig:
    open(fp, 'wb').write(raw)
    print("profile: fixed")

# ── Fix post-detail page ──
fp = os.path.join(base, 'post-detail', 'index.tsx')
raw = open(fp, 'rb').read()
orig = raw
# 馃挰 -> 💬 (corrupted emoji for comments icon)
raw = raw.replace(b'\xe9\xa6\x83\xe6\x8c\xb0', b'\xf0\x9f\x92\xac')  # 馃挰 -> 💬
# 鏌ョ湅璇︽儏 鈫? -> 查看详情 →
raw = raw.replace(b'\xe9\x8c\x9f\xe7\xb8\x85\xe8\xaf\xb8\xe6\x83\x85\xe9\x88\xab\x3f', b'\xe6\x9f\xa5\xe7\x9c\x8b\xe8\xaf\xa6\xe6\x83\x85\xe2\x86\x92')

if raw != orig:
    open(fp, 'wb').write(raw)
    print("post-detail: fixed")

# ── Fix other pages ── 
for pn in ['publish', 'verify', 'skill-detail', 'profile']:
    fp = os.path.join(base, pn, 'index.tsx')
    raw = open(fp, 'rb').read()
    orig = raw
    # Do generic common fixes (these are the most common corrupted chars)
    raw = raw.replace(b'\xe9\x8e\xb4', b'\xe6\x88\x91')  # 鎴 -> 我
    raw = raw.replace(b'\xe9\x8e\xbf', b'\xe7\x9a\x84')  # 鐨 -> 的
    raw = raw.replace(b'\xe2\x82\xac', b'\xe8\x83\xbd')  # € -> 能 (common corruption)
    if raw != orig:
        open(fp, 'wb').write(raw)
        print(f"{pn}: applied common fixes")

print("Done")
