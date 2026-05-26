import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import './index.scss'

export default function Verify() {
  const [identityType, setIdentityType] = useState<'student' | 'teacher'>('student')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'face'>('email')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const getEmailDomain = () => identityType === 'student' ? 'zju.edu.cn' : 'zju.edu.cn'

  const handleSendCode = () => {
    if (!email.includes('@')) { Taro.showToast({ title: 'Enter valid email', icon: 'none' }); return }
    if (!email.endsWith('@' + getEmailDomain())) { Taro.showToast({ title: 'Use campus email', icon: 'none' }); return }
    setCodeSent(true)
    setStep('code')
    let remaining = 60
    setCountdown(remaining)
    const timer = setInterval(() => { remaining--; setCountdown(remaining); if (remaining <= 0) { clearInterval(timer); setCodeSent(false) } }, 1000)
  }

  const handleVerifyCode = () => {
    if (!code || code.length < 4) { Taro.showToast({ title: 'Enter verification code', icon: 'none' }); return }
    Taro.showToast({ title: 'Face verification required', icon: 'none' })
    setStep('face')
  }

  const startFaceVerify = () => {
    Taro.showToast({ title: 'Verification submitted', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 2000)
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <View style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#FFF', borderBottom: '1px solid #F1F5F9' }}>
        <Text onClick={() => Taro.navigateBack()} style={{ fontSize: '20px', color: '#64748B' }}>Back</Text>
        <Text style={{ fontSize: '17px', fontWeight: '600', color: '#1E293B' }}>Identity Verification</Text>
      </View>

      <View style={{ padding: '16px' }}>
        {step === 'email' && (
          <View>
            <View style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <View onClick={() => setIdentityType('student')}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: identityType === 'student' ? '#2563EB' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '13px', fontWeight: '600', color: identityType === 'student' ? '#FFF' : '#64748B' }}>Student</Text>
              </View>
              <View onClick={() => setIdentityType('teacher')}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: identityType === 'teacher' ? '#2563EB' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '13px', fontWeight: '600', color: identityType === 'teacher' ? '#FFF' : '#64748B' }}>Teacher</Text>
              </View>
            </View>
            <View style={{ padding: '14px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <Text style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Campus Email</Text>
              <Input
                placeholder={'yourname@' + getEmailDomain()}
                value={email}
                onInput={(e) => setEmail(e.detail.value)}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '14px', border: '1px solid #E2E8F0' }}
              />
              <View onClick={handleSendCode}
                style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#FFF' }}>Send Code</Text>
              </View>
            </View>
          </View>
        )}

        {step === 'code' && (
          <View style={{ padding: '14px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <Text style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Code sent to {email}</Text>
            <Input
              placeholder="Enter code"
              value={code}
              onInput={(e) => setCode(e.detail.value)}
              maxlength={6}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '14px', border: '1px solid #E2E8F0' }}
            />
            <View onClick={handleVerifyCode}
              style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#FFF' }}>Verify</Text>
            </View>
            {countdown > 0 && <Text style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px', textAlign: 'center' }}>Resend in {countdown}s</Text>}
          </View>
        )}

        {step === 'face' && (
          <View style={{ padding: '24px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: '32px', marginBottom: '12px' }}>Face</Text>
            <Text style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', marginBottom: '16px' }}>Face verification needed. Position your face in the frame.</Text>
            <View onClick={startFaceVerify}
              style={{ padding: '12px 40px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#FFF' }}>Start Verification</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
