import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Sparkles, BookOpen, Plus } from "lucide-react";

interface AddDishSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRandomPick: () => void;
  onSelectFromLibrary: () => void;
  onCreateNew: () => void;
}

export function AddDishSheet({
  open,
  onOpenChange,
  onRandomPick,
  onSelectFromLibrary,
  onCreateNew,
}: AddDishSheetProps) {
  const handleAction = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-white rounded-t-2xl max-w-md mx-auto">
        <SheetHeader>
          <SheetTitle className="text-center text-lg">添加菜品</SheetTitle>
          <SheetDescription className="sr-only">
            选择添加菜品的方式
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2 pb-4">
          <button
            onClick={() => handleAction(onRandomPick)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-gray-900">摇一签推荐</span>
          </button>

          <button
            onClick={() => handleAction(onSelectFromLibrary)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-gray-900">从菜库选择</span>
          </button>

          <button
            onClick={() => handleAction(onCreateNew)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-gray-900">新建一道菜</span>
          </button>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full p-4 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors mt-2"
          >
            取消
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}