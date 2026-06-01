import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Shield, Flame, Activity, Check } from "lucide-react";

interface ShopViewProps {
  credits: number;
  doubleXp?: boolean;
  fiveMinuteFuseCount: number;
  hasNoiseHelmet: boolean;
  hasBootsMomentum: boolean;
  hasStreakShield: boolean;
  onPurchaseItem: (itemId: string, cost: number) => void;
  onHeal: (amount: number) => void;
}

interface ItemState {
  id: string;
  name: string;
  description: string;
  cost: number;
  iconType: "skin" | "shield" | "boost" | "bubble";
}

export default function ShopView({
  credits,
  doubleXp = false,
  fiveMinuteFuseCount,
  hasNoiseHelmet,
  hasBootsMomentum,
  hasStreakShield,
  onPurchaseItem,
  onHeal,
}: ShopViewProps) {
  const items: ItemState[] = [
    {
      id: "five_minute_fuse",
      name: "THE 5-MINUTE FUSE",
      description: "Instantly deals 20 unblockable damage to any active boss, completely bypassing shields.",
      cost: 200,
      iconType: "boost",
    },
    {
      id: "noise_helmet",
      name: "NOISE-CANCELLING HELMET",
      description: "Grants +30% passive resistance to status distractions. Direct counter to Dr. Distraction.",
      cost: 350,
      iconType: "shield",
    },
    {
      id: "boots_momentum",
      name: "BOOTS OF MOMENTUM",
      description: "Increases slider agility. Defense bonus scales higher based on your active daily habit streak.",
      cost: 500,
      iconType: "skin",
    },
    {
      id: "streak_shield",
      name: "ORACLE STREAK SHIELD",
      description: "Protects your longest habit streak from breaking if you miss a day. Single use.",
      cost: 350,
      iconType: "shield",
    },
    {
      id: "xp_boost",
      name: "SENTINEL XP BOOST",
      description: "Double all XP gained from completed daily habits for the next 24 hours.",
      cost: 450,
      iconType: "boost",
    },
    {
      id: "bubble_shield",
      name: "CELESTIAL BUBBLE SHIELD",
      description: "Instantly adds +10 max HP to your hero and fully heals your active state.",
      cost: 600,
      iconType: "bubble",
    },
  ];

  const [notification, setNotification] = useState<string | null>(null);

  const handleBuy = (item: ItemState) => {
    if (credits < item.cost) {
      setNotification(`🚨 INSUFFICIENT CREDITS! Need ${item.cost} C.`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    onPurchaseItem(item.id, item.cost);

    setNotification(`🎉 PURCHASED SUCCESSFULLY: ${item.name}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const renderItemImage = (item: ItemState) => {
    let src = "";
    // All these screenshots are captured from light/white-backed layouts, so we key out white.
    // We register both white and black chroma filters to be safe and versatile.
    const filterId = "remove-white-bg";

    switch (item.id) {
      case "five_minute_fuse":
        src = "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780320645/Screenshot_2026-06-01_at_20.27.24_urkl4n.png";
        break;
      case "noise_helmet":
        src = "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780320645/Screenshot_2026-06-01_at_20.28.04_ghajhr.png";
        break;
      case "boots_momentum":
        src = "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780320645/Screenshot_2026-06-01_at_20.28.19_xkpeg0.png";
        break;
      case "streak_shield":
        src = "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780323129/Screenshot_2026-06-01_at_21.11.26_zfnqax.png";
        break;
      case "xp_boost":
        src = "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780323129/Screenshot_2026-06-01_at_21.11.36_er9wij.png";
        break;
      case "bubble_shield":
        src = "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780323129/Screenshot_2026-06-01_at_21.11.42_pei7vv.png";
        break;
      default:
        return null;
    }

    return (
      <img
        alt={item.name}
        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 p-1"
        src={src}
        style={{ filter: `url(#${filterId})` }}
        referrerPolicy="no-referrer"
      />
    );
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
        {items.map((item) => {
          const isOwned = item.id === "xp_boost" ? doubleXp : 
                          item.id === "noise_helmet" ? hasNoiseHelmet : 
                          item.id === "boots_momentum" ? hasBootsMomentum : 
                          item.id === "streak_shield" ? hasStreakShield : false;

          return (
            <article
              key={item.id}
              className="bg-[#121312] border-3 border-[#3A9AFF] p-2.5 flex flex-col justify-between relative block-shadow group hover:-translate-y-1 transition-transform duration-200 aspect-[3/4.6] rounded-xl"
            >
              <div className="h-32 w-full bg-transparent comic-border rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                {renderItemImage(item)}
                
                {item.id === "xp_boost" && (
                  <span className="absolute bottom-1 right-2 bg-slate-900/90 border border-orange-500/50 px-1.5 py-0.5 rounded font-display-hero text-orange-400 text-[9px] uppercase tracking-wider z-20">
                    2X XP
                  </span>
                )}

                {item.id === "five_minute_fuse" && fiveMinuteFuseCount > 0 && (
                  <span className="absolute bottom-1 right-2 bg-slate-900/90 border border-orange-500/50 px-1.5 py-0.5 rounded font-display-hero text-orange-400 text-[9px] uppercase tracking-wider z-20 animate-pulse">
                    OWNED: {fiveMinuteFuseCount}
                  </span>
                )}
              </div>

              <div className="flex flex-col flex-grow justify-center mt-2.5 text-left">
                <h3 className="font-display-hero text-[11px] leading-tight text-white uppercase italic tracking-wider">
                  {item.name}
                </h3>
                <p className="font-body-md text-[9px] leading-snug text-gray-400 italic mt-1 line-clamp-3">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => handleBuy(item)}
                disabled={isOwned}
                className={`w-full font-display-hero text-[10px] uppercase py-1.5 rounded-lg border-2 border-black block-shadow-sm active:scale-95 duration-100 ease-in-out transition-all mt-2.5 flex items-center justify-center gap-1 ${
                  isOwned
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-[#3A9AFF] hover:bg-white text-[#121212] cursor-pointer"
                }`}
              >
                {isOwned ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" />
                    {item.id === "xp_boost" ? "ACTIVE [2X]" : "OWNED"}
                  </>
                ) : (
                  `[ ${item.cost} C ]`
                )}
              </button>
            </article>
          );
        })}
      </section>
      
      {/* SVG Filters for Transparent Backdrop Processing */}
      <svg className="absolute w-0 h-0 pointer-events-none" width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          {/* Key out white backgrounds safely while preserving foreground color vibrance */}
          <filter id="remove-white-bg">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -2 -2 -2 5 -0.2"
            />
          </filter>
          {/* Key out black/dark backgrounds safely while preserving foreground color vibrance */}
          <filter id="remove-black-bg">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      2 2 2 0 -0.2"
            />
          </filter>
        </defs>
      </svg>

    </main>
  );
}
