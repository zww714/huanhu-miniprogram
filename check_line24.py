#!/usr/bin/env python3
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
lines = open(fp, 'r', encoding='utf-8').read().split('\n')
for i in range(22, 28):
    print(f'L{i+1}: {repr(lines[i])}')
    sq = lines[i].count("'")
    dq = lines[i].count('"')
    print(f'  quotes: single={sq} double={dq}')
