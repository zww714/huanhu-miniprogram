import { Text, View } from '@tarojs/components'
import type { CSSProperties } from 'react'
import './index.scss'

interface FloatingPostButtonProps {
  onClick?: () => void
  className?: string
  style?: CSSProperties
}

export default function FloatingPostButton({
  onClick,
  className = '',
  style,
}: FloatingPostButtonProps) {
  return (
    <View
      className={`floating-post-button ${className}`}
      style={style}
      onClick={onClick}
      hoverClass='floating-post-button--pressed'
    >
      <Text className='floating-post-button__plus'>+</Text>
    </View>
  )
}
