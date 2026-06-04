import { View, Text } from '@tarojs/components'
import './index.scss'

export default function AgreementPage() {
  return (
    <View style={{ padding: '20px 18px', boxSizing: 'border-box', minHeight: '100vh' }}>
      <Text style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
        用户协议
      </Text>
      <Text style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '20px' }}>
        更新日期：2026 年 6 月 4 日
      </Text>

      <Text style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '16px' }}>
        欢迎使用「换乎ZJU版」（以下简称"本小程序"）。本协议是你（以下简称"用户"）与本小程序开发者之间关于使用本小程序服务的协议。使用本小程序即表示你同意本协议的全部条款。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        1. 服务说明
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        本小程序是一个面向浙江大学师生的技能交换平台。用户可以在平台上发布技能、寻找技能伙伴、进行在线交流。小程序使用微信云开发提供后台服务。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        2. 用户账号
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        2.1 你使用微信账号授权登录本小程序，无需单独注册。
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        2.2 你应对账号下的所有行为负责，包括发布的内容和与他人沟通的行为。
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        2.3 如发现账号被他人非法使用，请立即联系我们。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        3. 用户行为规范
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        你承诺在使用本小程序时遵守以下规范：
      </Text>
      <View style={{ paddingLeft: '18px', marginBottom: '10px' }}>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '4px' }}>
          3.1 不发布违反法律法规、社会公德的内容；
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '4px' }}>
          3.2 不发布虚假、欺诈信息；
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '4px' }}>
          3.3 不骚扰、辱骂、威胁其他用户；
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '4px' }}>
          3.4 不发布广告、垃圾信息或进行商业推广；
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '4px' }}>
          3.5 不尝试破坏平台安全或干扰其他用户正常使用；
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '4px' }}>
          3.6 不上传包含病毒或恶意代码的内容。
        </Text>
      </View>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        违反上述规范的内容，我们有权在不通知的情况下删除，并视情况限制或封禁账号。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        4. 内容审核
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        4.1 你发布的所有公开内容（帖子、评论、技能信息等）将接受微信内容安全接口的自动审核。
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        4.2 审核不通过的内容将被自动拦截并告知发布者。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        5. 免责声明
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        5.1 本小程序仅作为技能交换信息平台，不担保用户之间交换行为的质量和安全性。
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        5.2 用户之间因技能交换产生的纠纷，由双方自行协商解决。
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        5.3 因不可抗力（包括但不限于微信平台故障、网络中断等）导致的服务中断，我们不承担责任。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        6. 协议变更
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '10px' }}>
        我们可能适时更新本协议。重大变更将通过小程序内通知告知。你继续使用本小程序即表示接受更新后的协议。
      </Text>

      <Text style={{ fontSize: '16px', fontWeight: 600, color: '#334155', display: 'block', marginTop: '16px', marginBottom: '8px' }}>
        7. 联系方式
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, display: 'block', marginBottom: '30px' }}>
        如对协议有疑问，请通过小程序内消息联系我们。
      </Text>
    </View>
  )
}