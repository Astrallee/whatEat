import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface Dish {
  name: string;
  tags: string[];
  category: string;
}

interface LotteryAnimationProps {
  open: boolean;
  onClose: () => void;
  onAddToBoard: (dish: Dish) => void;
  category: string;
  availableDishes: Dish[];
}

export function LotteryAnimation({
  open,
  onClose,
  onAddToBoard,
  category,
  availableDishes,
}: LotteryAnimationProps) {
  const [isShaking, setIsShaking] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (open) {
      // 重置状态
      setShowResult(false);
      setSelectedDish(null);
      
      // 开始摇动动画
      setIsShaking(true);
      
      // 2秒后停止摇动并显示结果
      setTimeout(() => {
        setIsShaking(false);
        if (availableDishes.length > 0) {
          const randomDish =
            availableDishes[Math.floor(Math.random() * availableDishes.length)];
          setSelectedDish(randomDish);
          setShowResult(true);
        }
      }, 2000);
    }
  }, [open, availableDishes]);

  const handleShakeAgain = () => {
    setShowResult(false);
    setIsShaking(true);
    
    setTimeout(() => {
      setIsShaking(false);
      if (availableDishes.length > 0) {
        const randomDish =
          availableDishes[Math.floor(Math.random() * availableDishes.length)];
        setSelectedDish(randomDish);
        setShowResult(true);
      }
    }, 2000);
  };

  const handleAddToBoard = () => {
    if (selectedDish) {
      onAddToBoard(selectedDish);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 签筒动画区域 */}
        <div className="relative h-64 bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
          {!showResult ? (
            <motion.div
              animate={
                isShaking
                  ? {
                      rotate: [0, -10, 10, -10, 10, 0],
                      y: [0, -5, 5, -5, 5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: isShaking ? Infinity : 0,
              }}
              className="text-8xl"
            >
              🎲
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎊</div>
              <div className="text-orange-500 flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5" />
                <span>抽签成功</span>
                <Sparkles className="w-5 h-5" />
              </div>
            </motion.div>
          )}
        </div>

        {/* 结果显示区域 */}
        {showResult && selectedDish && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-4 border-t border-gray-100"
          >
            <div className="text-center mb-4">
              <div className="text-sm text-gray-500 mb-2">今日推荐</div>
              <div className="text-2xl text-gray-900 mb-3">
                {selectedDish.name}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedDish.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 操作按钮 */}
        <div className="px-6 pb-6 space-y-3">
          {showResult && selectedDish ? (
            <>
              <button
                onClick={handleAddToBoard}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-colors"
              >
                加入桌板
              </button>
              <button
                onClick={handleShakeAgain}
                className="w-full text-orange-500 hover:text-orange-600 py-2 transition-colors"
              >
                再摇一次
              </button>
              <button
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-600 py-2 transition-colors"
              >
                换一道（去菜库）
              </button>
            </>
          ) : (
            <div className="text-center text-gray-400 py-4">
              正在为您抽签...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
