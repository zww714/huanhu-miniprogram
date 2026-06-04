import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Text, View } from '@tarojs/components'
import { getSavedLoginUser, login, saveWechatProfile } from '../../../api'
import './index.scss'

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const saved = getSavedLoginUser()
    if (saved?.name) setUserName(saved.name)

    login()
      .then((user) => {
        if (user?.name) setUserName(user.name)
      })
      .catch((e) => console.warn('[Login] silent login failed', e))
  }, [])

  const finishLogin = (title = '登录成功') => {
    Taro.showToast({ title, icon: 'success' })
    setTimeout(() => {
      const pages = Taro.getCurrentPages()
      if (pages.length > 1) {
        Taro.navigateBack()
      } else {
        Taro.switchTab({ url: '/pages/profile/index' })
      }
    }, 500)
  }

  const goToPage = (url: string) => { Taro.navigateTo({ url }) }

const handleWechatLogin = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const profile = await Taro.getUserProfile({
        desc: '用于完善个人资料和展示昵称头像',
      })
      const userInfo = profile.userInfo || {}
      const user = await saveWechatProfile({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
      })
      setUserName(user?.name || userInfo.nickName || '微信用户')
      finishLogin('微信登录成功')
    } catch (e) {
      console.warn('[Login] wechat profile failed', e)
      Taro.showToast({ title: '你取消了微信授权', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '28px 18px', boxSizing: 'border-box' }}>
      <View style={{ marginBottom: '24px' }}>
        <Text style={{ fontSize: '26px', fontWeight: '700', color: '#1E293B', lineHeight: '36px' }}>登录换乎</Text>
        <Text style={{ fontSize: '14px', color: '#64748B', marginTop: '6px', lineHeight: '21px' }}>
          登录后可以发布内容、联系同学，并在不同设备同步聊天。
        </Text>
      </View>

      {!!userName && (
        <View style={{ marginBottom: '14px', padding: '10px 12px', backgroundColor: '#EFF6FF', borderRadius: '10px' }}>
          <Text style={{ fontSize: '13px', color: '#2563EB' }}>当前已识别：{userName}</Text>
        </View>
      )}

      <View style={{ backgroundColor: '#FFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}>
        <View style={{ padding: '18px 0 22px', alignItems: 'center' }}>
          <View style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Text style={{ fontSize: '28px', color: '#FFF', fontWeight: '700' }}>换</Text>
          </View>
          <Text style={{ fontSize: '14px', color: '#64748B', lineHeight: '22px', textAlign: 'center' }}>
            使用微信资料完善昵称和头像。
          </Text>
        </View>

        <Button
          onClick={handleWechatLogin}
          loading={submitting}
          style={{
            height: '46px',
            lineHeight: '46px',
            borderRadius: '10px',
            backgroundColor: '#2563EB',
            color: '#FFF',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          微信一键登录
        </Button>
      </View>

      <View style={{ marginTop: '16px', textAlign: 'center' }}>
        <Text style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '18px' }}>
          登录即表示同意{' '}
          <Text style={{ color: '#2563EB', textDecoration: 'underline' }} onClick={() => goToPage('/sp-common/pages/agreement/index')}>
            用户协议
          </Text>
          {' '}和{' '}
          <Text style={{ color: '#2563EB', textDecoration: 'underline' }} onClick={() => goToPage('/sp-common/pages/privacy/index')}>
            隐私协议
          </Text>
        </Text>
      </View>
    </View>
  )
}
