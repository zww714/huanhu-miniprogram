#!/usr/bin/env python3
"""Fix profile page corrupted strings"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
raw = open(fp, 'rb').read()
orig = raw

# Fix 1: '我戠殑鎶€鑳?' -> '我的技能'
raw = raw.replace(b"'我戠殑鎶能鑳? },", b"'我的技能' },")

# Fix 2: '我戠殑鍙戝竷' -> '我的发布'
raw = raw.replace(b"'我戠殑鍙戝竷',", b"'我的发布',")

# Fix 3: '我戠殑鏀惰棌' -> '我的收藏'
raw = raw.replace(b"'我戠殑鏀惰棌',", b"'我的收藏',")

if raw != orig:
    open(fp, 'wb').write(raw)
    print('Fixed profile page')
else:
    print('No changes to profile')
    # Show what's actually at line 12
    lines = raw.decode('utf-8').split('\n')
    for i, line in enumerate(lines, 1):
        if 'label' in line and 'skills' not in line:
            print(f'L{i}: {repr(line[:80])}')
