#!/usr/bin/env python3
import os, sys

PAGES_DIR = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'

def apply_fixes(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for bad, good in replacements:
        if bad in content:
            content = content.replace(bad, good)
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Fix discoveries - full string replacements  
fixes = {
    # Discover page
    os.path.join(PAGES_DIR, 'discover', 'index.tsx'): [
        # Category names
        ('[\u934f\u3129\u00a9\u30e9\u00b4', '[\u5168\u90e8'),    # ['鍏ㄩ儴 -> ['全部
        ('\u7ec8\u88c0\u70ba', '\u79d1\u7814'),                    # 绉戠爺 -> 科研
        ('\u934d\u59a7\u00ee\u0084\u009f', '\u5347\u5b66'),        # 鍗囧 -> 升学
        ('\u934d\u00a3\u008b\u00af\u00ae', '\u5174\u8da3'),        # 鍏磋叮 -> 兴趣
        ('\u00ae\u00b8\u00e3\u0083\u00a4\u00b6\u0094', '\u5de5\u4f5c'),  # 宸ヤ綔 -> 工作
        
        # Emoji fixes
        ('\u9983\u6544\u2120', '\U0001f52c'),  # 馃敩 -> 🔬
        ('\u9983\u5e17', '\U0001f3d7'),  # won't match exactly, let me fix differently
        
        # Title text
        ('\u934d\u7a54\u00b6\u008d', '\u53d1\u73b0'),  # 鍙戠幇 -> 发现
        
        # Search placeholder
        ('\u93c1\u700c\u50b3\u4f60\u00b5\u0085\u00a5\u00b6\u0083\u00ae\u00a7\u008b\u0088\u00b5\u0084\u0085\u00b8\u0095?..', 
         '\u641c\u7d22\u4f60\u611f\u5174\u8da3\u7684\u5185\u5bb9...'),
    ]
}

# But this hex approach is fragile. Let me instead try reading the actual bytes
# and doing a smarter recovery.

# Actually, let me try a completely different approach:
# 1. Save the CURRENT file structure (remove all non-ASCII)
# 2. Re-insert known Chinese text

for pn in ['discover']:
    fp = os.path.join(PAGES_DIR, pn, 'index.tsx')
    with open(fp, 'rb') as f:
        raw = f.read()
    
    # Try: re-read as latin-1, then re-encode as utf-8
    # This only works if the corruption was UTF-8 -> Latin-1 -> UTF-8
    try:
        as_latin = raw.decode('utf-8')
        step2 = as_latin.encode('latin-1', errors='replace')
        recovered = step2.decode('utf-8', errors='replace')
        
        # Check for known good Chinese characters
        has_good = '\u5168' in recovered and '\u90e8' in recovered
        if has_good:
            print(f'{pn}: RECOVERED with latin-1 method!')
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(recovered)
        else:
            print(f'{pn}: latin-1 method failed. Sample: {repr(recovered[:200])}')
    except Exception as e:
        print(f'{pn}: latin-1 method error: {e}')
