import { memo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { getGenderSymbol, getGenderTone } from '../../../utils/gender'
import { TODAY_RECOMMENDATIONS, HOT_TOPICS } from '../utils/constants'
import { isRenderableImage, firstChar } from '../utils/helpers'

interface DetailPopupProps {
  detailPopup: any
  onClose: () => void
  onExpandDetail: (data: any) => void
  onChat: (user: { id?: string | number; _id?: string; name?: string }, category: string) => void
}

const DetailPopup = memo(function DetailPopup({ detailPopup, onClose, onExpandDetail, onChat }: DetailPopupProps) {
  if (!detailPopup) return null

  const user = detailPopup.user
  const list = detailPopup.type === 'recommendation-list' ? TODAY_RECOMMENDATIONS : detailPopup.type === 'topic-list' ? HOT_TOPICS : []

  return (
    <View className="home-modal-mask" onClick={onClose}>
      <View className="home-detail-panel" onClick={(event) => event.stopPropagation()}>
        <View className="home-detail-head">
          <Text className="home-detail-title">{detailPopup.title}</Text>
          <Text className="home-detail-close" onClick={onClose}>&times;</Text>
        </View>
        <Text className="home-detail-desc">{detailPopup.detail}</Text>
        {user ? (
          <View className="home-detail-user" onClick={() => onChat(user, detailPopup.type === 'topic' ? '校园热议' : '今日推荐')}>
            <View className="home-detail-avatar">
              {isRenderableImage(user.avatar) ? <Image className="home-detail-avatar-img" src={user.avatar} mode="aspectFill" lazyLoad /> : <Text>{firstChar(user.name)}</Text>}
            </View>
            <View className="home-detail-user-main">
              <View className="home-detail-name-row">
                <Text className="home-detail-user-name">{user.name}</Text>
                {getGenderSymbol(user) ? <Text className={'home-gender home-gender--' + getGenderTone(user)}>{getGenderSymbol(user)}</Text> : null}
              </View>
              <Text className="home-detail-user-meta">{user.college} · {user.grade}</Text>
            </View>
            <Text className="home-detail-chat">聊天</Text>
          </View>
        ) : null}
        {list.length ? (
          <View className="home-detail-list">
            {list.map((item) => (
              <View className="home-detail-list-item" key={item.id} onClick={() => onExpandDetail({ type: detailPopup.type === 'topic-list' ? 'topic' : 'recommendation', ...item })}>
                <Text className="home-detail-list-title">{item.title}</Text>
                <Text className="home-detail-list-meta">{'stats' in item ? item.stats : item.desc}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  )
})

export default DetailPopup
