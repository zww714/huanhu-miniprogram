#!/usr/bin/env python3
"""Fix profile page - myPosts section"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
text = open(fp, 'r', encoding='utf-8').read()

# Replace the corrupted myPosts section with correct data
old_posts = """  const myPosts = [
    { title: 'Python鏁版嵁鍒嗘瀽鍏ラ棬鎸囧崡', date: '3澶╁墠', likes: 45, comments: 12 },
    { title: '鐮旂┒鐢熷繀澶囩\ue756鐮斿伐鍏锋帹鑽?, date: '1鍛ㄥ墠', likes: 89, comments: 23 },
  ]"""

new_posts = """  const myPosts = [
    { title: 'Python数据分析入门指南', date: '3天前', likes: 45, comments: 12 },
    { title: '研究生必备科研工具推荐', date: '1周前', likes: 89, comments: 23 },
  ]"""

if old_posts in text:
    text = text.replace(old_posts, new_posts)
    open(fp, 'w', encoding='utf-8').write(text)
    print('Posts section replaced')
else:
    print('Exact match not found')
    # Find 'const myPosts'
    idx = text.find('const myPosts')
    if idx >= 0:
        end = text.find('];', idx)
        print('Current text:')
        print(repr(text[idx:end+2]))
