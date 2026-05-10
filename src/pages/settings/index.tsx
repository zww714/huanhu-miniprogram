import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import './index.css'

const ITEMS = ['账号与安全', '消息通知', '隐私设置', '清除缓存', '关于换乎']

export default function Settings() {
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      <View style={{ backgroundColor: '#FFF', borderRadius: '12px', overflow: 'hidden' }}>
        {ITEMS.map((item, index) => (
          <View key={item} onClick={() => Taro.showToast({ title: item, icon: 'none' })} style={{ padding: '16px', display: 'flex', alignItems: 'center', borderBottom: index < ITEMS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
            <Text style={{ flex: 1, fontSize: '15px', color: '#1E293B', fontWeight: '500' }}>{item}</Text>
            <Text style={{ fontSize: '18px', color: '#CBD5E1' }}>›</Text>
          </View>
        ))}
      </View>
      <View onClick={() => Taro.navigateTo({ url: '/pages/login/index' })} style={{ marginTop: '12px', backgroundColor: '#FFF', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
        <Text style={{ fontSize: '15px', color: '#2563EB', fontWeight: '600' }}>登录 / 切换账号</Text>
      </View>
    </View>
  )
}
