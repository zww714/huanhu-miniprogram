#!/usr/bin/env python3
import os

base = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages'

# Check specific Chinese characters for each page type
checks = {
    'messages': {
        '聊天': b'\xe8\x81\x8a\xe5\xa4\xa9',
        '通讯录': b'\xe9\x80\x9a\xe8\xae\xaf\xe5\xbd\x95',
        '在线好友': b'\xe5\x9c\xa8\xe7\xba\xbf\xe5\xa5\xbd\xe5\x8f\x8b',
        '离线好友': b'\xe7\xa6\xbb\xe7\xba\xbf\xe5\xa5\xbd\xe5\x8f\x8b',
    },
    'profile': {
        '我的': b'\xe6\x88\x91\xe7\x9a\x84',
        '个人资料': b'\xe4\xb8\xaa\xe4\xba\xba\xe8\xb5\x84\xe6\x96\x99',
        '技能': b'\xe6\x8a\x80\xe8\x83\xbd',
        '设置': b'\xe8\xae\xbe\xe7\xbd\xae',
    },
    'post-detail': {
        '帖子详情': b'\xe5\xb8\x96\xe5\xad\x90\xe8\xaf\xa6\xe6\x83\x85',
        '评论': b'\xe8\xaf\x84\xe8\xae\xba',
    },
    'publish': {
        '发布': b'\xe5\x8f\x91\xe5\xb8\x83',
        '标题': b'\xe6\xa0\x87\xe9\xa2\x98',
        '描述': b'\xe6\x8f\x8f\xe8\xbf\xb0',
    },
    'verify': {
        '身份认证': b'\xe8\xba\xab\xe4\xbb\xbd\xe8\xae\xa4\xe8\xaf\x81',
        '学生': b'\xe5\xad\xa6\xe7\x94\x9f',
    },
    'skill-detail': {
        '技能详情': b'\xe6\x8a\x80\xe8\x83\xbd\xe8\xaf\xa6\xe6\x83\x85',
        '等级': b'\xe7\xad\x89\xe7\xba\xa7',
    },
}

all_ok = True
for pn, char_checks in checks.items():
    fp = os.path.join(base, pn, 'index.tsx')
    raw = open(fp, 'rb').read()
    statuses = []
    for label, byte_seq in char_checks.items():
        if byte_seq in raw:
            statuses.append(f"{label}=OK")
        else:
            statuses.append(f"{label}=MISSING")
            all_ok = False
    print(f"{pn}: {', '.join(statuses)}")

print(f"\nAll pages OK: {all_ok}")

if not all_ok:
    # Generate a list of files that need fixing
    print("\nFiles needing fix: checking by scanning for known corrupted bytes...")
    pages = ['messages', 'profile', 'post-detail', 'publish', 'verify', 'skill-detail']
    for pn in pages:
        fp = os.path.join(base, pn, 'index.tsx')
        raw = open(fp, 'rb').read()
        # Check for known corrupted patterns
        corrupted_bytes = [
            b'\xe9\x8e\xb6',  # 鎶 (corrupted 技)
            b'\xe2\x82\xac',  # € (corrupted)
            b'\xe9\x8d\x8f',  # 鍏 (corrupted 全)
        ]
        found_corrupted = [hex(b[0]) for b in corrupted_bytes if b in raw]
        if found_corrupted:
            print(f"  {pn}: CORRUPTED (found patterns: {found_corrupted})")
        else:
            print(f"  {pn}: looks clean")
