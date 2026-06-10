import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import './index.scss'

const ZJU_AUTH_URL = 'https://zjuam.zju.edu.cn/cas/login'

export default function Verify() {
  const openZjuAuth = () => {
    Taro.navigateTo({
      url: `/sp-common/pages/webview/index?url=${encodeURIComponent(ZJU_AUTH_URL)}&title=${encodeURIComponent('浙江大学统一身份认证')}`,
      fail: () => {
        Taro.setClipboardData({
          data: ZJU_AUTH_URL,
          success: () => Taro.showToast({ title: '已复制认证入口', icon: 'none' }),
        })
      },
    })
  }

  const copyAuthUrl = () => {
    Taro.setClipboardData({
      data: ZJU_AUTH_URL,
      success: () => Taro.showToast({ title: '已复制认证入口', icon: 'success' }),
    })
  }

  return (
    <View className='verify-page'>
      <View className='verify-card'>
        <View className='verify-logo'>
          <Text>浙</Text>
        </View>
        <Text className='verify-title'>浙江大学校园认证</Text>
        <Text className='verify-desc'>
          通过浙江大学统一身份认证确认校内身份。认证完成后，个人主页会显示校园认证标识。
        </Text>

        <View className='verify-info'>
          <Text className='verify-info-title'>认证方式</Text>
          <Text className='verify-info-text'>使用浙大统一身份认证账号登录</Text>
          <Text className='verify-info-text'>认证入口由浙江大学官方系统提供</Text>
        </View>

        <View className='verify-primary' onClick={openZjuAuth}>
          <Text>前往浙江大学统一身份认证</Text>
        </View>
        <View className='verify-secondary' onClick={copyAuthUrl}>
          <Text>复制认证入口</Text>
        </View>
      </View>
    </View>
  )
}
