import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import { CONVERSATIONS, CONTACTS } from '../../utils/mock'
import './index.css'

const CATEGORIES = ['聊天', '通讯录']

interface Conversation {
  id: string; name: string; lastMessage: string; timestamp: string; unread: number; online?: boolean; category: string; avatar?: string
}

export default function Messages() {
  const [activeCat, setActiveCat] = useState(0)
  const [searchText, setSearchText] = useState('')

  const goChat = (conv: Conversation) => {
    Taro.showToast({ title: '打开聊天: ' + conv.name, icon: 'none' })
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header + Search + Tabs */}
      <View style={{ backgroundColor: '#FFF', padding: '12px 16px 0', position: 'sticky', top: 0, zIndex: 10 }}>
        {/* Title Row */}
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <Text style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>聊天</Text>
          <View onClick={() => Taro.showToast({ title: '添加好友', icon: 'none' })}
            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '20px', color: '#64748B' }}>＋</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ marginBottom: '10px' }}>
          <View style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '0 10px' }}>
            <Text style={{ fontSize: '16px', color: '#94A3B8', marginRight: '6px' }}>🔍</Text>
            <Input
              placeholder="搜索聊天或联系人"
              value={searchText}
              onInput={(e) => setSearchText(e.detail.value)}
              style={{ flex: 1, padding: '8px 0', fontSize: '14px', color: '#1E293B', background: 'transparent', border: 'none', outline: 'none' }}
            />
          </View>
        </View>

        {/* Categories Tabs */}
        <ScrollView scrollX enableFlex style={{ whiteSpace: 'nowrap', marginBottom: '8px' }}>
          <View style={{ display: 'flex', gap: '8px' }}>
            {CATEGORIES.map((cat, i) => (
              <View key={cat} onClick={() => setActiveCat(i)}
                style={{
                  display: 'inline-flex', padding: '5px 16px', borderRadius: '100px', fontSize: '13px',
                  fontWeight: activeCat === i ? '600' : '400',
                  backgroundColor: activeCat === i ? '#2563EB' : '#F1F5F9',
                  color: activeCat === i ? '#FFF' : '#64748B'
                }}
              >{cat}</View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

      {/* List Content */}
      <View style={{ padding: '0 0 100px' }}>
        {activeCat === 0 ? (
          /* ====== 聊天列表 ====== */
          CONVERSATIONS.map((conv) => (
            <View key={conv.id} onClick={() => goChat(conv)}
              style={{ display: 'flex', padding: '14px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9', gap: '12px', alignItems: 'center' }}>
              {/* Avatar */}
              <View style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                <View style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#2563EB15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: '20px', color: '#2563EB', fontWeight: '500' }}>{(conv.name || '@')[0]}</Text>
                </View>
                {conv.online && (
                  <View style={{ position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #FFF' }} />
                )}
                {conv.unread > 0 && (
                  <View style={{ position: 'absolute', top: '-4px', right: '-4px', minWidth: '18px', height: '18px', borderRadius: '9px', backgroundColor: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    <Text style={{ fontSize: '10px', color: '#FFF', fontWeight: '500' }}>{conv.unread > 99 ? '99+' : conv.unread}</Text>
                  </View>
                )}
              </View>
              {/* Info */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '15px', fontWeight: conv.unread > 0 ? '600' : '400', color: '#1E293B' }} numberOfLines={1}>{conv.name}</Text>
                  <Text style={{ fontSize: '11px', color: '#94A3B8', flexShrink: 0, marginLeft: '8px' }}>{conv.timestamp}</Text>
                </View>
                <Text style={{ fontSize: '13px', color: conv.unread > 0 ? '#475569' : '#94A3B8', marginTop: '3px' }} numberOfLines={1}>
                  {conv.lastMessage}
                </Text>
              </View>
            </View>
          ))
        ) : (
          /* ====== 通讯录 ====== */
          <View>
            {/* Online */}
            <Text style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', padding: '12px 16px 4px' }}>在线好友</Text>
            {CONTACTS.filter((c) => c.online).map((contact) => (
              <View key={contact.id} onClick={() => Taro.navigateTo({ url: '/pages/user-detail/index?name=' + encodeURIComponent(contact.name) })}
                style={{ display: 'flex', padding: '10px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9', gap: '12px', alignItems: 'center' }}>
                <View style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                  <View style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#10B98120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: '18px', color: '#10B981', fontWeight: '500' }}>{(contact.name || '@')[0]}</Text>
                  </View>
                  <View style={{ position: 'absolute', bottom: '1px', right: '1px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #FFF' }} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: '15px', fontWeight: '500', color: '#1E293B' }} numberOfLines={1}>{contact.name}</Text>
                  <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }} numberOfLines={1}>{contact.bio}</Text>
                </View>
              </View>
            ))}

            {/* Offline */}
            <Text style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8', padding: '16px 16px 4px', marginTop: '8px' }}>离线好友</Text>
            {CONTACTS.filter((c) => !c.online).map((contact) => (
              <View key={contact.id} onClick={() => Taro.navigateTo({ url: '/pages/user-detail/index?name=' + encodeURIComponent(contact.name) })}
                style={{ display: 'flex', padding: '10px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9', gap: '12px', alignItems: 'center' }}>
                <View style={{ width: '44px', height: '44px', flexShrink: 0 }}>
                  <View style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: '18px', color: '#94A3B8', fontWeight: '500' }}>{(contact.name || '@')[0]}</Text>
                  </View>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: '15px', fontWeight: '400', color: '#475569' }} numberOfLines={1}>{contact.name}</Text>
                  <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }} numberOfLines={1}>{contact.bio}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* FAB - New Chat Button */}
      <View onClick={() => Taro.showToast({ title: '新建聊天', icon: 'none' })}
        style={{
          position: 'fixed', bottom: '80px', right: '20px',
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: '#2563EB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          zIndex: 100
        }}>
        <Text style={{ fontSize: '28px', color: '#FFF', fontWeight: '300', marginTop: '-2px', lineHeight: '1' }}>＋</Text>
      </View>
    </View>
  )
}
