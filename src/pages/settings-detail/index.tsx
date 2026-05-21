import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Switch, Text, View } from '@tarojs/components'
import './index.css'

type SettingType = 'account' | 'notice' | 'privacy' | 'about'

const COPY: Record<SettingType, {
  title: string
  desc: string
  groups: Array<{
    title: string
    rows: Array<{
      key: string
      label: string
      desc: string
      type?: 'switch' | 'link' | 'value'
      value?: string
      url?: string
    }>
  }>
}> = {
  account: {
    title: '账号与安全',
    desc: '管理个人资料、认证状态和账号安全信息。',
    groups: [
      {
        title: '账号资料',
        rows: [
          { key: 'profile', label: '编辑个人资料', desc: '头像、昵称、学院、简介等基础资料', type: 'link', url: '/pages/edit-profile/index' },
          { key: 'verify', label: '校园认证', desc: '完善认证后获得蓝色认证标识', type: 'link', url: '/pages/verify/index' },
        ],
      },
      {
        title: '登录安全',
        rows: [
          { key: 'login', label: '登录 / 切换账号', desc: '重新授权或切换微信账号', type: 'link', url: '/pages/login/index' },
          { key: 'device', label: '当前设备', desc: '微信小程序环境', type: 'value', value: '已启用' },
        ],
      },
    ],
  },
  notice: {
    title: '消息通知',
    desc: '控制消息页红点和互动提醒的展示方式。',
    groups: [
      {
        title: '互动通知',
        rows: [
          { key: 'likes', label: '赞和收藏', desc: '有人点赞或收藏内容时提醒', type: 'switch', value: 'on' },
          { key: 'follows', label: '新增关注', desc: '有同学关注你时提醒', type: 'switch', value: 'on' },
          { key: 'comments', label: '评论和@', desc: '评论、回复或提到你时提醒', type: 'switch', value: 'on' },
        ],
      },
      {
        title: '消息中心',
        rows: [
          { key: 'messages', label: '查看消息页', desc: '进入消息中心处理未读内容', type: 'link', url: '/pages/messages/index' },
          { key: 'system', label: '系统通知', desc: '查看平台公告和系统提醒', type: 'link', url: '/pages/message-system/index' },
        ],
      },
    ],
  },
  privacy: {
    title: '隐私设置',
    desc: '设置主页展示、联系权限和浏览记录可见性。',
    groups: [
      {
        title: '主页展示',
        rows: [
          { key: 'profileVisible', label: '公开个人主页', desc: '允许同学查看技能、发布和兴趣标签', type: 'switch', value: 'on' },
          { key: 'showActivity', label: '展示活动记录', desc: '在个人主页展示公开活动参与记录', type: 'switch' },
          { key: 'showHistory', label: '本机浏览记录', desc: '只保存在本机，可随时清理', type: 'link', url: '/pages/browse-history/index' },
        ],
      },
      {
        title: '互动权限',
        rows: [
          { key: 'allowMessage', label: '允许同学发消息', desc: '开启后可从主页和帖子进入聊天', type: 'switch', value: 'on' },
          { key: 'allowFollow', label: '允许被关注', desc: '开启后同学可以关注你', type: 'switch', value: 'on' },
        ],
      },
    ],
  },
  about: {
    title: '关于换乎',
    desc: '校园技能交换、兴趣搭子和社区活动平台。',
    groups: [
      {
        title: '产品信息',
        rows: [
          { key: 'version', label: '当前版本', desc: '换乎 ZJU版', type: 'value', value: 'UI redesign v2' },
          { key: 'scope', label: '服务范围', desc: '浙江大学校园内测使用', type: 'value', value: '校园版' },
        ],
      },
      {
        title: '反馈与支持',
        rows: [
          { key: 'feedback', label: '意见反馈', desc: '提交体验问题或功能建议', type: 'link', url: '/pages/contact-request/index?type=feedback' },
          { key: 'discover', label: '看看社区', desc: '返回发现页浏览校园内容', type: 'link', url: '/pages/discover/index' },
        ],
      },
    ],
  },
}

export default function SettingsDetail() {
  const [type, setType] = useState<SettingType>('account')
  const [switches, setSwitches] = useState<Record<string, boolean>>({})

  useLoad((options) => {
    const nextType = String(options?.type || 'account') as SettingType
    if (COPY[nextType]) setType(nextType)
  })

  const detail = COPY[type]

  const openLink = (url?: string) => {
    if (!url) return
    const tabPages = ['/pages/index/index', '/pages/discover/index', '/pages/messages/index', '/pages/profile/index']
    const method = tabPages.includes(url.split('?')[0]) ? Taro.switchTab : Taro.navigateTo
    method({
      url,
      fail: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    })
  }

  const toggleSwitch = (key: string, value: boolean) => {
    setSwitches((current) => ({ ...current, [key]: value }))
    Taro.showToast({ title: value ? '已开启' : '已关闭', icon: 'none' })
  }

  return (
    <View className='settings-detail-page'>
      <View className='detail-hero'>
        <Text className='detail-title'>{detail.title}</Text>
        <Text className='detail-desc'>{detail.desc}</Text>
      </View>

      {detail.groups.map((group) => (
        <View className='detail-card' key={group.title}>
          <Text className='group-title'>{group.title}</Text>
          {group.rows.map((row, index) => {
            const checked = switches[row.key] ?? row.value === 'on'
            return (
              <View
                key={row.key}
                className={`detail-row ${index === group.rows.length - 1 ? 'last' : ''}`}
                onClick={() => row.type === 'link' && openLink(row.url)}
              >
                <View className='detail-row-main'>
                  <Text className='detail-row-title'>{row.label}</Text>
                  <Text className='detail-row-desc'>{row.desc}</Text>
                </View>
                {row.type === 'switch' ? (
                  <Switch
                    checked={checked}
                    color='#2563EB'
                    onChange={(event) => toggleSwitch(row.key, event.detail.value)}
                  />
                ) : row.type === 'value' ? (
                  <Text className='detail-value'>{row.value}</Text>
                ) : (
                  <Text className='detail-arrow'>›</Text>
                )}
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}
