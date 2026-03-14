import { useState, useEffect, useRef } from "react";
import { CategorySlot } from "../components/CategorySlot";
import { AddDishSheet } from "../components/AddDishSheet";
import { LotteryAnimation } from "../components/LotteryAnimation";
import { DishContextMenu } from "../components/DishContextMenu";
import { Sparkles, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";

interface Dish {
  name: string;
  tags: string[];
  category: string;
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
  if (!savedBoard) return [];
  
  const board: Record<string, string[]> = JSON.parse(savedBoard);
  const dishes: Dish[] = [];
  
  categories.forEach((cat) => {
    if (board[cat] && Array.isArray(board[cat])) {
      board[cat].forEach((dishName: string) => {
        const dish = dishLibrary.find(d => d.name === dishName);
        if (dish) {
          dishes.push({ ...dish, category: cat });
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
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentDishIndex, setCurrentDishIndex] = useState<number>(0);
  const [isRandomAll, setIsRandomAll] = useState(false);
  const [randomCount, setRandomCount] = useState<number>(3);
  const [showCountDialog, setShowCountDialog] = useState(false);

  useEffect(() => {
    setSelectedDishes(loadBoardFromStorage());
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setSelectedDishes(loadBoardFromStorage());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const categoryCount = {
    荤菜: selectedDishes.filter(d => d.category === "荤菜").length,
    素菜: selectedDishes.filter(d => d.category === "素菜").length,
    汤: selectedDishes.filter(d => d.category === "汤").length,
    主食: selectedDishes.filter(d => d.category === "主食").length,
    甜品: selectedDishes.filter(d => d.category === "甜品").length,
  };

  const totalDishes = selectedDishes.length;
  const isBoardFull = totalDishes > 0;

  const getSuggestion = () => {
    if (totalDishes === 0) return "开始添加你的今日菜单吧";
    if (categoryCount.荤菜 === 0 && categoryCount.素菜 === 0) return "建议加一道荤菜或素菜";
    if (categoryCount.汤 === 0) return "建议加一道汤";
    if (categoryCount.主食 === 0) return "建议加一道主食";
    if (categoryCount.甜品 === 0 && totalDishes >= 4) return "可以加道甜品收尾";
    return "搭配很均衡！";
  };

  const getCurrentSummary = () => {
    const parts = [];
    if (categoryCount.荤菜 > 0) parts.push(`${categoryCount.荤菜}荤`);
    if (categoryCount.素菜 > 0) parts.push(`${categoryCount.素菜}素`);
    if (categoryCount.汤 > 0) parts.push(`${categoryCount.汤}汤`);
    if (categoryCount.主食 > 0) parts.push(`${categoryCount.主食}主食`);
    if (categoryCount.甜品 > 0) parts.push(`${categoryCount.甜品}甜品`);
    return parts.join(" ") || "还未添加";
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (index: number) => {
    longPressTimer.current = setTimeout(() => {
      handleDishLongPress(index);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleAdd = () => {
    setCurrentCategory("");
    setSheetOpen(true);
  };

  const handleRemove = (index: number) => {
    const newDishes = selectedDishes.filter((_, i) => i !== index);
    setSelectedDishes(newDishes);
    saveToStorage(newDishes);
  };

  const handleDishClick = (index: number) => {
    const dish = selectedDishes[index];
    if (dish) {
      navigate(`/dish/${dish.name}`);
    }
  };

  const handleDishLongPress = (index: number) => {
    setCurrentDishIndex(index);
    setContextMenuOpen(true);
  };

  const handleViewDetail = () => {
    if (selectedDishes[currentDishIndex]) {
      navigate(`/dish/${selectedDishes[currentDishIndex].name}`);
    }
  };

  const handleReplace = () => {
    setIsRandomAll(false);
    setLotteryOpen(true);
  };

  const handleContextDelete = () => {
    handleRemove(currentDishIndex);
  };

  const [lotteryAvoidTags, setLotteryAvoidTags] = useState<string[]>([]);

  const handleRandomPick = (category: string, avoidTags: string[]) => {
    setCurrentCategory(category);
    setLotteryAvoidTags(avoidTags);
    setIsRandomAll(false);
    setSheetOpen(false);
    setLotteryOpen(true);
  };

  const handleRandomAll = () => {
    setShowCountDialog(true);
  };

  const handleStartRandomAll = (count: number) => {
    setRandomCount(count);
    setCurrentCategory("全部");
    setIsRandomAll(true);
    setShowCountDialog(false);
    setLotteryOpen(true);
  };

  const handleSelectFromLibrary = () => {
    navigate("/library");
  };

  const handleCreateNew = () => {
    navigate(`/add-dish?from=home`);
  };

  const saveToStorage = (dishes: Dish[]) => {
    const board: Record<string, string[]> = {
      荤菜: [],
      素菜: [],
      汤: [],
      主食: [],
      甜品: [],
    };
    dishes.forEach((dish) => {
      if (board[dish.category]) {
        board[dish.category].push(dish.name);
      }
    });
    localStorage.setItem("todayBoard", JSON.stringify(board));
  };

  const handleAddToBoard = (dish: Dish) => {
    const newDishes = [...selectedDishes, { ...dish, category: dish.category }];
    setSelectedDishes(newDishes);
    saveToStorage(newDishes);
  };

  const handleAddMultipleToBoard = (dishes: Dish[]) => {
    const newDishes = [...selectedDishes, ...dishes.map(d => ({ ...d, category: d.category }))];
    setSelectedDishes(newDishes);
    saveToStorage(newDishes);
  };

  const handleGenerateMenu = () => {
    const menu = selectedDishes.map(d => d.name);
    localStorage.setItem("todayMenu", JSON.stringify(menu));
    
    const historyRecord = {
      id: Date.now().toString(),
      date: dateStr,
      timeType: "晚餐",
      dishes: selectedDishes.map(d => ({ name: d.name, category: d.category, tags: d.tags })),
    };
    
    const savedHistory = localStorage.getItem("historyBoard");
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    history.unshift(historyRecord);
    localStorage.setItem("historyBoard", JSON.stringify(history));
    
    const savedDecideCount = localStorage.getItem("decideCount");
    const decideCount = savedDecideCount ? parseInt(savedDecideCount) : 0;
    localStorage.setItem("decideCount", String(decideCount + 1));
    
    navigate("/menu-generate");
  };

  const getAvailableDishes = () => {
    if (isRandomAll) {
      return dishLibrary;
    }
    if (currentCategory) {
      return dishLibrary.filter(d => d.category === currentCategory);
    }
    return dishLibrary;
  };

  const currentDishName = selectedDishes[currentDishIndex]?.name || "";

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
                onClick={() => handleDishClick(index)}
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

        {isBoardFull ? (
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

      <DishContextMenu
        open={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        onViewDetail={handleViewDetail}
        onReplace={handleReplace}
        onDelete={handleContextDelete}
        dishName={currentDishName}
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