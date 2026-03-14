import { Plus } from "lucide-react";
import { useState } from "react";

interface CategorySlotProps {
  category: string;
  dish: { name: string; tags: string[] } | null;
  onAdd: () => void;
  onRemove: () => void;
  onClick?: () => void;
  onLongPress?: () => void;
}

export function CategorySlot({ 
  category, 
  dish, 
  onAdd, 
  onRemove,
  onClick,
  onLongPress,
}: CategorySlotProps) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    if (!dish || !onLongPress) return;
    const timer = setTimeout(() => {
      onLongPress();
    }, 500); // 500ms 长按触发
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleClick = () => {
    if (dish && onClick) {
      onClick();
    }
  };

  if (dish) {
    return (
      <div className="mb-4">
        <div 
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-2">{dish.name}</div>
              <div className="flex flex-wrap gap-2">
                {dish.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={onAdd}
        className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-orange-300 transition-colors flex items-center justify-between"
      >
        <span className="text-gray-700">{category}</span>
        <Plus className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}