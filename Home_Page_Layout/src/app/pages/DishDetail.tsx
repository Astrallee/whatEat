import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Heart, Share2, Trash2 } from "lucide-react";

interface Dish {
  name: string;
  cuisine: string;
  category: string;
  tags: string[];
  notes: string;
}

export function DishDetail() {
  const navigate = useNavigate();
  const { name } = useParams();
  const [dish, setDish] = useState<Dish | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const savedDishes = localStorage.getItem("myDishes");
    if (savedDishes) {
      const dishes: Dish[] = JSON.parse(savedDishes);
      const found = dishes.find(d => d.name === name);
      if (found) {
        setDish(found);
        return;
      }
    }
    
    const systemDishes: Dish[] = [
      { name: "宫保鸡丁", cuisine: "川菜", category: "荤菜", tags: ["香辣", "下饭"], notes: "经典川菜" },
      { name: "麻婆豆腐", cuisine: "川菜", category: "素菜", tags: ["下饭", "麻辣"], notes: "麻辣鲜香" },
      { name: "红烧肉", cuisine: "家常菜", category: "荤菜", tags: ["经典", "下饭"], notes: "肥而不腻" },
      { name: "清蒸鱼", cuisine: "粤菜", category: "荤菜", tags: ["清淡", "健康"], notes: "原汁原味" },
      { name: "紫菜蛋花汤", cuisine: "汤羹", category: "汤", tags: ["清淡", "快手"], notes: "简单易做" },
    ];
    const found = systemDishes.find(d => d.name === name);
    if (found) {
      setDish(found);
    }
  }, [name]);

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const filtered = favorites.filter((f: string) => f !== name);
      localStorage.setItem("favorites", JSON.stringify(filtered));
    } else {
      favorites.push(name);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (dish) {
      alert(`分享 "${dish.name}" 到微信`);
    }
  };

  if (!dish) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500">菜品未找到</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">{dish.name}</h1>
            <div className="flex gap-2">
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full ${isFavorite ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500"}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-100 text-gray-500"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-500">菜系：</span>
                <span className="text-gray-900">{dish.cuisine}</span>
              </div>
              <div>
                <span className="text-gray-500">分类：</span>
                <span className="text-gray-900">{dish.category}</span>
              </div>
            </div>

            {dish.tags.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">标签</div>
                <div className="flex flex-wrap gap-2">
                  {dish.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {dish.notes && (
              <div>
                <div className="text-sm text-gray-500 mb-2">私房笔记</div>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-700 text-sm">
                  {dish.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            返回
          </Button>
          <Button className="flex-1" onClick={() => navigate("/")}>
            加入桌板
          </Button>
        </div>
      </div>
    </div>
  );
}