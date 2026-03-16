import { useState, useEffect, useRef } from "react";
import { CategorySlot } from "../components/CategorySlot";
import { AddDishSheet } from "../components/AddDishSheet";
import { LotteryAnimation } from "../components/LotteryAnimation";
import { Sparkles, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";

interface Dish {
  name: string;
  tags: string[];
  category: string;
  source?: 'system' | 'user';
}

const dishLibrary: Dish[] = [
  { name: "红烧肉", tags: ["下饭", "经典"], category: "荤菜" },
  { name: "糖醋里脊", tags: ["酸甜", "开胃"], category: "荤菜" },
  { name: "宫保鸡丁", tags: ["川菜", "香辣"], category: "荤菜" },
  { name: "清蒸鱼", tags: ["清淡", "健康"], category: "荤菜" },
  { name: "回锅肉", tags: ["下饭", "经典"], category: "荤菜" },
  { name: "水煮鱼", tags: ["麻辣", "鲜美"], category: "荤菜" },
  { name: "可乐鸡翅", tags: ["甜香", "下饭"], category: "荤菜" },
  { name: "葱爆羊肉", tags: ["香鲜", "快手"], category: "荤菜" },
  { name: "九转大肠", tags: ["经典", "重口"], category: "荤菜" },
  { name: "白切鸡", tags: ["清淡", "原味"], category: "荤菜" },
  { name: "蒜蓉西兰花", tags: ["清淡", "营养"], category: "素菜" },
  { name: "麻婆豆腐", tags: ["下饭", "川菜"], category: "素菜" },
  { name: "蚝油生菜", tags: ["快手", "清爽"], category: "素菜" },
  { name: "番茄炒蛋", tags: ["家常", "简单"], category: "素菜" },
  { name: "西红柿炒蛋", tags: ["家常", "简单"], category: "素菜" },
  { name: "紫菜蛋花汤", tags: ["清淡", "快手"], category: "汤" },
  { name: "玉米排骨汤", tags: ["滋补", "鲜美"], category: "汤" },
  { name: "番茄蛋花汤", tags: ["开胃", "家常"], category: "汤" },
  { name: "米饭", tags: ["主食", "经典"], category: "主食" },
  { name: "馒头", tags: ["主食", "北方"], category: "主食" },
  { name: "炒面", tags: ["主食", "快手"], category: "主食" },
  { name: "猪肉包子", tags: ["主食", "面食"], category: "主食" },
  { name: "蛋炒饭", tags: ["主食", "快手"], category: "主食" },
  { name: "提拉米苏", tags: ["甜品", "经典"], category: "甜品" },
  { name: "芝士蛋糕", tags: ["甜品", "浓郁"], category: "甜品" },
  { name: "芒果布丁", tags: ["甜品", "清爽"], category: "甜品" },
  { name: "冰淇淋", tags: ["甜品", "凉爽"], category: "甜品" },
  { name: "山药蓝莓", tags: ["甜品", "健康"], category: "甜品" },
];

const categories = ["荤菜", "素菜", "汤", "主食", "甜品"] as const;

function loadBoardFromStorage(): Dish[] {
  const savedBoard = localStorage.getItem("todayBoard");
  const savedSources = localStorage.getItem("todayBoardSources");
  if (!savedBoard) return [];
  
  const board: Record<string, string[]> = JSON.parse(savedBoard);
  const sources: Record<string, 'system' | 'user'> = savedSources ? JSON.parse(savedSources) : {};
  const dishes: Dish[] = [];
  
  // Load user dishes from localStorage
  const savedUserDishes = localStorage.getItem("myDishes");
  const userDishes: Dish[] = savedUserDishes ? JSON.parse(savedUserDishes) : [];
  
  // Build a map for quick lookup of user dishes by name
  const userDishesMap = new Map<string, Dish>();
  userDishes.forEach(d => userDishesMap.set(d.name, d));
  
  categories.forEach((cat) => {
    if (board[cat] && Array.isArray(board[cat])) {
      board[cat].forEach((dishName: string) => {
        // First check system dishes
        let dish = dishLibrary.find(d => d.name === dishName);
        let source: 'system' | 'user' = sources[dishName] || 'system';
        let finalCategory = cat;
        
        // If not found, check user dishes
        if (!dish) {
          const userDish = userDishesMap.get(dishName);
          if (userDish) {
            dish = userDish;
            source = 'user';
            // Use the actual category from user dish if it's valid
            if (userDish.category && categories.includes(userDish.category as any)) {
              finalCategory = userDish.category;
            }
          }
        }
        
        if (dish) {
          dishes.push({ ...dish, category: finalCategory, source });
        }
      });
    }
  });
  
  return dishes;
}

export function Home() {
  const navigate = useNavigate();
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lotteryOpen, setLotteryOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [isRandomAll, setIsRandomAll] = useState(false);
  const [randomCount, setRandomCount] = useState<number>(3);
  const [showCountDialog, setShowCountDialog] = useState(false);
  const [lotteryAvoidTags, setLotteryAvoidTags] = useState<string[]>([]);
  
  // 当前日期
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  // Load data on mount
  useEffect(() => {
    loadBoardData();
  }, []);

  const loadBoardData = async () => {
    // 加载本地桌板数据
    setSelectedDishes(loadBoardFromStorage());
  };

  const saveToStorage = async (dishes: Dish[]) => {
    const board: Record<string, string[]> = {
      荤菜: [],
      素菜: [],
      汤: [],
      主食: [],
      甜品: [],
    };
    const sources: Record<string, 'system' | 'user'> = {};
    dishes.forEach((dish) => {
      if (board[dish.category]) {
        board[dish.category].push(dish.name);
      }
      sources[dish.name] = dish.source || 'system';
    });
    localStorage.setItem("todayBoard", JSON.stringify(board));
    localStorage.setItem("todayBoardSources", JSON.stringify(sources));
  };

  const handleAddToBoard = (dish: Dish) => {
    const source = dish.source || 'system';
    const newDishes = [...selectedDishes, { ...dish, category: dish.category, source }];
    setSelectedDishes(newDishes);
    saveToStorage(newDishes);
  };

  const handleAddMultipleToBoard = (dishes: Dish[]) => {
    const newDishes = [...selectedDishes, ...dishes.map(d => ({ ...d, category: d.category, source: d.source || 'system' }))];
    setSelectedDishes(newDishes);
    saveToStorage(newDishes);
  };

  const handleGenerateMenu = () => {
    const menu = selectedDishes.map(d => d.name);
    localStorage.setItem("todayMenu", JSON.stringify(menu));
    
    navigate("/menu-generate");
  };

  const getAvailableDishes = (): Dish[] => {
    const savedUserDishes = localStorage.getItem("myDishes");
    const userDishes: Dish[] = savedUserDishes ? JSON.parse(savedUserDishes) : [];
    
    const systemDishes = dishLibrary.map(d => ({ ...d, source: 'system' as const }));
    const userDishesWithSource = userDishes.map(d => ({ ...d, source: 'user' as const }));
    
    if (isRandomAll) {
      return [...systemDishes, ...userDishesWithSource];
    }
    if (currentCategory) {
      return [...systemDishes, ...userDishesWithSource].filter(d => d.category === currentCategory);
    }
    return [...systemDishes, ...userDishesWithSource];
  };

  const getCurrentSummary = (): string => {
    if (selectedDishes.length === 0) return "还未选择菜品";
    const categoryCount: Record<string, number> = {};
    selectedDishes.forEach(dish => {
      categoryCount[dish.category] = (categoryCount[dish.category] || 0) + 1;
    });
    const parts = Object.entries(categoryCount).map(([cat, count]) => `${cat}x${count}`);
    return `${selectedDishes.length}道菜 - ${parts.join(" ")}`;
  };

  const getSuggestion = (): string => {
    if (selectedDishes.length === 0) return "点击下方添加菜品开始搭配";
    const categories = selectedDishes.map(d => d.category);
    const hasMeat = categories.includes("荤菜");
    const hasVegetable = categories.includes("素菜");
    const hasSoup = categories.includes("汤");
    const hasStaple = categories.includes("主食");
    
    if (!hasMeat) return "建议加一道荤菜";
    if (!hasVegetable) return "建议加一道素菜";
    if (!hasSoup && selectedDishes.length < 4) return "可以加一道汤";
    if (!hasStaple) return "建议加一份主食";
    if (hasMeat && hasVegetable && hasSoup && hasStaple) return "营养均衡的搭配！";
    return "搭配不错";
  };

  const isBoardFull = selectedDishes.length >= 1;

  const handleAdd = () => setSheetOpen(true);

  const handleRemove = (index: number) => {
    const newDishes = selectedDishes.filter((_, i) => i !== index);
    setSelectedDishes(newDishes);
    saveToStorage(newDishes);
  };

  const handleDishClick = (dishName: string) => {
    navigate(`/dish/${dishName}`);
  };

  const handleTouchStart = (index: number) => {};
  const handleTouchEnd = () => {};

  const handleRandomPick = (category: string, avoidTags: string[]) => {
    setCurrentCategory(category);
    setLotteryAvoidTags(avoidTags);
    setIsRandomAll(false);
    setSheetOpen(false);
    setLotteryOpen(true);
  };

  const handleSelectFromLibrary = () => {
    navigate("/library");
  };

  const handleCreateNew = () => {
    navigate("/library?create=true");
  };

  const handleStartRandomAll = (count: number) => {
    setRandomCount(count);
    setShowCountDialog(false);
    setIsRandomAll(true);
    setCurrentCategory("");
    setLotteryAvoidTags([]);
    setLotteryOpen(true);
  };

  const handleRandomAll = () => {
    setShowCountDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      <div className="bg-white px-6 pt-8 pb-6 shadow-sm">
        <div className="text-sm text-gray-500 mb-1">{dateStr}</div>
        <h1 className="text-2xl text-gray-900">今天也要认真吃饭</h1>
      </div>

      <div className="px-6 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="text-sm text-gray-500 mb-2">当前搭配</div>
          <div className="text-lg font-medium text-gray-900 mb-1">{getCurrentSummary()}</div>
          <div className="text-sm text-orange-500">{getSuggestion()}</div>
        </div>

        {selectedDishes.length > 0 ? (
          <div className="space-y-3 mb-4">
            {selectedDishes.map((dish, index) => (
              <div
                key={index}
                onClick={() => handleDishClick(dish.name)}
                onTouchStart={() => handleTouchStart(index)}
                onTouchEnd={handleTouchEnd}
                className="bg-white rounded-lg p-4 shadow-sm cursor-pointer active:scale-95 transition-transform"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{dish.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                        {dish.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dish.tags.map((tag, i) => (
                        <span key={i} className="text-xs text-orange-600">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 mb-4">
            还没有添加菜品
          </div>
        )}

        <button
          onClick={handleAdd}
          className="w-full border-2 border-dashed border-orange-300 text-orange-500 rounded-lg p-4 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="w-5 h-5" />
          <span>添加菜</span>
        </button>

        {selectedDishes.length > 0 ? (
          <button
            onClick={handleGenerateMenu}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span>生成今日菜单</span>
          </button>
        ) : (
          <button
            onClick={handleRandomAll}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">🏮</span>
            <span>一键摇签</span>
          </button>
        )}
      </div>

      <AddDishSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRandomPick={handleRandomPick}
        onSelectFromLibrary={handleSelectFromLibrary}
        onCreateNew={handleCreateNew}
      />

      <LotteryAnimation
        open={lotteryOpen}
        onClose={() => setLotteryOpen(false)}
        onAddToBoard={handleAddToBoard}
        onAddMultipleToBoard={handleAddMultipleToBoard}
        category={currentCategory}
        availableDishes={getAvailableDishes()}
        isRandomAll={isRandomAll}
        randomCount={randomCount}
        avoidTags={lotteryAvoidTags}
      />

      <Dialog open={showCountDialog} onOpenChange={setShowCountDialog}>
        <DialogContent className="max-w-sm">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">🏮</div>
            <h2 className="text-lg font-semibold">一键摇签</h2>
            <p className="text-sm text-gray-500 mt-1">请选择要摇的菜品数量</p>
          </div>
          <div className="flex justify-center gap-3 mb-4">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => handleStartRandomAll(count)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium transition-colors ${
                  randomCount === count
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            每道菜将来自不同分类
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}