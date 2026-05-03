#!/usr/bin/env python3
"""Fix publish page - replace all corrupted strings"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\publish\index.tsx'
raw = open(fp, 'rb').read()
orig = raw

# Fix all PREDEFINED_TAGS with missing closing quotes
# Pattern: corrupted multi-byte chars followed by ?,  (no closing quote)
# Fix by finding ? that should be ' followed by comma

# Strategy 1: Replace specific corrupted tags
# '鎽勫奖' -> '摄影'  (this one looks OK with quotes)
# '鎶€鑳戒氦鎹?, -> '技能交换', (missing closing quote before ,)
# '鍏磋叮鎼瓙', -> '兴趣搭子', (may need fix)
# '娲诲姩鎵撳崱', -> '活动打卡', 
# '鑰冪爺', -> '考研',
# '鐣欏', -> '留学',
# '瀹炰範', -> '实习',
# '鍐呮帹', -> '内推',

# Find the corrupted tags by scanning the file
text = open(fp, 'r', encoding='utf-8').read()
for i, line in enumerate(text.split('\n'), 1):
    if 'PREDEFINED_TAGS' in line:
        print(f'L{i}: {repr(line[:120])}')
    if 'VISIBILITY' in line:
        print(f'L{i+1}: {repr(line.strip()[:120])}')
        break

# The corrupted sequence: , '鎶€鑳戒氦鎹?, '鍏磋叮鎼瓙', '娲诲姩鎵撳崱', '鑰冪爺', 
# Find '鎶€鑳戒氦鎹? and replace with '技能交换'
pat1 = b"'鎶€鑳戒氦鎹?"
fix1 = b"'技能交换'"
raw = raw.replace(pat1, fix1)

# Also fix '鍏磋叮鎼&#xE15E;瓙' -> '兴趣搭子'
# The character U+E15E is in the private use area
# So I need to match '鍏磋叮鎼\uE15E瓙'
pat2 = b"'鍏磋叮鎼\xee\x85\x9e瓙'"
fix2 = b"'兴趣搭子'"
raw = raw.replace(pat2, fix2)

# Fix '娲诲姩鎵撳崱' -> '活动打卡'
pat3 = b"'娲诲姩鎵撳崱'"
fix3 = b"'活动打卡'"
raw = raw.replace(pat3, fix3)

# Fix '鑰冪爺' -> '考研'
pat4 = b"'鑰冪爺'"
fix4 = b"'考研'"
raw = raw.replace(pat4, fix4)

# Fix '鐣欏' -> '留学'
pat5 = b"'鐣欏'"
fix5 = b"'留学'"
raw = raw.replace(pat5, fix5)

# Fix '瀹炰範' -> '实习'
pat6 = b"'瀹炰範'"
fix6 = b"'实习'"
raw = raw.replace(pat6, fix6)

# Fix '鍐呮帹' -> '内推'
pat7 = b"'鍐呮帹'"
fix7 = b"'内推'"
raw = raw.replace(pat7, fix7)

if raw != orig:
    open(fp, 'wb').write(raw)
    print('Fixed')
    
# Show results
text2 = open(fp, 'r', encoding='utf-8').read()
for i, line in enumerate(text2.split('\n'), 1):
    if 'PREDEFINED_TAGS' in line:
        print(f'Result L{i}: {repr(line[:120])}')
        break
