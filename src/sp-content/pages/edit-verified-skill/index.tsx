import { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Image, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import './index.scss'

export default function EditVerifiedSkill() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('编程')
  const [level, setLevel] = useState(3)
  const [desc, setDesc] = useState('')
  const [certName, setCertName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [certNo, setCertNo] = useState('')
  const [verifyUrl, setVerifyUrl] = useState('')
  const [inquiryMethod, setInquiryMethod] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  useLoad(() => {})

  const goBack = () => Taro.navigateBack()

  const handleAddImage = () => {
    Taro.chooseImage({
      count: 3 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setImages((prev) => [...prev, ...res.tempFilePaths].slice(0, 3))
      },
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入技能名称', icon: 'none' })
      return
    }
    if (!certName.trim() || !certNo.trim()) {
      Taro.showToast({ title: '请填写证书名称和编号', icon: 'none' })
      return
    }
    if (!verifyUrl.trim()) {
      Taro.showToast({ title: '请填写官方验证入口链接', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // 模拟提交成功
      await new Promise((r) => setTimeout(r, 800))
      Taro.showToast({ title: '提交成功，等待审核', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch (e) {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const categories = ['编程', '设计', '语言', '音乐', '摄影', '运动', '学术', '其他']

  return (
    <View className='evs-page'>
      {/* 顶部导航 */}
      <View className='evs-nav'>
        <Text className='nav-back' onClick={goBack}>‹ 返回</Text>
        <Text className='nav-title'>提交认证技能</Text>
        <View style={{ width: '80rpx' }} />
      </View>

      <View className='evs-scroll'>
        <View className='evs-section'>
          <Text className='evs-section-title'>技能信息</Text>

          <View className='evs-field'>
            <Text className='evs-label'>技能名称 <Text className='required'>*</Text></Text>
            <View className='evs-input-wrap'>
              <Input value={name} placeholder='如：Python 编程、雅思 7.0' onInput={(e) => setName(String(e.detail.value))} className='evs-input' />
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>技能分类</Text>
            <View className='evs-input-wrap'>
              <Picker mode='selector' range={categories} value={categories.indexOf(category)} onChange={(e) => setCategory(categories[Number(e.detail.value)])}>
                <Text className='evs-picker-value'>{category} ›</Text>
              </Picker>
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>技能等级</Text>
            <View className='evs-level-row'>
              {[1, 2, 3, 4, 5].map((lv) => (
                <View
                  key={lv}
                  className={`evs-level-btn ${level === lv ? 'active' : ''}`}
                  onClick={() => setLevel(lv)}
                >
                  <Text>Lv.{lv}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>技能描述</Text>
            <View className='evs-input-wrap'>
              <Textarea value={desc} placeholder='补充说明你的技能水平、相关经历等' onInput={(e) => setDesc(String(e.detail.value))} className='evs-textarea' />
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>标签</Text>
            <View className='evs-input-wrap'>
              <Input value={tags} placeholder='用顿号分隔，如：Python、数据分析' onInput={(e) => setTags(String(e.detail.value))} className='evs-input' />
            </View>
          </View>
        </View>

        <View className='evs-info-card'>
          <Text className='evs-info-icon'>💡</Text>
          <Text className='evs-info-text'>
            认证技能需要提供证明材料，平台会通过官方验证入口核实你的证书真伪。通过认证后，技能将显示"已验证"标识。
          </Text>
        </View>

        <View className='evs-section'>
          <Text className='evs-section-title'>认证材料</Text>

          <View className='evs-field'>
            <Text className='evs-label'>证书/证明名称 <Text className='required'>*</Text></Text>
            <View className='evs-input-wrap'>
              <Input value={certName} placeholder='如：Python技术能力中级认证' onInput={(e) => setCertName(String(e.detail.value))} className='evs-input' />
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>发证机构</Text>
            <View className='evs-input-wrap'>
              <Input value={issuer} placeholder='如：中国电子学会、雅思考试中心' onInput={(e) => setIssuer(String(e.detail.value))} className='evs-input' />
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>证书编号 <Text className='required'>*</Text></Text>
            <View className='evs-input-wrap'>
              <Input value={certNo} placeholder='如：CEP20250228' onInput={(e) => setCertNo(String(e.detail.value))} className='evs-input' />
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>官方验证入口 <Text className='required'>*</Text></Text>
            <View className='evs-input-wrap'>
              <Input value={verifyUrl} placeholder='https://... 验证证书真伪的官网地址' onInput={(e) => setVerifyUrl(String(e.detail.value))} className='evs-input' type='text' />
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>验证方式说明</Text>
            <View className='evs-input-wrap'>
              <Input value={inquiryMethod} placeholder='如：首页→证书查询→输入证书编号' onInput={(e) => setInquiryMethod(String(e.detail.value))} className='evs-input' />
            </View>
          </View>

          <View className='evs-field'>
            <Text className='evs-label'>附件图片（最多3张）</Text>
            <View className='evs-image-grid'>
              {images.map((src, i) => (
                <View key={i} className='evs-image-item'>
                  <Image className='evs-image' src={src} mode='aspectFill' />
                  <Text className='evs-image-remove' onClick={() => handleRemoveImage(i)}>×</Text>
                </View>
              ))}
              {images.length < 3 && (
                <View className='evs-image-add' onClick={handleAddImage}>
                  <Text className='evs-add-icon'>+</Text>
                  <Text className='evs-add-text'>上传</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className='evs-tips'>
          <Text className='evs-tips-title'>验证流程说明</Text>
          <View className='evs-tip-item'>
            <Text className='evs-tip-num'>1</Text>
            <Text className='evs-tip-text'>填写技能信息和证书材料</Text>
          </View>
          <View className='evs-tip-item'>
            <Text className='evs-tip-num'>2</Text>
            <Text className='evs-tip-text'>平台审核员登录官方验证入口核实证书真伪</Text>
          </View>
          <View className='evs-tip-item'>
            <Text className='evs-tip-num'>3</Text>
            <Text className='evs-tip-text'>审核通过后，技能卡片显示"已验证"标识，审核结果会通知你</Text>
          </View>
        </View>

        <Button loading={loading} className='evs-submit-btn' onClick={handleSubmit}>
          提交审核
        </Button>

        <View className='evs-bottom-space' />
      </View>
    </View>
  )
}
