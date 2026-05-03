#!/usr/bin/env python3
import os

PAGES_DIR = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'

pages = ['index','discover','messages','profile','post-detail','publish','verify','skill-detail']

for pn in pages:
    fp = os.path.join(PAGES_DIR, pn, 'index.tsx')
    # Read as bytes, try to fix
    with open(fp, 'rb') as f:
        raw = f.read()
    
    # The corruption pattern: original UTF-8 Chinese chars got
    # read as one encoding and written back as another
    # Let me try a simple approach: write the SAME bytes back
    # with no changes (the file IS valid UTF-8, just with wrong content)
    
    # Actually, let me check: was the file written correctly but the 
    # display is wrong? The read tool showed garbled text...
    # Let me decode as UTF-8 and check if Chinese chars are present
    try:
        text = raw.decode('utf-8')
        has_cjk = any(0x4e00 <= ord(ch) <= 0x9fff for ch in text)
        if not has_cjk:
            print(f'{pn}: NO CJK chars - may be corrupted')
        else:
            print(f'{pn}: has CJK - checking more...')
            # Check for specific known good chars
            known_good = ['全', '部', '科', '研', '兴', '趣']
            found = [g for g in known_good if g in text]
            if found:
                print(f'  Good chars found: {found}')
            else:
                # Check for corrupted chars
                corrupted = []
                for ch in text:
                    cp = ord(ch)
                    if cp > 127 and not (0x4e00 <= cp <= 0x9fff or 0x3000 <= cp <= 0x303f):
                        corrupted.append(ch)
                        if len(corrupted) > 5:
                            break
                print(f'  No good chars. Corrupted examples: {corrupted}')
    except Exception as e:
        print(f'{pn}: ERROR {e}')
