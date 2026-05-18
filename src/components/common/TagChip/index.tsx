import { Text, View } from '@tarojs/components'
import type { CSSProperties } from 'react'
import './index.scss'

type TagChipType = 'default' | 'primary' | 'success' | 'warning' | 'danger'

interface TagChipProps {
  text: string
  active?: boolean
  type?: TagChipType
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export default function TagChip({
  text,
  active = false,
  type = 'default',
  className = '',
  style,
  onClick,
}: TagChipProps) {
  return (
    <View
      className={`tag-chip tag-chip--${type} ${active ? 'tag-chip--active' : ''} ${className}`}
      style={style}
      onClick={onClick}
      hoverClass='tag-chip--pressed'
    >
      <Text className='tag-chip__text'>{text}</Text>
    </View>
  )
}
