import { useState } from "react";
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

// 示例菜品库
const dishLibrary: Dish[] = [
  { name: "红烧肉", tags: ["下饭", "经典"], category: "荤菜" },
  { name: "糖醋里脊", tags: ["酸甜", "开胃"], category: "荤菜" },
  { name: "宫保鸡丁", tags: ["川菜", "香辣"], category: "荤菜" },
  { name: "清蒸鱼", tags: ["清淡", "健康"], category: "荤菜" },
  { name: "蒜蓉西兰花", tags: ["清淡", "营养"], category: "素菜" },
  { name: "麻婆豆腐", tags: ["下饭", "川菜"], category: "素菜" },
  { name: "蚝油生菜", tags: ["快手", "清爽"], category: "素菜" },
  { name: "番茄炒蛋", tags: ["家常", "简单"], category: "素菜" },
  { name: "紫菜蛋花汤", tags: ["清淡", "快手"], category: "汤" },
  { name: "玉米排骨汤", tags: ["滋补", "鲜美"], category: "汤" },
  { name: "番茄蛋花汤", tags: ["开胃", "家常"], category: "汤" },
  { name: "米饭", tags: ["主食", "经典"], category: "主食" },
  { name: "馒头", tags: ["主食", "北方"], category: "主食" },
  { name: "炒面", tags: ["主食", "快手"], category: "主食" },
];

export function Home() {
  const navigate = useNavigate();
  const [selectedDishes, setSelectedDishes] = useState<{
    荤菜: Dish | null;
    素菜: Dish | null;
    汤: Dish | null;
    主食: Dish | null;
  }>({
    荤菜: null,
    素菜: null,
    汤: null,
    主食: null,
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [lotteryOpen, setLotteryOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [isRandomAll, setIsRandomAll] = useState(false);

  const categories = ["荤菜", "素菜", "汤", "主食"] as const;

  // 检查桌板是否填满
  const isBoardFull = categories.every(cat => selectedDishes[cat] !== null);

  const handleAdd = (category: string) => {
    setCurrentCategory(category);
    setSheetOpen(true);
  };

  const handleRemove = (category: string) => {
    setSelectedDishes((prev) => ({
      ...prev,
      [category]: null,
    }));
  };

  const handleDishClick = (category: string) => {
    // TODO: 跳转到菜品详情页
    const dish = selectedDishes[category as keyof typeof selectedDishes];
    if (dish) {
      alert(`查看详情：${dish.name}`);
    }
  };

  const handleDishLongPress = (category: string) => {
    setCurrentCategory(category);
    setContextMenuOpen(true);
  };

  const handleViewDetail = () => {
    const dish = selectedDishes[currentCategory as keyof typeof selectedDishes];
    if (dish) {
      // TODO: 跳转到菜品详情页
      alert(`查看详情：${dish.name}`);
    }
  };

  const handleReplace = () => {
    // 打开抽签页面替换当前菜品
    setIsRandomAll(false);
    setLotteryOpen(true);
  };

  const handleContextDelete = () => {
    handleRemove(currentCategory);
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
    // TODO: 跳转到新建菜品页面
    alert("新建菜品功能即将推出");
  };

  const handleAddToBoard = (dish: Dish) => {
    if (isRandomAll) {
      // 一键摇签：为所有类别随机选择
      const newSelection: any = {};
      categories.forEach((category) => {
        const availableDishes = dishLibrary.filter(
          (d) => d.category === category
        );
        if (availableDishes.length > 0) {
          newSelection[category] =
            availableDishes[Math.floor(Math.random() * availableDishes.length)];
        }
      });
      setSelectedDishes(newSelection);
    } else {
      // 单个菜品添加
      setSelectedDishes((prev) => ({
        ...prev,
        [currentCategory]: dish,
      }));
    }
  };

  const handleGenerateMenu = () => {
    // TODO: 跳转到菜单生成页
    alert("生成菜单功能即将推出");
  };

  // 获取可用的菜品列表
  const getAvailableDishes = () => {
    if (isRandomAll) {
      return dishLibrary;
    }
    return dishLibrary.filter((dish) => dish.category === currentCategory);
  };

  // 获取当前日期
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  // 获取长按菜品名称
  const currentDishName = currentCategory ? 
    selectedDishes[currentCategory as keyof typeof selectedDishes]?.name || "" : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* 头部 */}
      <div className="bg-white px-6 pt-8 pb-6 shadow-sm">
        <div className="text-sm text-gray-500 mb-1">{dateStr}</div>
        <h1 className="text-2xl text-gray-900">今天也要认真吃饭</h1>
      </div>

      {/* 今日桌板 */}
      <div className="px-6 py-6">
        <h2 className="text-lg text-gray-900 mb-4 text-center">今日桌板</h2>

        <div className="space-y-3">
          {categories.map((category) => (
            <CategorySlot
              key={category}
              category={category}
              dish={selectedDishes[category]}
              onAdd={() => handleAdd(category)}
              onRemove={() => handleRemove(category)}
              onClick={() => handleDishClick(category)}
              onLongPress={() => handleDishLongPress(category)}
            />
          ))}
        </div>
      </div>

      {/* 操作区 */}
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

      {/* 添加菜品 Action Sheet */}
      <AddDishSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRandomPick={handleRandomPick}
        onSelectFromLibrary={handleSelectFromLibrary}
        onCreateNew={handleCreateNew}
      />

      {/* 抽签动画 */}
      <LotteryAnimation
        open={lotteryOpen}
        onClose={() => setLotteryOpen(false)}
        onAddToBoard={handleAddToBoard}
        category={currentCategory}
        availableDishes={getAvailableDishes()}
      />

      {/* 菜品操作菜单 */}
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