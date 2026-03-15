import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Heart, Clock, Settings, Trash2, MessageCircle, Info, X, Cloud, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { loginWithPhone, verifyOTP, getCurrentUser, onAuthStateChange, logout as supabaseLogout } from "../../lib/auth";
import { getProfile, createProfile } from "../../lib/data";
import { syncAllData, hasLocalData } from "../../lib/sync";

interface UserInfo {
  avatar: string;
  nickname: string;
  signature: string;
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
};

export function Profile() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoriteDish[]>([]);
  const [avatarImage, setAvatarImage] = useState<string>("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ uri: string; width: number; height: number } | null>(null);
  
  // Phone login state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  
  useEffect(() => {
    // Check auth state on mount
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const checkAuth = async (triggerSync = false) => {
    console.log('checkAuth called with triggerSync:', triggerSync);
    
    // 检查测试模式用户
    const testUserId = localStorage.getItem('testUserId')
    console.log('testUserId from localStorage:', testUserId);
    
    if (testUserId) {
      setIsLoggedIn(true)
      localStorage.setItem("isLoggedIn", "true")
      
      console.log('User logged in, triggerSync:', triggerSync, 'hasLocalData:', hasLocalData());
      
      if (triggerSync) {
        // 总是尝试同步（无论有没有本地数据，都会拉取云端数据）
        setIsSyncing(true)
        try {
          await syncAllData({
            userId: testUserId,
            onProgress: (msg) => {
              console.log('Sync progress:', msg);
              setSyncMessage(msg);
            },
            onComplete: () => {
              console.log('Sync complete');
              setIsSyncing(false)
              setSyncMessage("")
              // 刷新页面数据
              window.location.reload()
            }
          })
        } catch (error) {
          console.error('Sync failed:', error);
          setIsSyncing(false)
          setSyncMessage("同步失败")
        }
      }
      return
    }
    
    // 检查 Supabase 用户
    const user = await getCurrentUser();
    if (user) {
      // Check if profile exists, create if not
      const profile = await getProfile(user.id);
      if (!profile) {
        await createProfile(user.id);
      }
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      
      if (triggerSync && hasLocalData()) {
        // 触发数据同步
        setIsSyncing(true)
        await syncAllData({
          userId: user.id,
          onProgress: (msg) => setSyncMessage(msg),
          onComplete: () => {
            setIsSyncing(false)
            setSyncMessage("")
            // 刷新页面数据
            window.location.reload()
          }
        })
      }
    } else {
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
    }
  };
  
  const handleSendOTP = async () => {
    if (!phone || phone.length !== 11) {
      setLoginError("请输入正确的手机号");
      return;
    }
    
    setIsLoading(true);
    setLoginError("");
    
    const result = await loginWithPhone(phone);
    
    if (result.success) {
      if ('autoConfirmed' in result && result.autoConfirmed) {
        // 测试模式下自动确认，直接登录
        setShowLoginDialog(false);
        setOtpSent(false);
        setOtp("");
        setPhone("");
        setLoginError("");
        // 触发同步
        await checkAuth(true);
      } else {
        setOtpSent(true);
      }
    } else {
      setLoginError(result.error || "发送验证码失败");
    }
    
    setIsLoading(false);
  };
  
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setLoginError("请输入6位验证码");
      return;
    }
    
    setIsLoading(true);
    setLoginError("");
    
    const result = await verifyOTP(phone, otp);
    
    if (result.success) {
      setShowLoginDialog(false);
      setOtpSent(false);
      setOtp("");
      setPhone("");
      setLoginError("");
      // 触发同步
      console.log('Login successful, triggering sync...');
      await checkAuth(true);
    } else {
      setLoginError(result.error || "验证失败");
    }
    
    setIsLoading(false);
  };
  
  const handleLogout = async () => {
    await supabaseLogout();
    // 清除测试用户数据
    localStorage.removeItem('testUserId');
    localStorage.removeItem('testUserPhone');
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
  };
  
  useEffect(() => {
    const loadData = async () => {
      // 加载本地数据
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

      const savedAvatar = localStorage.getItem("userAvatar");
      if (savedAvatar) {
        setAvatarImage(savedAvatar);
      }

      // 如果已登录，尝试从云端加载最新数据
      const savedIsLoggedIn = localStorage.getItem("isLoggedIn");
      if (savedIsLoggedIn === "true") {
        setIsLoggedIn(true);
        
        // 获取用户ID
        const testUserId = localStorage.getItem('testUserId')
        if (testUserId) {
          // 从云端加载数据
          const { getHistory, getFavorites } = await import('../../lib/data')
          const [cloudHistory, cloudFavorites] = await Promise.all([
            getHistory(testUserId),
            getFavorites(testUserId)
          ])
          
          if (cloudHistory.length > 0) {
            setHistory(cloudHistory)
            localStorage.setItem('historyBoard', JSON.stringify(cloudHistory))
          }
          
          if (cloudFavorites.length > 0) {
            setFavorites(cloudFavorites.map((f: any, i: number) => ({
              id: f.id || String(i),
              name: f.dish_name,
              cuisine: "",
              tags: f.snapshot_tags || [],
            })))
            localStorage.setItem('favorites', JSON.stringify(cloudFavorites.map((f: any) => f.dish_name)))
          }
        }
      }
    }
    
    loadData()
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
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
        
        const savedIsLoggedIn = localStorage.getItem("isLoggedIn");
        if (savedIsLoggedIn === "true") {
          setIsLoggedIn(true);
          
          // 从云端加载最新数据
          const testUserId = localStorage.getItem('testUserId')
          if (testUserId) {
            const { getHistory, getFavorites } = await import('../../lib/data')
            const [cloudHistory, cloudFavorites] = await Promise.all([
              getHistory(testUserId),
              getFavorites(testUserId)
            ])
            
            if (cloudHistory.length > 0) {
              setHistory(cloudHistory)
              localStorage.setItem('historyBoard', JSON.stringify(cloudHistory))
            }
            
            if (cloudFavorites.length > 0) {
              setFavorites(cloudFavorites.map((f: any, i: number) => ({
                id: f.id || String(i),
                name: f.dish_name,
                cuisine: "",
                tags: f.snapshot_tags || [],
              })))
              localStorage.setItem('favorites', JSON.stringify(cloudFavorites.map((f: any) => f.dish_name)))
            }
          }
        } else {
          setIsLoggedIn(false);
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
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);

  const menuItems = isLoggedIn
    ? [
        { icon: Clock, label: "历史桌板", count: history.length, action: () => setShowHistoryDetail(true) },
        { icon: Heart, label: "我的收藏", count: favorites.length, action: () => setShowFavorites(true) },
        { icon: LogOut, label: "退出登录", action: () => {
          if (confirm("确定要退出登录吗？")) {
            handleLogout();
          }
        }},
        { icon: Settings, label: "设置", action: () => setShowSettings(true) },
      ]
    : [
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
    setShowClearCacheConfirm(true);
  };

  const confirmClearCache = () => {
    // 只清除本地数据，不触碰云端相关状态
    // 清除的内容：桌板、历史、收藏、私房菜、自定义菜系等
    const keysToKeep = ['testUserId', 'testUserPhone', 'isLoggedIn'];
    
    // 获取需要保留的登录状态
    const testUserId = localStorage.getItem('testUserId');
    const testUserPhone = localStorage.getItem('testUserPhone');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // 清除所有本地存储
    localStorage.clear();
    
    // 恢复登录状态（如果有）
    if (testUserId) localStorage.setItem('testUserId', testUserId);
    if (testUserPhone) localStorage.setItem('testUserPhone', testUserPhone);
    if (isLoggedIn) localStorage.setItem('isLoggedIn', isLoggedIn);
    
    // 刷新页面以重新加载数据
    window.location.reload();
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
      <div className="bg-gradient-to-b from-orange-600 via-orange-500 to-orange-400 px-6 pt-12 pb-8">
        {isLoggedIn ? (
          // 登录用户
          <div className="flex items-start gap-4">
            <div className="relative">
              <div 
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl overflow-hidden cursor-pointer shadow-lg border-2 border-white/30"
                onClick={handleAvatarClick}
              >
                {avatarImage ? (
                  <img src={avatarImage} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  userInfo.avatar
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 pt-1">
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
                  className="text-white text-2xl font-bold cursor-pointer hover:opacity-80"
                  onClick={() => { setTempNickname(userInfo.nickname); setEditingNickname(true); }}
                >
                  {userInfo.nickname}
                </div>
              )}
              {editingSignature ? (
                <div className="flex items-center gap-2 mt-1">
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
                  className="text-orange-100 text-sm cursor-pointer hover:opacity-80 mt-1"
                  onClick={() => { setTempSignature(userInfo.signature); setEditingSignature(true); }}
                >
                  {userInfo.signature}
                </div>
              )}
                  <div className="text-orange-200 text-xs mt-2">
                    已陪伴您吃了{history.length}顿饭
                  </div>
                  {isLoggedIn && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-200">
                      <Cloud className="w-3 h-3" />
                      <span>{isSyncing ? "同步中..." : "已同步至云端"}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 匿名用户 - 体验与登录用户一致
          <div className="flex items-start gap-4">
            <div className="relative">
              <div 
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl overflow-hidden"
              >
                {userInfo.avatar}
              </div>
            </div>
            <div className="flex-1 pt-1">
              <div className="text-white text-2xl font-bold">
                {userInfo.nickname}
              </div>
              <div className="text-orange-100 text-sm mt-1">
                {userInfo.signature}
              </div>
              <div className="text-orange-200 text-xs mt-2">
                已陪伴您吃了{history.length}顿饭
              </div>
              {!isLoggedIn && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-200/70">
                  <Cloud className="w-3 h-3" />
                  <span>登录后同步数据</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 菜单列表 */}
      <div className="px-6 space-y-3 pt-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className={`w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between active:bg-gray-100 transition-all duration-150 ${item.label === "数据同步" || item.label === "同步中..." ? "" : "hover:bg-gray-50"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.label === "数据已同步" ? "bg-green-50" : item.label === "同步中..." ? "bg-blue-50" : "bg-orange-50"}`}>
                  <Icon className={`w-5 h-5 ${item.label === "数据已同步" ? "text-green-500" : item.label === "同步中..." ? "text-blue-500" : "text-orange-500"}`} />
                </div>
                <div className="text-left">
                  <span className="text-gray-900 text-base block">{item.label}</span>
                  {item.subtitle && (
                    <span className="text-xs text-gray-400">{item.subtitle}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-sm bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
                {item.label === "数据同步" ? (
                  <span className="text-sm text-orange-500 font-medium">登录</span>
                ) : item.label === "同步中..." ? (
                  <span className="text-sm text-blue-500 font-medium">同步</span>
                ) : item.label !== "数据已同步" ? (
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                ) : null}
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
            {!isLoggedIn ? (
              <button
                onClick={() => { setShowSettings(false); setShowLoginDialog(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-gray-700">登录 / 注册</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm("确定要登出吗？")) {
                    handleLogout();
                    setShowSettings(false);
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-red-600">退出登录</span>
              </button>
            )}
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

      {/* 清除缓存确认弹窗 */}
      <Dialog open={showClearCacheConfirm} onOpenChange={setShowClearCacheConfirm}>
        <DialogContent className="max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">确认清除缓存？</h2>
            <p className="text-sm text-gray-500 mb-4">
              此操作将清除所有本地数据，包括：<br />
              • 我的私房菜<br />
              • 今日桌板<br />
              • 历史记录和收藏<br />
              <span className="text-red-500 font-medium">数据将无法恢复！</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowClearCacheConfirm(false)}
            >
              取消
            </Button>
            <Button 
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={confirmClearCache}
            >
              确认清除
            </Button>
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

      {/* 登录弹窗 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="max-w-sm">
          {!otpSent ? (
            <>
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">🍽️</div>
                <h2 className="text-xl font-semibold">登录后同步数据</h2>
                <p className="text-sm text-gray-500 mt-2">登录后可保存菜单到云端，换手机也不丢失</p>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={11}
                />
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
                <Button 
                  className="w-full"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? "发送中..." : "发送验证码"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">📱</div>
                <h2 className="text-xl font-semibold">输入验证码</h2>
                <p className="text-sm text-gray-500 mt-2">已发送验证码到 {phone}</p>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="请输入6位验证码"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
                <Button 
                  className="w-full"
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                >
                  {isLoading ? "验证中..." : "确认"}
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setLoginError("");
                  }}
                >
                  重新输入手机号
                </Button>
              </div>
            </>
          )}
          
          <div className="border-t border-gray-100 pt-4 mt-4">
            <button
              onClick={() => {
                setShowLoginDialog(false);
                setOtpSent(false);
                setOtp("");
                setPhone("");
                setLoginError("");
              }}
              className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              暂不登录
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}