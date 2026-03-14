import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Sparkles, BookOpen, Plus, X } from "lucide-react";
import { Button } from "../components/ui/button";

interface AddDishSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRandomPick: (category: string, avoidTags: string[]) => void;
  onSelectFromLibrary: () => void;
  onCreateNew: () => void;
}

type Step = "action" | "category" | "avoid";

const CATEGORIES = [
  { value: "荤菜", emoji: "🥩", label: "荤菜" },
  { value: "素菜", emoji: "🥬", label: "素菜" },
  { value: "汤", emoji: "🍲", label: "汤" },
  { value: "主食", emoji: "🍚", label: "主食" },
  { value: "甜品", emoji: "🍰", label: "甜品" },
];

const AVOID_TAGS = ["辣", "油腻", "腥", "生冷", "过甜", "太咸"];

export function AddDishSheet({
  open,
  onOpenChange,
  onRandomPick,
  onSelectFromLibrary,
  onCreateNew,
}: AddDishSheetProps) {
  const [step, setStep] = useState<Step>("action");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [avoidTags, setAvoidTags] = useState<string[]>([]);

  const handleAction = (action: () => void) => {
    action();
  };

  const handleRandomPickClick = () => {
    setStep("category");
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStep("avoid");
  };

  const handleAvoidToggle = (tag: string) => {
    setAvoidTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleStartLottery = () => {
    onRandomPick(selectedCategory, avoidTags);
    onOpenChange(false);
    setStep("action");
    setSelectedCategory("");
    setAvoidTags([]);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("action");
    setSelectedCategory("");
    setAvoidTags([]);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="bg-white rounded-t-2xl max-w-md mx-auto h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center text-lg">
            {step === "action" && "添加菜品"}
            {step === "category" && "选择菜类型"}
            {step === "avoid" && "忌口询问"}
          </SheetTitle>
          <SheetDescription className="sr-only">
            选择添加菜品的方式
          </SheetDescription>
        </SheetHeader>

        {step === "action" && (
          <div className="space-y-2 pb-4">
            <button
              onClick={handleRandomPickClick}
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
              onClick={handleClose}
              className="w-full p-4 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors mt-2"
            >
              取消
            </button>
          </div>
        )}

        {step === "category" && (
          <div className="space-y-2 pb-4">
            <p className="text-sm text-gray-500 mb-4">你想吃什么类型的菜？</p>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                  {cat.emoji}
                </div>
                <span className="text-gray-900">{cat.label}</span>
              </button>
            ))}
            <button
              onClick={() => setStep("action")}
              className="w-full p-4 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors mt-2"
            >
              返回
            </button>
          </div>
        )}

        {step === "avoid" && (
          <div className="space-y-4 pb-4">
            <p className="text-sm text-gray-500 mb-4">有没有什么忌口？（可多选）</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVOID_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAvoidToggle(tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    avoidTags.includes(tag)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <Button
              onClick={handleStartLottery}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              开始摇签
            </Button>
            <button
              onClick={() => setStep("category")}
              className="w-full p-3 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              返回
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}