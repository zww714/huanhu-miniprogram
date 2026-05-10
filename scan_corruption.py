#!/usr/bin/env python3
"""Scan all page files for encoding corruption + suspicious patterns"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')

base = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'
issues = []

for pn in sorted(os.listdir(base)):
    fp = os.path.join(base, pn, 'index.tsx')
    raw = open(fp, 'rb').read()
    try:
        text = raw.decode('utf-8')
    except:
        issues.append(f'{pn}: FAILED TO DECODE UTF-8')
        continue
    
    lines = text.split('\n')
    page_issues = []
    
    for i, line in enumerate(lines, 1):
        # Check for corrupted closing quotes (?) in string context
        # Also check for PUA characters (U+E000+) that indicate corruption
        for j, ch in enumerate(line):
            cp = ord(ch)
            if 0xE000 <= cp <= 0xF8FF:
                context = line[max(0,j-10):j+10]
                page_issues.append(f'  L{i}: PUA char U+{cp:04X} at col{j} ...{repr(context)}...')
                if len(page_issues) >= 10:
                    break
            elif 0xFFF0 <= cp <= 0xFFFF:
                context = line[max(0,j-10):j+10]
                page_issues.append(f'  L{i}: Special char U+{cp:04X} at col{j} ...{repr(context)}...')
                if len(page_issues) >= 10:
                    break
        
        # Check for unterminated single quotes (odd count of ')
        if line.strip() and not line.strip().startswith('//') and not line.strip().startswith('/*'):
            # Only check if it looks like code
            s = line.strip()
            if s.startswith('const ') or s.startswith('let ') or s.startswith('var '):
                sq = s.count("'")
                if sq % 2 != 0 and '"' not in s:
                    # Might be a string issue
                    pass  # Too many false positives
    
        if len(page_issues) >= 10:
            break
    
    if page_issues:
        issues.append(f'\n=== {pn} === ({len(page_issues)} issues)')
        issues.extend(page_issues)

if issues:
    print('CORRUPTION ISSUES FOUND:')
    print('\n'.join(issues))
else:
    print('No corruption issues found in any page!')

# Also show all Chinese strings in skill-detail and discover to verify
for pn in ['skill-detail', 'discover', 'user-detail']:
    fp = os.path.join(base, pn, 'index.tsx')
    raw = open(fp, 'rb').read()
    text = raw.decode('utf-8')
    lines = text.split('\n')
    # Find lines with Chinese characters that might be corrupted
    suspect = []
    for i, line in enumerate(lines, 1):
        has_pua = any(0xE000 <= ord(c) <= 0xF8FF for c in line)
        if has_pua:
            suspect.append(f'{pn}:L{i}')
    if suspect:
        print(f'\nPUA chars found in:')
        for s in suspect[:20]:
            print(f'  {s}')
    else:
        print(f'\n{pn}: No PUA chars found')
