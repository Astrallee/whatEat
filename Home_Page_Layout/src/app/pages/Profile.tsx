import { ChevronRight, Heart, Clock, Settings } from "lucide-react";

export function Profile() {
  const menuItems = [
    { icon: Heart, label: "我的收藏", count: 12 },
    { icon: Clock, label: "历史记录", count: 28 },
    { icon: Settings, label: "设置", count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-400 px-6 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <div className="text-white text-xl mb-1">美食达人</div>
            <div className="text-orange-100 text-sm">今天也要好好吃饭</div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-6 -mt-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-2xl text-gray-900 mb-1">156</div>
              <div className="text-sm text-gray-500">已规划</div>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl text-gray-900 mb-1">28</div>
              <div className="text-sm text-gray-500">菜品库</div>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl text-gray-900 mb-1">12</div>
              <div className="text-sm text-gray-500">收藏</div>
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
    </div>
  );
}
