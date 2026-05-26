import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Input, Text, View } from '@tarojs/components'
import { getSavedLoginUser, login, phoneCodeLogin, saveWechatProfile, sendSmsCode } from '../../../api'
import './index.css'

type LoginMode = 'wechat' | 'phone'

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('wechat')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
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

  useEffect(() => {
    if (countdown <= 0) return undefined
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

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

  const handleSendCode = async () => {
    if (countdown > 0 || submitting) return
    try {
      const res = await sendSmsCode(phone)
      setCountdown(60)
      Taro.showModal({
        title: '开发验证码',
        content: `验证码：${res.code}\n正式上线时这里会接入短信服务。`,
        showCancel: false,
      })
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '发送失败', icon: 'none' })
    }
  }

  const handlePhoneLogin = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const user = await phoneCodeLogin({ phone, code })
      setUserName(user?.name || `用户${phone.slice(-4)}`)
      finishLogin('手机号登录成功')
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '登录失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const renderModeButton = (value: LoginMode, label: string) => {
    const selected = mode === value
    return (
      <View
        onClick={() => setMode(value)}
        style={{
          flex: 1,
          height: '42px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? '#2563EB' : '#F1F5F9',
        }}
      >
        <Text style={{ fontSize: '14px', fontWeight: '600', color: selected ? '#FFF' : '#64748B' }}>{label}</Text>
      </View>
    )
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
        <View style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          {renderModeButton('wechat', '微信登录')}
          {renderModeButton('phone', '手机验证码')}
        </View>

        {mode === 'wechat' && (
          <View>
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
        )}

        {mode === 'phone' && (
          <View>
            <View style={{ marginBottom: '14px' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>手机号</Text>
              <View style={{ height: '46px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                <Input
                  type="number"
                  value={phone}
                  maxlength={11}
                  placeholder="请输入手机号"
                  onInput={(e) => setPhone(e.detail.value)}
                  style={{ width: '100%', height: '44px', fontSize: '15px', color: '#1E293B' }}
                />
              </View>
            </View>

            <View style={{ marginBottom: '18px' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>验证码</Text>
              <View style={{ display: 'flex', gap: '8px' }}>
                <View style={{ flex: 1, height: '46px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                  <Input
                    type="number"
                    value={code}
                    maxlength={6}
                    placeholder="6位验证码"
                    onInput={(e) => setCode(e.detail.value)}
                    style={{ width: '100%', height: '44px', fontSize: '15px', color: '#1E293B' }}
                  />
                </View>
                <View
                  onClick={handleSendCode}
                  style={{
                    width: '104px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: countdown > 0 ? '#E2E8F0' : '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: '13px', color: countdown > 0 ? '#94A3B8' : '#2563EB', fontWeight: '600' }}>
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </Text>
                </View>
              </View>
            </View>

            <Button
              onClick={handlePhoneLogin}
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
              手机号登录
            </Button>
          </View>
        )}
      </View>

      <Text style={{ display: 'block', marginTop: '16px', fontSize: '12px', color: '#94A3B8', lineHeight: '18px', textAlign: 'center' }}>
        登录即表示同意使用微信身份创建账号。手机号验证码当前为开发模式，正式上线需接入短信服务。
      </Text>
    </View>
  )
}
