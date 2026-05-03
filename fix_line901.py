#!/usr/bin/env python3
import sys
fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\index\index.tsx'
raw = open(fp, 'rb').read()

# Find the corrupted string by searching for known surrounding text
# The pattern is: title: isFull ? '...' : '报名成功'
# Find 'title: isFull' area
idx = raw.find(b'title: isFull')
if idx >= 0:
    # Find the corrupted section between the first ' and before 报名成功
    start = raw.find(b"'", idx)  # first ' after title: isFull ?
    end = raw.find(b"\xe6\x8a\xa5\xe5\x90\x8d\xe6\x88\x90\xe5\x8a\x9f", idx)  # 报名成功
    
    if start >= 0 and end >= 0:
        corrupted_section = raw[start:end]
        print(f"Corrupted section ({len(corrupted_section)} bytes):")
        print(f"  hex: {corrupted_section.hex()}")
        print(f"  text: {repr(corrupted_section.decode('utf-8'))}")
        
        # Replace: '宸叉姤婊? : ' -> '已报满' : '
        correct = b"'\xe5\xb7\xb2\xe6\x8a\xa5\xe6\xbb\xa1' : '"
        
        new_raw = raw[:start] + correct + raw[end:]
        
        if new_raw != raw:
            open(fp, 'wb').write(new_raw)
            print(f"\nFixed: replaced {len(corrupted_section)} bytes with {len(correct)} bytes")
        else:
            print("\nNo change needed")
    else:
        print(f"Could not find markers: start={start}, end={end}")
else:
    print("Could not find 'title: isFull'")
