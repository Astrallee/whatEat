import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Heart, Download, Share2 } from "lucide-react";

interface Dish {
  name: string;
  tags: string[];
  category: string;
}

export function MenuGenerate() {
  const navigate = useNavigate();
  const [selectedDishes, setSelectedDishes] = useState<{
    荤菜: Dish | null;
    素菜: Dish | null;
    汤: Dish | null;
    主食: Dish | null;
  }>({
    荤菜: null,
    素菜: null,
    汤: null,
    主食: null,
  });
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("todayMenu");
    if (saved) {
      const menu = JSON.parse(saved);
      const menuMap: typeof selectedDishes = {
        荤菜: null,
        素菜: null,
        汤: null,
        主食: null,
      };
      menu.forEach((dishName: string) => {
        const dish: Dish = { name: dishName, tags: [], category: "" };
        if (menuMap["荤菜"] === null && !menuMap["荤菜"]) menuMap["荤菜"] = dish;
        else if (menuMap["素菜"] === null) menuMap["素菜"] = dish;
        else if (menuMap["汤"] === null) menuMap["汤"] = dish;
        else if (menuMap["主食"] === null) menuMap["主食"] = dish;
      });
      setSelectedDishes(menuMap);
    }
  }, []);

  const dishes = Object.values(selectedDishes).filter(Boolean);
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!isFavorite) {
      dishes.forEach(d => {
        if (d && !favorites.includes(d.name)) {
          favorites.push(d.name);
        }
      });
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  };

  const handleShare = () => {
    const menuText = dishes.map(d => d?.name).join("、");
    alert(`分享菜单：${menuText}`);
  };

  const handleSaveImage = () => {
    alert("保存图片功能需要使用 html2canvas 库实现");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-1">{dateStr}</div>
          <h1 className="text-2xl font-semibold text-gray-900">今日菜单</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {dishes.map((dish, index) => (
            dish && (
              <div
                key={index}
                className="flex items-center p-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-medium">
                  {index + 1}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-gray-900 font-medium">{dish.name}</div>
                </div>
              </div>
            )
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <Button
            variant={isFavorite ? "default" : "outline"}
            className="flex-1"
            onClick={handleFavorite}
          >
            <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "已收藏" : "收藏菜单"}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            微信分享
          </Button>
        </div>

        <Button variant="outline" className="w-full" onClick={handleSaveImage}>
          <Download className="w-4 h-4 mr-2" />
          保存图片
        </Button>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 py-3 text-orange-500 hover:text-orange-600"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}