import { useState } from "react";
import { Search, ChevronRight, ChevronDown, Plus, Edit2, Trash2 } from "lucide-react";

interface Dish {
  name: string;
  tags: string[];
  category: string;
  cuisine: string; // 菜系分类
  group?: string; // 自定义分组（仅用于私房菜）
}

const dishLibrary: Dish[] = [
  { name: "宫保鸡丁", tags: ["川菜", "香辣"], category: "荤菜", cuisine: "川菜" },
  { name: "麻婆豆腐", tags: ["下饭", "川菜"], category: "素菜", cuisine: "川菜" },
  { name: "回锅肉", tags: ["下饭", "经典"], category: "荤菜", cuisine: "川菜" },
  { name: "水煮鱼", tags: ["麻辣", "鲜美"], category: "荤菜", cuisine: "川菜" },
  
  { name: "西红柿炒蛋", tags: ["家常", "简单"], category: "素菜", cuisine: "家常菜" },
  { name: "可乐鸡翅", tags: ["甜香", "下饭"], category: "荤菜", cuisine: "家常菜" },
  { name: "红烧肉", tags: ["下饭", "经典"], category: "荤菜", cuisine: "家常菜" },
  { name: "糖醋里脊", tags: ["酸甜", "开胃"], category: "荤菜", cuisine: "家常菜" },
  
  { name: "清蒸鱼", tags: ["清淡", "健康"], category: "荤菜", cuisine: "粤菜" },
  { name: "白切鸡", tags: ["清淡", "原味"], category: "荤菜", cuisine: "粤菜" },
  { name: "蚝油生菜", tags: ["快手", "清爽"], category: "素菜", cuisine: "粤菜" },
  
  { name: "葱爆羊肉", tags: ["香鲜", "快手"], category: "荤菜", cuisine: "鲁菜" },
  { name: "九转大肠", tags: ["经典", "重口"], category: "荤菜", cuisine: "鲁菜" },
  
  { name: "紫菜蛋花汤", tags: ["清淡", "快手"], category: "汤", cuisine: "汤羹" },
  { name: "玉米排骨汤", tags: ["滋补", "鲜美"], category: "汤", cuisine: "汤羹" },
  { name: "番茄蛋花汤", tags: ["开胃", "家常"], category: "汤", cuisine: "汤羹" },
];

// 我的私房菜（示例数据）
const myDishes: Dish[] = [
  { name: "红烧肉", tags: ["家传", "下饭"], category: "荤菜", cuisine: "家常菜", group: "我宝心头爱" },
  { name: "蒜蓉虾", tags: ["鲜香", "快手"], category: "荤菜", cuisine: "粤菜", group: "我宝心头爱" },
  { name: "鸡胸肉沙拉", tags: ["健康", "低脂"], category: "素菜", cuisine: "西式", group: "减脂餐" },
];

export function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"system" | "my">("system");
  const [expandedCuisines, setExpandedCuisines] = useState<Set<string>>(
    new Set(["川菜", "家常菜", "我宝心头爱", "减脂餐"])
  );

  const currentDishes = activeTab === "system" ? dishLibrary : myDishes;

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
    // TODO: 实现编辑功能
    alert(`编辑菜品: ${dish.name}`);
  };

  const handleDelete = (dish: Dish) => {
    // TODO: 实现删除功能
    if (confirm(`确定要删除"${dish.name}"吗？`)) {
      alert(`已删除: ${dish.name}`);
    }
  };

  const handleAddNew = () => {
    // TODO: 跳转到新增菜品页面
    alert("跳转到新增菜品页面");
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
            onClick={handleAddNew}
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
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group} className="bg-white rounded-lg overflow-hidden shadow-sm">
                {/* 分组标题 */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{group}</span>
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

                {/* 菜品列表 */}
                {expandedCuisines.has(group) && (
                  <div className="border-t border-gray-100">
                    {dishesByGroup[group].map((dish, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
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
                            {activeTab === "my" ? (
                              <>
                                <button
                                  onClick={() => handleEdit(dish)}
                                  className="text-blue-500 hover:text-blue-600 p-1"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(dish)}
                                  className="text-red-500 hover:text-red-600 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                {dish.category}
                              </span>
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
        )}
      </div>
    </div>
  );
}