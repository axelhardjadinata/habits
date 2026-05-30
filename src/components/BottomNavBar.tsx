import { Home, BarChart3, ShoppingBag, Settings } from "lucide-react";

interface BottomNavBarProps {
  activeView: "home" | "stats" | "shop" | "settings" | "battle";
  setActiveView: (view: "home" | "stats" | "shop" | "settings" | "battle") => void;
}

export default function BottomNavBar({ activeView, setActiveView }: BottomNavBarProps) {
  // If in battle, we hide the nav bar for maximum immersion
  if (activeView === "battle") return null;

  return (
    <nav className="absolute bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 border-t-4 border-[#121312] bg-[#1C0770] shadow-[0px_-4px_0px_0px_rgba(8,0,56,1)] h-20 shrink-0">
      <button
        id="nav-home"
        onClick={() => setActiveView("home")}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 group active:scale-95 duration-100 ease-in-out ${
          activeView === "home" ? "text-[#3A9AFF] scale-105 font-bold" : "text-[#c1c1ff]/60 hover:text-[#3A9AFF]"
        }`}
      >
        <Home className={`w-6 h-6 mb-1 ${activeView === "home" ? "fill-[#3A9AFF]" : ""}`} />
        <span className="font-label-sm text-[10px] uppercase italic tracking-wide">
          HOME
        </span>
      </button>

      <button
        id="nav-stats"
        onClick={() => setActiveView("stats")}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 group active:scale-95 duration-100 ease-in-out ${
          activeView === "stats" ? "text-[#3A9AFF] scale-105 font-bold" : "text-[#c1c1ff]/60 hover:text-[#3A9AFF]"
        }`}
      >
        <BarChart3 className={`w-6 h-6 mb-1 ${activeView === "stats" ? "fill-[#3A9AFF] opacity-100" : ""}`} />
        <span className="font-label-sm text-[10px] uppercase italic tracking-wide">
          STATS
        </span>
      </button>

      <button
        id="nav-shop"
        onClick={() => setActiveView("shop")}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 group active:scale-95 duration-100 ease-in-out ${
          activeView === "shop" ? "text-[#3A9AFF] scale-105 font-bold" : "text-[#c1c1ff]/60 hover:text-[#3A9AFF]"
        }`}
      >
        <ShoppingBag className={`w-6 h-6 mb-1 ${activeView === "shop" ? "fill-[#3A9AFF] opacity-100" : ""}`} />
        <span className="font-label-sm text-[10px] uppercase italic tracking-wide">
          SHOP
        </span>
      </button>

      <button
        id="nav-settings"
        onClick={() => setActiveView("settings")}
        className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 group active:scale-95 duration-100 ease-in-out ${
          activeView === "settings" ? "text-[#3A9AFF] scale-105 font-bold" : "text-[#c1c1ff]/60 hover:text-[#3A9AFF]"
        }`}
      >
        <Settings className={`w-6 h-6 mb-1 ${activeView === "settings" ? "fill-[#3A9AFF] opacity-100" : ""}`} />
        <span className="font-label-sm text-[10px] uppercase italic tracking-wide">
          SETTINGS
        </span>
      </button>
    </nav>
  );
}
