import { Link, useLocation } from "react-router";
import { Home, BookOpen, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "首页", icon: Home },
    { path: "/library", label: "菜库", icon: BookOpen },
    { path: "/profile", label: "我的", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
