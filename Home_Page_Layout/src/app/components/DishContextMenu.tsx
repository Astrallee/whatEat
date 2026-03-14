import { Eye, RefreshCw, Trash2 } from "lucide-react";

interface DishContextMenuProps {
  open: boolean;
  onClose: () => void;
  onViewDetail: () => void;
  onReplace: () => void;
  onDelete: () => void;
  dishName: string;
}

export function DishContextMenu({
  open,
  onClose,
  onViewDetail,
  onReplace,
  onDelete,
  dishName,
}: DishContextMenuProps) {
  if (!open) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-sm mx-4 rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100">
          <div className="text-center text-gray-900 font-medium">{dishName}</div>
        </div>

        <div className="py-2">
          <button
            onClick={() => handleAction(onViewDetail)}
            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-5 h-5 text-blue-500" />
            <span className="text-gray-900">查看详情</span>
          </button>

          <button
            onClick={() => handleAction(onReplace)}
            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-orange-500" />
            <span className="text-gray-900">替换一道</span>
          </button>

          <button
            onClick={() => handleAction(onDelete)}
            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="text-red-500">删除</span>
          </button>
        </div>

        <div className="border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
