import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, Input, Text, View } from '@tarojs/components'
import { getSavedLoginUser, saveWechatProfile } from '../../../api'
import './index.scss'

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false)
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    const saved = getSavedLoginUser()
    if (saved?.name || saved?.nickname) setNickname(saved.name || saved.nickname)
    if (saved?.avatar) setAvatarUrl(saved.avatar)
  }, [])

  const finishLogin = () => {
    Taro.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      const pages = Taro.getCurrentPages()
      if (pages.length > 1) Taro.navigateBack()
      else Taro.switchTab({ url: '/pages/profile/index' })
    }, 500)
  }

  const goToPage = (url: string) => {
    Taro.navigateTo({ url })
  }

  const handleChooseAvatar = (event: any) => {
    const nextAvatar = event?.detail?.avatarUrl || ''
    if (nextAvatar) setAvatarUrl(nextAvatar)
  }

  const handleLogin = async () => {
    if (submitting) return
    const nextName = nickname.trim()

    if (!agreed) {
      Taro.showToast({ title: '请先勾选用户协议和隐私协议', icon: 'none' })
      return
    }
    if (!nextName) {
      Taro.showToast({ title: '请填写微信昵称', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const user = await saveWechatProfile({
        nickName: nextName,
        avatarUrl,
      })
      setNickname(user?.name || user?.nickname || nextName)
      setAvatarUrl(user?.avatar || avatarUrl)
      finishLogin()
    } catch (e) {
      console.warn('[Login] login failed', e)
      Taro.showToast({ title: '登录失败，请稍后重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='login-page'>
      <View className='login-hero'>
        <Text className='login-title'>登录换乎</Text>
        <Text className='login-desc'>登录后可以发布内容、联系同学，并同步你的个人资料。</Text>
      </View>

      <View className='login-card'>
        <Button className='avatar-button' openType='chooseAvatar' onChooseAvatar={handleChooseAvatar}>
          {avatarUrl ? (
            <Image className='avatar-image' src={avatarUrl} mode='aspectFill' />
          ) : (
            <View className='avatar-placeholder'>
              <Text>换</Text>
            </View>
          )}
        </Button>
        <Text className='avatar-tip'>点击选择微信头像</Text>

        <View className='form-field'>
          <Text className='field-label'>昵称</Text>
          <Input
            className='nickname-input'
            type='nickname'
            value={nickname}
            placeholder='请输入微信昵称'
            onInput={(event) => setNickname(String(event.detail.value || ''))}
          />
        </View>

        <View className='agreement-row' onClick={() => setAgreed((value) => !value)}>
          <View className={agreed ? 'checkbox checked' : 'checkbox'}>
            {agreed ? <Text>✓</Text> : null}
          </View>
          <Text className='agreement-text'>我已阅读并同意</Text>
          <Text className='agreement-link' onClick={(event) => { event.stopPropagation(); goToPage('/sp-common/pages/agreement/index') }}>用户协议</Text>
          <Text className='agreement-text'>和</Text>
          <Text className='agreement-link' onClick={(event) => { event.stopPropagation(); goToPage('/sp-common/pages/privacy/index') }}>隐私协议</Text>
        </View>

        <Button className='login-button' loading={submitting} onClick={handleLogin}>
          微信登录
        </Button>
      </View>
    </View>
  )
}
