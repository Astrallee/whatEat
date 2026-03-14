import { useState, useEffect } from "react";
import { CategorySlot } from "../components/CategorySlot";
import { AddDishSheet } from "../components/AddDishSheet";
import { LotteryAnimation } from "../components/LotteryAnimation";
import { DishContextMenu } from "../components/DishContextMenu";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router";

interface Dish {
  name: string;
  tags: string[];
  category: string;
}

const dishLibrary: Dish[] = [
  // 荤菜
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
  // 素菜
  { name: "蒜蓉西兰花", tags: ["清淡", "营养"], category: "素菜" },
  { name: "麻婆豆腐", tags: ["下饭", "川菜"], category: "素菜" },
  { name: "蚝油生菜", tags: ["快手", "清爽"], category: "素菜" },
  { name: "番茄炒蛋", tags: ["家常", "简单"], category: "素菜" },
  { name: "西红柿炒蛋", tags: ["家常", "简单"], category: "素菜" },
  // 汤
  { name: "紫菜蛋花汤", tags: ["清淡", "快手"], category: "汤" },
  { name: "玉米排骨汤", tags: ["滋补", "鲜美"], category: "汤" },
  { name: "番茄蛋花汤", tags: ["开胃", "家常"], category: "汤" },
  // 主食
  { name: "米饭", tags: ["主食", "经典"], category: "主食" },
  { name: "馒头", tags: ["主食", "北方"], category: "主食" },
  { name: "炒面", tags: ["主食", "快手"], category: "主食" },
  { name: "猪肉包子", tags: ["主食", "面食"], category: "主食" },
  { name: "蛋炒饭", tags: ["主食", "快手"], category: "主食" },
  // 甜品
  { name: "提拉米苏", tags: ["甜品", "经典"], category: "甜品" },
  { name: "芝士蛋糕", tags: ["甜品", "浓郁"], category: "甜品" },
  { name: "芒果布丁", tags: ["甜品", "清爽"], category: "甜品" },
  { name: "冰淇淋", tags: ["甜品", "凉爽"], category: "甜品" },
  { name: "山药蓝莓", tags: ["甜品", "健康"], category: "甜品" },
];

function loadBoardFromStorage(): typeof initialDishes {
  const savedBoard = localStorage.getItem("todayBoard");
  const board = savedBoard ? JSON.parse(savedBoard) : {};
  const newSelection: typeof initialDishes = {
    荤菜: [],
    素菜: [],
    汤: [],
    主食: [],
    甜品: [],
  };
  const categories = ["荤菜", "素菜", "汤", "主食", "甜品"] as const;
  
  categories.forEach((cat) => {
    if (board[cat] && Array.isArray(board[cat])) {
      board[cat].forEach((dishName: string) => {
        const dish = dishLibrary.find(d => d.name === dishName);
        if (dish) {
          newSelection[cat].push(dish);
        }
      });
    }
  });
  return newSelection;
}

const initialDishes = {
  荤菜: [],
  素菜: [],
  汤: [],
  主食: [],
  甜品: [],
};

