import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// 类型定义
// ============================================

export interface Profile {
  id: string
  nickname: string
  signature: string
  avatar_url: string | null
  updated_at: number
  client_at: number
  deleted_at: number | null
  is_synced: boolean
  created_at: number
}

export interface Dish {
  id: string
  name: string
  tags: string[]
  category: string
  cuisine: string | null
  is_system: boolean
  created_at: number
  updated_at: number
}

export interface UserDish {
  id: string
  user_id: string
  name: string
  tags: string[]
  category: string | null
  cuisine: string | null
  group_name: string | null
  snapshot_name: string | null
  snapshot_tags: string[] | null
  notes: string | null
  updated_at: number
  client_at: number
  deleted_at: number | null
  is_synced: boolean
  created_at: number
}

export interface Board {
  id: string
  user_id: string
  date: string
  updated_at: number
  client_at: number
  deleted_at: number | null
  is_synced: boolean
  created_at: number
}

export interface BoardItem {
  id: string
  board_id: string
  user_id: string
  dish_id: string | null
  dish_name: string
  dish_category: string | null
  dish_tags: string[] | null
  dish_source: 'system' | 'user'
  sort_order: number
  updated_at: number
  client_at: number
  deleted_at: number | null
  is_synced: boolean
  created_at: number
}

export interface HistoryRecord {
  id: string
  user_id: string
  date: string
  time_type: string | null
  dishes: { name: string; category: string; tags: string[] }[]
  updated_at: number
  client_at: number
  deleted_at: number | null
  is_synced: boolean
  created_at: number
}

export interface Favorite {
  id: string
  user_id: string
  dish_name: string
  snapshot_tags: string[] | null
  updated_at: number
  client_at: number
  deleted_at: number | null
  is_synced: boolean
  created_at: number
}

// ============================================
// 工具函数
// ============================================

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function now(): number {
  return Date.now()
}

// 云端返回的数据强制标记为已同步
export function fromCloudRecord<T extends { is_synced: boolean }>(record: T): T {
  return { ...record, is_synced: true }
}

// 本地创建的记录标记为未同步
export function toLocalRecord<T extends { is_synced: boolean; client_at: number; updated_at: number }>(record: T): T {
  return { ...record, is_synced: false, client_at: now(), updated_at: now() }
}
