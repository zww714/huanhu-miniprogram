import { useEffect, useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Input, ScrollView, Text, View } from '@tarojs/components'
import { getPosts } from '../../utils/api'
import './index.css'

const CATEGORIES = ['全部', '科研', '升学', '兴趣', '工作']
const CAT_ICONS: Record<string, string> = { 科研: '🔬', 升学: '🎓', 兴趣: '🎯', 工作: '💼' }

type Post = {
  id?: string
  _id?: string
  title: string
  excerpt?: string
  content?: string
  cover?: string
  categoryTag?: string
  mainCategory?: string
  tags?: string[]
  author?: {
    name: string
    college?: string
    grade?: string
  }
  likes?: number
  comments?: number
}

function getInitials(name: string): string {
  return name.length > 0 ? name[0] : '?'
}

function getAvatarBg(name: string): string {
  const colors = ['#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#D97706', '#059669', '#0891B2']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getRecordId(post: Post) {
  return String(post.id || post._id || post.title)
}

function isImageCover(cover?: string) {
  return !!cover && !cover.startsWith('linear-gradient')
}

function mergePendingPost(posts: Post[]) {
  const pending = Taro.getStorageSync('pendingPost')
  if (!pending?.title) return posts

  const pendingId = pending.id || pending._id || `pending_${pending.title}`
  const exists = posts.some((post) => (post.id || post._id || post.title) === pendingId)
  if (exists) return posts

  return [{ ...pending, id: pendingId }, ...posts]
}

function getAuthor(post: Post) {
  return post.author || {
    name: '陈同学',
    college: '浙江大学',
    grade: '在读',
  }
}

export default function Discover() {
  const [activeCat, setActiveCat] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useLoad(() => {
    const pending = Taro.getStorageSync('pendingPost')
    if (pending?.title) {
      setPosts((current) => mergePendingPost(current))
    }
  })

  useEffect(() => {
    let alive = true

    async function loadPosts() {
      setLoading(true)
      try {
        const data = await getPosts({ page: 0 })
        if (!alive) return
        setPosts(mergePendingPost(data || []))
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadPosts()
    return () => {
      alive = false
    }
  }, [])

  const handlePostClick = (id: string) => Taro.navigateTo({ url: `/pages/post-detail/index?id=${id}` })
  const handleUserClick = (name: string) => Taro.navigateTo({ url: `/pages/user-detail/index?name=${encodeURIComponent(name)}` })
  const handlePublish = () => Taro.navigateTo({ url: '/pages/publish/index?mode=post' })

  const filtered = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    const category = CATEGORIES[activeCat]
    return posts.filter((post) => {
      const author = getAuthor(post)
      const matchesCategory = activeCat === 0 ? true : post.mainCategory === category
      const searchable = [
        post.title,
        post.excerpt,
        post.content,
        post.categoryTag,
        post.mainCategory,
        author.name,
        author.college,
        author.grade,
        ...(post.tags || []),
      ].filter(Boolean).join(' ').toLowerCase()
      return matchesCategory && (!keyword || searchable.includes(keyword))
    })
  }, [activeCat, posts, searchQuery])

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <View style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#FFF' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px' }}>
          <Text style={{ fontSize: '20px', fontWeight: '700', color: '#2563EB' }}>发现</Text>
          <View onClick={() => Taro.showToast({ title: '通知', icon: 'none' })}>
            <Text style={{ fontSize: '20px' }}>🔔</Text>
          </View>
        </View>

        <View style={{ margin: '0 16px 8px', padding: '8px 14px', backgroundColor: '#F1F5F9', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text style={{ fontSize: '14px', color: '#94A3B8' }}>🔍</Text>
          <Input
            value={searchQuery}
            placeholder='搜索帖子、同学或兴趣标签...'
            confirmType='search'
            onInput={(event) => setSearchQuery(String(event.detail.value || ''))}
            style={{ flex: 1, height: '22px', fontSize: '14px', color: '#1E293B' }}
            placeholderStyle='color: #94A3B8; font-size: 14px;'
          />
        </View>

        <ScrollView scrollX enableFlex style={{ whiteSpace: 'nowrap' }}>
          <View style={{ padding: '0 16px 8px', display: 'flex', gap: '8px' }}>
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

      <View style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {!filtered.length && (
          <View style={{ padding: '40px 0', textAlign: 'center' }}>
            <Text style={{ fontSize: '13px', color: '#94A3B8' }}>{loading ? '正在加载帖子...' : '暂无帖子'}</Text>
          </View>
        )}
        {filtered.map((post) => {
          const author = getAuthor(post)
          return (
          <View key={getRecordId(post)} onClick={() => handlePostClick(getRecordId(post))}
            style={{ backgroundColor: '#FFF', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px 0' }}>
              <View onClick={(e) => { e.stopPropagation(); handleUserClick(author.name) }} style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: getAvatarBg(author.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#FFF' }}>
                  {getInitials(author.name)}
                </Text>
              </View>
              <View onClick={(e) => { e.stopPropagation(); handleUserClick(author.name) }} style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                  {author.name}
                </Text>
                <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '1px' }}>
                  {author.college || '浙江大学'} · {author.grade || '在读'}
                </Text>
              </View>
            </View>

            <View style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px 0', flexWrap: 'nowrap' }}>
              <View style={{ padding: '2px 8px', backgroundColor: '#EFF6FF', borderRadius: '4px' }}>
                <Text style={{ fontSize: '11px', color: '#2563EB' }}>{post.categoryTag || `${post.mainCategory || '兴趣'} · 动态`}</Text>
              </View>
              {(post.tags || []).slice(0, 3).map((tag) => (
                <View key={tag} style={{ padding: '2px 8px', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>
                  <Text style={{ fontSize: '11px', color: '#64748B' }}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={{ padding: '8px 16px 0' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', lineHeight: '1.4' }}>
                {post.title}
              </Text>
              <Text style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', marginTop: '4px' }} numberOfLines={2}>
                {post.excerpt || post.content}
              </Text>
            </View>

            {post.cover ? (
              isImageCover(post.cover) ? (
                <Image
                  src={post.cover}
                  mode="aspectFill"
                  style={{ margin: '10px 16px 0', width: 'calc(100% - 32px)', height: '140px', borderRadius: '10px', backgroundColor: '#E2E8F0' }}
                />
              ) : (
                <View style={{
                  margin: '10px 16px 0', height: '140px', borderRadius: '10px',
                  background: post.cover, display: 'flex', alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ fontSize: '32px', opacity: 0.6 }}>
                    {CAT_ICONS[post.mainCategory || '兴趣'] || '🎯'}
                  </Text>
                </View>
              )
            ) : null}

            <View style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px 14px', marginTop: '4px'
            }}>
              <View style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Text style={{ fontSize: '14px' }}>♥</Text>
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: '#EF4444' }}>{post.likes || 0}</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Text style={{ fontSize: '14px' }}>💬</Text>
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: '#2563EB' }}>{post.comments || 0}</Text>
                </View>
              </View>
              <View onClick={(e) => { e.stopPropagation(); handlePostClick(getRecordId(post)) }}>
                <Text style={{ fontSize: '12px', color: '#2563EB', fontWeight: '500' }}>查看详情 →</Text>
              </View>
            </View>
          </View>
          )
        })}
      </View>

      <View onClick={handlePublish}
        style={{
          position: 'fixed', right: '20px', bottom: '90px', width: '52px', height: '52px',
          borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center',
          justifyContent: 'center', border: '1px solid #2563EB', zIndex: 100
        }}>
        <Text style={{ fontSize: '24px', color: '#FFF' }}>+</Text>
      </View>
    </View>
  )
}
