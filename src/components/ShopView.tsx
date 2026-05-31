import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shield, Flame, Activity, Check } from "lucide-react";

interface ShopViewProps {
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  onPurchaseBoost: () => void;
  onHeal: (amount: number) => void;
}

interface ItemState {
  id: string;
  name: string;
  description: string;
  cost: number;
  iconType: "skin" | "shield" | "boost" | "bubble";
  purchased: boolean;
}

export default function ShopView({
  credits,
  setCredits,
  onPurchaseBoost,
  onHeal,
}: ShopViewProps) {
  const [items, setItems] = useState<ItemState[]>([
    {
      id: "skin_cosmic",
      name: "LEGENDARY SUIT SKINS",
      description: "Unlock alternative cosmic, stealth, and cyberpunk appearances for your hero.",
      cost: 800,
      iconType: "skin",
      purchased: false,
    },
    {
      id: "streak_shield",
      name: "ORACLE STREAK SHIELD",
      description: "Protects your longest habit streak from breaking if you miss a day. Single use.",
      cost: 350,
      iconType: "shield",
      purchased: false,
    },
    {
      id: "xp_boost",
      name: "SENTINEL XP BOOST",
      description: "Double all XP gained from completed daily habits for the next 24 hours.",
      cost: 450,
      iconType: "boost",
      purchased: false,
    },
    {
      id: "bubble_shield",
      name: "CELESTIAL BUBBLE SHIELD",
      description: "Instantly adds +10 max HP to your hero and fully heals your active state.",
      cost: 600,
      iconType: "bubble",
      purchased: false,
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleBuy = (item: ItemState) => {
    if (credits < item.cost) {
      setNotification(`🚨 INSUFFICIENT CREDITS! Need ${item.cost} C.`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setCredits((prev) => prev - item.cost);
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, purchased: true } : it))
    );

    // Apply immediate benefits if any
    if (item.id === "xp_boost") {
      onPurchaseBoost();
    } else if (item.id === "bubble_shield") {
      onHeal(20);
    }

    setNotification(`🎉 PURCHASED SUCESSFULLY: ${item.name}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const renderItemImage = (item: ItemState) => {
    switch (item.id) {
      case "skin_cosmic":
        return (
          <>
            <img
              alt="Cosmic Suit Background"
              className="absolute inset-0 w-full h-full object-cover opacity-75 brightness-90 group-hover:scale-105 transition-transform duration-200"
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#0B024C]/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C0770]/90 to-transparent" />
            <Sparkles className="relative w-14 h-14 text-yellow-400 filter drop-shadow-[0_0_12px_rgba(234,179,8,0.9)] animate-pulse z-10" />
          </>
        );
      case "streak_shield":
        return (
          <img
            alt="Oracle Streak Shield"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            src="https://lh3.googleusercontent.com/aida/ADBb0uh43cBNrDsxFjRvYG_eiYIGfGHIhCzMwf_Uch9dZBkHIe068Y9PMHU1tyXgQ3omi3Zyt9uuASTBj-yVhkFnfVUN0wnO2quQ7M9rbxWAqaA7Rl4Y3gM2tT5XaK3hsQl5bUOVYFNS_T1gFe2Yr4ZgzUJVJfP_bXZBcEocfHhUqOh8WzRY-imOeHpiKK4uw4f-BMfN_tg1VHNtbH7QHA8IYyS_1Yw2IQL9rcEofrAnEE5LWo7_rkS4OzV4xDw"
            referrerPolicy="no-referrer"
          />
        );
      case "xp_boost":
        return (
          <>
            <img
              alt="Booster Background"
              className="absolute inset-0 w-full h-full object-cover opacity-75 brightness-90 group-hover:scale-105 transition-transform duration-200"
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#0B024C]/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C0770]/90 to-transparent" />
            <Flame className="relative w-14 h-14 text-red-500 fill-red-500 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-bounce z-10" />
          </>
        );
      case "bubble_shield":
        return (
          <>
            <img
              alt="Bubble Shield Background"
              className="absolute inset-0 w-full h-full object-cover opacity-75 brightness-90 group-hover:scale-105 transition-transform duration-200"
              src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#0B024C]/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C0770]/90 to-transparent" />
            <Activity className="relative w-14 h-14 text-cyan-400 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse z-10" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <main className="px-4 flex flex-col gap-6 mt-24 mb-24 w-full max-w-xl mx-auto">
      
      <section className="text-center w-full">
        <h2 className="font-display-hero text-3xl text-white tracking-widest uppercase italic transform -skew-x-6 text-stroke-black">
          HEROIC SUPPLY SHOP
        </h2>
        <p className="font-body-md text-[10px] italic text-blue-300 mt-1 select-none">
          Power up catalog for Vanguard Operatives
        </p>
      </section>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`comic-border text-center p-3 text-xs font-display-hero uppercase rounded-lg shadow-md ${
              notification.includes("INSUFFICIENT")
                ? "bg-red-950 border-red-500 text-red-300"
                : "bg-green-950 border-green-500 text-green-300"
            }`}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid grid-cols-2 gap-3 w-full">
        {items.map((item) => (
          <article
            key={item.id}
            className="bg-[#121312] border-3 border-[#3A9AFF] p-2.5 flex flex-col justify-between relative block-shadow group hover:-translate-y-1 transition-transform duration-200 aspect-[3/4.6] rounded-xl"
          >
            <div className="h-32 w-full bg-[#1C0770] comic-border rounded-lg cross-hatch flex items-center justify-center overflow-hidden relative shrink-0">
              {renderItemImage(item)}
              {item.id === "xp_boost" && (
                <span className="absolute bottom-1 right-2 bg-slate-900/90 border border-orange-500/50 px-1.5 py-0.5 rounded font-display-hero text-orange-400 text-[9px] uppercase tracking-wider z-20">
                  2X XP
                </span>
              )}
            </div>

            <div className="flex flex-col flex-grow justify-center mt-2.5">
              <h3 className="font-display-hero text-[11px] leading-tight text-white uppercase italic tracking-wider">
                {item.name}
              </h3>
              <p className="font-body-md text-[9px] leading-snug text-gray-400 italic mt-1 line-clamp-3">
                {item.description}
              </p>
            </div>

            <button
              onClick={() => handleBuy(item)}
              disabled={item.purchased && item.id === "streak_shield"}
              className={`w-full font-display-hero text-[10px] uppercase py-1.5 rounded-lg border-2 border-black block-shadow-sm active:scale-95 duration-100 ease-in-out transition-all mt-2.5 flex items-center justify-center gap-1 ${
                item.purchased && item.id === "streak_shield"
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-[#3A9AFF] hover:bg-white text-[#121212] cursor-pointer"
              }`}
            >
              {item.purchased && item.id === "streak_shield" ? (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  OWNED
                </>
              ) : (
                `[ ${item.cost} C ]`
              )}
            </button>
          </article>
        ))}
      </section>

    </main>
  );
}
