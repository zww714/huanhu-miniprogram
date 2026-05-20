import Taro from '@tarojs/taro'

const STORAGE_KEY = 'browseHistory'
const MAX_ITEMS = 100

export type BrowseItem = {
  id: string
  type: 'post' | 'skill' | 'user'
  title: string
  subtitle?: string
  timestamp: number
}

export function recordBrowse(item: Omit<BrowseItem, 'timestamp'>) {
  const history = getBrowseHistory()
  const filtered = history.filter((h) => !(h.id === item.id && h.type === item.type))
  filtered.unshift({ ...item, timestamp: Date.now() })
  const trimmed = filtered.slice(0, MAX_ITEMS)
  Taro.setStorageSync(STORAGE_KEY, trimmed)
}

export function getBrowseHistory(): BrowseItem[] {
  return Taro.getStorageSync(STORAGE_KEY) || []
}

export function clearBrowseHistory() {
  Taro.removeStorageSync(STORAGE_KEY)
}
