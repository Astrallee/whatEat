import { supabase } from './supabase'

// 获取当前用户
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.log('No active session:', error.message)
      return null
    }
    return user
  } catch (e: any) {
    console.log('Error getting user:', e?.message || e)
    return null
  }
}

// 手机验证码登录
export async function loginWithPhone(phone: string) {
  try {
    // 发送验证码
    const { error, data } = await supabase.auth.signInWithOtp({
      phone,
    })
    
    if (error) {
      console.error('Error sending OTP:', error)
      return { success: false, error: error.message }
    }
    
    // 检查是否自动确认
    if (data?.user) {
      console.log('Auto confirmed, user:', data.user)
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
  console.log('verifyOTP called with phone:', phone, 'token:', token);
  
  // 使用 Supabase 验证验证码
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })
  
  if (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: error.message }
  }
  
  if (data?.user) {
    console.log('OTP verified, user:', data.user);
    // 保存真实用户ID
    localStorage.setItem('testUserId', data.user.id)
    localStorage.setItem('testUserPhone', phone)
    return { success: true, user: data.user }
  }
  
  return { success: false, error: '验证失败' }
}

// 登出
export async function logout() {
  // 检查是否是测试模式用户
  const testUserId = localStorage.getItem('testUserId');
  
  if (testUserId && testUserId.startsWith('test-user-')) {
    // 测试模式用户，不需要调用 supabase signOut
    console.log('Test user logout, skipping Supabase signOut');
    return { success: true };
  }
  
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

// 注册
export async function signUp(email: string, password: string) {
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
