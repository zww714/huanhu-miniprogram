#!/usr/bin/env python3
"""Fix the skill labels in profile page stack trace"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
raw = open(fp, 'rb').read()
orig = raw

# Fix the object literal corruption
# { skills: '鎶能鑳?, posts: '甯栧瓙', followers: '绮変笣', following: '鍏虫敞' }
# should be: { skills: '技能', posts: '帖子', followers: '粉丝', following: '关注' }

# Find the corrupted section
corrupted = b"""{ skills: '鎶能鑳?, posts: '甯栧瓙', followers: '绮変笣', following: '鍏虫敞' }"""
correct = b"""{ skills: '技能', posts: '帖子', followers: '粉丝', following: '关注' }"""

if corrupted in raw:
    raw = raw.replace(corrupted, correct)
    open(fp, 'wb').write(raw)
    print('Fixed labels')
else:
    print('Pattern not found')
    # Try alternate - find the unique sequence
    idx = raw.find(b'skills:')
    if idx >= 0:
        chunk = raw[idx:idx+80]
        print(f'Found skills: at byte {idx}')
        print(f'Hex: {chunk.hex()}')
