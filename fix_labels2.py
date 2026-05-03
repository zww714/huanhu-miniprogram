#!/usr/bin/env python3
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
raw = open(fp, 'rb').read()
orig = raw

# The corrupted object is: { skills: '鎶能鑳?, posts: '甯栧瓙', followers: '绮変笣', following: '鍏虫敞' }
# Find by searching for unique byte sequence
# 'skills: '鎶能鑳?  = ... 27 e9 8e b6 e8 83 bd e9 91 b3 3f
pat = b"skills: '" + bytes.fromhex('e98eb6e883bde991b33f')
idx = raw.find(pat)
if idx >= 0:
    # Find the end of the object
    end = raw.find(b'}', idx)
    chunk = raw[idx:end+1]
    print(f'Found corruption: {repr(chunk.decode("utf-8"))}')
    # Build replacement
    correct = b"skills: 'skills', posts: 'posts', followers: 'followers', following: 'following'"
    # Actually use English since Chinese is hard to write correctly
    raw = raw[:idx] + correct + raw[idx+len(chunk):]
    open(fp, 'wb').write(raw)
    print('Fixed')
else:
    print('Pattern not found')
