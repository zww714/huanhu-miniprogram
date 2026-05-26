/**
 * 首页详情弹窗组件
 */
import { Image, View, Text } from '@tarojs/components'
import { firstChar, isRenderableImage } from '../home-utils'
import { getGenderSymbol, getGenderTone } from '../../../utils/gender'

interface PopupItem {
  type?: string
  title?: string
  detail?: string
  id?: string
  user?: { name?: string; avatar?: string; college?: string; grade?: string; [key: string]: any }
  stats?: string
  desc?: string
  [key: string]: any
}

interface Props {
  popup: PopupItem | null
  recommendations: PopupItem[]
  hotTopics: PopupItem[]
  onClose: () => void
  onChatOpen: (user: any, category?: string) => void
  onItemClick: (item: PopupItem, listType: string) => void
}

export default function DetailPopup({ popup, recommendations, hotTopics, onClose, onChatOpen, onItemClick }: Props) {
  if (!popup) return null

  const user = popup.user
  const list: PopupItem[] =
    popup.type === 'recommendation-list' ? recommendations :
    popup.type === 'topic-list' ? hotTopics : []

  return (
    <View className='home-modal-mask' onClick={onClose}>
      <View className='home-detail-panel' onClick={(e) => e.stopPropagation()}>
        <View className='home-detail-head'>
          <Text className='home-detail-title'>{popup.title}</Text>
          <Text className='home-detail-close' onClick={onClose}>&times;</Text>
        </View>
        <Text className='home-detail-desc'>{popup.detail}</Text>
        {user ? (
          <View className='home-detail-user' onClick={() => onChatOpen(user, popup.type === 'topic' ? '校园热议' : '今日推荐')}>
            <View className='home-detail-avatar'>
              {isRenderableImage(user.avatar)
                ? <Image className='home-detail-avatar-img' src={user.avatar} mode='aspectFill' />
                : <Text>{firstChar(user.name)}</Text>
              }
            </View>
            <View className='home-detail-user-main'>
              <View className='home-detail-name-row'>
                <Text className='home-detail-user-name'>{user.name}</Text>
                {getGenderSymbol(user as any)
                  ? <Text className={`home-gender home-gender--${getGenderTone(user as any)}`}>{getGenderSymbol(user as any)}</Text>
                  : null
                }
              </View>
              <Text className='home-detail-user-meta'>{user.college} &middot; {user.grade}</Text>
            </View>
            <Text className='home-detail-chat'>聊天</Text>
          </View>
        ) : null}
        {list.length ? (
          <View className='home-detail-list'>
            {list.map((item) => (
              <View className='home-detail-list-item' key={item.id} onClick={() => onItemClick(item, popup.type || '')}>
                <Text className='home-detail-list-title'>{item.title}</Text>
                <Text className='home-detail-list-meta'>{'stats' in item ? item.stats : item.desc}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  )
}
