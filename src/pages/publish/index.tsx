import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components'
import './index.css'

const PREDEFINED_TAGS = ['AI', 'Tech', 'Coding', 'Design', 'Sports', 'Music']
const VISIBILITY = ['Public', 'Campus Only', 'Private']

export default function Publish() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState('Public')
  const [images, setImages] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handlePublish = () => {
    if (!title.trim()) {
      Taro.showToast({ title: 'Title required', icon: 'none' })
      return
    }
    Taro.showToast({ title: 'Posted!', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 1500)
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: '16px', color: '#64748B' }}>Cancel</Text>
        <Text style={{ fontSize: '17px', fontWeight: '600', color: '#1E293B' }}>New Post</Text>
        <Text onClick={handlePublish} style={{ fontSize: '16px', fontWeight: '600', color: '#2563EB' }}>Publish</Text>
      </View>

      <ScrollView>
        <View style={{ padding: '16px', paddingBottom: '100px' }}>
          <Input
            placeholder="Post title"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            style={{ width: '100%', padding: '12px 14px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '15px', color: '#1E293B', marginBottom: '12px' }}
          />

          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            style={{ width: '100%', height: '180px', padding: '12px 14px', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#1E293B', marginBottom: '12px' }}
          />

          <View style={{ marginBottom: '14px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Tags</Text>
            <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PREDEFINED_TAGS.map((tag) => (
                <View key={tag} onClick={() => toggleTag(tag)}
                  style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: selectedTags.includes(tag) ? '600' : '400', backgroundColor: selectedTags.includes(tag) ? '#2563EB' : '#F1F5F9', color: selectedTags.includes(tag) ? '#FFF' : '#64748B' }}>
                  {tag}
                </View>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>Visibility</Text>
            <View style={{ display: 'flex', gap: '8px' }}>
              {VISIBILITY.map((v) => (
                <View key={v} onClick={() => setVisibility(v)}
                  style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: visibility === v ? '600' : '400', backgroundColor: visibility === v ? '#2563EB' : '#F1F5F9', color: visibility === v ? '#FFF' : '#64748B' }}>
                  {v}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
