#!/usr/bin/env python3
"""Dump all corrupted lines to a hex report file"""
import sys

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\index\index.tsx'
report = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\corrupted_report.txt'

raw = open(fp, 'rb').read()
text = raw.decode('utf-8')
lines = text.split('\n')

with open(report, 'w', encoding='utf-8') as f:
    for i, line in enumerate(lines, 1):
        has_bad = False
        for ch in line:
            cp = ord(ch)
            if cp > 127 and not (0x4e00 <= cp <= 0x9fff) and not (0x3000 <= cp <= 0x303f):
                has_bad = True
                break
        
        if has_bad:
            line_b = line.encode('utf-8')
            f.write(f"L{i}: hex={line_b.hex()}\n")
            f.write(f"     text={repr(line[:150])}\n\n")

print(f"Report written to {report}")
