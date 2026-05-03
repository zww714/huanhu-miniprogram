#!/usr/bin/env python3
"""Fix profile page - replace inline corrupted data with clean data"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\profile\index.tsx'
text = open(fp, 'r', encoding='utf-8').read()

# Find the 'const skills' section and replace it
# The skills data is inline. Let me find it and replace with correct data.

old_skills = """  const skills = [
    { name: 'Python 缂栫▼', level: 'Lv.5', category: '缂栫▼寮能鍙?, desc: '鐔熺粌浣跨敤 Python 杩涜鏁版嵁鍒嗘瀽銆佹満鍣ㄥ涔犱笌 Web 寮能鍙?, tags: ['鏁版嵁鍒嗘瀽', 'Django', 'TensorFlow'] },
    { name: 'UI 璁捐', level: 'Lv.3', category: '璁捐鍒涙剰', desc: '鍏峰 Figma 璁捐缁忛獙锛屾搮闀跨Щ鍔ㄧ鐣岄潰璁捐', tags: ['Figma', 'UI/UX'] },
  ]"""

new_skills = """  const skills = [
    { name: 'Python 编程', level: 'Lv.5', category: '编程开发', desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发', tags: ['数据分析', 'Django', 'TensorFlow'] },
    { name: 'UI 设计', level: 'Lv.3', category: '设计创意', desc: '具备 Figma 设计经验，擅长移动端界面设计', tags: ['Figma', 'UI/UX'] },
  ]"""

if old_skills in text:
    text = text.replace(old_skills, new_skills)
    open(fp, 'w', encoding='utf-8').write(text)
    print('Skills data replaced')
else:
    print('Skills section not found with exact match')
    # Try finding a substring
    if 'Python' in text and '缂栫▼' in text:
        print('Found corrupted skills data, but pattern mismatch')
        # Show the exact corrupted skills section
        idx = text.find('const skills')
        end = text.find('];', idx)
        if end > 0:
            print(repr(text[idx:end+2]))
