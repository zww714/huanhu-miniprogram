import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { SKILL_USERS, FILTER_TAGS, INTEREST_GROUPS, PARTNER_USERS, ACTIVITIES, HOT_ACTIVITIES } from '../../utils/mock'
import './index.css'

const TABS = ['技能交换', '兴趣搭子', '社区活动']
const ACTIVITY_CATEGORIES = ['全部', '技能交换', '兴趣', '志愿', '其他']
const ICONS: Record<string, string> = {
  trending: '🔥', chef: '🍆', gamepad: '🎮', camera: '📲'
}

export default function Index() {
  const [activeTab, setActiveTab] = useState(0)
  const [filterIndex, setFilterIndex] = useState(0)
  const [activityCategory, setActivityCategory] = useState(0)
  const [partnerCategory, setPartnerCategory] = useState(0)

  const handleSearch = () => Taro.switchTab({ url: '/pages/discover/index' })
  const handleStartChat = () => Taro.showToast({ title: '鍙戣捣鑱旂郴', icon: 'none' })
  const handleJoinGroup = () => Taro.showToast({ title: '已加入兴趣组', icon: 'success' })
  const handleJoin = () => Taro.showToast({ title: '报名成功', icon: 'success' })
  const handlePublish = () => Taro.navigateTo({ url: '/pages/publish/index' })
  const handleUserClick = (name: string) => Taro.navigateTo({ url: `/pages/user-detail/index?name=${encodeURIComponent(name)}` })

  const renderStars = (level: number) =>
    Array(5).fill(0).map((_, i) => (
      <Text
        key={i}
        style={{
          color: i < level ? '#F59E0B' : '#E2E8F0',
          fontSize: '10px',
          marginRight: '1px'
        }}
      >
        {'\u2605'}
      </Text>
    ))

  // ========= 鎶€鑳戒氦鎹?Tab =========
  const renderSkillExchange = () => (
    <View>
      {/* Filter Tags */}
      <ScrollView
        scrollX
        showScrollbar
        style={{ height: '36px', whiteSpace: 'nowrap' }}
      >
        <View
          style={{
            padding: '0 16px 8px',
            display: 'flex',
            gap: '8px',
            height: '28px'
          }}
        >
          {FILTER_TAGS.map((tag, i) => (
            <View
              key={tag}
              onClick={() => setFilterIndex(i)}
              style={{
                display: 'inline-flex',
                padding: '4px 14px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: filterIndex === i ? '600' : '400',
                backgroundColor: filterIndex === i ? '#2563EB' : '#F1F5F9',
                color: filterIndex === i ? '#FFF' : '#64748B'
              }}
            >
              {tag}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Decorative Banner */}
      <View
        style={{
          margin: '0 16px 10px',
          height: '110px',
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 30%, #A855F7 60%, #EC4899 100%)'
        }}
      >
        {/* Decorative circles */}
        <View
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-10px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.12)'
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)'
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '10px',
            left: '40%',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.06)'
          }}
        />
        {/* Text content */}
        <View
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 20px'
          }}
        >
          <Text
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#FFF',
              lineHeight: '28px'
            }}
          >
            鍜屽叏鏍″悓瀛︿氦鎹㈡妧鑳?          </Text>
          <Text
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.75)',
              marginTop: '4px'
            }}
          >
            鍒嗕韩浣犵殑鐗归暱锛屽涔犳劅鍏磋叮鐨勭煡璇?          </Text>
        </View>
      </View>

      {/* User Cards */}
      <View
        style={{
          padding: '0 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {SKILL_USERS.map((user) => (
          <View
            key={user.id}
            style={{
              backgroundColor: '#FFF',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #E2E8F0'
            }}
          >
            {/* Header: Avatar + Info */}
            <View style={{ display: 'flex', gap: '12px' }}>
              <View onClick={() => handleUserClick(user.name)}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: '#E2E8F0', flexShrink: 0, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#FFF' }}>{'?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Text
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1E293B'
                    }}
                  >
                    {user.name}
                  </Text>
                  {user.verified && (
                    <Text style={{ fontSize: '12px', color: '#2563EB' }}>
                      鉁?                    </Text>
                  )}
                  <View
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: '#EFF6FF',
                      borderRadius: '100px',
                      padding: '2px 8px'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '11px',
                        color: '#2563EB',
                        fontWeight: '500'
                      }}
                    >
                      {user.match}% 鍖归厤
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: '13px',
                    color: '#64748B',
                    marginTop: '2px'
                  }}
                >
                  {user.college} 路 {user.major}
                </Text>
                <Text style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {user.grade}
                </Text>
              </View>
            </View>

            {/* Bio */}
            <Text
              style={{
                fontSize: '13px',
                color: '#475569',
                marginTop: '10px',
                lineHeight: '1.5'
              }}
            >
              {user.bio}
            </Text>

            {/* Skills - Can */}
            <View style={{ marginTop: '10px' }}>
              <Text
                style={{
                  fontSize: '12px',
                  color: '#2563EB',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}
              >
                鎴戜細
              </Text>
              <View
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}
              >
                {user.can.map((s) => (
                  <View
                    key={s.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      backgroundColor: '#F0FDF4',
                      borderRadius: '100px',
                      padding: '3px 10px'
                    }}
                  >
                    <Text style={{ fontSize: '12px', color: '#10B981' }}>
                      {s.name}
                    </Text>
                    {renderStars(s.level)}
                  </View>
                ))}
              </View>
            </View>

            {/* Skills - Want */}
            <View style={{ marginTop: '8px' }}>
              <Text
                style={{
                  fontSize: '12px',
                  color: '#EA580C',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}
              >
                鎯冲
              </Text>
              <View
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}
              >
                {user.want.map((w) => (
                  <View
                    key={w}
                    style={{
                      backgroundColor: '#FFF7ED',
                      borderRadius: '100px',
                      padding: '3px 10px'
                    }}
                  >
                    <Text style={{ fontSize: '12px', color: '#EA580C' }}>
                      {w}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action */}
            <View
              style={{
                marginTop: '12px',
                display: 'flex',
                gap: '10px'
              }}
            >
              <View
                onClick={handleStartChat}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  backgroundColor: '#2563EB',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#FFF',
                    fontWeight: '500'
                  }}
                >
                  鍙戣捣鑱旂郴
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  // ========= 鍏磋叮鎼瓙 Tab =========
  const renderInterestPartners = () => {
    const filtered = partnerCategory === 0
      ? PARTNER_USERS
      : PARTNER_USERS.filter(function(u) { return u.tags && u.tags.indexOf(PARTNER_CATEGORIES[partnerCategory]) >= 0 })

    return (
      <View>
        {/* Category Filter */}
        <ScrollView
          scrollX
          showScrollbar
          style={{ height: '40px', whiteSpace: 'nowrap', marginTop: '4px', marginBottom: '4px' }}
        >
          <View style={{ padding: '0 16px', display: 'flex', gap: '8px', height: '32px' }}>
            {PARTNER_CATEGORIES.map(function(cat, i) {
              return (
                <View
                  key={cat}
                  onClick={function() { setPartnerCategory(i) }}
                  style={{
                    display: 'inline-flex',
                    padding: '5px 16px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: partnerCategory === i ? '600' : '400',
                    backgroundColor: partnerCategory === i ? '#2563EB' : '#F1F5F9',
                    color: partnerCategory === i ? '#FFF' : '#64748B'
                  }}
                >
                  {cat}
                </View>
              )
            })}
          </View>
        </ScrollView>

        {/* Hero Banner */}
      <View
        style={{
          margin: '12px 16px',
          height: '160px',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <View
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #F59E0B 0%, #FBBF24 40%, #3B82F6 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px 20px'
          }}
        >
          <Text
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#FFF',
              lineHeight: '30px'
            }}
          >
            鎵惧埌鍏磋叮鐩告姇鐨勬惌瀛?          </Text>
          <Text
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)',
              marginTop: '4px'
            }}
          >
            涓€璧锋帰绱㈢儹鐖憋紝璁╂牎鍥敓娲绘洿鏈夎叮锛?          </Text>
          <View
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px'
            }}
          >
            {['鐪熷疄鍚屽ソ', '杞绘澗鍖归厤', '浜掔浉闄即'].map((p) => (
              <View
                key={p}
                style={{
                  padding: '3px 10px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '100px'
                }}
              >
                <Text style={{ fontSize: '11px', color: '#FFF' }}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Hot Interest Groups */}
      <View style={{ padding: '0 16px', marginBottom: '16px' }}>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <Text
            style={{ fontSize: '17px', fontWeight: '600', color: '#1E293B' }}
          >
            馃敟 鐑棬鍏磋叮缁?          </Text>
          <Text style={{ fontSize: '13px', color: '#64748B' }}>
            鏇村 &gt;
          </Text>
        </View>
        <ScrollView scrollX showScrollbar style={{ whiteSpace: 'nowrap' }}>
          <View
            style={{ display: 'flex', gap: '12px', paddingBottom: '4px' }}
          >
            {INTEREST_GROUPS.map((g) => (
              <View
                key={g.name}
                onClick={handleJoinGroup}
                style={{
                  display: 'inline-flex',
                  width: '120px',
                  minHeight: '136px',
                  backgroundColor: '#FFF',
                  borderRadius: '14px',
                  padding: '14px 12px',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <View
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: g.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: '22px' }}>
                    {ICONS[g.icon] || '馃數'}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1E293B',
                    textAlign: 'center'
                  }}
                >
                  {g.name}
                </Text>
                <Text style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {g.followers}浜哄叧娉?                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Partner Cards */}
      <View style={{ padding: '0 16px 20px' }}>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <Text
            style={{ fontSize: '17px', fontWeight: '600', color: '#1E293B' }}
          >
            馃懃 鎵炬惌瀛?          </Text>
          <Text style={{ fontSize: '13px', color: '#64748B' }}>
            鏇村 &gt;
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {filtered.map((user) => (
            <View
              key={user.id}
              style={{
                backgroundColor: '#FFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0'
              }}
            >
              <View
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '10px'
                }}
              >
                <View onClick={() => handleUserClick(user.name)}
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    backgroundColor: '#E2E8F0', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  <Text style={{ fontSize: '18px', fontWeight: '700', color: '#FFF' }}>{'?'}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#1E293B'
                      }}
                    >
                      {user.name}
                    </Text>
                    {user.verified && (
                      <Text style={{ fontSize: '12px', color: '#2563EB' }}>
                        鉁?                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: '13px',
                      color: '#64748B',
                      marginTop: '2px',
                      lineHeight: '1.4'
                    }}
                  >
                    {user.bio}
                  </Text>
                </View>
                <View style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Text
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#2563EB',
                      lineHeight: '24px'
                    }}
                  >
                    {user.match}%
                  </Text>
                  <Text style={{ fontSize: '11px', color: '#94A3B8' }}>
                    鍖归厤搴?                  </Text>
                </View>
              </View>
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Text style={{ fontSize: '12px', color: '#64748B' }}>
                    瀵绘壘锛?                  </Text>
                  <View
                    style={{
                      padding: '3px 10px',
                      backgroundColor: '#EFF6FF',
                      borderRadius: '100px'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '12px',
                        color: '#2563EB',
                        fontWeight: '500'
                      }}
                    >
                      {user.lookingFor}
                    </Text>
                  </View>
                </View>
                <View
                  onClick={handleStartChat}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: '#2563EB',
                    borderRadius: '100px'
                  }}
                >
                  <Text
                    style={{
                      fontSize: '13px',
                      color: '#FFF',
                      fontWeight: '500'
                    }}
                  >
                    鑱旂郴TA
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
  }

  // ========= 绀惧尯娲诲姩 Tab =========
  const renderActivities = () => {
    const filtered = activityCategory === 0
      ? ACTIVITIES
      : ACTIVITIES.filter(function(a) { return a.category === ACTIVITY_CATEGORIES[activityCategory] })

    return (
      <View>
        {/* Category Filter */}
        <ScrollView
          scrollX
          showScrollbar
          style={{ height: '40px', whiteSpace: 'nowrap', marginBottom: '8px' }}
        >
          <View style={{ padding: '0 16px', display: 'flex', gap: '8px', height: '32px' }}>
            {ACTIVITY_CATEGORIES.map(function(cat, i) {
              return (
                <View
                  key={cat}
                  onClick={function() { setActivityCategory(i) }}
                  style={{
                    display: 'inline-flex',
                    padding: '5px 16px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: activityCategory === i ? '600' : '400',
                    backgroundColor: activityCategory === i ? '#2563EB' : '#F1F5F9',
                    color: activityCategory === i ? '#FFF' : '#64748B'
                  }}
                >
                  {cat}
                </View>
              )
            })}
          </View>
        </ScrollView>

        {/* Hero Banner */}
        <View
          style={{
            margin: '8px 16px',
            height: '150px',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)'
          }}
        >
          <View style={{ position: 'absolute', top: '-30px', right: '-20px', width: '130px', height: '130px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <View style={{ position: 'absolute', bottom: '-20px', left: '30%', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)' }} />
          <View style={{ position: 'absolute', top: '20px', left: '-10px', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <View
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <Text style={{ fontSize: '22px', fontWeight: '700', color: '#FFF', lineHeight: '30px' }}>
              鎺㈢储ZJU鏍″洯娲诲姩
            </Text>
            <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
              鍙戠幇绮惧僵娲诲姩锛岄亣瑙佹湁瓒ｇ殑鐏甸瓊
            </Text>
            <View
              onClick={function() { Taro.showToast({ title: '鏌ョ湅鍏ㄩ儴娲诲姩', icon: 'none' }) }}
              style={{
                marginTop: '12px',
                padding: '6px 18px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '100px',
                alignSelf: 'flex-start',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <Text style={{ fontSize: '13px', color: '#FFF', fontWeight: '500' }}>
                绔嬪嵆报名 &gt;
              </Text>
            </View>
          </View>
        </View>

        {/* 鐑棬娲诲姩 - 姘村钩婊氬姩鍥炬爣 */}
        <View style={{ padding: '16px 16px 8px' }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Text style={{ fontSize: '17px', fontWeight: '600', color: '#1E293B' }}>
              馃敟 鐑棬娲诲姩
            </Text>
            <Text style={{ fontSize: '13px', color: '#64748B' }}>鏇村 &gt;</Text>
          </View>
          <ScrollView scrollX showScrollbar style={{ whiteSpace: 'nowrap' }}>
            <View style={{ display: 'flex', gap: '12px', paddingBottom: '4px' }}>
              {HOT_ACTIVITIES.map(function(g) {
                return (
                  <View
                    key={g.name}
                    onClick={function() { Taro.showToast({ title: g.name + '娲诲姩', icon: 'none' }) }}
                    style={{
                      display: 'inline-flex',
                      width: '100px',
                      minHeight: '120px',
                      backgroundColor: '#FFF',
                      borderRadius: '14px',
                      padding: '14px 10px',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <View
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: g.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Text style={{ fontSize: '20px' }}>{g.icon}</Text>
                    </View>
                    <Text style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', textAlign: 'center' }}>
                      {g.name}
                    </Text>
                    <Text style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {g.count}
                    </Text>
                  </View>
                )
              })}
            </View>
          </ScrollView>
        </View>

        {/* 鍏ㄩ儴娲诲姩鏍囬 */}
        <View style={{ padding: '0 16px', marginBottom: '10px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
            鍏ㄩ儴娲诲姩
          </Text>
        </View>

        {/* Activity Cards */}
        <View style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(function(act) {
            var isFull = act.participants >= (act.maxParticipants || 999)
            var catIdx = activityCategory
            return (
              <View
                key={act.id}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0'
                }}
              >
                {/* Cover */}
                <View
                  style={{
                    height: '90px',
                    position: 'relative',
                    background: act.cover || 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)'
                  }}
                >
                  <View style={{ position: 'absolute', top: '-15px', right: '-5px', width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <View style={{ position: 'absolute', bottom: '-10px', left: '40%', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                  <View
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 16px'
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '16px', fontWeight: '600', color: '#FFF', lineHeight: '22px' }}>
                        {act.title}
                      </Text>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>馃晲 {act.time}</Text>
                        <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>路</Text>
                        <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>馃搷 {act.location}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {/* Bottom Section */}
                <View style={{ padding: '10px 14px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                      {!!act.organizer && (
                        <Text style={{ fontSize: '11px', color: '#64748B' }}>
                          {act.organizer}
                        </Text>
                      )}
                      {act.tags.map(function(t) {
                        return (
                          <View key={t} style={{ padding: '1px 6px', backgroundColor: '#F1F5F9', borderRadius: '100px' }}>
                            <Text style={{ fontSize: '10px', color: '#64748B' }}>{t}</Text>
                          </View>
                        )
                      })}
                    </View>
                    <View
                      onClick={function() { Taro.showToast({ title: isFull ? '已报满' : '报名成功', icon: isFull ? 'error' : 'success' }) }}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '100px',
                        backgroundColor: isFull ? '#F1F5F9' : '#2563EB',
                        flexShrink: 0
                      }}
                    >
                      <Text style={{ fontSize: '12px', color: isFull ? '#94A3B8' : '#FFF', fontWeight: '500' }}>
                        {isFull ? '已满' : '报名'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ marginTop: '6px' }}>
                    <Text style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {act.participants}/{act.maxParticipants || '∞'}人已报名
                    </Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <View style={{ height: '100vh', position: 'relative', backgroundColor: '#F8FAFC' }}>
      <ScrollView
        scrollY
        showScrollbar
        style={{ height: '100vh' }}
      >
        {/* 鎼滅储鏍?- 椤甸潰鏈€椤堕儴 */}
        <View
          onClick={handleSearch}
          style={{
            margin: '10px 16px 4px',
            padding: '10px 14px',
            backgroundColor: '#FFF',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #E2E8F0'
          }}
        >
          <Text style={{ fontSize: '16px' }}>馃攳</Text>
          <Text style={{ fontSize: '14px', color: '#94A3B8', flex: 1 }}>
            鎼滅储璇剧▼銆佹妧鑳芥垨鍚屽...
          </Text>
        </View>

        {/* 椤堕儴涓夊ぇ Tab */}
        <View
          style={{
            display: 'flex',
            backgroundColor: '#FFF',
            padding: '8px 16px',
            gap: '0',
            borderBottom: '1px solid #E2E8F0',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          {TABS.map((tab, i) => (
            <View
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1,
                padding: '8px 0',
                textAlign: 'center',
                fontSize: '15px',
                fontWeight: activeTab === i ? '600' : '400',
                color: activeTab === i ? '#2563EB' : '#64748B',
                borderBottom:
                  activeTab === i
                    ? '2px solid #2563EB'
                    : '2px solid transparent'
              }}
            >
              {tab}
            </View>
          ))}
        </View>

        {/* 鍐呭鍖哄煙 */}
        {activeTab === 0 && renderSkillExchange()}
        {activeTab === 1 && renderInterestPartners()}
        {activeTab === 2 && renderActivities()}
      </ScrollView>

      {/* 鎮诞鍙戝竷鎸夐挳 */}
      <View
        onClick={handlePublish}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
          zIndex: 100
        }}
      >
        <Text style={{ fontSize: '28px', color: '#FFF', lineHeight: '28px' }}>
          +
        </Text>
      </View>
    </View>
  )
}
