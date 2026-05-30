import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNavBar from "./components/BottomNavBar";
import HomeView from "./components/HomeView";
import StatsView from "./components/StatsView";
import ShopView from "./components/ShopView";
import SettingsView from "./components/SettingsView";
import BattleView from "./components/BattleView";
import { DailyHabit } from "./types";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut, User } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { LogIn, ShieldAlert, Sparkles, Zap, User as UserIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const googleProvider = new GoogleAuthProvider();

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<"home" | "stats" | "shop" | "settings" | "battle" | "auth">("home");

  // User Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Tactical notification toast for AI Core events
  const [vanguardNotification, setVanguardNotification] = useState<string | null>(null);

  // Settings State
  const [volume, setVolume] = useState(65);
  const [visualMode, setVisualMode] = useState<"DARK" | "LIGHT">("DARK");

  // Daily Habits checklist
  const [habits, setHabits] = useState<DailyHabit[]>([
    {
      id: "habit_1",
      number: 1,
      name: "GET EIGHT HOURS OF SLEEP",
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
      name: "ONE HOUR SCREEN FREE ZONE",
      category: "MIND",
      xpReward: 35,
      creditsReward: 25,
      completedToday: false,
      streakCount: 3,
      iconName: "shield",
    },
    {
      id: "habit_3",
      number: 3,
      name: "FOCUS STUDY ZONE",
      category: "ACADEMIC",
      xpReward: 50,
      creditsReward: 40,
      completedToday: false,
      streakCount: 10,
      iconName: "terminal",
    },
    {
      id: "habit_4",
      number: 4,
      name: "MEET MEAL 3-COLOR RULE",
      category: "FITNESS",
      xpReward: 30,
      creditsReward: 30,
      completedToday: false,
      streakCount: 5,
      iconName: "shield",
    },
  ]);

  // Auth Listener
  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  // Notification Auto-Dismissal Hook
  useEffect(() => {
    if (vanguardNotification) {
      const timer = setTimeout(() => {
        setVanguardNotification(null);
      }, 7500);
      return () => clearTimeout(timer);
    }
  }, [vanguardNotification]);

  // Firestore Synchronizer
  useEffect(() => {
    if (!user || user.uid === "local_guest_user") return;

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setXp(data.xp ?? 0);
          setMaxXp(data.maxXp ?? 2000);
          setLevel(data.level ?? 1);
          setLevelName(data.levelName ?? "LEVEL 1: ROOKIE");
          setCredits(data.credits ?? 0);
          setCurrentStreak(data.currentStreak ?? 0);
          setMaxStreak(data.maxStreak ?? 0);
          setTotalCompleted(data.totalCompleted ?? 0);
          setTotalXpGained(data.totalXpGained ?? 0);
          setPlayerHp(data.playerHp ?? 20);
          setMaxPlayerHp(data.maxPlayerHp ?? 20);
          setDoubleXp(data.doubleXp ?? false);
          if (data.habits) {
            setHabits(data.habits);
          }
        } else {
          // Document does not exist yet. Initialize it with our state values.
          const initialProfile = {
            xp,
            maxXp,
            level,
            levelName,
            credits,
            currentStreak,
            maxStreak,
            totalCompleted,
            totalXpGained,
            playerHp,
            maxPlayerHp,
            doubleXp,
            habits,
          };
          setDoc(userDocRef, initialProfile).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    );

    return unsubscribe;
  }, [user]);

  // Helper to save updates to authenticated user document
  const updateFirebaseDoc = async (fields: Partial<any>) => {
    if (!user || user.uid === "local_guest_user") return;
    try {
      await setDoc(doc(db, "users", user.uid), fields, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Authentication failed:", err);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.warn("Anonymous sign-in failed/not-allowed, falling back to local guest:", err);
      setUser({
        uid: "local_guest_user",
        displayName: "Guest Officer",
        email: "guest@hero-habit.local",
        photoURL: null,
        emailVerified: true,
        isAnonymous: true,
      } as any);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // reset local states
      setXp(1250);
      setMaxXp(2000);
      setLevel(3);
      setLevelName("LEVEL 3: THE INVINCIBLE");
      setCredits(1250);
      setCurrentStreak(14);
      setMaxStreak(21);
      setTotalCompleted(780);
      setTotalXpGained(12500);
      setPlayerHp(20);
      setDoubleXp(false);
    } catch (err) {
      console.error("Signout failed:", err);
    }
  };

  // Level Up Check for non-logged fallback. (When logged in, Firestore onSnapshot handles leveling up automatically)
  useEffect(() => {
    if (!user && xp >= maxXp) {
      setLevel((prevLevel) => {
        const nextLevel = prevLevel + 1;
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
  }, [xp, maxXp, user]);

  const handleToggleHabit = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const wasCompleted = habit.completedToday;
    const xpModifier = habit.xpReward * (doubleXp ? 2 : 1);
    const creditsModifier = habit.creditsReward;

    let nextXp = xp;
    let nextTotalXp = totalXpGained;
    let nextCredits = credits;
    let nextTotalCompleted = totalCompleted;
    let nextCurrentStreak = currentStreak;
    let nextMaxStreak = maxStreak;

    if (!wasCompleted) {
      nextXp = xp + xpModifier;
      nextTotalXp = totalXpGained + xpModifier;
      nextCredits = credits + creditsModifier;
      nextTotalCompleted = totalCompleted + 1;
      nextCurrentStreak = currentStreak + 1;
      if (nextCurrentStreak > nextMaxStreak) {
        nextMaxStreak = nextCurrentStreak;
      }
    } else {
      nextXp = Math.max(0, xp - xpModifier);
      nextTotalXp = Math.max(0, totalXpGained - xpModifier);
      nextCredits = Math.max(0, credits - creditsModifier);
      nextTotalCompleted = Math.max(0, totalCompleted - 1);
      nextCurrentStreak = Math.max(0, currentStreak - 1);
    }

    let nextLevel = level;
    let nextLevelName = levelName;
    let nextMaxXp = maxXp;
    if (nextXp >= nextMaxXp) {
      nextLevel = level + 1;
      if (nextLevel === 4) {
        nextLevelName = "LEVEL 4: COSMIC GUARDIAN";
      } else if (nextLevel >= 5) {
        nextLevelName = `LEVEL ${nextLevel}: VANGUARD COMMANDER`;
      }
      nextXp = nextXp - nextMaxXp;
      nextMaxXp = Math.floor(nextMaxXp * 1.25);
    }

    const nextHabits = habits.map((h) => (h.id === id ? { ...h, completedToday: !wasCompleted } : h));

    if (user && user.uid !== "local_guest_user") {
      updateFirebaseDoc({
        xp: nextXp,
        maxXp: nextMaxXp,
        level: nextLevel,
        levelName: nextLevelName,
        credits: nextCredits,
        totalCompleted: nextTotalCompleted,
        totalXpGained: nextTotalXp,
        currentStreak: nextCurrentStreak,
        maxStreak: nextMaxStreak,
        habits: nextHabits,
      });
    } else {
      setXp(nextXp);
      setMaxXp(nextMaxXp);
      setLevel(nextLevel);
      setLevelName(nextLevelName);
      setCredits(nextCredits);
      setTotalCompleted(nextTotalCompleted);
      setTotalXpGained(nextTotalXp);
      setCurrentStreak(nextCurrentStreak);
      setMaxStreak(nextMaxStreak);
      setHabits(nextHabits);
    }
  };

  const handleCompleteHabitByAI = (
    habitNumber: number,
    xpReward: number,
    creditsReward: number,
    customMessage: string
  ) => {
    const targetHabit = habits.find((h) => h.number === habitNumber);
    if (!targetHabit) return;

    const isAlreadyDone = targetHabit.completedToday;
    const finalXpReward = xpReward * (doubleXp ? 2 : 1);

    const nextHabits = habits.map((h) =>
      h.number === habitNumber ? { ...h, completedToday: true, streakCount: h.streakCount + (isAlreadyDone ? 0 : 1) } : h
    );

    const nextXp = xp + finalXpReward;
    const nextTotalXp = totalXpGained + finalXpReward;
    const nextCredits = credits + creditsReward;
    const nextTotalCompleted = totalCompleted + (isAlreadyDone ? 0 : 1);

    let nextLevel = level;
    let nextLevelName = levelName;
    let nextMaxXp = maxXp;

    if (nextXp >= nextMaxXp) {
      nextLevel = level + 1;
      if (nextLevel === 4) {
        nextLevelName = "LEVEL 4: COSMIC GUARDIAN";
      } else if (nextLevel >= 5) {
        nextLevelName = `LEVEL ${nextLevel}: VANGUARD COMMANDER`;
      }
      setXp(nextXp - nextMaxXp);
      setMaxXp(Math.floor(nextMaxXp * 1.25));
      setLevel(nextLevel);
      setLevelName(nextLevelName);
    } else {
      setXp(nextXp);
    }

    setTotalXpGained(nextTotalXp);
    setCredits(nextCredits);
    setTotalCompleted(nextTotalCompleted);
    setHabits(nextHabits);

    if (user && user.uid !== "local_guest_user") {
      updateFirebaseDoc({
        xp: nextXp >= nextMaxXp ? nextXp - nextMaxXp : nextXp,
        maxXp: nextXp >= nextMaxXp ? Math.floor(nextMaxXp * 1.25) : nextMaxXp,
        level: nextLevel,
        levelName: nextLevelName,
        totalXpGained: nextTotalXp,
        credits: nextCredits,
        totalCompleted: nextTotalCompleted,
        habits: nextHabits,
      });
    }

    setVanguardNotification(customMessage);
  };

  const handleClaimVanguardCode = async (code: string) => {
    const formatted = code.toUpperCase().trim();
    let msg = "";
    let nextCredits = credits;
    let nextPlayerHp = playerHp;
    let nextLevel = level;
    let nextLevelName = levelName;
    let nextXp = xp;

    if (formatted === "VANGUARD") {
      nextCredits = credits + 500;
      msg = "🎉 CODE VERIFIED! VANGUARD SUPPLY DROP DISPATCHED: +500 C!";
    } else if (formatted === "FREECOINS") {
      nextCredits = credits + 300;
      msg = "🎉 STRIKE FORCE COIN DROP CRATED SUCCESS: +300 C!";
    } else if (formatted === "MRMARK") {
      nextCredits = credits + 9999;
      msg = "🎉 CODE VERIFIED! MRMARK SPECIAL DROP SECURED: +9,999 C!";
    } else if (formatted === "AXEL") {
      nextCredits = credits + 1500;
      msg = "🎉 CODE VERIFIED! COGNITIVE OVERDRIVE SUPPLIES (AXEL) RECEIVED: +1,500 C!";
    } else if (formatted === "IMINVINCIBLE") {
      nextPlayerHp = maxPlayerHp;
      nextLevel = 5;
      nextLevelName = "LEVEL 5: SUPREME ARCH-GUARDIAN";
      nextXp = 50;
      msg = "🤖 PROTOCOL RECALIBRATION: HEALTH FULLY RECHARGED & ADVANCED TO LEVEL 5!";
    } else {
      return "🚨 SECURE INVALID PROTOCOL CODE ENCOUNTERED - DENIED!";
    }

    if (user && user.uid !== "local_guest_user") {
      try {
        await updateFirebaseDoc({
          credits: nextCredits,
          playerHp: nextPlayerHp,
          level: nextLevel,
          levelName: nextLevelName,
          xp: nextXp,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else {
      setCredits(nextCredits);
      setPlayerHp(nextPlayerHp);
      setLevel(nextLevel);
      setLevelName(nextLevelName);
      setXp(nextXp);
    }
    return msg;
  };

  const handleBattleVictoryXpReward = (amount: number) => {
    let nextXp = xp + amount;
    const nextTotalXp = totalXpGained + amount;
    let nextLevel = level;
    let nextMaxXp = maxXp;
    let nextLevelName = levelName;
    if (nextXp >= nextMaxXp) {
      nextLevel = level + 1;
      if (nextLevel === 4) {
        nextLevelName = "LEVEL 4: COSMIC GUARDIAN";
      } else if (nextLevel >= 5) {
        nextLevelName = `LEVEL ${nextLevel}: VANGUARD COMMANDER`;
      }
      nextXp = nextXp - nextMaxXp;
      nextMaxXp = Math.floor(nextMaxXp * 1.25);
    }
    if (user && user.uid !== "local_guest_user") {
      updateFirebaseDoc({
        xp: nextXp,
        maxXp: nextMaxXp,
        level: nextLevel,
        levelName: nextLevelName,
        totalXpGained: nextTotalXp,
      });
    } else {
      setXp(nextXp);
      setMaxXp(nextMaxXp);
      setLevel(nextLevel);
      setLevelName(nextLevelName);
      setTotalXpGained(nextTotalXp);
    }
  };

  const handleBattleVictoryCreditsReward = (amount: number) => {
    const nextCredits = credits + amount;
    if (user && user.uid !== "local_guest_user") {
      updateFirebaseDoc({ credits: nextCredits });
    } else {
      setCredits(nextCredits);
    }
  };

  const handleSetPlayerHp = (newHp: number | ((prev: number) => number)) => {
    let nextHp = 0;
    if (typeof newHp === "function") {
      nextHp = newHp(playerHp);
    } else {
      nextHp = newHp;
    }
    if (user && user.uid !== "local_guest_user") {
      updateFirebaseDoc({ playerHp: nextHp });
    } else {
      setPlayerHp(nextHp);
    }
  };

  const handleSetCredits = (newCredits: number | ((prev: number) => number)) => {
    let nextCredits = 0;
    if (typeof newCredits === "function") {
      nextCredits = newCredits(credits);
    } else {
      nextCredits = newCredits;
    }
    if (user && user.uid !== "local_guest_user") {
      updateFirebaseDoc({ credits: nextCredits });
    } else {
      setCredits(nextCredits);
    }
  };

  const handlePurchaseBoost = () => {
    if (user && user.uid !== "local_guest_user") {
      updateFirebaseDoc({ doubleXp: true });
    } else {
      setDoubleXp(true);
    }
  };

  const handleHeal = (amount: number) => {
    const nextHp = Math.min(maxPlayerHp, playerHp + amount);
    if (user && user.uid !== "local_guest_user") {
      updateFirebaseDoc({ playerHp: nextHp });
    } else {
      setPlayerHp(nextHp);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070125] p-0 md:p-6 select-none font-sans overflow-hidden">
        <div className="relative w-full max-w-[480px] h-screen md:h-[840px] md:max-h-[92vh] bg-[#121312] md:rounded-[3rem] md:border-[12px] md:border-[#1C0770] md:shadow-[#3A9AFF]/30 md:shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="font-display-hero text-xl italic animate-pulse text-[#3A9AFF] tracking-widest text-stroke-black">
            INITIALIZING SECURE LINK...
          </div>
        </div>
      </div>
    );
  }

  // Beautiful Google Login Gate
  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070125] p-0 md:p-6 select-none font-sans overflow-hidden">
        <div className="relative w-full max-w-[480px] h-screen md:h-[840px] md:max-h-[92vh] bg-[#080038] md:rounded-[3rem] md:border-[12px] md:border-[#1C0770] md:shadow-[#3A9AFF]/30 md:shadow-2xl overflow-hidden flex flex-col justify-center items-center px-6 text-white relative">
          {/* Kirby grid overlay dots */}
          <div className="absolute inset-0 bg-stripes opacity-10 pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#261CC1]/40 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3A9AFF]/30 rounded-full filter blur-3xl pointer-events-none" />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-[#1C0770] comic-border comic-shadow-accent p-6 rounded-3xl w-full text-center relative z-10"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#261CC1] to-[#3A9AFF] rounded-full border-4 border-black mx-auto flex items-center justify-center mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>

            <h1 className="font-display-hero text-2xl text-yellow-400 italic tracking-wider text-stroke-black uppercase leading-tight mb-1">
              HERO HABIT
            </h1>
            <p className="font-pixel text-[8px] text-[#3A9AFF] uppercase mb-4 tracking-wide">
              Vanguands Command Center
            </p>

            <p className="font-body-md text-xs text-gray-300 italic mb-6 px-1 font-medium leading-relaxed">
              Authorized sign-in required to automatically sync data on cloud, unlock global streaks, and battle villains.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              className="w-full bg-[#3A9AFF] hover:bg-white text-[#121312] font-display-hero text-sm tracking-wider py-3 px-5 rounded-2xl border-3 border-black comic-shadow shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer select-none active:scale-95 duration-100 ease-in-out"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              SIGN IN WITH GOOGLE
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuestSignIn}
              className="w-full mt-3 bg-[#FFB800] hover:bg-white text-[#121312] font-display-hero text-sm tracking-wider py-3 px-5 rounded-2xl border-3 border-black comic-shadow shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer select-none active:scale-95 duration-100 ease-in-out"
            >
              <UserIcon className="w-4 h-4 stroke-[2.5]" />
              ENTER AS GUEST
            </motion.button>

            <div className="mt-6 flex items-center justify-center gap-2 bg-black/40 border border-gray-600 rounded-xl p-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#3A9AFF]" />
              <span className="font-label-sm text-[8px] uppercase text-gray-400">
                Zero-Trust Secure Database Connection
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070125] p-0 md:p-6 select-none font-sans overflow-hidden">
      <div className={`relative w-full max-w-[480px] h-screen md:h-[840px] md:max-h-[92vh] md:rounded-[3rem] md:border-[12px] md:border-[#1C0770] md:shadow-[#3A9AFF]/30 md:shadow-2xl overflow-hidden flex flex-col ${visualMode === "LIGHT" ? "bg-stone-100 text-[#121312]" : "bg-[#121312] text-white"}`}>
        
        {/* Absolute header pinned inside the container */}
        <Header credits={credits} userPhotoUrl={user.photoURL} />

        {/* Scrollable middle container */}
        <div className="flex-1 overflow-y-auto pt-16 pb-20 scrollbar-none animate-fade-in relative">
          {activeView === "home" && (
            <HomeView
              xp={xp}
              maxXp={maxXp}
              levelName={levelName}
              habits={habits}
              onToggleHabit={handleToggleHabit}
              onEnterBattle={() => setActiveView("battle")}
              doubleXp={doubleXp}
              onCompleteHabitByAI={handleCompleteHabitByAI}
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
              setCredits={handleSetCredits}
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
              userEmail={user.email}
              userDisplayName={user.displayName}
              onLogOut={handleSignOut}
            />
          )}

          {activeView === "battle" && (
            <BattleView
              playerHp={playerHp}
              maxPlayerHp={maxPlayerHp}
              setPlayerHp={handleSetPlayerHp}
              level={level}
              addXp={handleBattleVictoryXpReward}
              addCredits={handleBattleVictoryCreditsReward}
              onRetreat={() => setActiveView("home")}
            />
          )}
        </div>

        {/* Persistent global bottom navigator tabs (Hidden dynamically inside Battle Mode) */}
        <BottomNavBar activeView={activeView} setActiveView={setActiveView} />

        {/* Absolute Tactical Toast Overlay */}
        <AnimatePresence>
          {vanguardNotification && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4 pointer-events-none"
            >
              <div className="bg-[#1C0770] border-3 border-green-500 rounded-2xl p-4 shadow-2xl pointer-events-auto flex items-start gap-3 comic-shadow border-double">
                <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 animate-bounce mt-0.5" />
                <div className="flex-1 text-left">
                  <span className="font-display-hero text-[9px] text-green-400 font-bold tracking-widest block uppercase">
                    Vanguard AI Core Link
                  </span>
                  <p className="font-sans text-[11px] text-white leading-relaxed mt-1 font-semibold">
                    {vanguardNotification}
                  </p>
                </div>
                <button
                  onClick={() => setVanguardNotification(null)}
                  className="text-gray-400 hover:text-white shrink-0 cursor-pointer pointer-events-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

