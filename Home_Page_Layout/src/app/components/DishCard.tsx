import { X } from "lucide-react";

interface DishCardProps {
  name: string;
  tags: string[];
  onRemove: () => void;
}

export function DishCard({ name, tags, onRemove }: DishCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-2">{name}</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
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
          onClick={onRemove}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
