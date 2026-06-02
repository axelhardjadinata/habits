import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swords, LogOut, RefreshCw, Trophy, Heart, ArrowLeft, Wind, Shield, Bomb } from "lucide-react";

interface BattleViewProps {
  playerHp: number;
  maxPlayerHp: number;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  level: number;
  addXp: (amount: number) => void;
  addCredits: (amount: number) => void;
  onRetreat: () => void;
  currentBossIndex: number;
  updateBossIndex: (index: number) => void;
  triBossChampion: boolean;
  setTriBossChampion: (unlocked: boolean) => void;
  currentBossHp: number | null;
  updateBossHp: (hp: number | null) => void;
  fiveMinuteFuseCount: number;
  setFiveMinuteFuseCount: (count: number) => void;
  hasNoiseHelmet: boolean;
  hasBootsMomentum: boolean;
  currentStreak: number;
}

interface FloatingText {
  id: number;
  text: string;
  type: "perfect" | "good" | "okay" | "miss" | "boss-attack" | "heal" | "item";
  damage?: number;
}

export default function BattleView({
  playerHp,
  maxPlayerHp,
  setPlayerHp,
  level,
  addXp,
  addCredits,
  onRetreat,
  currentBossIndex: initialBossIndex,
  updateBossIndex,
  triBossChampion,
  setTriBossChampion,
  currentBossHp,
  updateBossHp,
  fiveMinuteFuseCount,
  setFiveMinuteFuseCount,
  hasNoiseHelmet,
  hasBootsMomentum,
  currentStreak,
}: BattleViewProps) {
  // Boss progression state
  const [currentBossIndex, setCurrentBossIndex] = useState(initialBossIndex);

  useEffect(() => {
    setCurrentBossIndex(initialBossIndex);
  }, [initialBossIndex]);

  // Boss configurations (Midnight Glutton starting health pool reduced to exactly 100 HP)
  const bossList = [
    {
      name: "Midnight Glutton",
      maxHp: 100,
      bgUrl: "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780360771/Gemini_Generated_Image_ck17ebck17ebck17_njnzzr.png",
      bgPosition: "center 5%",
      bgSize: "108% 108%",
      verticalOffset: "-24px"
    },
    {
      name: "Dr. Distraction",
      maxHp: 150,
      bgUrl: "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780245710/image_4_csamtk.png",
      bgPosition: "center 0%",
      bgSize: "108% 108%",
      verticalOffset: "-24px"
    },
    {
      name: "The Tomorrow Titan",
      maxHp: 300,
      bgUrl: "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780287388/Gemini_Generated_Image_gimz9cgimz9cgimz_kmnsqv.png",
      bgPosition: "center 4%",
      bgSize: "108% 108%",
      verticalOffset: "-24px"
    }
  ];

  const currentBoss = bossList[currentBossIndex] || bossList[0];
  const bossName = currentBoss.name;
  const maxBossHp = currentBoss.maxHp;

  const [bossHp, setBossHp] = useState(() => {
    if (currentBossHp !== null && currentBossHp !== undefined) {
      return currentBossHp;
    }
    return currentBoss.maxHp;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const bossHpRef = useRef(bossHp);

  useEffect(() => {
    bossHpRef.current = bossHp;
  }, [bossHp]);

  // Sync index and boss HP loaded
  useEffect(() => {
    const b = bossList[currentBossIndex] || bossList[0];
    if (currentBossHp !== null && currentBossHp !== undefined) {
      setBossHp(currentBossHp);
      bossHpRef.current = currentBossHp;
    } else {
      setBossHp(b.maxHp);
      bossHpRef.current = b.maxHp;
    }
  }, [currentBossIndex]);

  // Hero Local Health System for active battle (Initialized at exactly 100 HP)
  const [battlePlayerHp, setBattlePlayerHp] = useState(100);
  const battleMaxPlayerHp = 100;
  const battlePlayerHpRef = useRef(battlePlayerHp);

  useEffect(() => {
    battlePlayerHpRef.current = battlePlayerHp;
    // Keep parent Hp synced
    setPlayerHp(battlePlayerHp);
  }, [battlePlayerHp, setPlayerHp]);

  // Combo Chain State
  const [currentChain, setCurrentChain] = useState(0);

  // Active items states (temporary toggles or visual triggers)
  const [isAgilityActive, setIsAgilityActive] = useState(false);
  const [activeShields, setActiveShields] = useState(0);
  const [isHelmetFortified, setIsHelmetFortified] = useState(false);

  // Slider Mechanics
  const [isPlayingSlider, setIsPlayingSlider] = useState(true); // Always active slider minigame by default!
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isSliderFrozen, setIsSliderFrozen] = useState(false);
  const [isSlashing, setIsSlashing] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  const directionRef = useRef(1);
  const sliderSpeedRef = useRef(4.0);
  const sliderPositionRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Adjust speed based on Agility power booster or boots momentum
  useEffect(() => {
    let baseSpeed = 4.2;
    if (isAgilityActive) {
      baseSpeed = 2.2; // 45% slower for ultimate critical precision
    } else if (hasBootsMomentum) {
      baseSpeed = 3.2; // Speed advantage
    }
    sliderSpeedRef.current = baseSpeed;
  }, [isAgilityActive, hasBootsMomentum]);

  // Combat Outcome state
  const [battleOutcome, setBattleOutcome] = useState<"ongoing" | "victory" | "defeat">("ongoing");
  const battleOutcomeRef = useRef(battleOutcome);
  useEffect(() => {
    battleOutcomeRef.current = battleOutcome;
  }, [battleOutcome]);

  const [showDecisionMenu, setShowDecisionMenu] = useState(false);
  const [decisionNextBossIndex, setDecisionNextBossIndex] = useState<number | null>(null);

  const [actionLog, setActionLog] = useState<string>("Face the demonic Midnight Glutton in the dark pixel arena!");
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isEnemyFlashing, setIsEnemyFlashing] = useState(false);

  const textIdCounter = useRef(0);

  const addFloatingText = (text: string, type: FloatingText["type"], damage?: number) => {
    const id = textIdCounter.current++;
    setFloatingTexts((prev) => [...prev, { id, text, type, damage }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  // Slider animation loop
  const animateSlider = () => {
    if (battleOutcomeRef.current !== "ongoing") {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    setSliderPosition((pos) => {
      let nextPos = pos + directionRef.current * sliderSpeedRef.current;
      if (nextPos >= 100) {
        nextPos = 100;
        directionRef.current = -1;
      } else if (nextPos <= 0) {
        nextPos = 0;
        directionRef.current = 1;
      }
      sliderPositionRef.current = nextPos;
      return nextPos;
    });

    requestRef.current = requestAnimationFrame(animateSlider);
  };

  useEffect(() => {
    if (isPlayingSlider && !isSliderFrozen && battleOutcome === "ongoing") {
      startTimeRef.current = Date.now();
      requestRef.current = requestAnimationFrame(animateSlider);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlayingSlider, isSliderFrozen, battleOutcome]);

  // Spacebar and Enter to trigger stop
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isPlayingSlider && !isSliderFrozen && battleOutcome === "ongoing") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleStopSlider();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isPlayingSlider, isSliderFrozen, battleOutcome]);

  // Core Slider Stop Attack calculations
  const handleStopSlider = () => {
    if (!isPlayingSlider || isSliderFrozen || isCooldown || battleOutcomeRef.current !== "ongoing") return;

    setIsSliderFrozen(true);
    setIsCooldown(true);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    const finalPos = sliderPositionRef.current;
    let damageToBoss = 0;
    let feedback = "";
    let type: FloatingText["type"] = "miss";
    let logMsg = "";

    // Target Range evaluations (Center Target: 40% to 60%)
    if (finalPos >= 42 && finalPos <= 58) {
      damageToBoss = 30; // Perfect punchy strike strictly capped at 30
      feedback = "CRITICAL HYPE!";
      type = "perfect";
      logMsg = "CRITICAL HIT! Direct puncture to the core of Midnight Glutton!";
      setCurrentChain((c) => c + 1);
    } else if ((finalPos >= 22 && finalPos < 42) || (finalPos > 58 && finalPos <= 78)) {
      damageToBoss = 20; // Mid-tier alignment strike strictly capped at 20
      feedback = "SMASH DAMAGE!";
      type = "good";
      logMsg = "EXCELLENT STRIKE! The monster is knocked backwards.";
      setCurrentChain((c) => c + 1);
    } else {
      damageToBoss = 10; // Low-tier alignment strike strictly capped at 10
      feedback = "GRAZE HIT";
      type = "okay";
      logMsg = "SHALLOW STRIKE. Marginal impact on the demon.";
      setCurrentChain(0); // broken combo
    }

    // Process Boss Damage
    const nextBossHp = Math.max(0, bossHpRef.current - damageToBoss);
    setBossHp(nextBossHp);
    bossHpRef.current = nextBossHp;
    updateBossHp(nextBossHp);

    addFloatingText(feedback, type, damageToBoss);

    // Dynamic graphic effects
    setIsSlashing(true);
    setIsEnemyFlashing(true);
    setIsScreenShaking(true);

    setTimeout(() => {
      setIsSlashing(false);
      setIsEnemyFlashing(false);
      setIsScreenShaking(false);
    }, 250);

    // Check boss defeat
    if (nextBossHp <= 0) {
      handleBossDefeat();
      return;
    } else {
      setActionLog(logMsg);
    }

    // Retaliation stroke if survives
    setTimeout(() => {
      if (bossHpRef.current > 0 && battleOutcomeRef.current === "ongoing") {
        enemyRetaliation();
      }
    }, 300);

    // Reboot slider automatically for persistent play
    setTimeout(() => {
      if (bossHpRef.current > 0 && battlePlayerHpRef.current > 0 && battleOutcomeRef.current === "ongoing") {
        setIsSliderFrozen(false);
        setIsCooldown(false);
        setSliderPosition(Math.random() > 0.5 ? 5 : 95);
      }
    }, 1100);
  };

  // Enemy Counter-attack AI
  const enemyRetaliation = () => {
    if (battleOutcomeRef.current !== "ongoing") return;

    // Boss counters hard
    const isHit = Math.random() < 0.65;
    if (isHit) {
      if (activeShields > 0) {
        // Shield absorbed
        setActiveShields((prev) => prev - 1);
        addFloatingText("SHIELD BLOCKED!", "heal");
        setActionLog("Midnight Glutton tries to bite you, but your active shield absorbs the impact totally!");
        return;
      }

      let bossDamage = 18;
      let defenseMsg = "";

      if (isHelmetFortified) {
        bossDamage = Math.round(bossDamage * 0.5);
        setIsHelmetFortified(false);
        defenseMsg = " [FORIFIED HELMET -50%]";
      } else if (hasNoiseHelmet) {
        bossDamage = Math.round(bossDamage * 0.82);
        defenseMsg = " [STATIC HELMET -18%]";
      }

      const nextPlayerHp = Math.max(0, battlePlayerHpRef.current - bossDamage);
      setBattlePlayerHp(nextPlayerHp);
      battlePlayerHpRef.current = nextPlayerHp;

      addFloatingText(`-${bossDamage} HP`, "boss-attack");
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 250);

      if (nextPlayerHp <= 0) {
        setBattleOutcome("defeat");
        setActionLog(`DEFEATED! Midnight Glutton's shadow bind consumes your resolve.`);
        setIsPlayingSlider(false);
      } else {
        setActionLog(`Midnight Glutton retaliates with Horn Smash!${defenseMsg}`);
      }
    } else {
      addFloatingText("EVADED!", "heal");
      setActionLog("You somersault away! Midnight Glutton's shadow claws miss you completely.");
    }
  };

  // Bomb Fuse execution
  const triggerBombFuse = () => {
    if (battleOutcome !== "ongoing" || isTransitioning) return;

    // Use up one fuse
    if (fiveMinuteFuseCount > 0) {
      setFiveMinuteFuseCount(fiveMinuteFuseCount - 1);
    }

    const damageToBoss = 80;
    const nextBossHp = Math.max(0, bossHpRef.current - damageToBoss);
    setBossHp(nextBossHp);
    bossHpRef.current = nextBossHp;
    updateBossHp(nextBossHp);

    addFloatingText("BOMB BOOM!", "perfect", damageToBoss);
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 350);
    setActionLog("💣 BOMB DETONATED! High kinetic detonation strikes Midnight Glutton directly!");

    if (nextBossHp <= 0) {
      handleBossDefeat();
    }
  };

  // Stage clear handler
  const handleBossDefeat = () => {
    if (currentBossIndex === 0) {
      setActionLog("Midnight Glutton is defeated! But Dr. Distraction has arrived to intercept you!");
      addFloatingText("BOSS DEFEATED!", "heal");
      addXp(120);
      addCredits(150);

      // Save progression values
      updateBossIndex(1);
      updateBossHp(null);
      setDecisionNextBossIndex(1);
      setTimeout(() => {
        setShowDecisionMenu(true);
      }, 1200);
    } else if (currentBossIndex === 1) {
      setActionLog("Dr. Distraction is vanquished! But the ultimate Tomorrow Titan has materialized!");
      addFloatingText("BOSS DEFEATED!", "heal");
      addXp(180);
      addCredits(250);

      updateBossIndex(2);
      updateBossHp(null);
      setDecisionNextBossIndex(2);
      setTimeout(() => {
        setShowDecisionMenu(true);
      }, 1200);
    } else {
      setBattleOutcome("victory");
      addXp(300);
      addCredits(600);
      setActionLog("CELESTIAL HERO VICTORY! The Tomorrow Titan is eradicated and the system realm is liberated!");
      setTriBossChampion(true);
    }

    setIsPlayingSlider(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  // Next Boss progression Choice
  const handleFightNextEnemy = () => {
    if (decisionNextBossIndex === null) return;
    const nextIndex = decisionNextBossIndex;
    const nextBoss = bossList[nextIndex];

    setIsTransitioning(true);
    setShowDecisionMenu(false);
    setDecisionNextBossIndex(null);

    updateBossHp(null);
    setCurrentBossIndex(nextIndex);
    setBossHp(nextBoss.maxHp);
    bossHpRef.current = nextBoss.maxHp;

    setBattlePlayerHp(100);
    battlePlayerHpRef.current = 100;

    setIsPlayingSlider(true);
    setIsSliderFrozen(false);
    setIsCooldown(false);
    setIsTransitioning(false);
    setActionLog(`A new threat emerges! Battle ${nextBoss.name}!`);
  };

  const handleReturnToHub = () => {
    setShowDecisionMenu(false);
    setDecisionNextBossIndex(null);
    onRetreat();
  };

  const handleRestartBattle = () => {
    const boss = bossList[currentBossIndex] || bossList[0];
    setBossHp(boss.maxHp);
    bossHpRef.current = boss.maxHp;
    updateBossHp(null);

    setBattlePlayerHp(100);
    battlePlayerHpRef.current = 100;

    setBattleOutcome("ongoing");
    setIsPlayingSlider(true);
    setIsSliderFrozen(false);
    setIsCooldown(false);
    setIsTransitioning(false);
    setActionLog(`You returned to battle. Face the demonic ${boss.name}!`);
    setFloatingTexts([]);
  };

  // Safely save user completed state and return back to app dashboard
  const handleUltimateVictoryReturn = () => {
    setIsPlayingSlider(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    updateBossIndex(0); // Reset boss progression stage loop
    updateBossHp(null); // Clear transient boss HP
    setTriBossChampion(true); // Persist ultimate victory state
    onRetreat(); // Smooth redirection to the main app dashboard hub
  };

  // Handles clicking retreat
  const handleEscapeRetreat = () => {
    setIsPlayingSlider(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    // Save transient levels safely
    updateBossHp(bossHpRef.current);
    updateBossIndex(currentBossIndex);

    // Escape back to central hub
    onRetreat();
  };

  if (battleOutcome === "victory") {
    return (
      <div 
        id="ultimate-victory-celebration-canvas"
        className="relative w-full max-w-md mx-auto my-4 rounded-3xl border-4 border-yellow-500 bg-[#060814] shadow-[0_0_50px_rgba(234,179,8,0.55)] overflow-hidden flex flex-col font-mono text-white justify-between p-6 text-center min-h-[580px]"
      >
        {/* Animated ambient cosmic sparkles backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-950/40 via-[#060814]/90 to-black pointer-events-none" />
        
        {/* Top Celebration Title Header */}
        <div className="relative z-10 flex flex-col items-center pt-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.25, 1] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-4"
          >
            <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-bounce" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-yellow-400 text-xl font-black tracking-widest uppercase mt-2 text-shadow-glow"
          >
            Stage Cleared!
          </motion.h1>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent my-3"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-green-500 text-green-400 font-extrabold text-[11px] uppercase tracking-wider"
          >
            🏆 System Realm Liberated 🏆
          </motion.p>
        </div>

        {/* Dynamic Boss Defeated Summary & Reward Metrics */}
        <div className="relative z-10 bg-slate-950/80 border-2 border-yellow-500/25 rounded-2xl p-5 mx-2 my-2 shadow-[0_4px_24px_rgba(0,0,0,0.65)] flex flex-col gap-3">
          <div className="text-left space-y-2.5">
            <h4 className="text-yellow-500 text-[10px] font-black uppercase tracking-wider text-center border-b border-yellow-500/15 pb-2">
              🛡️ CAMPAIGN STAGE RECAP
            </h4>
            
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-400 font-medium">1. Midnight Glutton:</span>
              <span className="text-green-400 font-extrabold uppercase">DEFEATED</span>
            </div>
            
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-400 font-medium">2. Dr. Distraction:</span>
              <span className="text-green-400 font-extrabold uppercase">OBLITERATED</span>
            </div>
            
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-400 font-medium">3. Tomorrow Titan:</span>
              <span className="text-green-400 font-extrabold uppercase">PURGED</span>
            </div>
          </div>

          <div className="border-t border-yellow-500/15 pt-3 text-center mt-1">
            <span className="text-yellow-400 text-[9px] font-black tracking-widest uppercase block mb-1.5">
              STAGE COMPLETION BONUSES
            </span>
            <div className="flex justify-center gap-3 text-xs font-black">
              <div className="bg-yellow-950/30 border border-yellow-500/35 px-2.5 py-1 rounded-lg text-yellow-300">
                ✨ +300 XP
              </div>
              <div className="bg-cyan-950/30 border border-cyan-500/35 px-2.5 py-1 rounded-lg text-cyan-300">
                🪙 +600 Credits
              </div>
            </div>
          </div>
        </div>

        {/* Restrict UI navigation: Only ONE explicit Action Button */}
        <div className="relative z-10 pb-4 pt-1 px-1 flex flex-col gap-2">
          <p className="text-[9px] text-gray-500 font-medium tracking-wide uppercase leading-normal">
            Completed stage data is securely saved to core databank.
          </p>
          <button
            id="ultimate-victory-return-hub-btn"
            onClick={handleUltimateVictoryReturn}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-450 hover:to-amber-450 border-2 border-yellow-300 text-black font-black py-3.5 px-5 rounded-xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-[0_4px_15px_rgba(234,179,8,0.45)] uppercase text-[13px]"
          >
            <Trophy className="w-4 h-4 text-black animate-spin shrink-0" />
            <span>Return to Hub</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="midnight-glutton-battle-screen" 
      className={`relative w-full max-w-md mx-auto my-4 transition-all duration-300 rounded-3xl border-4 border-[#1c1d2e] bg-[#0c0d12] shadow-[0_0_40px_rgba(28,29,46,0.8)] overflow-hidden flex flex-col font-mono text-white ${
        isScreenShaking ? "translate-x-1.5 translate-y-1.5 duration-75" : ""
      }`}
    >
      {/* 1. TOP HEALTH BARS SEGMENT (Above viewport exactly as depicted) */}
      <div id="battle-healthbar-header" className="w-full bg-[#10121a] p-4 border-b border-[#1f2330] flex flex-col gap-3 relative z-10 shrink-0">
        
        {/* MIDNIGHT GLUTTON - [100 HP] DYNAMIC */}
        <div id="midnight-glutton-hp-wrapper" className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs tracking-wider">
            <span className="text-red-500 font-black flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              👹 {bossName} - [{maxBossHp} HP]
            </span>
            <span className="text-red-400 font-extrabold uppercase text-[11px] bg-red-950/40 px-2 py-0.5 rounded border border-red-900/55">
              [{maxBossHp} HP]
            </span>
          </div>
          <div className="h-5 bg-gray-950 rounded-md p-0.5 border border-red-905 border-red-700/60 overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <motion.div
              className="h-full bg-gradient-to-r from-red-800 via-red-600 to-amber-600 rounded-sm relative"
              animate={{ width: `${(bossHp / maxBossHp) * 100}%` }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:10px_10px] opacity-30 animate-[pulse_1s_infinite]" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-stroke-black drop-shadow-md">
              {bossHp} / {maxBossHp} HP
            </div>
          </div>
        </div>

        {/* HERO [100 HP] */}
        <div id="hero-hp-wrapper" className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs tracking-wider">
            <span className="text-[#3A9AFF] font-black flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              ⚔️ HERO (YOU)
            </span>
            <span className="text-cyan-400 font-extrabold uppercase text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/55">
              [100 HP]
            </span>
          </div>
          <div className="h-5 bg-gray-950 rounded-md p-0.5 border border-[#3A9AFF]/50 overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-[#3A9AFF] rounded-sm relative"
              animate={{ width: `${(battlePlayerHp / battleMaxPlayerHp) * 100}%` }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:10px_10px] opacity-25" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-stroke-black drop-shadow-md">
              {battlePlayerHp} / {battleMaxPlayerHp} HP
            </div>
          </div>
        </div>
      </div>

      {/* 2. CENTRAL VIEWPORT (100% exact high-fidelity replication arena background) */}
      <div 
        id="battle-central-viewport"
        onClick={() => {
          if (isPlayingSlider && !isSliderFrozen) handleStopSlider();
        }}
        className={`relative w-full aspect-[4/3] bg-[#090b0e] border-y-4 border-[#1f2330] overflow-hidden shrink-0 group ${
          isPlayingSlider && !isSliderFrozen ? "cursor-pointer active:scale-[0.99] transition-transform duration-75" : ""
        }`}
      >
        {/* Exact scene as background image aligned vertically upward to center sprites perfectly */}
        <div 
          className={`absolute inset-0 transition-all duration-300 scale-100 ${
            isEnemyFlashing ? "brightness-150 contrast-125 saturate-200 hue-rotate-15" : "brightness-110 saturate-100"
          }`}
          style={{
            backgroundImage: `url('${currentBoss.bgUrl}')`,
            backgroundPosition: (currentBoss as any).bgPosition || "center 5%",
            backgroundSize: (currentBoss as any).bgSize || "108% 108%",
            transform: `translateY(${(currentBoss as any).verticalOffset || "-24px"})`,
            backgroundRepeat: "no-repeat"
          }}
        />

        {/* Ambient grid horizon atmospheric overlay style */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Interactive tactical shields display overlay if activated */}
        {activeShields > 0 && (
          <div className="absolute inset-0 border-4 border-cyan-400/50 rounded-xl m-3 pointer-events-none animate-pulse">
            <div className="absolute top-2 left-2 bg-cyan-900/80 px-2 py-0.5 rounded border border-cyan-400 text-[8px] text-cyan-300 font-extrabold uppercase">
              ACTIVE S-SHIELDS: {activeShields}
            </div>
          </div>
        )}

        {/* Comic slash animation effect when striking */}
        <AnimatePresence>
          {isSlashing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: [1, 1.3, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-6 bg-white border-y-4 border-yellow-400 rotate-12 shadow-[0_0_20px_#fbbf24] animate-ping" />
              <div className="absolute w-full h-1.5 bg-[#3A9AFF] -rotate-12 shadow-[0_0_15px_#3A9AFF]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating texts & damage multipliers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
          <AnimatePresence>
            {floatingTexts.map((txt) => {
              let colorClasses = "text-white text-stroke-black font-extrabold";
              if (txt.type === "perfect") {
                colorClasses = "text-yellow-450 text-yellow-400 text-lg drop-shadow-[0_0_12px_rgba(234,179,8,1)] animate-bounce";
              } else if (txt.type === "good") {
                colorClasses = "text-cyan-400 text-sm drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]";
              } else if (txt.type === "boss-attack") {
                colorClasses = "text-red-500 text-sm drop-shadow-[0_0_10px_rgba(239,68,68,0.85)] animate-bounce";
              } else if (txt.type === "heal") {
                colorClasses = "text-teal-400 text-sm drop-shadow-[0_0_10px_rgba(20,184,166,0.8)]";
              } else if (txt.type === "item") {
                colorClasses = "text-amber-400 text-xs drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]";
              }

              return (
                <motion.div
                  key={txt.id}
                  initial={{ opacity: 0, scale: 0.6, y: 40 }}
                  animate={{ opacity: 1, scale: [0.8, 1.25, 1], y: -30 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`absolute text-center ${colorClasses}`}
                >
                  <span className="uppercase text-shadow-glow text-[13px] tracking-widest">{txt.text}</span>
                  {txt.damage !== undefined && txt.damage > 0 && (
                    <div className="text-xs text-red-500 font-black mt-1 animate-pulse font-mono block">
                      -{txt.damage} HP
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Interactive hover overlay button helper hint */}
        {isPlayingSlider && !isSliderFrozen && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 text-[9px] text-gray-400 tracking-wider font-extrabold pointer-events-none uppercase opacity-80 group-hover:opacity-100 transition-opacity">
            CLICK VIEWPORT OR TAP KEYBOARD TO ATTACK
          </div>
        )}
      </div>

      {/* Action Logs Feed Overlay */}
      <div className="w-full bg-[#0a0c10] px-4 py-2 flex flex-col justify-center border-b border-[#1f2330]">
        <div className="bg-slate-950/80 border border-teal-900/50 px-3 py-2 rounded-lg flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping shrink-0" />
          <p className="font-sans text-[11px] text-teal-300 font-semibold italic truncate">
            {actionLog}
          </p>
        </div>
      </div>

      {/* 3. BOTTOM CONSOLE SECTION (Active Slider Game + Inventory Bar) */}
      <div id="battle-bottom-console" className="w-full p-4 flex-grow bg-[#0c0d12] flex flex-col gap-4">
        
        {/* Slider Combat Minigame */}
        <div className="bg-[#04060b] border-2 border-[#3A9AFF]/80 p-3 rounded-2xl relative shadow-[0_0_20px_rgba(58,154,255,0.25)] flex flex-col gap-2">
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-[#3A9AFF] tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3A9AFF] animate-pulse" />
              SLIDER TIMING ATTACK
            </span>
            {/* COMPLETED TEXT 'Current Chain: X' EXPLICITLY REPLICATED */}
            <span id="battle-combo-chain" className="text-yellow-400 font-black text-xs tracking-wider uppercase font-mono animate-pulse">
              Current Chain: {currentChain}
            </span>
          </div>

          {/* Slider Minigame container */}
          <div 
            onClick={() => {
              if (!isSliderFrozen && !isCooldown) handleStopSlider();
            }}
            className="w-full h-11 bg-black rounded-lg border border-slate-700 relative overflow-hidden cursor-crosshair relative shadow-inner"
          >
            {/* Side Low regions */}
            <div className="absolute inset-y-0 left-0 w-[22%] bg-red-650 bg-red-900/30 flex items-center justify-center text-[7px] text-red-400 font-bold border-r border-black/40">
              LOW
            </div>
            {/* Medium surrounding targets */}
            <div className="absolute inset-y-0 left-[22%] w-[20%] bg-yellow-600/30 flex items-center justify-center text-[7px] text-yellow-300 font-bold border-r border-black/40">
              MID
            </div>
            
            {/* SPECIAL TARGET BOX EXPLICIT COORED AND BORDERS */}
            <div id="slider-target" className="absolute inset-y-0 left-[42%] w-[16%] bg-green-500/30 border-x-2 border-green-450 border-green-500/80 flex items-center justify-center text-[8px] text-green-300 font-extrabold shadow-[inset_0_0_8px_rgba(34,197,94,0.4)]">
              CRIT
            </div>

            <div className="absolute inset-y-0 left-[58%] w-[20%] bg-yellow-600/30 flex items-center justify-center text-[7px] text-yellow-300 font-bold border-r border-black/40">
              MID
            </div>
            <div className="absolute inset-y-0 left-[78%] w-[22%] bg-red-650 bg-red-900/30 flex items-center justify-center text-[7px] text-red-400 font-bold">
              LOW
            </div>

            {/* SLIDER BOX INDICATOR MOUNTED */}
            <motion.div
              id="slider-indicator"
              className={`absolute top-0 bottom-0 w-3 bg-white border border-black z-30 shadow-[0_0_10px_#fff] ${
                isSliderFrozen ? "bg-yellow-300 border-yellow-500 scale-125 animate-ping duration-300" : ""
              }`}
              style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] text-[#3A9AFF]/60 uppercase tracking-widest font-black leading-none">
            <span>[LEFT OUTER]</span>
            <span className="text-green-400">[TARGET ZONE (CRIT)]</span>
            <span>[RIGHT OUTER]</span>
          </div>
        </div>

        {/* 4. SIX-SLOT INVENTORY BAR (Replicated exactly below minigame) */}
        <div id="battle-inventory-container" className="flex flex-col gap-2.5">
          <span className="text-[10px] font-black text-slate-400/90 tracking-widest uppercase block text-left">
            🧰 QUICK-USE INVENTORY SLOTS
          </span>
          
          <div className="grid grid-cols-6 gap-2 w-full">
            
            {/* Slot 0: Blue back-arrow */}
            <button
              id="inventory-slot-back"
              onClick={() => {
                if (battleOutcome !== "ongoing") return;
                setSliderPosition(Math.random() > 0.5 ? 5 : 95);
                addFloatingText("SPEED RESET", "item");
                setActionLog("Click! Re-centered slider and cleared overload speeds.");
              }}
              className="aspect-square bg-slate-900 border-2 border-cyan-500 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-slate-800 transition-all active:scale-95 text-cyan-400 shadow-[0_3px_6px_rgba(0,0,0,0.5)]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-[7px] font-bold text-cyan-300/80 uppercase">RESET</span>
            </button>

            {/* Slot 1: Winged boots */}
            <button
              id="inventory-slot-boots"
              onClick={() => {
                if (battleOutcome !== "ongoing" || isAgilityActive) return;
                setIsAgilityActive(true);
                addFloatingText("AGILITY BOOST!", "heal");
                setActionLog("💨 AGILITY ACTIVATED! Slider slows down for 5 seconds for easy critical landing!");
                setTimeout(() => setIsAgilityActive(false), 5000);
              }}
              className={`aspect-square border-2 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-slate-800 transition-all active:scale-95 shadow-[0_3px_6px_rgba(0,0,0,0.5)] ${
                isAgilityActive || hasBootsMomentum
                  ? "border-amber-400 bg-amber-950/40 text-amber-300 animate-pulse"
                  : "border-slate-700 bg-slate-900 text-slate-450 text-slate-400"
              }`}
            >
              <Wind className="w-5 h-5 text-amber-400" />
              <span className="text-[7px] font-bold text-amber-300 uppercase">BOOTS</span>
            </button>

            {/* Slot 2: Question-mark shield #1 */}
            <button
              id="inventory-slot-shield-q1"
              onClick={() => {
                if (battleOutcome !== "ongoing") return;
                setActiveShields((s) => s + 1);
                addFloatingText("AEGIS SHIELD!", "heal");
                setActionLog("🛡️ ORACLE AEGIS ACTIVE! Absorbing next direct boss attack completely!");
              }}
              className="aspect-square bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col items-center justify-center hover:bg-slate-800 transition-all active:scale-95 text-slate-450 text-slate-450 text-slate-400 shadow-[0_3px_6px_rgba(0,0,0,0.5)]"
            >
              <div className="relative">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mt-[-1px]">?</span>
              </div>
              <span className="text-[7px] font-bold text-purple-300 uppercase">SHIELD ?</span>
            </button>

            {/* Slot 3: Question-mark shield #2 */}
            <button
              id="inventory-slot-shield-q2"
              onClick={() => {
                if (battleOutcome !== "ongoing") return;
                setActiveShields((s) => s + 1);
                addFloatingText("BUBBLE SHIELD!", "heal");
                setActionLog("🫧 BUBBLE AEGIS ACTIVE! Energy grid forcefield deployed.");
              }}
              className="aspect-square bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col items-center justify-center hover:bg-slate-800 transition-all active:scale-95 text-slate-450 text-slate-400 shadow-[0_3px_6px_rgba(0,0,0,0.5)]"
            >
              <div className="relative">
                <Shield className="w-5 h-5 text-teal-400" />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mt-[-1px]">?</span>
              </div>
              <span className="text-[7px] font-bold text-teal-300 uppercase">SHIELD ?</span>
            </button>

            {/* Slot 4: Helmet */}
            <button
              id="inventory-slot-helmet"
              onClick={() => {
                if (battleOutcome !== "ongoing" || isHelmetFortified) return;
                setIsHelmetFortified(true);
                addFloatingText("HELMET FORTIFY", "item");
                setActionLog("⛑️ HELMET FORTIFIED! Takes 50% reduced damage from the next attack!");
              }}
              className={`aspect-square border-2 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-slate-800 transition-all active:scale-95 shadow-[0_3px_6px_rgba(0,0,0,0.5)] ${
                hasNoiseHelmet || isHelmetFortified
                  ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 animate-pulse"
                  : "border-slate-700 bg-slate-900 text-slate-400"
              }`}
            >
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-[7px] font-bold text-emerald-300 uppercase">HELMET</span>
            </button>

            {/* Slot 5: Red bomb (Fuse) */}
            <button
              id="inventory-slot-bomb"
              onClick={() => {
                if (battleOutcome !== "ongoing") return;
                triggerBombFuse();
              }}
              className="aspect-square bg-slate-900 border-2 border-red-500 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-slate-800 transition-all active:scale-95 text-red-400 shadow-[0_3px_6px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <Bomb className="w-5 h-5 text-red-500 animate-pulse" />
              {fiveMinuteFuseCount > 0 ? (
                <span className="text-[7px] font-bold text-red-350 block">💣 ({fiveMinuteFuseCount})</span>
              ) : (
                <span className="text-[7px] font-bold text-red-300 uppercase">FUSE</span>
              )}
            </button>

          </div>
        </div>

        {/* 5. RETREAT ICON BUTTON SECTION */}
        <div id="battle-retreat-bar" className="w-full mt-2">
          <button
            id="inventory-retreat-btn"
            onClick={handleEscapeRetreat}
            className="w-full bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 border-2 border-red-500/80 py-2.5 rounded-xl font-bold tracking-widest text-[#FF4C4C] hover:text-white flex items-center justify-center gap-2 select-none active:scale-98 transition-all shadow-[0_4px_12px_rgba(239,68,68,0.2)] font-mono text-[11px] uppercase group"
          >
            <LogOut className="w-4 h-4 text-[#FF4C4C] group-hover:text-white group-hover:animate-bounce shrink-0" />
            <span>Retreat Icon & Option</span>
          </button>
        </div>

        {/* Victory/Defeat Overlay Cards */}
        <AnimatePresence>
          {showDecisionMenu && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 p-4 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border-4 border-yellow-400 p-5 rounded-2xl max-w-sm w-full shadow-2xl relative"
              >
                <Trophy className="w-14 h-14 text-yellow-400 mx-auto mb-2 animate-bounce" />
                <h3 className="text-yellow-400 font-extrabold text-sm tracking-wide uppercase mb-1">
                  ⚔️ CONFLICT STAGE CLEARED!
                </h3>
                <p className="text-xs text-green-400 font-bold mb-4">
                  REWARDS SECURED: +100-250 XP & CREDITS!
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mb-6 italic">
                  But the battle resolves... New stage approaches. Would you like to progress immediately or rest at the central hub?
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    id="decision-fight-next"
                    onClick={handleFightNextEnemy}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-2.5 rounded-xl text-xs uppercase"
                  >
                    🚀 Advance To Next Stage
                  </button>
                  <button
                    id="decision-return-hub"
                    onClick={handleReturnToHub}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs uppercase"
                  >
                    🏠 Back to Hub Base
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {battleOutcome === "defeat" && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/95 p-4 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-slate-950 border-4 border-red-650 border-red-600 p-6 rounded-2xl max-w-xs w-full shadow-2xl">
                <Heart className="w-12 h-12 text-red-500 fill-red-500 mx-auto mb-3 animate-pulse" />
                <h3 className="text-red-500 font-black text-base uppercase tracking-wider mb-2">DEFEAT</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  Shadow bind overpowers your neural loops. Recharge your energy at the base and prepare again!
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    id="defeat-try-again-btn"
                    onClick={handleRestartBattle}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Fight
                  </button>
                  <button
                    id="defeat-return-hub-btn"
                    onClick={onRetreat}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl text-xs uppercase"
                  >
                    🏠 Retreat to Base
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {battleOutcome === "victory" && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/95 p-4 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-slate-950 border-4 border-yellow-400 p-6 rounded-2xl max-w-xs w-full shadow-2xl">
                <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-3 animate-ping" />
                <h3 className="text-yellow-400 font-black text-sm uppercase tracking-wider mb-2">🏆 REALM OVERTHROWN</h3>
                <p className="text-xs text-green-400 font-bold mb-4">
                  SYSTEM OVERLORD DESTROYED!
                </p>
                <p className="text-[11px] text-slate-300 leading-normal mb-5">
                  You conquered Dr. Distraction and the Tomorrow Titan! Dynamic balance has been restored to the system.
                </p>
                <button
                  id="ultimate-victory-return-btn"
                  onClick={handleRestartBattle}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-2.5 rounded-xl text-xs uppercase"
                >
                  Return and Reset Progression
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
