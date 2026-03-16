import { supabase, now, generateUUID } from './supabase'
import { getHistory, createHistory, getFavorites, addFavorite, getUserDishes, createUserDish } from './data'

// ============================================
// 同步服务 - 按照规范实现
// ============================================

interface SyncOptions {
  userId: string
  onProgress?: (message: string) => void
  onComplete?: () => void
}

// 场景1：本地无，云端有 -> 拉取到本地
async function pullFromCloudToLocal(userId: string): Promise<boolean> {
  try {
    console.log('=== Pull from cloud START ===');
    console.log('UserId:', userId);
    
    // 拉取云端历史
    const cloudHistory = await getHistory(userId)
    console.log('Cloud history count:', cloudHistory.length);
    console.log('Cloud history:', cloudHistory);
    
    if (cloudHistory.length > 0) {
      // 使用 normalized date 作为 key 来去重
      const historyMap = new Map<string, any>();
      cloudHistory.forEach((h: any) => {
        const key = normalizeDate(h.date);
        
        if (!historyMap.has(key)) {
          // 第一次遇到这个日期，记录下来
          historyMap.set(key, h);
        } else {
          const existing = historyMap.get(key);
          // 保留最新创建的
          const existingTime = new Date(existing.created_at).getTime();
          const newTime = new Date(h.created_at).getTime();
          if (newTime > existingTime) {
            historyMap.set(key, h);
          }
        }
      });
      
      // 转换为本地格式
      const localHistory = Array.from(historyMap.values()).map((h: any) => ({
        id: h.id,
        date: normalizeDate(h.date),
        timeType: h.time_type,
        dishes: h.dishes || [],
      }));
      
      // 按日期倒序排序
      localHistory.sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      localStorage.setItem('historyBoard', JSON.stringify(localHistory))
      console.log('Saved history to local:', localHistory.length);
    }
    
    // 拉取云端收藏
    const cloudFavorites = await getFavorites(userId)
    console.log('Cloud favorites count:', cloudFavorites.length);
    console.log('Cloud favorites:', cloudFavorites);
    
    if (cloudFavorites.length > 0) {
      const favNames = cloudFavorites.map((f: any) => f.dish_name)
      localStorage.setItem('favorites', JSON.stringify(favNames))
      console.log('Saved favorites to local:', favNames.length);
    }
    
    // 拉取云端私房菜
    const cloudDishes = await getUserDishes(userId)
    console.log('Cloud dishes count:', cloudDishes.length);
    console.log('Cloud dishes:', cloudDishes);
    
    if (cloudDishes.length > 0) {
      // 只去重那些从未修改过的记录（updated_at === created_at）
      const dishesMap = new Map<string, any>();
      cloudDishes.forEach((d: any) => {
        const key = d.name;
        const isUnchanged = d.updated_at === d.created_at;
        
        if (!dishesMap.has(key)) {
          dishesMap.set(key, { ...d, isUnchanged });
        } else {
          const existing = dishesMap.get(key);
          if (isUnchanged && existing.isUnchanged) {
            return;
          } else if (isUnchanged && !existing.isUnchanged) {
            return;
          } else if (!isUnchanged && existing.isUnchanged) {
            dishesMap.set(key, { ...d, isUnchanged });
          } else {
            if (d.updated_at > existing.updated_at) {
              dishesMap.set(key, { ...d, isUnchanged });
            }
          }
        }
      });
      
      const localDishes = Array.from(dishesMap.values()).map((d: any) => ({
        name: d.name,
        tags: d.tags || [],
        category: d.category || '',
        cuisine: d.cuisine || d.group_name || '',
        group: d.group_name || '',
        notes: d.notes || '',
      }));
      
      localStorage.setItem('myDishes', JSON.stringify(localDishes))
      console.log('Saved dishes to local:', localDishes.length);
    }
    
    console.log('=== Pull from cloud END ===');
    return true
  } catch (error) {
    console.error('Pull from cloud error:', error)
    return false
  }
}

// 统一日期格式为 "YYYY-MM-DD"
function normalizeDate(dateStr: string): string {
  // 支持 "2026.3.16", "2026-3-16", "2026/3/16" 等格式
  return dateStr.replace(/[.\/]/g, '-');
}

