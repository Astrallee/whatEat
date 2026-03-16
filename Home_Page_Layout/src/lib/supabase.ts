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

export function now(): string {
  // 返回本地时间格式 "YYYY-MM-DD HH:mm:ss"
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化时间戳为可读格式
export function formatTimestamp(timestamp: string | number): string {
  if (!timestamp) return ''
  // 如果是数字（秒级时间戳），转换为日期
  if (typeof timestamp === 'number') {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }
  // 如果已经是字符串格式，直接返回
  return timestamp
}

// 云端返回的数据强制标记为已同步
export function fromCloudRecord<T extends { is_synced: boolean }>(record: T): T {
  return { ...record, is_synced: true }
}

// 本地创建的记录标记为未同步
export function toLocalRecord<T extends { is_synced: boolean; client_at: number; updated_at: number }>(record: T): T {
  return { ...record, is_synced: false, client_at: now(), updated_at: now() }
}
