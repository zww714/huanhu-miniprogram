import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.css'

const user = {
  name: '陈同学',
  verified: true,
  school: '浙江大学',
  major: '物理学博士在读',
  bio: '擅长用 AI 和编程工具帮助同学快速上手科研与项目实践。',
  stats: [
    { label: '技能', value: 5, key: 'skills' },
    { label: '发布', value: 12, key: 'posts' },
    { label: '粉丝', value: 86, key: 'followers' },
    { label: '关注', value: 42, key: 'following' },
  ],
  skills: [
    {
      name: 'AI工具',
      level: 5,
      desc: '擅长利用 AI 工具完成文献整理、内容生成与学习辅助',
      tags: ['ChatGPT', '提示词', '效率工具'],
      icon: 'AI',
      featured: true,
    },
    {
      name: 'Python 编程',
      level: 5,
      desc: '熟练使用 Python 进行数据分析、机器学习与 Web 开发',
      tags: ['数据分析', 'Django', 'TensorFlow'],
      icon: 'PY',
    },
  ],
  skillChips: [
    { name: 'AI工具', level: 5, featured: true },
    { name: 'Python', level: 4 },
    { name: '数据分析', level: 3 },
    { name: '英语交流', level: 2 },
  ],
  wants: ['摄影', '产品设计', '羽毛球'],
  interests: ['科研', 'AI', '徒步', '摄影', '桌游'],
}

const tabs = [
  { key: 'skills', label: '他的技能' },
  { key: 'posts', label: '他的发布' },
  { key: 'reviews', label: '收到的评价' },
]

export default function UserDetail() {
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('skills')

  const toast = (title: string) => Taro.showToast({ title, icon: 'none' })
  const handleBack = () => Taro.navigateBack()

  return (
    <ScrollView scrollY className='user-page' showScrollbar={false} enhanced bounces={false}>
      <View className='nav-bar'>
        <Text className='back-icon' onClick={handleBack}>‹</Text>
        <Text className='nav-title'>个人主页</Text>
        <View className='capsule'>
          <Text className='capsule-dot'>•••</Text>
          <View className='capsule-ring' />
        </View>
      </View>

      <View className='profile-head'>
        <View className='avatar' />
        <View className='profile-main'>
          <View className='name-row'>
            <Text className='user-name'>{user.name}</Text>
            {user.verified && <Text className='verify-badge'>✓</Text>}
            <Text className='verify-text'>已认证</Text>
          </View>
          <Text className='school-line'>{user.school} · {user.major}</Text>
          <Text className='bio'>{user.bio}</Text>
        </View>
      </View>

      <View className='stat-row'>
        {user.stats.map(item => (
          <View
            className='stat-item'
            key={item.key}
            onClick={() => item.key === 'skills' ? setActiveTab('skills') : toast(item.label)}
          >
            <Text className='stat-value'>{item.value}</Text>
            <Text className='stat-label'>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='action-row'>
        <View className='primary-btn' onClick={() => toast('发消息')}>
          <Text className='msg-icon'>▣</Text>
          <Text>发消息</Text>
        </View>
        <View
          className={following ? 'secondary-btn following' : 'secondary-btn'}
          onClick={() => setFollowing(!following)}
        >
          <Text className='follow-icon'>♙</Text>
          <Text>{following ? '已关注' : '关注TA'}</Text>
        </View>
      </View>

      <View className='info-card'>
        <View className='section-title blue'>
          <Text>我会</Text>
        </View>
        <View className='chip-wrap'>
          {user.skillChips.map(skill => (
            <View className={skill.featured ? 'skill-chip gold' : 'skill-chip'} key={skill.name}>
              <Text>{skill.name}</Text>
              <Text className='chip-level'>Lv.{skill.level}</Text>
              {skill.featured && <Text className='crown'>♛</Text>}
            </View>
          ))}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title orange'>
          <Text>我想学</Text>
        </View>
        <View className='chip-wrap'>
          {user.wants.map(item => (
            <Text className='want-chip' key={item}>{item}</Text>
          ))}
        </View>
      </View>

      <View className='info-card compact'>
        <View className='section-title blue'>
          <Text>兴趣标签</Text>
        </View>
        <View className='chip-wrap'>
          {user.interests.map(item => (
            <Text className='interest-chip' key={item}>{item}</Text>
          ))}
        </View>
      </View>

      <View className='content-card'>
        <View className='tab-row'>
          {tabs.map(tab => (
            <View
              className={activeTab === tab.key ? 'tab active' : 'tab'}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>

        {activeTab === 'skills' && (
          <View className='skill-list'>
            {user.skills.map(skill => (
              <View className='skill-item' key={skill.name} onClick={() => toast(skill.name)}>
                <View className={skill.icon === 'AI' ? 'skill-icon ai' : 'skill-icon python'}>
                  <Text>{skill.icon}</Text>
                </View>
                <View className='skill-copy'>
                  <Text className='skill-name'>{skill.name}</Text>
                  <Text className='skill-desc'>{skill.desc}</Text>
                  <View className='tag-row'>
                    {skill.tags.map(tag => (
                      <Text className='small-tag' key={tag}>{tag}</Text>
                    ))}
                  </View>
                </View>
                <Text className={skill.featured ? 'level orange-level' : 'level'}>Lv.{skill.level}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'posts' && (
          <View className='empty-state'>
            <Text>暂无公开发布</Text>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View className='empty-state'>
            <Text>暂无收到的评价</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  )
}
