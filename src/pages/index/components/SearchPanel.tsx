/**
 * 首页搜索面板组件
 */
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import SearchBar from '../../../components/common/SearchBar'
import { SEARCH_SUGGESTIONS } from '../home-utils'

interface Props {
  open: boolean
  searchDraft: string
  recentSearches: string[]
  onClose: () => void
  onDraftChange: (val: string) => void
  onSubmit: (val?: string) => void
}

export default function SearchPanel({ open, searchDraft, recentSearches, onClose, onDraftChange, onSubmit }: Props) {
  if (!open) return null

  const words = recentSearches.length ? recentSearches : SEARCH_SUGGESTIONS

  return (
    <View className='home-modal-mask' onClick={onClose}>
      <View className='home-search-panel' onClick={(e) => e.stopPropagation()}>
        <View className='home-search-panel-head'>
          <Text className='home-search-panel-title'>搜索</Text>
          <Text className='home-search-panel-close' onClick={onClose}>关闭</Text>
        </View>
        <SearchBar
          className='home-search-panel-input'
          value={searchDraft}
          placeholder='输入技能、搭子、活动或帖子'
          onInput={onDraftChange}
          onConfirm={onSubmit}
        />
        <View className='home-search-suggest-head'>
          <Text>{recentSearches.length ? '最近搜索' : '推荐搜索'}</Text>
        </View>
        <View className='home-search-suggest-list'>
          {words.map((word) => (
            <View className='home-search-suggest-item' key={word} onClick={() => onSubmit(word)}>
              <Text>{word}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
