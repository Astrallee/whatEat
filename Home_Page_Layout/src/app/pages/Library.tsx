
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronRight, ChevronDown, Plus, Edit2, Trash2, X, Heart } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { getUserDishes, createUserDish, deleteUserDish } from "../../lib/data";

interface Dish {
  name: string;
  tags: string[];
  category: string;
  cuisine: string;
  group?: string;
  notes?: string;
}

const dishLibrary: Dish[] = [
  // 川菜
  { name: "宫保鸡丁", tags: ["川菜", "香辣"], category: "荤菜", cuisine: "川菜" },
  { name: "麻婆豆腐", tags: ["下饭", "川菜"], category: "素菜", cuisine: "川菜" },
  { name: "回锅肉", tags: ["下饭", "经典"], category: "荤菜", cuisine: "川菜" },
  { name: "水煮鱼", tags: ["麻辣", "鲜美"], category: "荤菜", cuisine: "川菜" },
  
  // 家常菜
  { name: "西红柿炒蛋", tags: ["家常", "简单"], category: "素菜", cuisine: "家常菜" },
  { name: "可乐鸡翅", tags: ["甜香", "下饭"], category: "荤菜", cuisine: "家常菜" },
  { name: "红烧肉", tags: ["下饭", "经典"], category: "荤菜", cuisine: "家常菜" },
  { name: "糖醋里脊", tags: ["酸甜", "开胃"], category: "荤菜", cuisine: "家常菜" },
  { name: "馒头", tags: ["主食", "北方"], category: "主食", cuisine: "家常菜" },
  { name: "猪肉包子", tags: ["主食", "面食"], category: "主食", cuisine: "家常菜" },
  { name: "蛋炒饭", tags: ["主食", "快手"], category: "主食", cuisine: "家常菜" },
  
  // 粤菜
  { name: "清蒸鱼", tags: ["清淡", "健康"], category: "荤菜", cuisine: "粤菜" },
  { name: "白切鸡", tags: ["清淡", "原味"], category: "荤菜", cuisine: "粤菜" },
  { name: "蚝油生菜", tags: ["快手", "清爽"], category: "素菜", cuisine: "粤菜" },
  
  // 鲁菜
  { name: "葱爆羊肉", tags: ["香鲜", "快手"], category: "荤菜", cuisine: "鲁菜" },
  { name: "九转大肠", tags: ["经典", "重口"], category: "荤菜", cuisine: "鲁菜" },
  
  // 汤羹
  { name: "紫菜蛋花汤", tags: ["清淡", "快手"], category: "汤", cuisine: "汤羹" },
  { name: "玉米排骨汤", tags: ["滋补", "鲜美"], category: "汤", cuisine: "汤羹" },
  { name: "番茄蛋花汤", tags: ["开胃", "家常"], category: "汤", cuisine: "汤羹" },
  
  // 甜品
  { name: "山药蓝莓", tags: ["甜品", "健康"], category: "甜品", cuisine: "甜品" },
  { name: "提拉米苏", tags: ["甜品", "经典"], category: "甜品", cuisine: "甜品" },
  { name: "芝士蛋糕", tags: ["甜品", "浓郁"], category: "甜品", cuisine: "甜品" },
  { name: "芒果布丁", tags: ["甜品", "清爽"], category: "甜品", cuisine: "甜品" },
  { name: "冰淇淋", tags: ["甜品", "凉爽"], category: "甜品", cuisine: "甜品" },
];

// 我的私房菜 - 初始为空，从 localStorage 加载
const defaultMyDishes: Dish[] = [];

