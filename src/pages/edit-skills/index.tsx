import { useEffect, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Input, Text, Textarea, View } from '@tarojs/components'
import { MY_LEARN_WANTS } from '../../utils/mock'
import { createSkill, deleteSkill, getMySkills, updateSkill } from '../../utils/api'
import './index.css'

type EditType = 'can' | 'want'
type Visibility = 'public' | 'private'

export default function EditSkills() {
  const [type, setType] = useState<EditType>('can')
  const [skills, setSkills] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [name, setName] = useState('')
  const [intro, setIntro] = useState('')
  const [level, setLevel] = useState(3)
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('技能')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [loading, setLoading] = useState(false)

  useLoad((options) => {
    setType(options?.type === 'want' ? 'want' : 'can')
    if (options?.skillId) setSelectedId(String(options.skillId))
  })

  const loadSkills = () => {
    getMySkills()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setSkills(list)
        if (selectedId) {
          const current = list.find((item) => item.id === selectedId || item._id === selectedId)
          if (current) fillForm(current)
        }
      })
      .catch((e) => console.warn('[EditSkills] getMySkills failed', e))
  }

  useEffect(() => {
    loadSkills()
  }, [selectedId])

  const fillForm = (skill: any) => {
    setSelectedId(skill.id || skill._id || '')
    setName(skill.name || '')
    setIntro(skill.intro || skill.desc || '')
    setLevel(Number(skill.level || 3))
    setTags((skill.tags || []).join('、'))
    setCategory(skill.category || '技能')
    setVisibility(skill.visibility === 'private' ? 'private' : 'public')
  }

  const resetForm = () => {
    setSelectedId('')
    setName('')
    setIntro('')
    setLevel(3)
    setTags('')
    setCategory('技能')
    setVisibility('public')
  }

  const save = async () => {
    const nextName = name.trim()
    if (!nextName) {
      Taro.showToast({ title: '请输入技能名称', icon: 'none' })
      return
    }
    const payload = {
      name: nextName,
      level,
      intro: intro.trim(),
      tags: tags.split(/[、,\s]+/).map((item) => item.trim()).filter(Boolean),
      category: category.trim() || '技能',
      visibility,
    }

    setLoading(true)
    try {
      if (selectedId) {
        await updateSkill({ skillId: selectedId, skill: payload })
        Taro.showToast({ title: '已保存', icon: 'success' })
      } else {
        await createSkill(payload)
        Taro.showToast({ title: '已添加', icon: 'success' })
      }
      resetForm()
      loadSkills()
    } catch (e) {
      console.warn('[EditSkills] save failed', e)
      Taro.showToast({ title: '已保存到本地', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const remove = () => {
    if (!selectedId) return
    Taro.showModal({
      title: '删除技能',
      content: '删除后将不再展示该技能，确定删除吗？',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: async ({ confirm }) => {
        if (!confirm) return
        await deleteSkill({ skillId: selectedId })
        Taro.showToast({ title: '已删除', icon: 'success' })
        resetForm()
        loadSkills()
      },
    })
  }

  const current = type === 'can' ? skills : MY_LEARN_WANTS.map((item) => ({ name: item.name }))

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '16px', boxSizing: 'border-box' }}>
      <View style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {(['can', 'want'] as const).map((item) => (
          <View key={item} onClick={() => setType(item)} style={{ flex: 1, padding: '12px 0', borderRadius: '10px', backgroundColor: type === item ? '#2563EB' : '#FFF', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <Text style={{ fontSize: '15px', color: type === item ? '#FFF' : '#64748B', fontWeight: '600' }}>{item === 'can' ? '我会' : '我想学'}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{type === 'can' ? '已有技能' : '已有想学内容'}</Text>
      <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', marginBottom: '18px' }}>
        {current.length ? current.map((item: any) => (
          <View key={item.id || item._id || item.name} onClick={() => type === 'can' ? fillForm(item) : setName(item.name)} style={{ padding: '6px 12px', borderRadius: '999px', backgroundColor: selectedId && (item.id === selectedId || item._id === selectedId) ? '#2563EB' : '#EFF6FF' }}>
            <Text style={{ fontSize: '13px', color: selectedId && (item.id === selectedId || item._id === selectedId) ? '#FFF' : '#2563EB' }}>{item.name}</Text>
          </View>
        )) : (
          <Text style={{ fontSize: '13px', color: '#94A3B8' }}>你还没有添加技能，去添加一个你擅长的技能吧</Text>
        )}
      </View>

      <View style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '10px 12px', marginBottom: '14px' }}>
        <Input value={name} placeholder={type === 'can' ? '输入你会的技能' : '输入你想学的技能'} onInput={(e) => setName(String(e.detail.value || ''))} style={{ fontSize: '14px' }} />
      </View>

      {type === 'can' && (
        <>
          <View style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <View key={item} onClick={() => setLevel(item)} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: level === item ? '#2563EB' : '#FFF', border: '1px solid #E2E8F0' }}>
                <Text style={{ fontSize: '13px', color: level === item ? '#FFF' : '#64748B', fontWeight: '600' }}>Lv.{item}</Text>
              </View>
            ))}
          </View>
          <View style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '10px 12px', marginBottom: '14px' }}>
            <Input value={category} placeholder='技能分类，例如 编程、语言、设计' onInput={(e) => setCategory(String(e.detail.value || ''))} style={{ fontSize: '14px' }} />
          </View>
          <View style={{ backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '10px 12px', marginBottom: '14px' }}>
            <Input value={tags} placeholder='标签，用顿号或空格分隔' onInput={(e) => setTags(String(e.detail.value || ''))} style={{ fontSize: '14px' }} />
          </View>
          <View style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {(['public', 'private'] as const).map((item) => (
              <View key={item} onClick={() => setVisibility(item)} style={{ flex: 1, padding: '10px 0', borderRadius: '10px', textAlign: 'center', backgroundColor: visibility === item ? '#EFF6FF' : '#FFF', border: visibility === item ? '1px solid #2563EB' : '1px solid #E2E8F0' }}>
                <Text style={{ color: visibility === item ? '#2563EB' : '#64748B', fontSize: '13px', fontWeight: '600' }}>{item === 'public' ? '公开展示' : '仅自己可见'}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Textarea value={intro} placeholder='补充说明' onInput={(e) => setIntro(String(e.detail.value || ''))} style={{ width: '100%', height: '120px', boxSizing: 'border-box', backgroundColor: '#FFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px', fontSize: '14px' }} />

      <Button loading={loading} onClick={save} style={{ marginTop: '24px', backgroundColor: '#2563EB', color: '#FFF', borderRadius: '10px', fontSize: '15px' }}>{selectedId ? '保存修改' : '添加技能'}</Button>
      {!!selectedId && (
        <Button onClick={remove} style={{ marginTop: '12px', backgroundColor: '#FFF', color: '#EF4444', borderRadius: '10px', fontSize: '15px', border: '1px solid #FECACA' }}>删除技能</Button>
      )}
      {!!selectedId && (
        <Button onClick={resetForm} style={{ marginTop: '12px', backgroundColor: '#FFF', color: '#64748B', borderRadius: '10px', fontSize: '15px', border: '1px solid #E2E8F0' }}>新建技能</Button>
      )}
    </View>
  )
}
