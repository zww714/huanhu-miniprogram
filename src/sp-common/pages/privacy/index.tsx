import { View, Text } from '@tarojs/components'
import './index.scss'

export default function PrivacyPage() {
  return (
    <View className='privacy-container'>
      <Text style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
        隐私协议
      </Text>
      <Text className='updated'>更新日期：2026 年 6 月 4 日</Text>

      <Text style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '16px' }}>
        欢迎使用「换乎ZJU版」（以下简称"本小程序"）。我们深知个人信息对你的重要性，因此制定了本隐私协议，说明我们如何收集、使用和保护你的个人信息。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px', marginTop: '16px' }}>
        1. 我们收集的信息
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        为向你提供技能交换服务，我们可能收集以下信息：
      </Text>
      <View style={{ paddingLeft: '18px', marginBottom: '10px' }}>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block' }}>• 微信昵称和头像（用于展示个人资料）</Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block' }}>• 学校、学院、专业、年级等教育信息（你主动填写）</Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block' }}>• 技能信息（你主动发布的技能和需求）</Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block' }}>• 聊天消息（用于你与其他用户沟通）</Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block' }}>• 发布的内容（帖子、评论等）</Text>
      </View>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px', marginTop: '16px' }}>
        2. 信息使用目的
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        我们使用你的信息用于：创建和维护你的账号、展示个人资料页面、为你推荐技能匹配的用户、提供聊天通讯功能、保障平台安全（内容审核和垃圾信息过滤）。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px', marginTop: '16px' }}>
        3. 信息共享
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        我们不会将你的个人信息出售给第三方。你的个人资料仅在小程序范围内对其他用户可见。我们使用微信云开发作为数据存储服务，数据存储在国内服务器。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px', marginTop: '16px' }}>
        4. 数据安全
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        我们采取符合行业标准的安全措施保护你的数据，包括数据加密传输、访问控制、安全审计日志等。但请注意，互联网上的数据传输不能保证 100% 的安全。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px', marginTop: '16px' }}>
        5. 你的权利
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        你可以随时：查看和编辑你的个人资料、删除你发布的内容、注销账号（联系管理员）。如要删除全部数据，请通过小程序内的联系方式与我们联系。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px', marginTop: '16px' }}>
        6. 隐私协议更新
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        我们可能适时更新本隐私协议。重大更新时，我们会通过小程序内通知的方式告知你。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px', marginTop: '16px' }}>
        7. 联系我们
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '30px' }}>
        如你对本隐私协议有任何疑问，可以通过小程序内的消息功能联系我们，或通过浙江大学校内渠道联系开发者。
      </Text>
    </View>
  )
}