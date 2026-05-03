#!/usr/bin/env python3
import sys, os

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
raw = open(fp, 'rb').read()
orig = raw

# Fix 1: tabs[0] - '我的技能' 
# corrupted: e6 88 91 e6 88 a0 e6 ae 91 e9 8e b6 e8 83 bd e9 91 b3 3f
# correct:   e6 88 91 e7 9a 84 e6 8a 80 e8 83 bd 27
BAD1 = bytes.fromhex('e68891e688a0e6ae91e98eb6e883bde991b33f')
GOOD1 = bytes.fromhex('e68891e79a84e68a80e883bd27')
raw = raw.replace(BAD1, GOOD1)

# Fix 2: tabs[1] - '我的发布'
# corrupted: e6 88 91 e6 88 a0 e6 ae 91 e9 8d 99 e6 88 9d e7 ab b7 27
# correct:   e6 88 91 e7 9a 84 e5 8f 91 e5 b8 83 27
BAD2 = bytes.fromhex('e68891e688a0e6ae91e98d99e6889de7abb727')
GOOD2 = bytes.fromhex('e68891e79a84e58f91e5b88327')
raw = raw.replace(BAD2, GOOD2)

# Fix 3: tabs[2] - '我的收藏'
# corrupted: e6 88 91 e6 88 a0 e6 ae 91 e9 8f 80 e6 83 b0 e6 a3 8c 27
# correct:   e6 88 91 e7 9a 84 e6 94 b6 e8 97 8f 27
BAD3 = bytes.fromhex('e68891e688a0e6ae91e98f80e683b0e6a38c27')
GOOD3 = bytes.fromhex('e68891e79a84e694b6e8978f27')
raw = raw.replace(BAD3, GOOD3)

if raw != orig:
    open(fp, 'wb').write(raw)
    print('Profile page fixed')
else:
    print('No changes - checking actual bytes...')
    idx = raw.find(b'\xe6\x88\x91\xe6\x88\xa0')
    if idx >= 0:
        chunk = raw[idx:idx+30]
        print(f'Found corrupted pattern: {chunk.hex()}')
