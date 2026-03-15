"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { cn } from "../components/ui/utils";
import { createUserDish } from "../../lib/data";

interface DishFormData {
  name: string;
  cuisine: string;
  category: string;
  tags: string[];
  notes: string;
}

const SYSTEM_CUISINES = ["川菜", "粤菜", "湘菜", "鲁菜", "苏菜", "浙菜", "闽菜", "徽菜", "西餐", "日料", "韩餐", "其他"];

function getMyCuisines(initialCuisine: string): string[] {
  const savedDishes = localStorage.getItem("myDishes");
  const myDishData: DishFormData[] = savedDishes ? JSON.parse(savedDishes) : [];
  const cuisines = new Set(myDishData.map(d => d.cuisine));
  if (initialCuisine && !cuisines.has(initialCuisine)) {
    cuisines.add(initialCuisine);
  }
  return Array.from(cuisines).sort();
}

function isSystemCuisine(cuisine: string): boolean {
  return SYSTEM_CUISINES.includes(cuisine);
}

const CATEGORIES = [
  { value: "荤菜", label: "荤菜" },
  { value: "素菜", label: "素菜" },
  { value: "汤", label: "汤" },
  { value: "主食", label: "主食" },
  { value: "甜品", label: "甜品" },
];

const TAGS = ["辣", "清淡", "快手", "下饭", "减脂", "家常", "创意", "甜品"];

export function AddDish() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const initialCuisine = searchParams.get("cuisine") || "";
  const fromHome = searchParams.get("from") === "home";

  const [formData, setFormData] = useState<DishFormData>({
    name: "",
    cuisine: initialCuisine,
    category: "",
    tags: [],
    notes: "",
  });

  useEffect(() => {
    if (isEdit && id) {
      const savedDishes = localStorage.getItem("myDishes");
      if (savedDishes) {
        const dishes = JSON.parse(savedDishes);
        const dish = dishes.find((d: DishFormData) => d.name === id);
        if (dish) {
          setFormData(dish);
        }
      }
    }
  }, [isEdit, id]);

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const savedDishes = localStorage.getItem("myDishes");
    let dishes: DishFormData[] = savedDishes ? JSON.parse(savedDishes) : [];
    
    if (isEdit) {
      dishes = dishes.map(d => d.name === id ? formData : d);
    } else {
      dishes.push(formData);
    }
    
    localStorage.setItem("myDishes", JSON.stringify(dishes));
    
    // 如果是编辑模式且修改了菜名，同步更新桌板
    if (isEdit && id && id !== formData.name) {
      const savedBoard = localStorage.getItem("todayBoard");
      const savedSources = localStorage.getItem("todayBoardSources");
      if (savedBoard) {
        const board = JSON.parse(savedBoard);
        const sources = savedSources ? JSON.parse(savedSources) : {};
        
        // 遍历所有分类，找到旧菜名并替换
        Object.keys(board).forEach(category => {
          const index = board[category].indexOf(id);
          if (index !== -1) {
            board[category][index] = formData.name;
          }
        });
        
        // 更新来源信息
        if (sources[id]) {
          sources[formData.name] = sources[id];
          delete sources[id];
        }
        
        localStorage.setItem("todayBoard", JSON.stringify(board));
        localStorage.setItem("todayBoardSources", JSON.stringify(sources));
      }
    }
    
    // 保存自定义菜系到 localStorage
    if (formData.cuisine) {
      const savedCuisines = localStorage.getItem("customCuisines");
      let customCuisines: string[] = savedCuisines ? JSON.parse(savedCuisines) : [];
      if (!customCuisines.includes(formData.cuisine)) {
        customCuisines.push(formData.cuisine);
        localStorage.setItem("customCuisines", JSON.stringify(customCuisines));
      }
    }
    
    // 同步到云端
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const testUserId = localStorage.getItem('testUserId')
    
    if (isLoggedIn && testUserId) {
      if (!isEdit) {
        // 新建菜品
        console.log('Syncing dish to cloud:', formData);
        const result = await createUserDish(testUserId, {
          name: formData.name,
          tags: formData.tags,
          category: formData.category || '荤菜',
          cuisine: formData.cuisine,
          group_name: formData.cuisine,
          snapshot_name: formData.name,
          snapshot_tags: formData.tags,
          notes: formData.notes || null,
        })
        console.log('Cloud sync result:', result);
      } else {
        // 编辑菜品时更新云端
        const { getUserDishes, updateUserDish } = await import('../../lib/data')
        const cloudDishes = await getUserDishes(testUserId)
        const cloudDish = cloudDishes.find((d: any) => d.name === id)
        if (cloudDish) {
          await updateUserDish(cloudDish.id, {
            name: formData.name,
            tags: formData.tags,
            category: formData.category || '荤菜',
            cuisine: formData.cuisine,
            group_name: formData.cuisine,
            snapshot_name: formData.name,
            snapshot_tags: formData.tags,
            notes: formData.notes || null,
          })
        }
      }
    } else if (!isLoggedIn) {
      console.log('Not logged in, dish saved locally only');
    }
    
    if (fromHome) {
      const category = initialCuisine || formData.cuisine;
      const savedBoard = localStorage.getItem("todayBoard");
      let board = savedBoard ? JSON.parse(savedBoard) : {};
      board[category] = formData.name;
      localStorage.setItem("todayBoard", JSON.stringify(board));
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-6">{isEdit ? "编辑菜品" : "新建菜品"}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">菜名 *</label>
            <Input
              placeholder="请输入菜名"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">所属菜系</label>
            <Select
              value={formData.cuisine}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, cuisine: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择菜系" />
              </SelectTrigger>
              <SelectContent>
                {getMyCuisines(initialCuisine).map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">分类</label>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors",
                    formData.category === cat.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:bg-accent"
                  )}
                >
                  <Checkbox
                    checked={formData.category === cat.value}
                    onCheckedChange={() => handleCategoryChange(cat.value)}
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">标签</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <label
                  key={tag}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-colors",
                    formData.tags.includes(tag)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      checked={formData.tags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                      className="sr-only"
                    />
                    {tag}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">私房笔记</label>
            <Textarea
              placeholder="添加你的独家秘方或烹饪心得..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}