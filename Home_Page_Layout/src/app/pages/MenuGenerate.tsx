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
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteDishes, setFavoriteDishes] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("todayMenu");
    if (saved) {
      const menu = JSON.parse(saved);
      const dishes: Dish[] = menu.map((name: string) => ({ name, tags: [], category: "" }));
      setSelectedDishes(dishes);
      
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavoriteDishes(favs);
      
      const allFaved = dishes.every((d: Dish) => favs.includes(d.name));
      setIsFavorite(allFaved);
    }
  }, []);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const handleFavoriteSingle = (dishName: string) => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites: string[];
    
    if (favoriteDishes.includes(dishName)) {
      newFavorites = favorites.filter((f: string) => f !== dishName);
      setFavoriteDishes(favoriteDishes.filter(f => f !== dishName));
    } else {
      newFavorites = [...favorites, dishName];
      setFavoriteDishes([...favoriteDishes, dishName]);
    }
    
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    
    const allFaved = selectedDishes.every(d => newFavorites.includes(d.name));
    setIsFavorite(allFaved);
  };

  const handleFavoriteAll = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites: string[];
    
    if (isFavorite) {
      newFavorites = favorites.filter((f: string) => !selectedDishes.some(d => d.name === f));
      setFavoriteDishes([]);
    } else {
      const allFavorites = [...new Set([...favorites, ...selectedDishes.map(d => d.name)])];
      newFavorites = allFavorites;
      setFavoriteDishes(selectedDishes.map(d => d.name));
    }
    
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    const menuText = selectedDishes.map(d => d.name).join("、");
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
          {selectedDishes.map((dish, index) => (
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
              <button
                onClick={() => handleFavoriteSingle(dish.name)}
                className={`p-2 transition-colors ${
                  favoriteDishes.includes(dish.name)
                    ? "text-red-500"
                    : "text-gray-300 hover:text-red-400"
                }`}
              >
                <Heart className={`w-5 h-5 ${favoriteDishes.includes(dish.name) ? "fill-current" : ""}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <Button
            variant={isFavorite ? "default" : "outline"}
            className="flex-1"
            onClick={handleFavoriteAll}
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