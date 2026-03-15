import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Heart, Share2, ArrowLeft, Check, MessageCircle, MoreHorizontal } from "lucide-react";

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
  const [showShareSheet, setShowShareSheet] = useState(false);

  useEffect(() => {
    // Load menu from localStorage
    const savedMenu = localStorage.getItem("todayMenu");
    if (savedMenu) {
      const menu = JSON.parse(savedMenu);
      
      // Also load today's board to get full dish info
      const savedBoard = localStorage.getItem("todayBoard");
      const board = savedBoard ? JSON.parse(savedBoard) : {};
      
      // Reconstruct dishes with category info
      const dishes: Dish[] = [];
      for (const category in board) {
        if (Array.isArray(board[category])) {
          for (const dishName of board[category]) {
            dishes.push({ name: dishName, tags: [], category });
          }
        }
      }
      
      setSelectedDishes(dishes);
      
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavoriteDishes(favs);
      
      const allFaved = dishes.every((d: Dish) => favs.includes(d.name));
      setIsFavorite(allFaved);
    }
  }, []);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const handleFavoriteSingle = async (dishName: string) => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites: string[];
    
    if (favoriteDishes.includes(dishName)) {
      newFavorites = favorites.filter((f: string) => f !== dishName);
      setFavoriteDishes(favoriteDishes.filter(f => f !== dishName));
    } else {
      newFavorites = [...favorites, dishName];
      setFavoriteDishes([...favoriteDishes, dishName]);
      
      // Sync to cloud if logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      const testUserId = localStorage.getItem('testUserId')
      if (isLoggedIn && testUserId) {
        const { addFavorite } = await import('../../lib/data')
        await addFavorite(testUserId, dishName)
      }
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

  const handleShare = async () => {
    const menuText = selectedDishes.map(d => d.name).join("、");
    const shareText = `今日菜单：${menuText}\n\n由「今天吃什么」生成`;
    
    setShowShareSheet(true);
  };

  const handleShareToWeChat = async () => {
    const menuText = selectedDishes.map(d => d.name).join("、");
    const shareText = `今日菜单：${menuText}\n\n由「今天吃什么」生成`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert('菜单已复制，请打开微信分享');
    } catch (err) {
      alert(`分享菜单：${menuText}`);
    }
    setShowShareSheet(false);
  };

  const handleShareToQQ = async () => {
    const menuText = selectedDishes.map(d => d.name).join("、");
    const shareText = `今日菜单：${menuText}\n\n由「今天吃什么」生成`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert('菜单已复制，请打开QQ分享');
    } catch (err) {
      alert(`分享菜单：${menuText}`);
    }
    setShowShareSheet(false);
  };

  const handleShareToMore = async () => {
    const menuText = selectedDishes.map(d => d.name).join("、");
    const shareText = `今日菜单：${menuText}\n\n由「今天吃什么」生成`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '今日菜单',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('菜单已复制到剪贴板');
      } catch (err) {
        alert(`分享菜单：${menuText}`);
      }
    }
    setShowShareSheet(false);
  };

  // 返回修改 - 保持当前桌板状态
  const handleGoBack = () => {
    navigate("/");
  };

  // 保存并返回 - 清空桌板并保存历史
  const handleSaveAndReturn = async () => {
    // 1. 保存到历史记录
    const historyRecord = {
      id: Date.now().toString(),
      date: dateStr,
      timeType: "晚餐",
      dishes: selectedDishes.map(d => ({ name: d.name, category: d.category, tags: d.tags })),
    };
    
    const savedHistory = localStorage.getItem("historyBoard");
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    history.unshift(historyRecord);
    localStorage.setItem("historyBoard", JSON.stringify(history));
    
    // Sync history to cloud if logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const testUserId = localStorage.getItem('testUserId')
    if (isLoggedIn && testUserId) {
      const { createHistory } = await import('../../lib/data')
      await createHistory(testUserId, {
        date: dateStr,
        time_type: "晚餐",
        dishes: selectedDishes.map(d => ({ name: d.name, category: d.category, tags: d.tags })),
      })
    }
    
    // 2. 清空今日桌板
    const emptyBoard = {
      荤菜: [],
      素菜: [],
      汤: [],
      主食: [],
      甜品: [],
    };
    localStorage.setItem("todayBoard", JSON.stringify(emptyBoard));
    
    // 3. 返回首页
    navigate("/");
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
            分享
          </Button>
        </div>

        <div className="flex gap-3 mt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回修改
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSaveAndReturn}
          >
            <Check className="w-4 h-4 mr-2" />
            保存并返回
          </Button>
        </div>
      </div>

      {/* 分享面板 */}
      <Dialog open={showShareSheet} onOpenChange={setShowShareSheet}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <div className="text-center py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">分享菜单</h3>
          </div>
          
          <div className="py-6 px-4">
            <div className="flex justify-center gap-8">
              {/* 微信 */}
              <button
                onClick={handleShareToWeChat}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm text-gray-600">微信</span>
              </button>
              
              {/* QQ */}
              <button
                onClick={handleShareToQQ}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">Q</span>
                </div>
                <span className="text-sm text-gray-600">QQ</span>
              </button>
              
              {/* 更多 */}
              <button
                onClick={handleShareToMore}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                  <MoreHorizontal className="w-7 h-7 text-gray-500" />
                </div>
                <span className="text-sm text-gray-400">更多</span>
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-100">
            <button
              onClick={() => setShowShareSheet(false)}
              className="w-full py-4 text-gray-500 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}