// 场景2：本地有，云端无 -> 上传到云端
async function pushLocalToCloud(userId: string, onProgress?: (msg: string) => void): Promise<boolean> {
  try {
    console.log('=== pushLocalToCloud START ===')
    console.log('userId:', userId)
    console.log('userId type:', typeof userId)
    
    // 上传历史记录
    const localHistoryStr = localStorage.getItem('historyBoard')
    if (localHistoryStr) {
      const localHistory = JSON.parse(localHistoryStr)
      console.log('localHistory parsed:', localHistory)
      onProgress?.('上传历史记录...')
      
      const cloudHistory = await getHistory(userId)
      console.log('cloudHistory:', cloudHistory)
      const cloudDates = new Set(cloudHistory.map((h: any) => normalizeDate(h.date)))
      console.log('cloudDates:', cloudDates)
      
      for (const record of localHistory) {
        console.log('Processing record:', record)
        const normalizedDate = normalizeDate(record.date)
        console.log('normalizedDate:', normalizedDate)
        if (!cloudDates.has(normalizedDate)) {
          console.log('Creating history for date:', normalizedDate, 'userId:', userId)
          const result = await createHistory(userId, {
            date: normalizedDate,
            time_type: record.timeType,
            dishes: record.dishes,
          })
          console.log('Create history result:', result)
        } else {
          console.log('Skipping, date already exists:', normalizedDate)
        }
      }
    } else {
      console.log('No localHistory found')
    }
    
    // 上传收藏
    const localFavoritesStr = localStorage.getItem('favorites')
    if (localFavoritesStr) {
      const localFavorites = JSON.parse(localFavoritesStr)
      console.log('localFavorites:', localFavorites)
      onProgress?.('上传收藏...')
      
      const cloudFavorites = await getFavorites(userId)
      console.log('cloudFavorites:', cloudFavorites)
      const cloudNames = new Set(cloudFavorites.map((f: any) => f.dish_name))
      
      for (const name of localFavorites) {
        if (!cloudNames.has(name)) {
          console.log('Adding favorite:', name)
          const result = await addFavorite(userId, name)
          console.log('Add favorite result:', result)
        }
      }
    }
    
    // 上传私房菜
    const localDishesStr = localStorage.getItem('myDishes')
    if (localDishesStr) {
      const localDishes = JSON.parse(localDishesStr)
      onProgress?.('上传私房菜...')
      
      const cloudDishes = await getUserDishes(userId)
      const cloudNames = new Set(cloudDishes.map((d: any) => d.name))
      
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
    }
    
    console.log('=== pushLocalToCloud END ===')
    console.log('Push to cloud complete');
    return true
  } catch (error) {
    console.error('Push to cloud error:', error)
    return false
  }
}

// 场景3：本地有，云端也有 -> 冲突解决（最后写入者胜）
async function resolveConflicts(userId: string, onProgress?: (msg: string) => void): Promise<boolean> {
  try {
    console.log('=== resolveConflicts START ===')
    
    // 解决历史记录冲突
    const cloudHistory = await getHistory(userId)
    const localHistoryStr = localStorage.getItem('historyBoard')
    
    console.log('cloudHistory:', cloudHistory.length)
    console.log('localHistoryStr:', localHistoryStr ? 'exists' : 'null')
    
    // 无论云端有没有历史，都需要检查本地历史
    if (localHistoryStr) {
      const localHistory = JSON.parse(localHistoryStr)
      // 使用 normalizeDate 作为 key 来处理日期格式不一致
      const cloudHistoryMap = new Map(cloudHistory.map((h: any) => [normalizeDate(h.date), h]))
      
      const mergedHistory: any[] = []
      const processedDates = new Set<string>()
      
      for (const local of localHistory) {
        const normalizedDate = normalizeDate(local.date)
        
        // 跳过已处理过的日期（避免重复）
        if (processedDates.has(normalizedDate)) {
          continue
        }
        processedDates.add(normalizedDate)
        
        const cloud = cloudHistoryMap.get(normalizedDate)
        
        if (!cloud) {
          // 云端没有，上传
          console.log('Uploading local history:', normalizedDate)
          await createHistory(userId, {
            date: normalizedDate,
            time_type: local.timeType,
            dishes: local.dishes,
          })
          mergedHistory.push(local)
        } else {
          // 都有，比较时间
          const localTime = local.id ? parseInt(local.id) : 0
          const cloudTime = new Date(cloud.updated_at || cloud.created_at).getTime()
          
          if (localTime > cloudTime) {
            // 本地优先，重新上传
            console.log('Re-uploading local history (newer):', normalizedDate)
            await createHistory(userId, {
              date: normalizedDate,
              time_type: local.timeType,
              dishes: local.dishes,
            })
            mergedHistory.push(local)
          } else {
            // 云端优先，用云端数据覆盖
            mergedHistory.push({
              id: cloud.id,
              date: cloud.date,
              timeType: cloud.time_type,
              dishes: cloud.dishes || [],
            })
          }
        }
      }
      
      // 添加云端独有的（本地没有的）
      for (const cloud of cloudHistory) {
        const normalizedDate = normalizeDate(cloud.date)
        if (!processedDates.has(normalizedDate)) {
          mergedHistory.push({
            id: cloud.id,
            date: cloud.date,
            timeType: cloud.time_type,
            dishes: cloud.dishes || [],
          })
        }
      }
      
      // 按日期排序
      mergedHistory.sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      
      localStorage.setItem('historyBoard', JSON.stringify(mergedHistory))
    } else if (localHistoryStr) {
      // 云端没有历史，直接上传所有本地历史
      const localHistory = JSON.parse(localHistoryStr)
      for (const local of localHistory) {
        const normalizedDate = normalizeDate(local.date)
        console.log('Uploading local history (cloud empty):', normalizedDate)
        await createHistory(userId, {
          date: normalizedDate,
          time_type: local.timeType,
          dishes: local.dishes,
        })
      }
      localStorage.setItem('historyBoard', JSON.stringify(localHistory))
    }
    
    // 解决收藏冲突 - 简单合并（去重）+ 上传本地新增的
    const cloudFavorites = await getFavorites(userId)
    const localFavoritesStr = localStorage.getItem('favorites')
    
    console.log('=== Resolving favorites ===')
    console.log('cloudFavorites:', cloudFavorites.length)
    console.log('localFavoritesStr:', localFavoritesStr)
    
    if (localFavoritesStr) {
      const localFavorites = JSON.parse(localFavoritesStr)
      const cloudNames = new Set(cloudFavorites.map((f: any) => f.dish_name))
      const mergedFavorites: string[] = [...cloudFavorites.map((f: any) => f.dish_name)]
      
      // 上传本地新增的收藏到云端
      for (const name of localFavorites) {
        if (!cloudNames.has(name)) {
          console.log('Uploading favorite:', name)
          await addFavorite(userId, name)
          mergedFavorites.push(name)
        } else {
          mergedFavorites.push(name)
        }
      }
      
      localStorage.setItem('favorites', JSON.stringify([...new Set(mergedFavorites)]))
    }
    
    // 解决私房菜冲突 - 简单合并（去重）
    const cloudDishes = await getUserDishes(userId)
    const localDishesStr = localStorage.getItem('myDishes')
    
    if (localDishesStr || cloudDishes.length > 0) {
      const localDishes = localDishesStr ? JSON.parse(localDishesStr) : []
      const allDishesMap = new Map()
      
      // 先加云端
      cloudDishes.forEach((d: any) => {
        allDishesMap.set(d.name, {
          name: d.name,
          tags: d.tags || [],
          category: d.category || '',
          cuisine: d.cuisine || d.group_name || '',
          group: d.group_name || '',
          notes: d.notes || '',
        })
      })
      
      // 再加本地（覆盖云端）
      localDishes.forEach((d: any) => {
        allDishesMap.set(d.name, d)
      })
      
      localStorage.setItem('myDishes', JSON.stringify(Array.from(allDishesMap.values())))
    }
    
    console.log('Resolve conflicts complete');
    return true
  } catch (error) {
    console.error('Resolve conflicts error:', error)
    return false
  }
}

