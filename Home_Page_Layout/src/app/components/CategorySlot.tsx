import { Plus, X } from "lucide-react";
import { useState } from "react";

interface Dish {
  name: string;
  tags: string[];
}

interface CategorySlotProps {
  category: string;
  dishes: Dish[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onClick?: (index: number) => void;
  onLongPress?: (index: number) => void;
}

export function CategorySlot({ 
  category, 
  dishes, 
  onAdd, 
  onRemove,
  onClick,
  onLongPress,
}: CategorySlotProps) {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleLongPress = (index: number) => {
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress(index);
      }, 500);
      setPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  if (dishes.length > 0) {
    return (
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">{category}</div>
        <div className="space-y-2">
          {dishes.map((dish, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onClick?.(index)}
              onTouchStart={() => handleLongPress(index)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleLongPress(index)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{dish.name}</span>
                  </div>
                  {dish.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dish.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onAdd}
          className="w-full mt-2 border-2 border-dashed border-gray-200 rounded-lg p-2 text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">再添一道</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-500 mb-2">{category}</div>
      <button
        onClick={onAdd}
        className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-orange-300 transition-colors flex items-center justify-between"
      >
        <span className="text-gray-700">点击添加{category}</span>
        <Plus className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}