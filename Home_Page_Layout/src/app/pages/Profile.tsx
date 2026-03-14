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
  dishes: string[];
  type: string;
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
  decideCount: 156,
};

const mockHistory: HistoryRecord[] = [
  { id: "1", date: "2024-01-15", dishes: ["宫保鸡丁", "麻婆豆腐", "紫菜蛋花汤"], type: "川菜组合" },
  { id: "2", date: "2024-01-14", dishes: ["清蒸鱼", "白切鸡", "蚝油生菜"], type: "粤菜组合" },
  { id: "3", date: "2024-01-13", dishes: ["红烧肉", "糖醋里脊"], type: "家常菜" },
  { id: "4", date: "2024-01-12", dishes: ["鸡胸肉沙拉", "玉米排骨汤"], type: "减脂餐" },
];

const mockFavorites: FavoriteDish[] = [
  { id: "1", name: "宫保鸡丁", cuisine: "川菜", tags: ["香辣", "下饭"] },
  { id: "2", name: "红烧肉", cuisine: "家常菜", tags: ["经典", "下饭"] },
  { id: "3", name: "清蒸鱼", cuisine: "粤菜", tags: ["清淡", "健康"] },
];

export function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [history, setHistory] = useState<HistoryRecord[]>(mockHistory);
  const [favorites, setFavorites] = useState<FavoriteDish[]>(mockFavorites);
  
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [editingSignature, setEditingSignature] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [tempSignature, setTempSignature] = useState("");

  const menuItems = [
    { icon: Clock, label: "历史桌板", count: history.length, action: () => setShowHistoryDetail(true) },
    { icon: Heart, label: "我的收藏", count: favorites.length, action: () => setShowFavorites(true) },
    { icon: Settings, label: "设置", action: () => setShowSettings(true) },
  ];

  const handleReuseMenu = (dishes: string[]) => {
    localStorage.setItem("todayMenu", JSON.stringify(dishes));
    navigate("/");
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 px-6 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl">
            {userInfo.avatar}
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
              <div className="text-2xl text-gray-900 mb-1">{userInfo.decideCount}</div>
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
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-orange-50 transition-colors"
                onClick={() => setSelectedRecord(record)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">{record.date}</span>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">{record.type}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {record.dishes.map((dish, i) => (
                    <span key={i} className="text-sm text-gray-700">{dish}{i < record.dishes.length - 1 ? "、" : ""}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 历史详情二次弹窗 */}
      <Dialog open={selectedRecord !== null} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">历史菜单详情</h3>
            <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {selectedRecord && (
            <>
              <div className="text-sm text-gray-500 mb-4">
                {selectedRecord.date} · {selectedRecord.type}
              </div>
              <div className="space-y-2 mb-4">
                {selectedRecord.dishes.map((dish, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg text-gray-700">{dish}</div>
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
                    onClick={() => handleReuseMenu([dish.name])}
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
    </div>
  );
}