// 完整同步流程
export async function syncAllData(options: SyncOptions): Promise<boolean> {
  const { userId, onProgress, onComplete } = options
  
  console.log('=== syncAllData START ===')
  console.log('userId:', userId)
  
  try {
    // 检查本地是否有数据
    const localHistory = localStorage.getItem('historyBoard')
    const localFavorites = localStorage.getItem('favorites')
    const localDishes = localStorage.getItem('myDishes')
    
    console.log('localHistory:', localHistory)
    console.log('localFavorites:', localFavorites)
    console.log('localDishes:', localDishes)
    
    const hasLocalData = !!(localHistory || localFavorites || localDishes)
    console.log('hasLocalData:', hasLocalData)
    
    if (!hasLocalData) {
      // 场景1：本地无数据，直接拉取云端
      console.log('Scenario 1: No local data, pulling from cloud')
      onProgress?.('从云端拉取数据...')
      await pullFromCloudToLocal(userId)
    } else {
      // 有本地数据，需要处理冲突
      console.log('Scenario 2/3: Has local data, checking cloud')
      onProgress?.('检查云端数据...')
      const cloudHistory = await getHistory(userId)
      const cloudFavorites = await getFavorites(userId)
      const cloudDishes = await getUserDishes(userId)
      
      console.log('cloudHistory count:', cloudHistory.length)
      console.log('cloudFavorites count:', cloudFavorites.length)
      console.log('cloudDishes count:', cloudDishes.length)
      
      const hasCloudData = cloudHistory.length > 0 || cloudFavorites.length > 0 || cloudDishes.length > 0
      
      if (!hasCloudData) {
        // 场景2：本地有，云端无，直接上传
        console.log('Scenario 2: Uploading local data to cloud')
        onProgress?.('上传本地数据到云端...')
        await pushLocalToCloud(userId, onProgress)
      } else {
        // 场景3：两边都有，解决冲突
        console.log('Scenario 3: Resolving conflicts')
        onProgress?.('同步中（最后写入者胜）...')
        await resolveConflicts(userId, onProgress)
      }
    }
    
    onComplete?.()
    console.log('=== syncAllData END ===')
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
