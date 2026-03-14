import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";

interface Dish {
  name: string;
  tags: string[];
  category: string;
}

interface LotteryAnimationProps {
  open: boolean;
  onClose: () => void;
  onAddToBoard: (dish: Dish) => void;
  onAddMultipleToBoard?: (dishes: Dish[]) => void;
  category: string;
  availableDishes: Dish[];
  isRandomAll?: boolean;
  randomCount?: number;
}

type AnimationPhase = "idle" | "shaking" | "flying" | "revealing" | "result";

export function LotteryAnimation({
  open,
  onClose,
  onAddToBoard,
  onAddMultipleToBoard,
  category,
  availableDishes,
  isRandomAll = false,
  randomCount = 3,
}: LotteryAnimationProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isMultiMode = isRandomAll && category === "全部";

  useEffect(() => {
    if (open) {
      setPhase("idle");
      setSelectedDishes([]);
      setCurrentIndex(0);
      setTimeout(() => {
        startShake();
      }, 500);
    }
  }, [open, availableDishes]);

  const startShake = () => {
    setPhase("shaking");
    
    setTimeout(() => {
      setPhase("flying");
    }, 1500);

    setTimeout(() => {
      setPhase("revealing");
    }, 2000);

    setTimeout(() => {
      if (isMultiMode) {
        const categories = ["荤菜", "素菜", "汤", "主食", "甜品"];
        const results: Dish[] = [];
        const usedCategories = new Set<string>();
        
        for (let i = 0; i < randomCount; i++) {
          const targetCat = categories[i % categories.length];
          const filtered = availableDishes.filter(d => d.category === targetCat);
          if (filtered.length > 0) {
            const randomDish = filtered[Math.floor(Math.random() * filtered.length)];
            results.push(randomDish);
            usedCategories.add(targetCat);
          }
        }
        
        while (results.length < randomCount) {
          const remaining = availableDishes.filter(d => !usedCategories.has(d.category));
          if (remaining.length > 0) {
            const randomDish = remaining[Math.floor(Math.random() * remaining.length)];
            results.push(randomDish);
            usedCategories.add(randomDish.category);
          } else {
            break;
          }
        }
        
        setSelectedDishes(results);
      } else {
        if (availableDishes.length > 0) {
          const randomDish = availableDishes[Math.floor(Math.random() * availableDishes.length)];
          setSelectedDishes([randomDish]);
        }
      }
      setPhase("result");
    }, 2800);
  };

  const handleShakeAgain = () => {
    setPhase("idle");
    setSelectedDishes([]);
    setCurrentIndex(0);
    setTimeout(() => {
      startShake();
    }, 300);
  };

  const handleAddToBoard = () => {
    if (isMultiMode && onAddMultipleToBoard) {
      onAddMultipleToBoard(selectedDishes);
    } else {
      selectedDishes.forEach(dish => {
        onAddToBoard(dish);
      });
    }
    onClose();
  };

  const handleChangeDish = () => {
    onClose();
    navigate("/library");
  };

  const currentDish = selectedDishes[currentIndex];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="bg-gradient-to-b from-orange-50 to-orange-100/30 p-8 min-h-[280px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "shaking" && (
              <motion.div
                key="shaking"
                initial={{ rotate: 0 }}
                animate={{ rotate: [-5, 5, -5, 5, 0] }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="cursor-pointer"
                onClick={startShake}
              >
                <motion.div
                  animate={{ y: [0, -3, 3, -3, 0] }}
                  transition={{ duration: 0.15, repeat: Infinity }}
                >
                  <div className="text-7xl">🏮</div>
                </motion.div>
              </motion.div>
            )}

            {phase === "flying" && (
              <motion.div
                key="flying"
                initial={{ scale: 1, y: 0, rotate: 0 }}
                animate={{ scale: 1.2, y: -20, rotate: 15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-7xl">🏮</div>
                </motion.div>
                <motion.div
                  initial={{ y: 50, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="absolute left-1/2 -translate-x-1/2"
                >
                  <div className="text-5xl">📜</div>
                </motion.div>
              </motion.div>
            )}

            {phase === "revealing" && (
              <motion.div
                key="revealing"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-6xl"
                >
                  ✨
                </motion.div>
              </motion.div>
            )}

            {phase === "result" && isMultiMode && selectedDishes.length > 0 && (
              <motion.div
                key="result-multi"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl mb-2"
                >
                  🍀
                </motion.div>
                <div className="text-orange-600 flex items-center justify-center gap-1 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>今日幸运</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>
            )}

            {phase === "result" && !isMultiMode && currentDish && (
              <motion.div
                key="result-single"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl mb-2"
                >
                  🍀
                </motion.div>
                <div className="text-orange-600 flex items-center justify-center gap-1 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>今日幸运</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>
            )}

            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center cursor-pointer"
                onClick={startShake}
              >
                <div className="text-7xl mb-4">🏮</div>
                <div className="text-gray-500 text-sm">点击签筒开始抽签</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {phase === "result" && selectedDishes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-6 py-4"
          >
            {isMultiMode ? (
              <div className="text-center mb-2">
                <div className="text-sm text-gray-500">今日推荐</div>
              </div>
            ) : (
              <div className="text-center mb-2">
                <div className="text-sm text-gray-500">今日推荐</div>
              </div>
            )}
            
            {isMultiMode ? (
              <div className="space-y-2 mb-4">
                {selectedDishes.map((dish, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span className="text-gray-900 font-medium">{dish.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{dish.category}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="text-center mb-3">
                  <div className="text-2xl font-semibold text-gray-900">
                    {currentDish.name}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  {currentDish.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        <div className="px-6 pb-6 space-y-2">
          {phase === "result" ? (
            <>
              <Button
                onClick={handleAddToBoard}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isMultiMode ? `加入桌板 (${selectedDishes.length}道)` : "加入桌板"}
              </Button>
              <Button
                variant="outline"
                className="w-full text-orange-600 border-orange-200"
                onClick={handleShakeAgain}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                再摇一次
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-500"
                onClick={handleChangeDish}
              >
                换一道
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              className="w-full text-gray-400"
              onClick={onClose}
            >
              取消
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}