export function Library() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"system" | "my">("system");
  const [expandedCuisines, setExpandedCuisines] = useState<Set<string>>(
    new Set([])
  );
  const [myDishesList, setMyDishesList] = useState<Dish[]>(defaultMyDishes);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [showDishDetail, setShowDishDetail] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  
  // 新增菜系相关
  const [showAddCuisine, setShowAddCuisine] = useState(false);
  const [newCuisineName, setNewCuisineName] = useState("");
  
  // 自定义菜系列表（仅用于我的私房菜）
  const [customCuisines, setCustomCuisines] = useState<string[]>([]);

  useEffect(() => {
    const loadUserDishes = async () => {
      // 先加载自定义菜系列表
      const savedCuisines = localStorage.getItem("customCuisines");
      if (savedCuisines) {
        setCustomCuisines(JSON.parse(savedCuisines));
      }
      
      // 加载本地数据
      const savedDishes = localStorage.getItem("myDishes");
      let localDishes: Dish[] = [];
      if (savedDishes) {
        localDishes = JSON.parse(savedDishes);
        setMyDishesList(localDishes);
        
        // 提取自定义菜系
        const cuisinesSet = new Set<string>();
        localDishes.forEach(d => {
          if (d.group) {
            cuisinesSet.add(d.group);
          }
        });
        // 合并已保存的菜系和新提取的菜系
        const existingCuisines = savedCuisines ? JSON.parse(savedCuisines) : [];
        const combinedCuisines = [...new Set([...existingCuisines, ...Array.from(cuisinesSet)])];
        setCustomCuisines(combinedCuisines);
      }
      
      // 如果登录了，尝试从云端加载
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      const testUserId = localStorage.getItem('testUserId')
      
      if (isLoggedIn && testUserId) {
        const cloudDishes = await getUserDishes(testUserId)
        if (cloudDishes.length > 0) {
          // 合并云端数据
          const cloudDishesFormatted = cloudDishes.map((d: any) => ({
            name: d.name,
            tags: d.tags || [],
            category: d.category || '荤菜',
            cuisine: d.cuisine || d.group_name || '',
            group: d.group_name,
            notes: d.notes || ''
          }))
          
          // 按名称去重，优先使用云端数据
          const localNames = new Set(localDishes.map((d: any) => d.name))
          const newDishes = cloudDishesFormatted.filter((d: any) => !localNames.has(d.name))
          
          if (newDishes.length > 0) {
            const combined = [...localDishes, ...newDishes]
            setMyDishesList(combined)
            // 更新本地存储
            localStorage.setItem('myDishes', JSON.stringify([...localDishes, ...newDishes]))
            
            // 更新自定义菜系列表
            const cuisinesSet = new Set<string>();
            combined.forEach(d => {
              if (d.group) {
                cuisinesSet.add(d.group);
              }
            });
            setCustomCuisines(Array.from(cuisinesSet));
          }
        }
      }
    }
    
    loadUserDishes()
  }, [activeTab]);

  const handleRenameGroup = async (oldGroup: string) => {
    const trimmed = editingGroupName.trim();
    if (!trimmed || trimmed === oldGroup) {
      setEditingGroup(null);
      return;
    }
    
    // Update localStorage
    const savedDishes = localStorage.getItem("myDishes");
    if (savedDishes) {
      const dishes = JSON.parse(savedDishes);
      const updated = dishes.map((d: any) => 
        (d.cuisine === oldGroup || d.group === oldGroup) 
          ? { ...d, cuisine: trimmed, group: trimmed } 
          : d
      );
      localStorage.setItem("myDishes", JSON.stringify(updated));
    }
    
    // Update state
    const updatedList = myDishesList.map(d => 
      (d.cuisine === oldGroup || d.group === oldGroup) 
        ? { ...d, cuisine: trimmed, group: trimmed } 
        : d
    );
    setMyDishesList(updatedList);
    
    // Update customCuisines array
    if (customCuisines.includes(oldGroup)) {
      const newCuisines = customCuisines.map(c => c === oldGroup ? trimmed : c);
      setCustomCuisines(newCuisines);
      localStorage.setItem('customCuisines', JSON.stringify(newCuisines));
    }
    
    // Update expandedCuisines
    const newExpanded = new Set(expandedCuisines);
    newExpanded.delete(oldGroup);
    newExpanded.add(trimmed);
    setExpandedCuisines(newExpanded);
    
    // Sync to cloud if logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const testUserId = localStorage.getItem('testUserId')
    
    if (isLoggedIn && testUserId) {
      const cloudDishes = await getUserDishes(testUserId)
      const { updateUserDish } = await import('../../lib/data')
      
      for (const dish of cloudDishes) {
        if (dish.group_name === oldGroup || dish.cuisine === oldGroup) {
          await updateUserDish(dish.id, {
            cuisine: trimmed,
            group_name: trimmed
          })
        }
      }
    }
    
    setEditingGroup(null);
  };

  // 新增菜系
  const handleAddCuisine = () => {
    const trimmed = newCuisineName.trim();
    if (!trimmed) return;
    
    if (customCuisines.includes(trimmed)) {
      alert("该菜系已存在");
      return;
    }
    
    const newCuisines = [...customCuisines, trimmed];
    setCustomCuisines(newCuisines);
    
    // 展开新菜系
    const newExpanded = new Set(expandedCuisines);
    newExpanded.add(trimmed);
    setExpandedCuisines(newExpanded);
    
    // 保存到 localStorage
    localStorage.setItem('customCuisines', JSON.stringify(newCuisines));
    
    setNewCuisineName("");
    setShowAddCuisine(false);
  };

  // 删除菜系（同时删除该菜系下所有菜品）
  const handleDeleteCuisine = async (cuisine: string) => {
    if (!confirm(`确定要删除菜系"${cuisine}"及其所有菜品吗？`)) return;
    
    // 从列表中移除
    const newCuisines = customCuisines.filter(c => c !== cuisine);
    setCustomCuisines(newCuisines);
    
    // 从菜品列表中移除该菜系的所有菜品
    const savedDishes = localStorage.getItem("myDishes");
    if (savedDishes) {
      const dishes = JSON.parse(savedDishes);
      const filtered = dishes.filter((d: Dish) => d.group !== cuisine);
      localStorage.setItem("myDishes", JSON.stringify(filtered));
      setMyDishesList(filtered);
    }
    
    // 从展开集合中移除
    const newExpanded = new Set(expandedCuisines);
    newExpanded.delete(cuisine);
    setExpandedCuisines(newExpanded);
    
    // 保存自定义菜系列表
    localStorage.setItem('customCuisines', JSON.stringify(newCuisines));
    
    // 同步删除到云端
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const testUserId = localStorage.getItem('testUserId')
    
    if (isLoggedIn && testUserId) {
      const cloudDishes = await getUserDishes(testUserId)
      for (const dish of cloudDishes) {
        if (dish.group_name === cuisine) {
          await deleteUserDish(dish.id)
        }
      }
    }
  };

  const currentDishes = activeTab === "system" ? dishLibrary : myDishesList;

  // 筛选菜品
  const filteredDishes = currentDishes.filter((dish) => {
    const matchesSearch =
      dish.name.includes(searchTerm) ||
      dish.tags.some((tag) => tag.includes(searchTerm));
    return matchesSearch;
  });

  // 按菜系或分组分组
  const dishesByGroup = filteredDishes.reduce((acc, dish) => {
    const groupKey = activeTab === "my" && dish.group ? dish.group : dish.cuisine;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  // 对于我的私房菜，要显示所有自定义菜系（包括空菜系）
  let groups = Object.keys(dishesByGroup).sort();
  if (activeTab === "my") {
    const allGroups = [...new Set([...groups, ...customCuisines])].sort();
    groups = allGroups;
  }

  const toggleGroup = (group: string) => {
    setExpandedCuisines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  const handleEdit = (dish: Dish) => {
    navigate(`/edit-dish/${dish.name}`);
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setShowDishDetail(true);
  };

  const getDishNotes = (dish: Dish): string => {
    // 如果是用户私房菜且有笔记，优先使用用户笔记
    if (dish.notes) {
      return dish.notes;
    }
    
    // 否则使用系统预设笔记
    const notesMap: Record<string, string> = {
      "宫保鸡丁": "经典川菜，鸡丁香嫩，花生酥脆",
      "麻婆豆腐": "麻辣鲜香，豆腐嫩滑",
      "回锅肉": "四川传统名菜，香气扑鼻",
      "水煮鱼": "鱼片鲜嫩，麻辣鲜香",
      "红烧肉": "肥而不腻，入口即化",
      "糖醋里脊": "外酥里嫩，酸甜可口",
      "可乐鸡翅": "鸡翅软烂，甜香入味",
      "西红柿炒蛋": "国民家常菜，营养丰富",
      "馒头": "北方传统主食，松软香甜",
      "猪肉包子": "皮薄馅大，鲜香多汁",
      "蛋炒饭": "粒粒分明，经典快手",
      "清蒸鱼": "原汁原味，鲜嫩可口",
      "白切鸡": "肉质鲜嫩，保持原香",
      "蚝油生菜": "爽脆可口，营养健康",
      "葱爆羊肉": "羊肉鲜嫩，葱香四溢",
      "九转大肠": "色泽红润，酸甜苦辣咸五味",
      "紫菜蛋花汤": "简单易做，营养丰富",
      "玉米排骨汤": "汤鲜味美，滋补养生",
      "番茄蛋花汤": "酸甜开胃，老少皆宜",
      "提拉米苏": "意大利经典，层次丰富",
      "芝士蛋糕": "绵密顺滑，奶香浓郁",
      "芒果布丁": "清甜爽滑，热带风味",
      "冰淇淋": "冰凉甜蜜，夏日必备",
      "山药蓝莓": "健康养生，酸甜可口",
      "蒜蓉西兰花": "碧绿爽脆，营养丰富",
      "番茄炒蛋": "经典家常菜，酸甜可口",
      "米饭": "粒粒分明，香气扑鼻",
      "炒面": "爽滑入味，简单美味",
    };
    return notesMap[dish.name] || "美味菜品";
  };

  const handleDelete = async (dish: Dish) => {
    if (confirm(`确定要删除"${dish.name}"吗？`)) {
      const savedDishes = localStorage.getItem("myDishes");
      if (savedDishes) {
        const dishes = JSON.parse(savedDishes);
        const filtered = dishes.filter((d: Dish) => d.name !== dish.name);
        localStorage.setItem("myDishes", JSON.stringify(filtered));
        setMyDishesList(myDishesList.filter(d => d.name !== dish.name));
        
        // 同步删除到云端
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
        const testUserId = localStorage.getItem('testUserId')
        
        if (isLoggedIn && testUserId) {
          // 查找云端对应的记录ID
          const cloudDishes = await getUserDishes(testUserId)
          const cloudDish = cloudDishes.find((d: any) => d.name === dish.name)
          if (cloudDish) {
            await deleteUserDish(cloudDish.id)
          }
        }
      }
    }
  };

  const handleAddToBoard = async (dish: Dish) => {
    console.log('Adding dish to board:', dish);
    const categories = ["荤菜", "素菜", "汤", "主食", "甜品"] as const;
    let category = dish.category;
    
    // For user dishes, category might be empty, try to use cuisine or group
    if (!category || !categories.includes(category as any)) {
      category = dish.cuisine || dish.group || "荤菜";
    }
    
    console.log('Using category:', category);
    
    const savedBoard = localStorage.getItem("todayBoard");
    let board: Record<string, string[]> = savedBoard ? JSON.parse(savedBoard) : {
      荤菜: [],
      素菜: [],
      汤: [],
      主食: [],
      甜品: [],
    };
    
    // 如果分类不在board的key中，默认放到荤菜
    if (!board[category]) {
      if (categories.includes(category as any)) {
        board[category] = [];
      } else {
        category = "荤菜";
        board[category] = board[category] || [];
      }
    }
    
    console.log('Board before add:', board);
    
    // 获取现有来源信息
    const savedSources = localStorage.getItem("todayBoardSources");
    let sources: Record<string, 'system' | 'user'> = savedSources ? JSON.parse(savedSources) : {};
    
    if (!board[category].includes(dish.name)) {
      board[category].push(dish.name);
      // 保存来源 - 我的私房菜都是 user 来源
      sources[dish.name] = 'user';
      
      localStorage.setItem("todayBoard", JSON.stringify(board));
      localStorage.setItem("todayBoardSources", JSON.stringify(sources));
      
      console.log('Board after add:', board);
      
      alert(`已将"${dish.name}"添加到${category}`);
    } else {
      alert("该菜品已在桌板中");
    }
  };

  const handleAddNew = (group?: string) => {
    const params = group ? `?cuisine=${encodeURIComponent(group)}` : "";
    navigate(`/add-dish${params}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 - 搜索框 */}
      <div className="bg-white px-6 pt-8 pb-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索菜名 / 标签"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-300"
          />
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="bg-white px-6 py-3 border-b border-gray-100">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("system")}
            className={`pb-2 transition-colors relative ${
              activeTab === "system"
                ? "text-orange-500"
                : "text-gray-500"
            }`}
          >
            系统菜谱
            {activeTab === "system" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`pb-2 transition-colors relative ${
              activeTab === "my"
                ? "text-orange-500"
                : "text-gray-500"
            }`}
          >
            我的私房菜
            {activeTab === "my" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
        </div>
      </div>

      {/* 新增菜系按钮（仅在我的私房菜标签显示） */}
      {activeTab === "my" && (
        <div className="px-6 pt-4">
          <button
            onClick={() => setShowAddCuisine(true)}
            className="w-full bg-white border-2 border-dashed border-orange-300 text-orange-500 rounded-lg p-4 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>新增菜系</span>
          </button>
        </div>
      )}

      {/* 菜品列表 - 按菜系/分组 */}
      <div className="px-6 py-4">
        {groups.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {activeTab === "my" ? "还没有添加私房菜" : "没有找到相关菜品"}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  {/* 分组标题 */}
                  {editingGroup === group ? (
                    <div className="flex items-center gap-2 p-4">
                      <Input
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRenameGroup(group)}
                        autoFocus
                        className="h-8"
                      />
                      <Button size="sm" onClick={() => handleRenameGroup(group)}>确定</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingGroup(null)}>取消</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleGroup(group)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{group}</span>
                        {activeTab === "my" && customCuisines.includes(group) && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingGroup(group); setEditingGroupName(group); }}
                              className="text-gray-400 hover:text-blue-500 p-1"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCuisine(group); }}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-sm">
                          {(dishesByGroup[group]?.length || 0)}道
                        </span>
                        {expandedCuisines.has(group) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </button>
                  )}

                  {/* 菜品列表 */}
                  {expandedCuisines.has(group) && (
                    <div className="border-t border-gray-100">
                      {(dishesByGroup[group] || []).map((dish, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleDishClick(dish)}
                            >
                              <div className="text-gray-900 mb-1">
                                {dish.name}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {dish.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAddToBoard(dish); }}
                                className="text-orange-500 hover:text-orange-600 p-1"
                                title="添加到桌板"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              {activeTab === "my" && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(dish); }}
                                    className="text-blue-500 hover:text-blue-600 p-1"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(dish); }}
                                    className="text-red-500 hover:text-red-600 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* 自定义菜系底部添加菜品入口 */}
                      {activeTab === "my" && customCuisines.includes(group) && (
                        <button
                          onClick={() => handleAddNew(group)}
                          className="w-full py-3 text-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>添加菜品</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 菜品详情弹窗 - 移到条件渲染外部 */}
      <Dialog open={showDishDetail} onOpenChange={setShowDishDetail}>
        <DialogContent className="max-w-sm">
          {selectedDish && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedDish.name}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">菜系：</span>
                    <span className="text-gray-900">{selectedDish.cuisine}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">分类：</span>
                    <span className="text-gray-900">{selectedDish.category}</span>
                  </div>
                </div>

                {selectedDish.tags.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">标签</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedDish.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-500 mb-2">笔记</div>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-700 text-sm">
                    {getDishNotes(selectedDish)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    handleAddToBoard(selectedDish);
                    setShowDishDetail(false);
                  }}
                >
                  加入桌板
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDishDetail(false)}
                >
                  关闭
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 新增菜系弹窗 - 移到条件渲染外部 */}
      <Dialog open={showAddCuisine} onOpenChange={setShowAddCuisine}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center">新建自定义菜系</h2>
            
            <div>
              <label className="text-sm text-gray-500 mb-2 block">菜系名称</label>
              <Input
                placeholder="例如：宝宝最爱、深夜食堂、减脂必备"
                value={newCuisineName}
                onChange={(e) => setNewCuisineName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCuisine()}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                onClick={handleAddCuisine}
                disabled={!newCuisineName.trim()}
              >
                保存
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowAddCuisine(false);
                  setNewCuisineName("");
                }}
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
