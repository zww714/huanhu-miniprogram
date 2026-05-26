import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Input, Text, Textarea, View } from '@tarojs/components'
import { MY_PROFILE } from '../../../utils/mock'
import { getCurrentUser, updateProfile } from '../../../api'
import './index.css'

type Gender = 'male' | 'female' | 'private'

const GENDER_OPTIONS: Array<{ label: string; value: Gender }> = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '不便透露', value: 'private' },
]

const PROFILE_STORAGE_KEY = 'profileDraft'

function getSavedProfile() {
  const saved = Taro.getStorageSync(PROFILE_STORAGE_KEY)
  return saved && typeof saved === 'object' ? saved : {}
}

export default function EditProfile() {
  const saved = getSavedProfile()
  const [nickname, setNickname] = useState(saved.nickname || saved.name || MY_PROFILE.name || '')
  const [gender, setGender] = useState<Gender>(saved.gender || MY_PROFILE.gender || 'private')
  const [college, setCollege] = useState(saved.college || MY_PROFILE.college || '')
  const [grade, setGrade] = useState(saved.grade || MY_PROFILE.grade || '')
  const [campus, setCampus] = useState(saved.campus || MY_PROFILE.campus || '')
  const [intro, setIntro] = useState(saved.intro || saved.bio || MY_PROFILE.bio || '')

  useEffect(() => {
    let alive = true
    getCurrentUser()
      .then((user) => {
        if (!alive || !user) return
        setNickname(user.name || user.nickname || '')
        setGender(user.gender || 'private')
        setCollege(user.college || '')
        setGrade(user.grade || '')
        setCampus(user.campus || '')
        setIntro(user.intro || user.bio || '')
      })
      .catch((e) => console.warn('[EditProfile] getCurrentUser failed, fallback to local', e))
    return () => { alive = false }
  }, [])

  const save = async () => {
    const nextNickname = nickname.trim()
    const nextCollege = college.trim()
    const nextGrade = grade.trim()
    const nextCampus = campus.trim()
    const nextIntro = intro.trim()

    if (!nextNickname) {
      Taro.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }
    if (nextIntro.length > 150) {
      Taro.showToast({ title: '个人介绍最多150字', icon: 'none' })
      return
    }

    const payload = {
      nickname: nextNickname,
      name: nextNickname,
      gender: gender || 'private',
      college: nextCollege,
      grade: nextGrade,
      campus: nextCampus,
      intro: nextIntro,
      bio: nextIntro,
    }

    Taro.setStorageSync(PROFILE_STORAGE_KEY, payload)
    try {
      await updateProfile({ profile: payload })
    } catch (e) {
      console.warn('[EditProfile] updateProfile failed, saved locally', e)
    }
    Taro.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 500)
  }

  const field = (label: string, value: string, setter: (value: string) => void, placeholder: string) => (
    <View className='form-field'>
      <Text className='field-label'>{label}</Text>
      <View className='input-wrap'>
        <Input
          value={value}
          placeholder={placeholder}
          onInput={(e) => setter(String(e.detail.value || ''))}
          className='text-input'
        />
      </View>
    </View>
  )

  return (
    <View className='edit-page'>
      {field('昵称', nickname, setNickname, '请输入昵称')}

      <View className='form-field'>
        <Text className='field-label'>性别</Text>
        <View className='gender-row'>
          {GENDER_OPTIONS.map((item) => (
            <View
              key={item.value}
              className={gender === item.value ? 'gender-option active' : 'gender-option'}
              onClick={() => setGender(item.value)}
            >
              <Text>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {field('学院', college, setCollege, '请输入学院')}
      {field('年级', grade, setGrade, '请输入年级')}
      {field('校区', campus, setCampus, '请输入校区，如紫金港')}

      <View className='form-field'>
        <View className='label-row'>
          <Text className='field-label'>个人介绍</Text>
          <Text className={intro.length > 150 ? 'count danger' : 'count'}>{intro.length}/150</Text>
        </View>
        <Textarea
          value={intro}
          maxlength={150}
          placeholder='介绍一下你自己'
          onInput={(e) => setIntro(String(e.detail.value || ''))}
          className='bio-input'
        />
      </View>

      <Button onClick={save} className='save-btn'>保存资料</Button>
    </View>
  )
}
