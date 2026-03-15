import { supabase, now, generateUUID } from './supabase'
import { getHistory, createHistory, getFavorites, addFavorite, getUserDishes, createUserDish, getTodayBoard, createBoard, getBoardItems, addBoardItem, removeBoardItem } from './data'

// ============================================
// 同步服务
// ============================================

interface SyncOptions {
  userId: string
  onProgress?: (message: string) => void
  onComplete?: () => void
}

// 合并记录（按时间戳，最后写入者胜）
function mergeByTimestamp<T extends { id: string; client_at?: number; updated_at?: number }>(
  local: T[],
  cloud: T[]
): T[] {
  const map = new Map<string, T>()
  
  // 先加入云端
  cloud.forEach(item => map.set(item.id, item))
  
  // 再用本地覆盖（如果本地更新）
  local.forEach(item => {
    const existing = map.get(item.id)
    const localTime = item.client_at || item.updated_at || 0
    const cloudTime = existing?.updated_at || existing?.client_at || 0
    
    if (!existing || localTime > cloudTime) {
      map.set(item.id, item)
    }
  })
  
  return Array.from(map.values())
}

// 同步历史记录
async function syncHistory(userId: string): Promise<boolean> {
  try {
    // 1. 获取云端数据
    const cloudHistory = await getHistory(userId)
    
    // 2. 获取本地数据
    const localHistoryStr = localStorage.getItem('historyBoard')
    const localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : []
    
    // 3. 合并数据
    const merged = mergeByTimestamp(localHistory, cloudHistory)
    
    // 4. 排序（按日期倒序）
    merged.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime()
      const dateB = new Date(b.date || 0).getTime()
      return dateB - dateA
    })
    
    // 5. 更新本地存储
    localStorage.setItem('historyBoard', JSON.stringify(merged))
    
    // 6. 上传本地新增的数据到云端
    const cloudIds = new Set(cloudHistory.map(h => h.id))
    for (const record of localHistory) {
      if (!cloudIds.has(record.id)) {
        await createHistory(userId, {
          date: record.date,
          time_type: record.timeType,
          dishes: record.dishes,
        })
      }
    }
    
    return true
  } catch (error) {
    console.error('Sync history error:', error)
    return false
  }
}

// 同步收藏
async function syncFavorites(userId: string): Promise<boolean> {
  try {
    // 1. 获取云端数据
    const cloudFavorites = await getFavorites(userId)
    
    // 2. 获取本地数据
    const localFavoritesStr = localStorage.getItem('favorites')
    const localFavorites = localFavoritesStr ? JSON.parse(localFavoritesStr) : []
    
    // 3. 合并数据（按 dish_name 去重）
    const mergedMap = new Map<string, any>()
    
    // 先加入云端
    cloudFavorites.forEach(fav => {
      mergedMap.set(fav.dish_name, fav)
    })
    
    // 再用本地覆盖
    localFavorites.forEach((name: string, index: number) => {
      if (!mergedMap.has(name)) {
        mergedMap.set(name, {
          id: generateUUID(),
          dish_name: name,
          snapshot_tags: null,
        })
      }
    })
    
    // 4. 更新本地存储
    const mergedNames = Array.from(mergedMap.keys())
    localStorage.setItem('favorites', JSON.stringify(mergedNames))
    
    // 5. 上传本地新增的到云端
    const cloudNames = new Set(cloudFavorites.map(f => f.dish_name))
    for (const name of mergedNames) {
      if (!cloudNames.has(name)) {
        await addFavorite(userId, name)
      }
    }
    
    return true
  } catch (error) {
    console.error('Sync favorites error:', error)
    return false
  }
}

// 同步私房菜
async function syncUserDishes(userId: string): Promise<boolean> {
  try {
    // 1. 获取云端数据
    const cloudDishes = await getUserDishes(userId)
    
    // 2. 获取本地数据
    const localDishesStr = localStorage.getItem('myDishes')
    const localDishes = localDishesStr ? JSON.parse(localDishesStr) : []
    
    // 3. 合并数据（按 name 去重）
    const mergedMap = new Map<string, any>()
    
    cloudDishes.forEach(dish => {
      mergedMap.set(dish.name, dish)
    })
    
    localDishes.forEach((dish: any) => {
      if (!mergedMap.has(dish.name)) {
        mergedMap.set(dish.name, dish)
      }
    })
    
    // 4. 更新本地存储
    localStorage.setItem('myDishes', JSON.stringify(Array.from(mergedMap.values())))
    
    // 5. 上传本地新增的到云端
    const cloudNames = new Set(cloudDishes.map(d => d.name))
    for (const dish of localDishes) {
      if (!cloudNames.has(dish.name)) {
        await createUserDish(userId, {
          name: dish.name,
          tags: dish.tags || [],
          category: dish.category || null,
          cuisine: dish.cuisine || null,
          group_name: dish.group || null,
          snapshot_name: dish.name,
          snapshot_tags: dish.tags || null,
          notes: dish.notes || null,
        })
      }
    }
    
    return true
  } catch (error) {
    console.error('Sync user dishes error:', error)
    return false
  }
}

