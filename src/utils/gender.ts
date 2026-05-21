type GenderLike = 'male' | 'female' | 'private' | '男' | '女' | string | undefined

type GenderSource = {
  gender?: GenderLike
  name?: string
  authorName?: string
  id?: string | number
  userId?: string | number
  authorId?: string | number
}

const GENDER_BY_NAME: Record<string, 'male' | 'female'> = {
  陈同学: 'male',
  张三: 'male',
  王同学: 'male',
  李学姐: 'female',
  小熊软糖: 'female',
  橘子汽水: 'female',
  陈思思: 'female',
  林晓晓: 'female',
  吴悦然: 'female',
  郑雅文: 'female',
  科研小达人: 'female',
  光影捕手: 'male',
  上岸锦鲤: 'female',
  实习记录员: 'male',
  前端小结: 'male',
}

const GENDER_BY_ID: Record<string, 'male' | 'female'> = {
  '10086': 'male',
  user_chen: 'male',
  u1: 'female',
  u_photo: 'male',
  u_math: 'female',
  u_career: 'male',
  u_frontend: 'male',
}

export function normalizeGender(value?: GenderLike): 'male' | 'female' | 'private' {
  if (value === 'male' || value === '男') return 'male'
  if (value === 'female' || value === '女') return 'female'
  return 'private'
}

export function getDisplayGender(source?: GenderSource | GenderLike): 'male' | 'female' | 'private' {
  if (!source) return 'private'
  if (typeof source === 'string') return normalizeGender(source)

  const direct = normalizeGender(source.gender)
  if (direct !== 'private') return direct

  const id = String(source.userId || source.authorId || source.id || '')
  if (id && GENDER_BY_ID[id]) return GENDER_BY_ID[id]

  const name = source.name || source.authorName || ''
  if (name && GENDER_BY_NAME[name]) return GENDER_BY_NAME[name]

  return 'private'
}

export function getGenderSymbol(source?: GenderSource | GenderLike) {
  const gender = getDisplayGender(source)
  if (gender === 'male') return '♂'
  if (gender === 'female') return '♀'
  return ''
}

export function getGenderTone(source?: GenderSource | GenderLike) {
  return getDisplayGender(source)
}
