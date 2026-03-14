
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronRight, ChevronDown, Plus, Edit2, Trash2, X, Heart } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";

interface Dish {
  name: string;
  tags: string[];
  category: string;
  cuisine: string; // 菜系分类
  group?: string; // 自定义分组（仅用于私房菜）
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

// 我的私房菜（示例数据）
const myDishes: Dish[] = [
  { name: "红烧肉", tags: ["家传", "下饭"], category: "荤菜", cuisine: "家常菜", group: "我宝心头爱" },
  { name: "蒜蓉虾", tags: ["鲜香", "快手"], category: "荤菜", cuisine: "粤菜", group: "我宝心头爱" },
  { name: "鸡胸肉沙拉", tags: ["健康", "低脂"], category: "素菜", cuisine: "西式", group: "减脂餐" },
];

export function Library() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"system" | "my">("system");
  const [expandedCuisines, setExpandedCuisines] = useState<Set<string>>(
    new Set([])
  );
  const [myDishesList, setMyDishesList] = useState<Dish[]>(myDishes);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [showDishDetail, setShowDishDetail] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  useEffect(() => {
    const savedDishes = localStorage.getItem("myDishes");
    if (savedDishes) {
      const parsed = JSON.parse(savedDishes);
      const combined = [...myDishes, ...parsed];
      setMyDishesList(combined);
    }
  }, [activeTab]);

  const handleRenameGroup = (oldGroup: string) => {
    const trimmed = editingGroupName.trim();
    if (!trimmed || trimmed === oldGroup) {
      setEditingGroup(null);
      return;
    }
    
    const savedDishes = localStorage.getItem("myDishes");
    if (savedDishes) {
      const dishes = JSON.parse(savedDishes);
      const updated = dishes.map((d: Dish) => 
        d.cuisine === oldGroup ? { ...d, cuisine: trimmed, group: trimmed } : d
      );
      localStorage.setItem("myDishes", JSON.stringify(updated));
      
      const combined = myDishesList.map(d => 
        d.group === oldGroup ? { ...d, group: trimmed, cuisine: trimmed } : d
      );
      setMyDishesList(combined);
      
      const newExpanded = new Set(expandedCuisines);
      newExpanded.delete(oldGroup);
      newExpanded.add(trimmed);
      setExpandedCuisines(newExpanded);
    }
    
    setEditingGroup(null);
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

  const groups = Object.keys(dishesByGroup).sort();

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

  const getDishNotes = (dishName: string): string => {
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
    return notesMap[dishName] || "美味菜品";
  };

  const handleDelete = (dish: Dish) => {
    if (confirm(`确定要删除"${dish.name}"吗？`)) {
      const savedDishes = localStorage.getItem("myDishes");
      if (savedDishes) {
        const dishes = JSON.parse(savedDishes);
        const filtered = dishes.filter((d: Dish) => d.name !== dish.name);
        localStorage.setItem("myDishes", JSON.stringify(filtered));
        setMyDishesList(myDishesList.filter(d => d.name !== dish.name));
      }
    }
  };

  const handleAddToBoard = (dish: Dish) => {
    const categories = ["荤菜", "素菜", "汤", "主食", "甜品"] as const;
    let category = dish.category;
    if (!categories.includes(category as any)) {
      category = dish.cuisine || "荤菜";
    }
    
    const savedBoard = localStorage.getItem("todayBoard");
    let board: Record<string, string[]> = savedBoard ? JSON.parse(savedBoard) : {
      荤菜: [],
      素菜: [],
      汤: [],
      主食: [],
      甜品: [],
    };
    
    if (!board[category]) {
      board[category] = [];
    }
    
    if (!board[category].includes(dish.name)) {
      board[category].push(dish.name);
      localStorage.setItem("todayBoard", JSON.stringify(board));
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

      {/* 新增按钮（仅在我的私房菜标签显示） */}
      {activeTab === "my" && (
        <div className="px-6 pt-4">
          <button
            // onClick={handleAddNew}
            onClick={() => handleAddNew()}
            className="w-full bg-white border-2 border-dashed border-orange-300 text-orange-500 rounded-lg p-4 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>新增菜品</span>
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
                        {activeTab === "my" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingGroup(group); setEditingGroupName(group); }}
                            className="text-gray-400 hover:text-blue-500 p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-sm">
                          {dishesByGroup[group].length}道
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
                      {dishesByGroup[group].map((dish, index) => (
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
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 菜品详情弹窗 */}
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
                          {getDishNotes(selectedDish.name)}
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
          </>
        )}
      </div>
    </div>
  );
}
