#!/usr/bin/env python3
import sys
fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\index\index.tsx'
raw = open(fp, 'rb').read()

idx = raw.find(b'isFull')
if idx >= 0:
    chunk = raw[idx:idx+80]
    text = chunk.decode('utf-8', errors='replace')
    print("isFull area repr:", repr(text))
    print("isFull area hex:", chunk.hex())