export function Home() {
  const navigate = useNavigate();
  const [selectedDishes, setSelectedDishes] = useState(loadBoardFromStorage);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [lotteryOpen, setLotteryOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentDishIndex, setCurrentDishIndex] = useState<number>(0);
  const [isRandomAll, setIsRandomAll] = useState(false);

  const categories = ["荤菜", "素菜", "汤", "主食", "甜品"] as const;

  const isBoardFull = categories.every(cat => selectedDishes[cat].length > 0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setSelectedDishes(loadBoardFromStorage());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleAdd = (category: string) => {
    setCurrentCategory(category);
    setSheetOpen(true);
  };

  const handleRemove = (category: string, index: number) => {
    const newSelection = {
      ...selectedDishes,
      [category]: selectedDishes[category as keyof typeof selectedDishes].filter((_, i) => i !== index),
    };
    setSelectedDishes(newSelection);
    
    const board: Record<string, string[]> = {};
    categories.forEach((cat) => {
      if (newSelection[cat].length > 0) {
        board[cat] = newSelection[cat].map(d => d.name);
      }
    });
    localStorage.setItem("todayBoard", JSON.stringify(board));
  };

  const handleDishClick = (category: string, index: number) => {
    const dish = selectedDishes[category as keyof typeof selectedDishes][index];
    if (dish) {
      navigate(`/dish/${dish.name}`);
    }
  };

  const handleDishLongPress = (category: string, index: number) => {
    setCurrentCategory(category);
    setCurrentDishIndex(index);
    setContextMenuOpen(true);
  };

  const handleViewDetail = () => {
    const dishes = selectedDishes[currentCategory as keyof typeof selectedDishes];
    if (dishes && dishes.length > currentDishIndex) {
      navigate(`/dish/${dishes[currentDishIndex].name}`);
    }
  };

  const handleReplace = () => {
    setIsRandomAll(false);
    setLotteryOpen(true);
  };

  const handleContextDelete = () => {
    handleRemove(currentCategory, currentDishIndex);
  };

  const handleRandomPick = () => {
    setSheetOpen(false);
    setIsRandomAll(false);
    setLotteryOpen(true);
  };

  const handleRandomAll = () => {
    setCurrentCategory("全部");
    setIsRandomAll(true);
    setLotteryOpen(true);
  };

  const handleSelectFromLibrary = () => {
    navigate("/library");
  };

  const handleCreateNew = () => {
    navigate(`/add-dish?cuisine=${currentCategory}&from=home`);
  };

  const handleAddToBoard = (dish: Dish) => {
    let newSelection: typeof selectedDishes;
    if (isRandomAll) {
      newSelection = {
        荤菜: [],
        素菜: [],
        汤: [],
        主食: [],
        甜品: [],
      };
      categories.forEach((category) => {
        const availableDishes = dishLibrary.filter(
          (d) => d.category === category
        );
        if (availableDishes.length > 0) {
          newSelection[category] = [
            availableDishes[Math.floor(Math.random() * availableDishes.length)]
          ];
        }
      });
    } else {
      newSelection = {
        ...selectedDishes,
        [currentCategory]: [...selectedDishes[currentCategory as keyof typeof selectedDishes], dish],
      };
    }
    setSelectedDishes(newSelection);
    
    const board: Record<string, string[]> = {};
    categories.forEach((cat) => {
      if (newSelection[cat].length > 0) {
        board[cat] = newSelection[cat].map(d => d.name);
      }
    });
    localStorage.setItem("todayBoard", JSON.stringify(board));
  };

  const handleGenerateMenu = () => {
    const menu = Object.values(selectedDishes)
      .flatMap(d => d)
      .map(d => d.name);
    localStorage.setItem("todayMenu", JSON.stringify(menu));
    navigate("/menu-generate");
  };

  const getAvailableDishes = () => {
    if (isRandomAll) {
      return dishLibrary;
    }
    return dishLibrary.filter((dish) => dish.category === currentCategory);
  };

  const currentDishName = currentCategory ? 
    selectedDishes[currentCategory as keyof typeof selectedDishes]?.[currentDishIndex]?.name || "" : "";

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="bg-white px-6 pt-8 pb-6 shadow-sm">
        <div className="text-sm text-gray-500 mb-1">{dateStr}</div>
        <h1 className="text-2xl text-gray-900">今天也要认真吃饭</h1>
      </div>

      <div className="px-6 py-6">
        <h2 className="text-lg text-gray-900 mb-4 text-center">今日桌板</h2>

        <div className="space-y-3">
          {categories.map((category) => (
            <CategorySlot
              key={category}
              category={category}
              dishes={selectedDishes[category]}
              onAdd={() => handleAdd(category)}
              onRemove={(index) => handleRemove(category, index)}
              onClick={(index) => handleDishClick(category, index)}
              onLongPress={(index) => handleDishLongPress(category, index)}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {isBoardFull ? (
          <button
            onClick={handleGenerateMenu}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span>生成菜单</span>
          </button>
        ) : (
          <button
            onClick={handleRandomAll}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>一键摇签</span>
          </button>
        )}

        <button
          onClick={() => navigate("/library")}
          className="w-full text-orange-500 hover:text-orange-600 py-2 transition-colors"
        >
          进入菜库
        </button>
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
        category={currentCategory}
        availableDishes={getAvailableDishes()}
      />

      <DishContextMenu
        open={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        onViewDetail={handleViewDetail}
        onReplace={handleReplace}
        onDelete={handleContextDelete}
        dishName={currentDishName}
      />
    </div>
  );
}