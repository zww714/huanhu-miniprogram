import { PropsWithChildren } from 'react'
import { useDidShow, useLaunch } from '@tarojs/taro'
import { updateMessageTabUnread } from './utils/notifications'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    updateMessageTabUnread()
  })

  useDidShow(() => {
    updateMessageTabUnread()
  })

  return children
}

export default App
