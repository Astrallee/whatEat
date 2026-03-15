import { supabase } from './supabase'

// ============================================
// 认证服务
// ============================================

export interface AuthState {
  user: {
    id: string
    phone?: string
    email?: string
  } | null
  isLoading: boolean
}

// 获取当前会话
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

// 获取当前用户
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

// 手机验证码登录
export async function loginWithPhone(phone: string) {
  try {
    // ====== 开发测试模式 ======
    // 如果是测试手机号，直接返回成功（用于开发测试）
    const TEST_PHONES = ['13800000000', '13900000000']
    if (TEST_PHONES.includes(phone)) {
      console.log('Test mode: simulating OTP send')
      return { success: true, autoConfirmed: false }
    }
    // ====== 开发测试模式结束 ======
    
    // 发送验证码
    const { error, data } = await supabase.auth.signInWithOtp({
      phone,
    })
    
    if (error) {
      console.error('Error sending OTP:', error)
      
      // 检查是否是测试模式错误
      if (error.message.includes('not supported') || error.message.includes('provider')) {
        return { success: false, error: '请在 Supabase 后台启用手机验证码登录' }
      }
      
      return { success: false, error: error.message }
    }
    
    // 检查是否自动确认（Supabase 测试模式）
    if (data?.user) {
      // 用户已自动登录（测试模式）
      console.log('Auto confirmed in test mode, user:', data.user)
      return { success: true, autoConfirmed: true }
    }
    
    return { success: true, autoConfirmed: false }
  } catch (err: any) {
    console.error('Exception sending OTP:', err)
    return { success: false, error: err.message || '发送失败，请重试' }
  }
}

// 验证验证码
export async function verifyOTP(phone: string, token: string) {
  // ====== 开发测试模式 ======
  const TEST_PHONES = ['13800000000', '13900000000']
  if (TEST_PHONES.includes(phone) && token === '123456') {
    console.log('Test mode: simulating OTP verification')
    // 在测试模式下，创建模拟用户并存储
    const testUserId = 'test-user-' + phone
    localStorage.setItem('testUserId', testUserId)
    localStorage.setItem('testUserPhone', phone)
    return { success: true, testMode: true, userId: testUserId }
  }
  // ====== 开发测试模式结束 ======
  
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })
  
  if (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}

// 邮箱密码登录（备用）
export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error('Error signing in:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}

// 注册（邮箱密码）
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  
  if (error) {
    console.error('Error signing up:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}

// 登出
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    return { success: false, error: error.message }
  }
  return { success: true }
}

// 监听认证状态变化
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
