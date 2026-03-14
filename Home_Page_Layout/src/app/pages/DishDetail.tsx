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
      // 川菜
      { name: "宫保鸡丁", cuisine: "川菜", category: "荤菜", tags: ["香辣", "下饭"], notes: "经典川菜，鸡丁香嫩，花生酥脆" },
      { name: "麻婆豆腐", cuisine: "川菜", category: "素菜", tags: ["下饭", "麻辣"], notes: "麻辣鲜香，豆腐嫩滑" },
      { name: "回锅肉", cuisine: "川菜", category: "荤菜", tags: ["下饭", "经典"], notes: "四川传统名菜，香气扑鼻" },
      { name: "水煮鱼", cuisine: "川菜", category: "荤菜", tags: ["麻辣", "鲜美"], notes: "鱼片鲜嫩，麻辣鲜香" },
      
      // 家常菜
      { name: "红烧肉", cuisine: "家常菜", category: "荤菜", tags: ["经典", "下饭"], notes: "肥而不腻，入口即化" },
      { name: "糖醋里脊", cuisine: "家常菜", category: "荤菜", tags: ["酸甜", "开胃"], notes: "外酥里嫩，酸甜可口" },
      { name: "可乐鸡翅", cuisine: "家常菜", category: "荤菜", tags: ["甜香", "下饭"], notes: "鸡翅软烂，甜香入味" },
      { name: "西红柿炒蛋", cuisine: "家常菜", category: "素菜", tags: ["家常", "简单"], notes: "国民家常菜，营养丰富" },
      { name: "馒头", cuisine: "家常菜", category: "主食", tags: ["主食", "北方"], notes: "北方传统主食，松软香甜" },
      { name: "猪肉包子", cuisine: "家常菜", category: "主食", tags: ["主食", "面食"], notes: "皮薄馅大，鲜香多汁" },
      { name: "蛋炒饭", cuisine: "家常菜", category: "主食", tags: ["主食", "快手"], notes: "粒粒分明，经典快手" },
      
      // 粤菜
      { name: "清蒸鱼", cuisine: "粤菜", category: "荤菜", tags: ["清淡", "健康"], notes: "原汁原味，鲜嫩可口" },
      { name: "白切鸡", cuisine: "粤菜", category: "荤菜", tags: ["清淡", "原味"], notes: "肉质鲜嫩，保持原香" },
      { name: "蚝油生菜", cuisine: "粤菜", category: "素菜", tags: ["快手", "清爽"], notes: "爽脆可口，营养健康" },
      
      // 鲁菜
      { name: "葱爆羊肉", cuisine: "鲁菜", category: "荤菜", tags: ["香鲜", "快手"], notes: "羊肉鲜嫩，葱香四溢" },
      { name: "九转大肠", cuisine: "鲁菜", category: "荤菜", tags: ["经典", "重口"], notes: "色泽红润，酸甜苦辣咸五味" },
      
      // 汤羹
      { name: "紫菜蛋花汤", cuisine: "汤羹", category: "汤", tags: ["清淡", "快手"], notes: "简单易做，营养丰富" },
      { name: "玉米排骨汤", cuisine: "汤羹", category: "汤", tags: ["滋补", "鲜美"], notes: "汤鲜味美，滋补养生" },
      { name: "番茄蛋花汤", cuisine: "汤羹", category: "汤", tags: ["开胃", "家常"], notes: "酸甜开胃，老少皆宜" },
      
      // 甜品
      { name: "提拉米苏", cuisine: "甜品", category: "甜品", tags: ["甜品", "经典"], notes: "意大利经典，层次丰富" },
      { name: "芝士蛋糕", cuisine: "甜品", category: "甜品", tags: ["甜品", "浓郁"], notes: "绵密顺滑，奶香浓郁" },
      { name: "芒果布丁", cuisine: "甜品", category: "甜品", tags: ["甜品", "清爽"], notes: "清甜爽滑，热带风味" },
      { name: "冰淇淋", cuisine: "甜品", category: "甜品", tags: ["甜品", "凉爽"], notes: "冰凉甜蜜，夏日必备" },
      { name: "山药蓝莓", cuisine: "甜品", category: "甜品", tags: ["甜品", "健康"], notes: "健康养生，酸甜可口" },
      
      // 其他
      { name: "蒜蓉西兰花", cuisine: "粤菜", category: "素菜", tags: ["清淡", "营养"], notes: "碧绿爽脆，营养丰富" },
      { name: "番茄炒蛋", cuisine: "家常菜", category: "素菜", tags: ["家常", "简单"], notes: "经典家常菜，酸甜可口" },
      { name: "米饭", cuisine: "家常菜", category: "主食", tags: ["主食", "经典"], notes: "粒粒分明，香气扑鼻" },
      { name: "炒面", cuisine: "家常菜", category: "主食", tags: ["主食", "快手"], notes: "爽滑入味，简单美味" },
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