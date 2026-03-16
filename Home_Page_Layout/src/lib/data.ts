import { supabase, generateUUID, now, fromCloudRecord } from './supabase'
import type { Profile, UserDish, Board, BoardItem, HistoryRecord, Favorite, Dish } from './supabase'

// ============================================
// 数据服务 - profiles
// ============================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error getting profile:', error)
    return null
  }
  
  return fromCloudRecord(data)
}

export async function createProfile(userId: string): Promise<Profile | null> {
  const profile = {
    id: userId,
    nickname: '美食达人',
    signature: '今天也要认真吃饭',
    avatar_url: null,
    updated_at: now(),
    client_at: now(),
    created_at: now(),
    deleted_at: null,
    is_synced: false,
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating profile:', error)
    return null
  }
  
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: now(),
      is_synced: false,
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating profile:', error)
    return null
  }
  
  return data
}

// ============================================
// 数据服务 - 系统菜谱
// ============================================

export async function getDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error getting dishes:', error)
    return []
  }
  
  return data || []
}

export async function getDishesByCategory(category: string): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('category', category)
    .order('name')
  
  if (error) {
    console.error('Error getting dishes by category:', error)
    return []
  }
  
  return data || []
}

// ============================================
// 数据服务 - 私房菜
// ============================================

export async function getUserDishes(userId: string): Promise<UserDish[]> {
  const { data, error } = await supabase
    .from('user_dishes')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error getting user dishes:', error)
    return []
  }
  
  return (data || []).map(fromCloudRecord)
}

export async function createUserDish(userId: string, dish: Omit<UserDish, 'id' | 'user_id' | 'updated_at' | 'client_at' | 'deleted_at' | 'is_synced' | 'created_at'>): Promise<UserDish | null> {
  const newDish = {
    id: generateUUID(),
    user_id: userId,
    ...dish,
    updated_at: now(),
    client_at: now(),
    created_at: now(),
    deleted_at: null,
    is_synced: false,
  }
  
  console.log('Creating user dish in Supabase:', newDish);
  
  const { data, error } = await supabase
    .from('user_dishes')
    .insert(newDish)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user dish:', error)
    alert('同步失败: ' + error.message);
    return null
  }

  console.log('User dish created successfully:', data);
  return data
}

export async function updateUserDish(id: string, updates: Partial<UserDish>): Promise<UserDish | null> {
  const { data, error } = await supabase
    .from('user_dishes')
    .update({
      ...updates,
      updated_at: now(),
      is_synced: false,
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user dish:', error)
    return null
  }
  
  return data
}

export async function deleteUserDish(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_dishes')
    .update({
      deleted_at: now(),
      is_synced: false,
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting user dish:', error)
    return false
  }
  
  return true
}

// ============================================
// 数据服务 - 历史记录
// ============================================

export async function getHistory(userId: string): Promise<HistoryRecord[]> {
  console.log('getHistory called with userId:', userId);
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error getting history:', error)
    return []
  }
  
  console.log('getHistory returned:', data?.length || 0, 'records');
  return (data || []).map(fromCloudRecord)
}

export async function getFavorites(userId: string): Promise<Favorite[]> {
  console.log('getFavorites called with userId:', userId);
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error getting favorites:', error)
    return []
  }
  
  console.log('getFavorites returned:', data?.length || 0, 'records');
  return (data || []).map(fromCloudRecord)
}

export async function createHistory(userId: string, record: Omit<HistoryRecord, 'id' | 'user_id' | 'updated_at' | 'client_at' | 'deleted_at' | 'is_synced' | 'created_at'>): Promise<HistoryRecord | null> {
  const newRecord = {
    id: generateUUID(),
    user_id: userId,
    ...record,
    updated_at: now(),
    client_at: now(),
    created_at: now(),
    deleted_at: null,
    is_synced: false,
  }
  
  console.log('=== createHistory START ===')
  console.log('userId:', userId)
  console.log('newRecord:', JSON.stringify(newRecord))
  console.log('Supabase URL:', supabase.supabaseUrl)
  
  const { data, error } = await supabase
    .from('history')
    .insert(newRecord)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating history:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
    return null
  }

  console.log('History created successfully:', data)
  console.log('=== createHistory END ===')
  return data
}

export async function deleteHistory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('history')
    .update({
      deleted_at: now(),
      is_synced: false,
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting history:', error)
    return false
  }
  
  return true
}

export async function addFavorite(userId: string, dishName: string, tags?: string[]): Promise<Favorite | null> {
  const favorite = {
    id: generateUUID(),
    user_id: userId,
    dish_name: dishName,
    snapshot_tags: tags || null,
    updated_at: now(),
    client_at: now(),
    created_at: now(),
    deleted_at: null,
    is_synced: false,
  }
  
  console.log('=== addFavorite START ===')
  console.log('userId:', userId)
  console.log('favorite:', JSON.stringify(favorite))
  
  const { data, error } = await supabase
    .from('favorites')
    .insert(favorite)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding favorite:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    return null
  }

  console.log('Favorite added successfully:', data)
  console.log('=== addFavorite END ===')
  return data
}

export async function removeFavorite(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .update({
      deleted_at: now(),
      is_synced: false,
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error removing favorite:', error)
    return false
  }
  
  return true
}
