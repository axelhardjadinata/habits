import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNavBar from "./components/BottomNavBar";
import HomeView from "./components/HomeView";
import StatsView from "./components/StatsView";
import ShopView from "./components/ShopView";
import SettingsView from "./components/SettingsView";
import BattleView from "./components/BattleView";
import { DailyHabit } from "./types";

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<"home" | "stats" | "shop" | "settings" | "battle">("home");

  // Economic / Level state
  const [xp, setXp] = useState(1250);
  const [maxXp, setMaxXp] = useState(2000);
  const [level, setLevel] = useState(3);
  const [levelName, setLevelName] = useState("LEVEL 3: THE INVINCIBLE");
  const [credits, setCredits] = useState(1250);

  // Stats / Tracking counters
  const [currentStreak, setCurrentStreak] = useState(14);
  const [maxStreak, setMaxStreak] = useState(21);
  const [totalCompleted, setTotalCompleted] = useState(780);
  const [totalXpGained, setTotalXpGained] = useState(12500);

  // Active Combat player vitals
  const [playerHp, setPlayerHp] = useState(20);
  const [maxPlayerHp, setMaxPlayerHp] = useState(20);

  // Shop booster flags
  const [doubleXp, setDoubleXp] = useState(false);

  // Settings State
  const [volume, setVolume] = useState(65);
  const [visualMode, setVisualMode] = useState<"DARK" | "LIGHT">("DARK");

  // Daily Habits checklist
  const [habits, setHabits] = useState<DailyHabit[]>([
    {
      id: "habit_1",
      number: 1,
      name: "VIGILANTE NIGHT PATROL (SLEEP)",
      category: "SLEEP",
      xpReward: 25,
      creditsReward: 15,
      completedToday: false,
      streakCount: 7,
      iconName: "bedtime",
    },
    {
      id: "habit_2",
      number: 2,
      name: "TELEPATHIC SHIELD (MIND)",
      category: "MIND",
      xpReward: 25,
      creditsReward: 15,
      completedToday: false,
      streakCount: 3,
      iconName: "shield",
    },
    {
      id: "habit_3",
      number: 3,
      name: "ORACLE DATABASE SYNC (ACADEMIC)",
      category: "ACADEMIC",
      xpReward: 50,
      creditsReward: 25,
      completedToday: false,
      streakCount: 10,
      iconName: "terminal",
    },
  ]);

  // Level Up Check
  useEffect(() => {
    if (xp >= maxXp) {
      setLevel((prevLevel) => {
        const nextLevel = prevLevel + 1;
        // Level Name calculation
        if (nextLevel === 4) {
          setLevelName("LEVEL 4: COSMIC GUARDIAN");
        } else if (nextLevel >= 5) {
          setLevelName(`LEVEL ${nextLevel}: VANGUARD COMMANDER`);
        }
        return nextLevel;
      });
      setXp((prevXp) => prevXp - maxXp);
      setMaxXp((prevMax) => Math.floor(prevMax * 1.25));
    }
  }, [xp, maxXp]);

  const handleToggleHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === id) {
          const wasCompleted = habit.completedToday;
          const xpModifier = habit.xpReward * (doubleXp ? 2 : 1);
          const creditsModifier = habit.creditsReward;

          if (!wasCompleted) {
            // Addition
            setXp((prev) => prev + xpModifier);
            setTotalXpGained((prev) => prev + xpModifier);
            setCredits((prev) => prev + creditsModifier);
            setTotalCompleted((prev) => prev + 1);
            
            // Random streak increment or adjust
            const nextStreak = currentStreak + 1;
            setCurrentStreak(nextStreak);
            if (nextStreak > maxStreak) {
              setMaxStreak(nextStreak);
            }
          } else {
            // Reverse reduction
            setXp((prev) => Math.max(0, prev - xpModifier));
            setTotalXpGained((prev) => Math.max(0, prev - xpModifier));
            setCredits((prev) => Math.max(0, prev - creditsModifier));
            setTotalCompleted((prev) => Math.max(0, prev - 1));
            setCurrentStreak((prev) => Math.max(0, prev - 1));
          }

          return { ...habit, completedToday: !wasCompleted };
        }
        return habit;
      })
    );
  };

  const handleClaimVanguardCode = (code: string) => {
    const formatted = code.toUpperCase().trim();
    if (formatted === "VANGUARD") {
      setCredits((prev) => prev + 500);
      return "🎉 CODE VERIFIED! VANGUARD SUPPLY DROP DISPATCHED: +500 C!";
    } else if (formatted === "FREECOINS") {
      setCredits((prev) => prev + 300);
      return "🎉 STRIKE FORCE COIN DROP CRATED SUCCESS: +300 C!";
    } else if (formatted === "IMINVINCIBLE") {
      setPlayerHp(maxPlayerHp);
      setLevel(5);
      setLevelName("LEVEL 5: SUPREME ARCH-GUARDIAN");
      setXp(50);
      return "🤖 PROTOCOL RECALIBRATION: HEALTH FULLY RECHARGED & ADVANCED TO LEVEL 5!";
    } else {
      return "🚨 SECURE INVALID PROTOCOL CODE ENCOUNTERED - DENIED!";
    }
  };

  // Combat stats callback helpers
  const handleBattleVictoryXpReward = (amount: number) => {
    setXp((prev) => prev + amount);
    setTotalXpGained((prev) => prev + amount);
  };

  const handleBattleVictoryCreditsReward = (amount: number) => {
    setCredits((prev) => prev + amount);
  };

  const handlePurchaseBoost = () => {
    setDoubleXp(true);
    // Auto reset double XP booster after a duration simulation or let it stick
  };

  const handleHeal = (amount: number) => {
    setPlayerHp((prev) => Math.min(maxPlayerHp, prev + amount));
  };

  return (
    <div className={`min-h-screen pb-24 ${visualMode === "LIGHT" ? "bg-stone-100 text-[#121312]" : "bg-[#121312] text-white"}`}>
      
      {/* Fixed global navigation toolbar */}
      <Header credits={credits} />

      {/* Main dynamic core views container */}
      <div className="pt-2 animate-fade-in">
        {activeView === "home" && (
          <HomeView
            xp={xp}
            maxXp={maxXp}
            levelName={levelName}
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onEnterBattle={() => setActiveView("battle")}
            doubleXp={doubleXp}
          />
        )}

        {activeView === "stats" && (
          <StatsView
            currentStreak={currentStreak}
            maxStreak={maxStreak}
            totalCompleted={totalCompleted}
            totalXpGained={totalXpGained}
          />
        )}

        {activeView === "shop" && (
          <ShopView
            credits={credits}
            setCredits={setCredits}
            onPurchaseBoost={handlePurchaseBoost}
            onHeal={handleHeal}
          />
        )}

        {activeView === "settings" && (
          <SettingsView
            volume={volume}
            setVolume={setVolume}
            visualMode={visualMode}
            setVisualMode={setVisualMode}
            onRedeemCode={handleClaimVanguardCode}
          />
        )}

        {activeView === "battle" && (
          <BattleView
            playerHp={playerHp}
            maxPlayerHp={maxPlayerHp}
            setPlayerHp={setPlayerHp}
            level={level}
            addXp={handleBattleVictoryXpReward}
            addCredits={handleBattleVictoryCreditsReward}
            onRetreat={() => setActiveView("home")}
          />
        )}
      </div>

      {/* Persistent global bottom navigator tabs (Hidden dynamically inside Battle Mode) */}
      <BottomNavBar activeView={activeView} setActiveView={setActiveView} />
      
    </div>
  );
}
