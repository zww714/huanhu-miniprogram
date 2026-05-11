import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { MY_LEARN_WANTS, MY_PROFILE, MY_SKILLS, SKILL_ID_BY_NAME } from '../../utils/mock'
import './index.css'

export default function MySkills() {
  const goSkillDetail = (skillName: string) => {
    const skillId = SKILL_ID_BY_NAME[skillName] || encodeURIComponent(skillName)
    Taro.navigateTo({ url: `/pages/skill-detail/index?userId=${encodeURIComponent(MY_PROFILE.user_id)}&skillId=${encodeURIComponent(skillId)}` })
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '12px' }}>
      <View onClick={() => Taro.navigateTo({ url: '/pages/edit-skills/index?type=can' })} style={{ marginBottom: '12px', backgroundColor: '#2563EB', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
        <Text style={{ color: '#FFF', fontSize: '15px', fontWeight: '600' }}>编辑我会</Text>
      </View>
      {MY_SKILLS.map((skill) => (
        <View key={skill.name} onClick={() => goSkillDetail(skill.name)} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{skill.name}</Text>
            <Text style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>Lv.{skill.level}</Text>
          </View>
          <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', lineHeight: '20px' }}>{skill.desc}</Text>
        </View>
      ))}
      <View onClick={() => Taro.navigateTo({ url: '/pages/edit-skills/index?type=want' })} style={{ margin: '16px 0 10px', backgroundColor: '#FFF7ED', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
        <Text style={{ color: '#EA580C', fontSize: '15px', fontWeight: '600' }}>编辑我想学</Text>
      </View>
      {MY_LEARN_WANTS.map((item) => (
        <View key={item.name} style={{ backgroundColor: '#FFF', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #FED7AA' }}>
          <Text style={{ fontSize: '15px', fontWeight: '700', color: '#C2410C' }}>{item.name}</Text>
          <Text style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>{item.target}</Text>
        </View>
      ))}
    </View>
  )
}