// 完整同步流程
export async function syncAllData(options: SyncOptions): Promise<boolean> {
  const { userId, onProgress, onComplete } = options
  
  try {
    // 1. 同步历史记录
    onProgress?.('正在同步历史记录...')
    await syncHistory(userId)
    
    // 2. 同步收藏
    onProgress?.('正在同步收藏...')
    await syncFavorites(userId)
    
    // 3. 同步私房菜
    onProgress?.('正在同步私房菜...')
    await syncUserDishes(userId)
    
    onComplete?.()
    return true
  } catch (error) {
    console.error('Sync error:', error)
    return false
  }
}

// 检查是否有本地数据需要同步
export function hasLocalData(): boolean {
  const history = localStorage.getItem('historyBoard')
  const favorites = localStorage.getItem('favorites')
  const myDishes = localStorage.getItem('myDishes')
  
  return !!(history || favorites || myDishes)
}

// ============================================
// 桌板同步
// ============================================

// 同步今日桌板
export async function syncTodayBoard(userId: string, date: string): Promise<{
  board: any
  items: any[]
} | null> {
  try {
    // 1. 获取云端桌板
    let cloudBoard = await getTodayBoard(userId, date)
    
    // 2. 如果没有云端桌板，创建新的
    if (!cloudBoard) {
      cloudBoard = await createBoard(userId, date)
    }
    
    if (!cloudBoard) {
      return null
    }
    
    // 3. 获取云端桌板明细
    const cloudItems = await getBoardItems(cloudBoard.id)
    
    // 4. 获取本地桌板数据
    const localBoardStr = localStorage.getItem('todayBoard')
    const localBoard = localBoardStr ? JSON.parse(localBoardStr) : {}
    const localSourcesStr = localStorage.getItem('todayBoardSources')
    const localSources: Record<string, 'system' | 'user'> = localSourcesStr ? JSON.parse(localSourcesStr) : {}
    
    // 5. 合并本地和云端数据
    const mergedItems: any[] = []
    const addedDishes = new Set<string>()
    
    // 先添加云端item
    for (const item of cloudItems) {
      mergedItems.push({
        ...item,
        is_synced: true
      })
      addedDishes.add(item.dish_name)
    }
    
    // 再添加本地独有的
    for (const [category, dishes] of Object.entries(localBoard)) {
      if (Array.isArray(dishes)) {
        for (const dishName of dishes) {
          if (!addedDishes.has(dishName)) {
            const dishSource = localSources[dishName] || 'system';
            await addBoardItem(cloudBoard.id, userId, {
              dish_id: null,
              dish_name: dishName,
              dish_category: category,
              dish_tags: null,
              dish_source: dishSource,
              sort_order: mergedItems.length
            })
            addedDishes.add(dishName)
          }
        }
      }
    }
    
    // 6. 返回合并后的数据
    return {
      board: cloudBoard,
      items: mergedItems
    }
  } catch (error) {
    console.error('Sync today board error:', error)
    return null
  }
}

// 保存桌板到云端
export async function saveBoardToCloud(userId: string, date: string, category: string, dishNames: string[]): Promise<boolean> {
  try {
    // 1. 获取或创建桌板
    let board = await getTodayBoard(userId, date)
    if (!board) {
      board = await createBoard(userId, date)
    }
    
    if (!board) {
      return false
    }
    
    // 2. 获取当前云端items
    const cloudItems = await getBoardItems(board.id)
    const cloudDishNames = new Set(cloudItems.map(i => i.dish_name))
    
    // 获取来源信息
    const localSourcesStr = localStorage.getItem('todayBoardSources')
    const localSources: Record<string, 'system' | 'user'> = localSourcesStr ? JSON.parse(localSourcesStr) : {}
    
    // 3. 添加新菜品
    for (const dishName of dishNames) {
      if (!cloudDishNames.has(dishName)) {
        const dishSource = localSources[dishName] || 'system';
        await addBoardItem(board.id, userId, {
          dish_id: null,
          dish_name: dishName,
          dish_category: category,
          dish_tags: null,
          dish_source: dishSource,
          sort_order: cloudItems.length
        })
      }
    }
    
    return true
  } catch (error) {
    console.error('Save board to cloud error:', error)
    return false
  }
}

// 从云端删除桌板菜品
export async function removeBoardItemFromCloud(boardItemId: string): Promise<boolean> {
  return await removeBoardItem(boardItemId)
}
