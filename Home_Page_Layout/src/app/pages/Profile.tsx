import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Heart, Clock, Settings, Trash2, MessageCircle, Info, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

interface UserInfo {
  avatar: string;
  nickname: string;
  signature: string;
  decideCount: number;
}

interface HistoryRecord {
  id: string;
  date: string;
  timeType: string;
  dishes: {
    name: string;
    category: string;
    tags: string[];
  }[];
}

interface FavoriteDish {
  id: string;
  name: string;
  cuisine: string;
  tags: string[];
}

const defaultUserInfo: UserInfo = {
  avatar: "👤",
  nickname: "美食达人",
  signature: "今天也要好好吃饭",
  decideCount: 0,
};

export function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoriteDish[]>([]);
  const [decideCount, setDecideCount] = useState(0);
  const [avatarImage, setAvatarImage] = useState<string>("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ uri: string; width: number; height: number } | null>(null);
  
  useEffect(() => {
    const savedHistory = localStorage.getItem("historyBoard");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      const favList = JSON.parse(savedFavorites);
      setFavorites(favList.map((name: string, i: number) => ({
        id: String(i),
        name,
        cuisine: "",
        tags: [],
      })));
    }

    const savedDecideCount = localStorage.getItem("decideCount");
    if (savedDecideCount) {
      setDecideCount(parseInt(savedDecideCount));
    } else if (savedHistory) {
      const historyData = JSON.parse(savedHistory);
      setDecideCount(historyData.length);
      localStorage.setItem("decideCount", String(historyData.length));
    }

    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) {
      setAvatarImage(savedAvatar);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const savedHistory = localStorage.getItem("historyBoard");
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
        const savedFavorites = localStorage.getItem("favorites");
        if (savedFavorites) {
          const favList = JSON.parse(savedFavorites);
          setFavorites(favList.map((name: string, i: number) => ({
            id: String(i),
            name,
            cuisine: "",
            tags: [],
          })));
        }
        const savedDecideCount = localStorage.getItem("decideCount");
        if (savedDecideCount) {
          setDecideCount(parseInt(savedDecideCount));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);
  
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [selectedFavoriteDish, setSelectedFavoriteDish] = useState<FavoriteDish | null>(null);
  const [showFavoriteDetail, setShowFavoriteDetail] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [editingSignature, setEditingSignature] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [tempSignature, setTempSignature] = useState("");

  const menuItems = [
    { icon: Clock, label: "历史桌板", count: history.length, action: () => setShowHistoryDetail(true) },
    { icon: Heart, label: "我的收藏", count: favorites.length, action: () => setShowFavorites(true) },
    { icon: Settings, label: "设置", action: () => setShowSettings(true) },
  ];

  const handleReuseMenu = (dishes: { name: string; category?: string }[] | string[]) => {
    const board: Record<string, string[]> = {
      荤菜: [],
      素菜: [],
      汤: [],
      主食: [],
      甜品: [],
    };
    
    if (typeof dishes[0] === 'string') {
      (dishes as string[]).forEach((name) => {
        board["荤菜"].push(name);
      });
    } else {
      (dishes as { name: string; category?: string }[]).forEach((dish) => {
        const category = dish.category || "荤菜";
        if (board[category]) {
          board[category].push(dish.name);
        }
      });
    }
    
    localStorage.setItem("todayBoard", JSON.stringify(board));
    navigate("/");
  };

  const getDishNotes = (dishName: string): string => {
    const notesMap: Record<string, string> = {
      "宫保鸡丁": "经典川菜，鸡丁香嫩，花生酥脆",
      "麻婆豆腐": "麻辣鲜香，豆腐嫩滑",
      "回锅肉": "四川传统名菜，香气扑鼻",
      "水煮鱼": "鱼片鲜嫩，麻辣鲜香",
      "红烧肉": "肥而不腻，入口即化",
      "糖醋里脊": "外酥里嫩，酸甜可口",
      "可乐鸡翅": "鸡翅软烂，甜香入味",
      "西红柿炒蛋": "国民家常菜，营养丰富",
      "馒头": "北方传统主食，松软香甜",
      "猪肉包子": "皮薄馅大，鲜香多汁",
      "蛋炒饭": "粒粒分明，经典快手",
      "清蒸鱼": "原汁原味，鲜嫩可口",
      "白切鸡": "肉质鲜嫩，保持原香",
      "蚝油生菜": "爽脆可口，营养健康",
      "葱爆羊肉": "羊肉鲜嫩，葱香四溢",
      "九转大肠": "色泽红润，酸甜苦辣咸五味",
      "紫菜蛋花汤": "简单易做，营养丰富",
      "玉米排骨汤": "汤鲜味美，滋补养生",
      "番茄蛋花汤": "酸甜开胃，老少皆宜",
      "提拉米苏": "意大利经典，层次丰富",
      "芝士蛋糕": "绵密顺滑，奶香浓郁",
      "芒果布丁": "清甜爽滑，热带风味",
      "冰淇淋": "冰凉甜蜜，夏日必备",
      "山药蓝莓": "健康养生，酸甜可口",
      "蒜蓉西兰花": "碧绿爽脆，营养丰富",
      "番茄炒蛋": "经典家常菜，酸甜可口",
      "米饭": "粒粒分明，香气扑鼻",
      "炒面": "爽滑入味，简单美味",
    };
    return notesMap[dishName] || "美味菜品";
  };

  const handleFavoriteDishClick = (dish: FavoriteDish) => {
    setSelectedFavoriteDish(dish);
    setShowFavoriteDetail(true);
  };

  const handleRemoveHistory = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem("historyBoard", JSON.stringify(newHistory));
  };

  const handleRemoveFavorite = (id: string) => {
    const newFavorites = favorites.filter(f => f.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites.map(f => f.name)));
  };

  const handleClearCache = () => {
    localStorage.clear();
    alert("缓存已清除");
    setShowSettings(false);
  };

  const handleSaveNickname = () => {
    if (tempNickname.trim()) {
      setUserInfo({ ...userInfo, nickname: tempNickname.trim() });
    }
    setEditingNickname(false);
  };

  const handleSaveSignature = () => {
    if (tempSignature.trim()) {
      setUserInfo({ ...userInfo, signature: tempSignature.trim() });
    }
    setEditingSignature(false);
  };

  const handleAvatarClick = () => {
    setShowAvatarPicker(true);
  };

  const handleOpenImagePicker = async () => {
    try {
      const result = await (window as any).openImagePicker();
      if (result && result.uri) {
        setSelectedImage(result);
        setShowAvatarPicker(false);
        setShowAvatarCrop(true);
      }
    } catch (error) {
      console.error("Failed to open image picker:", error);
    }
  };

  const handleAvatarCropConfirm = async () => {
    if (!selectedImage) return;
    
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        canvas.width = 200;
        canvas.height = 200;
        
        if (ctx) {
          ctx.beginPath();
          ctx.arc(100, 100, 100, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x, y, size, size, 0, 0, 200, 200);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setAvatarImage(dataUrl);
          localStorage.setItem("userAvatar", dataUrl);
        }
        
        setShowAvatarCrop(false);
        setSelectedImage(null);
      };
      
      img.src = selectedImage.uri;
    } catch (error) {
      console.error("Failed to crop image:", error);
    }
  };

  const handleAvatarCropCancel = () => {
    setShowAvatarCrop(false);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 px-6 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl overflow-hidden cursor-pointer"
            onClick={handleAvatarClick}
          >
            {avatarImage ? (
              <img src={avatarImage} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              userInfo.avatar
            )}
          </div>
          <div className="flex-1">
            {editingNickname ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
                  className="h-8 bg-white"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveNickname}>确定</Button>
              </div>
            ) : (
              <div 
                className="text-white text-xl mb-1 cursor-pointer hover:opacity-80"
                onClick={() => { setTempNickname(userInfo.nickname); setEditingNickname(true); }}
              >
                {userInfo.nickname}
              </div>
            )}
            {editingSignature ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempSignature}
                  onChange={(e) => setTempSignature(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSignature()}
                  className="h-7 bg-white text-sm"
                  placeholder="个性签名"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveSignature}>确定</Button>
              </div>
            ) : (
              <div 
                className="text-orange-100 text-sm cursor-pointer hover:opacity-80"
                onClick={() => { setTempSignature(userInfo.signature); setEditingSignature(true); }}
              >
                {userInfo.signature}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-6 -mt-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-2xl text-gray-900 mb-1">{decideCount}</div>
              <div className="text-sm text-gray-500">已决定吃饭</div>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl text-gray-900 mb-1">{favorites.length}</div>
              <div className="text-sm text-gray-500">我的收藏</div>
            </div>
          </div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="px-6 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className="w-full bg-white rounded-lg p-4 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.count !== null && (
                  <span className="text-sm text-gray-400">{item.count}</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 历史记录详情弹窗 */}
      <Dialog open={showHistoryDetail} onOpenChange={setShowHistoryDetail}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">历史桌板</h2>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              暂无历史记录
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">{record.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">{record.timeType}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveHistory(record.id); }}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {record.dishes.map((dish, i) => (
                      <span key={i} className="text-sm text-gray-700">{dish.name}{i < record.dishes.length - 1 ? "、" : ""}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 历史详情二次弹窗 */}
      <Dialog open={selectedRecord !== null} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">历史菜单详情</h3>
          </div>
          {selectedRecord && (
            <>
              <div className="text-sm text-gray-500 mb-4">
                {selectedRecord.date} · {selectedRecord.timeType}
              </div>
              <div className="space-y-2 mb-4">
                {selectedRecord.dishes.map((dish, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium">{dish.name}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{dish.category}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => handleReuseMenu(selectedRecord.dishes)}>
                复用此菜单
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 收藏列表弹窗 */}
      <Dialog open={showFavorites} onOpenChange={setShowFavorites}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">我的收藏</h2>
          </div>
          {favorites.length === 0 ? (
            <div className="text-center py-8 text-gray-400">暂无收藏</div>
          ) : (
            <div className="space-y-3">
              {favorites.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleFavoriteDishClick(dish)}
                  >
                    <div className="text-gray-900 mb-1">{dish.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{dish.cuisine}</span>
                      {dish.tags.map((tag, i) => (
                        <span key={i} className="text-xs text-orange-600">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(dish.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 收藏菜品详情弹窗 */}
      <Dialog open={showFavoriteDetail} onOpenChange={setShowFavoriteDetail}>
        <DialogContent className="max-w-sm">
          {selectedFavoriteDish && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{selectedFavoriteDish.name}</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-700">{getDishNotes(selectedFavoriteDish.name)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFavoriteDish.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      handleReuseMenu([selectedFavoriteDish.name]);
                      setShowFavoriteDetail(false);
                    }}
                  >
                    加入桌板
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleRemoveFavorite(selectedFavoriteDish.id)}
                  >
                    取消收藏
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 设置弹窗 */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">设置</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleClearCache}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <Trash2 className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">清除缓存</span>
            </button>
            <button
              onClick={() => { setShowSettings(false); setShowFeedback(true); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">意见反馈</span>
            </button>
            <button
              onClick={() => alert("今天吃什么 v1.0.0\n让选择困难症不再纠结")}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <Info className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">关于我们</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 意见反馈弹窗 */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-sm">
          <h2 className="text-lg font-semibold mb-4">意见反馈</h2>
          <Textarea placeholder="请输入您的宝贵意见..." className="min-h-[120px] mb-4" />
          <Button className="w-full" onClick={() => { alert("感谢您的反馈！"); setShowFeedback(false); }}>
            提交
          </Button>
        </DialogContent>
      </Dialog>

      {/* 头像选择弹窗 */}
      <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
        <DialogContent className="max-w-sm">
          <h2 className="text-lg font-semibold mb-4">更换头像</h2>
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handleOpenImagePicker}
            >
              从相册选择
            </Button>
            {avatarImage && (
              <Button 
                variant="outline" 
                className="w-full text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setAvatarImage("");
                  localStorage.removeItem("userAvatar");
                  setShowAvatarPicker(false);
                }}
              >
                删除头像
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 头像裁剪弹窗 */}
      <Dialog open={showAvatarCrop} onOpenChange={(open) => !open && handleAvatarCropCancel()}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <button onClick={handleAvatarCropCancel} className="text-gray-600">取消</button>
            <span className="font-medium">裁剪头像</span>
            <button onClick={handleAvatarCropConfirm} className="text-orange-500 font-medium">完成</button>
          </div>
          <div className="relative bg-gray-900 h-80 flex items-center justify-center">
            {selectedImage && (
              <div className="relative w-56 h-56">
                <div className="absolute inset-0 border-2 border-white rounded-full"></div>
                <img 
                  src={selectedImage.uri} 
                  alt="crop" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            )}
          </div>
          <div className="text-center py-3 text-gray-500 text-sm">
            拖动图片调整位置
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}