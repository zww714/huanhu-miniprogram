import { Input, Text, View } from '@tarojs/components'
import type { CSSProperties } from 'react'
import './index.scss'

interface SearchBarProps {
  value?: string
  placeholder?: string
  readonly?: boolean
  className?: string
  style?: CSSProperties
  onInput?: (value: string) => void
  onConfirm?: (value: string) => void
  onClick?: () => void
}

export default function SearchBar({
  value = '',
  placeholder = '搜索技能、搭子、活动或帖子',
  readonly = false,
  className = '',
  style,
  onInput,
  onConfirm,
  onClick,
}: SearchBarProps) {
  return (
    <View className={`search-bar ${className}`} style={style} onClick={onClick}>
      <Text className='search-bar__icon'>⌕</Text>
      <Input
        className='search-bar__input'
        value={value}
        placeholder={placeholder}
        disabled={readonly}
        confirmType='search'
        onInput={(event) => {
          onInput?.(event.detail.value)
        }}
        onConfirm={(event) => {
          onConfirm?.(event.detail.value)
        }}
      />
    </View>
  )
}
