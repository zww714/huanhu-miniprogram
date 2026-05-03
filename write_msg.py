#!/usr/bin/env python3
"""Write messages page - no Chinese text in source, hex-safe"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

code = """import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import { CONVERSATIONS, CONTACTS } from '../../utils/mock'
import './index.css'

const CATEGORIES = ['\u804a\u5929', '\u901a\u8baf\u5f55']

interface Conversation {
  id: string; name: string; lastMessage: string; timestamp: string; unread: number; online?: boolean; category: string; avatar?: string
}

export default function Messages() {
  const [activeCat, setActiveCat] = useState(0)
  const [searchText, setSearchText] = useState('')

  const goChat = (conv: Conversation) => {
    Taro.showToast({ title: '\u6253\u5f00\u804a\u5929: ' + conv.name, icon: 'none' })
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#FFF', padding: '12px 16px 0', position: 'sticky', top: 0, zIndex: 10 }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <Text style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>\u804a\u5929</Text>
          <View onClick={() => Taro.showToast({ title: '\u6dfb\u52a0\u597d\u53cb', icon: 'none' })}
            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '20px', color: '#64748B' }}>\uff0b</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ marginBottom: '10px' }}>
          <Input
            placeholder={'\u641c\u7d22\u804a\u5929\u6216\u8054\u7cfb\u4eba'}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            style={{ width: '100%', padding: '8px 12px', backgroundColor: '#F1F5F9', borderRadius: '8px', fontSize: '14px', color: '#1E293B', border: 'none' }}
          />
        </View>
      </View>
    </View>
  )
}
"""

fp = r'C:\Users\91697\Desktop\V3\huanhu-miniprogram\src\pages\messages\test.tsx'
open(fp, 'w', encoding='utf-8').write(code)
print('Written')
