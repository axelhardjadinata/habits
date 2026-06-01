import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swords, LogOut, RefreshCw, Trophy, Heart } from "lucide-react";

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
}

interface FloatingText {
  id: number;
  text: string;
  type: "perfect" | "good" | "okay" | "miss" | "boss-attack" | "heal";
  xOffset?: number;
  yOffset?: number;
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
}: BattleViewProps) {
  // Boss state
  const [currentBossIndex, setCurrentBossIndex] = useState(initialBossIndex);
  
  useEffect(() => {
    setCurrentBossIndex(initialBossIndex);
  }, [initialBossIndex]);

  const bossList = [
    {
      name: "Midnight Glutton",
      maxHp: 60,
      bgUrl: "https://lh3.googleusercontent.com/aida/AP1WRLuWoX4Au0CUU2Gz9b3GfRAhDpWCg17zoqOpYs6nB_d1HG-PsVaiiSvU6ZSDBwj4wpPlfEarzqd4AVE94o8qSggFFTccJAJvhOQZ7vsKKD-ykzY13g9pNx5OkVEWc_WYilPoULLYa845fQqIl7ox02jTvnYNYUaBTT1JrpcHueqfl2dc9tWnr9jiLp1k_eIvDFmO83N1QYEjb4I-8shwj4qD8nwOgSYALI1IFk8aQ7_uKU2RxNjZ_qYq1A",
    },
    {
      name: "Dr. Distraction",
      maxHp: 150,
      bgUrl: "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780245710/image_4_csamtk.png",
    },
    {
      name: "The Tomorrow Titan",
      maxHp: 300,
      bgUrl: "https://res.cloudinary.com/dcxrn4kmx/image/upload/v1780287388/Gemini_Generated_Image_gimz9cgimz9cgimz_kmnsqv.png",
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

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (currentBossHp !== null && currentBossHp !== undefined) {
        setBossHp(currentBossHp);
        bossHpRef.current = currentBossHp;
        return;
      }
    }
    const b = bossList[currentBossIndex] || bossList[0];
    setBossHp(b.maxHp);
    bossHpRef.current = b.maxHp;
  }, [currentBossIndex]);

  const hasJustDefeatedPreviousRef = useRef(false);

  // Dynamic state refs to guarantee synchronous checks inside async consecutive keypress timeouts
  const bossHpRef = useRef(bossHp);
  useEffect(() => {
    bossHpRef.current = bossHp;
  }, [bossHp]);

  // Hero Local Health System for active battle (Initialized at exactly 100 HP)
  const [battlePlayerHp, setBattlePlayerHp] = useState(100);
  const battleMaxPlayerHp = 100;

  const battlePlayerHpRef = useRef(battlePlayerHp);
  useEffect(() => {
    battlePlayerHpRef.current = battlePlayerHp;
  }, [battlePlayerHp]);

  // Slider State for checking hits
  const [isPlayingSlider, setIsPlayingSlider] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isSliderFrozen, setIsSliderFrozen] = useState(false);
  const [isSlashing, setIsSlashing] = useState(false);
  const directionRef = useRef(1);
  const sliderSpeedRef = useRef(4.8); // Smooth, challenging tactical speed
  const sliderPositionRef = useRef(0);

  // Game state
  const [battleOutcome, setBattleOutcome] = useState<"ongoing" | "victory" | "defeat">("ongoing");
  const battleOutcomeRef = useRef(battleOutcome);
  useEffect(() => {
    battleOutcomeRef.current = battleOutcome;
  }, [battleOutcome]);

  // Universal post-battle choice menu
  const [showDecisionMenu, setShowDecisionMenu] = useState(false);
  const [decisionNextBossIndex, setDecisionNextBossIndex] = useState<number | null>(null);

  const [actionLog, setActionLog] = useState<string>("Face the hooded villain in the dark alleyway...");
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isEnemyFlashing, setIsEnemyFlashing] = useState(false);

  // Anti-Spam input cooldown
  const [isCooldown, setIsCooldown] = useState(false);
  const isCooldownRef = useRef(false);
  useEffect(() => {
    isCooldownRef.current = isCooldown;
  }, [isCooldown]);

  // Animation Frame Ref
  const requestRef = useRef<number | null>(null);

  // Floating text Counter
  const textIdCounter = useRef(0);

  const addFloatingText = (text: string, type: FloatingText["type"], damage?: number) => {
    const id = textIdCounter.current++;
    const xOffset = Math.floor(Math.random() * 80) - 40;
    const yOffset = Math.floor(Math.random() * 40) - 20;
    setFloatingTexts((prev) => [...prev, { id, text, type, xOffset, yOffset, damage }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1000); // Exactly one second fade out and disappear completely
  };

  // Run the slider animation loop
  const animateSlider = () => {
    if (Date.now() - startTimeRef.current > 4000) {
      handleStopSlider(undefined, true);
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

  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isPlayingSlider && !isSliderFrozen && battleOutcome === "ongoing") {
      requestRef.current = requestAnimationFrame(animateSlider);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlayingSlider, isSliderFrozen, battleOutcome]);

  // Global keydown triggers stop action
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isPlayingSlider && !isSliderFrozen && battleOutcome === "ongoing") {
        if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
          e.preventDefault();
        }
        handleStopSlider();
      }
    };

    if (isPlayingSlider && !isSliderFrozen) {
      window.addEventListener("keydown", handleGlobalKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isPlayingSlider, isSliderFrozen, battleOutcome]);

  // Handle player pressing FIGHT
  const handleFightClick = () => {
    if (battleOutcome !== "ongoing") return;
    if (currentBossIndex === 0 || !hasJustDefeatedPreviousRef.current) {
      setBattlePlayerHp(100);
      battlePlayerHpRef.current = 100;
      setPlayerHp(100); // Sync initial 100 HP to parent state
    }
    hasJustDefeatedPreviousRef.current = false;

    setIsPlayingSlider(true);
    setIsSliderFrozen(false);
    setIsSlashing(false);
    const initialPos = Math.random() * 40 + 10;
    setSliderPosition(initialPos);
    sliderPositionRef.current = initialPos;
    directionRef.current = Math.random() > 0.5 ? 1 : -1;
    startTimeRef.current = Date.now();
  };

  // Triggered when stopping the slider
  const handleStopSlider = (
    e?: React.MouseEvent | React.KeyboardEvent | KeyboardEvent,
    isTimeout = false
  ) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isPlayingSlider || isSliderFrozen || isCooldownRef.current || battleOutcomeRef.current !== "ongoing") return;

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

    const PERFECT_PHRASES = ["CRITICAL!", "PERFECT!", "MAX COMBO!"];
    const GOOD_PHRASES = ["SMASH!", "BOOM!", "NICE!"];
    const OKAY_PHRASES = ["HIT!", "GRAZE!", "1-HIT!"];

    if (isTimeout) {
      damageToBoss = 0;
      feedback = "MISS!";
      type = "miss";
      logMsg = "Too slow! Your energy blast fizzled out before you could release it!";
    } else if (finalPos >= 40 && finalPos <= 60) {
      damageToBoss = 25;
      feedback = PERFECT_PHRASES[Math.floor(Math.random() * PERFECT_PHRASES.length)];
      type = "perfect";
      logMsg = "Bullseye! Stopped dead-center inside the Green CRITICAL zone!";
    } else if ((finalPos >= 20 && finalPos < 40) || (finalPos > 60 && finalPos <= 80)) {
      damageToBoss = 12;
      feedback = GOOD_PHRASES[Math.floor(Math.random() * GOOD_PHRASES.length)];
      type = "good";
      logMsg = "Excellent timing! Stopped inside the Yellow MEDIUM zone.";
    } else {
      damageToBoss = 4;
      feedback = OKAY_PHRASES[Math.floor(Math.random() * OKAY_PHRASES.length)];
      type = "okay";
      logMsg = "Decent strike, but stopped in the Red LOW zone.";
    }

    // Apply damage and logs immediately with no delays
    if (damageToBoss > 0) {
      const nextBossHp = Math.max(0, bossHpRef.current - damageToBoss);
      setBossHp(nextBossHp);
      bossHpRef.current = nextBossHp;
      
      addFloatingText(feedback, type, damageToBoss);

      if (nextBossHp <= 0) {
        if (currentBossIndex === 0) {
          setActionLog("Midnight Glutton is defeated! But suddenly, Dr. Distraction blocks your path!");
          addFloatingText("BOSS DEFEATED!", "heal");
          addXp(75);
          addCredits(100);
          hasJustDefeatedPreviousRef.current = true;
          
          // Secure stage checkpoint in Firestore and parent state immediately
          updateBossIndex(1);
          updateBossHp(null);

          // Stop active slider loop and freeze combat systems
          setIsPlayingSlider(false);
          setIsSliderFrozen(true);
          setIsCooldown(false);
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }

          // Trigger universal post-battle decision menu
          setDecisionNextBossIndex(1);
          setTimeout(() => {
            setShowDecisionMenu(true);
          }, 1000);
        } else if (currentBossIndex === 1) {
          setActionLog("Dr. Distraction is defeated! But the system's core ruptures... The Tomorrow Titan rises!");
          addFloatingText("BOSS DEFEATED!", "heal");
          addXp(125);
          addCredits(175);
          hasJustDefeatedPreviousRef.current = true;
          
          // Secure stage checkpoint in Firestore and parent state immediately
          updateBossIndex(2);
          updateBossHp(null);

          // Stop active slider loop and freeze combat systems
          setIsPlayingSlider(false);
          setIsSliderFrozen(true);
          setIsCooldown(false);
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }

          // Trigger universal post-battle decision menu
          setDecisionNextBossIndex(2);
          setTimeout(() => {
            setShowDecisionMenu(true);
          }, 1000);
        } else {
          setBattleOutcome("victory");
          addXp(150); // Exactly 150 XP
          addCredits(500); // Exactly 500 Credits
          setActionLog("CELESTIAL VICTORY! The Tomorrow Titan is obliterated and the cycle resets!");
          addFloatingText("TITAN OVERTHROWN!", "heal");
          
          // Complete current tier & freeze mechanics
          setTriBossChampion(true);
          setIsPlayingSlider(false);
          setIsSliderFrozen(true);
          setIsCooldown(false);
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }
        }
      } else {
        setActionLog(logMsg);
      }

      // Trigger instantaneous slash animations
      setIsSlashing(true);
      setIsEnemyFlashing(true);
      setTimeout(() => {
        setIsSlashing(false);
        setIsEnemyFlashing(false);
      }, 300);
    } else {
      addFloatingText(feedback, "miss");
      setActionLog(logMsg);
    }

    const upcomingBossHp = bossHpRef.current;
    const isBossDead = upcomingBossHp <= 0;

    // Trigger snappy retaliation if boss survives
    if (!isBossDead) {
      setTimeout(() => {
        if (bossHpRef.current > 0 && battleOutcomeRef.current === "ongoing") {
          enemyRetaliation(damageToBoss === 0);
        }
      }, 150);
    }

    // Snappily resets the slider pointer and maintains fight state for consecutive strikes
    setTimeout(() => {
      if (bossHpRef.current > 0 && battlePlayerHpRef.current > 0 && battleOutcomeRef.current === "ongoing") {
        const initialPos = Math.random() * 40 + 10;
        setSliderPosition(initialPos);
        sliderPositionRef.current = initialPos;
        directionRef.current = Math.random() > 0.5 ? 1 : -1;
        startTimeRef.current = Date.now();
        setIsSliderFrozen(false); // restarts animateSlider automatically inside useEffect
        setIsCooldown(false);
      } else {
        // If battle finished, exit active slider mode
        setIsPlayingSlider(false);
        setIsSliderFrozen(false);
        setIsCooldown(false);
      }
    }, 1000);
  };

  // Enemy Turn
  const enemyRetaliation = (wasPlayerMiss: boolean) => {
    if (battleOutcomeRef.current !== "ongoing") return;

    // Boss has higher hit chance if player missed
    const isHit = wasPlayerMiss ? Math.random() < 0.85 : Math.random() < 0.45;
    
    if (isHit) {
      const bossDamage = wasPlayerMiss ? 12 : 6;
      const nextPlayerHp = Math.max(0, battlePlayerHpRef.current - bossDamage);
      setBattlePlayerHp(nextPlayerHp);
      battlePlayerHpRef.current = nextPlayerHp;
      setPlayerHp(nextPlayerHp); // Sync to parent state
      
      addFloatingText(`-${bossDamage} HP`, "boss-attack");
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 400);

      if (nextPlayerHp <= 0) {
        setBattleOutcome("defeat");
        setActionLog(`DEFEAT! ${bossName}'s shadow bind overwhelms your senses.`);
        setIsPlayingSlider(false);
      } else {
        setActionLog(`${bossName} counters with shadow levitation spikes!`);
      }
    } else {
      addFloatingText("EVADED!", "heal");
      setActionLog(`${bossName} sweeps down, but you dodge his shadow claws!`);
    }
  };

  const handleFightNextEnemy = () => {
    if (decisionNextBossIndex === null) return;
    
    const nextIndex = decisionNextBossIndex;
    const nextBoss = bossList[nextIndex];
    if (!nextBoss) return;

    setIsTransitioning(true);
    setShowDecisionMenu(false);
    setDecisionNextBossIndex(null);

    // Reset/clear any mid-battle saved HP since we are moving to next boss
    updateBossHp(null);

    // Load next boss details immediately
    setCurrentBossIndex(nextIndex);
    setBossHp(nextBoss.maxHp);
    bossHpRef.current = nextBoss.maxHp;

    // Reset combat stats & controllers
    setBattlePlayerHp(100);
    battlePlayerHpRef.current = 100;
    setPlayerHp(100);
    setIsPlayingSlider(false);
    setIsSliderFrozen(false);
    setIsCooldown(false);
    setIsTransitioning(false);

    if (nextIndex === 1) {
      setActionLog("Face Dr. Distraction! Beware of his cyclic cognitive loops...");
    } else if (nextIndex === 2) {
      setActionLog("Slay The Tomorrow Titan! The final titan of system clutter...");
    }
  };

  const handleReturnToHub = () => {
    setShowDecisionMenu(false);
    setDecisionNextBossIndex(null);
    onRetreat();
  };

  const handleRetreatEmergency = () => {
    // Instantly freeze/pause active combat state
    setIsPlayingSlider(false);
    setIsSliderFrozen(true);
    setIsCooldown(false);
    
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    // Securely save current progress and state details
    updateBossHp(bossHpRef.current);
    updateBossIndex(currentBossIndex);

    // Gracefully redirect back to the main app hub
    onRetreat();
  };

  const handleFinalVictoryReturn = () => {
    // Clear mid-battle saved boss HP
    updateBossHp(null);
    // Reset progression loop back to Midnight Glutton (0)
    updateBossIndex(0);
    // Return to the main hub dashboard
    onRetreat();
  };

  const handleRestartBattle = () => {
    const boss = bossList[currentBossIndex] || bossList[0];
    setBossHp(boss.maxHp);
    bossHpRef.current = boss.maxHp;
    updateBossHp(null); // Clean up the saved HP when restarting clean
    setBattlePlayerHp(100);
    battlePlayerHpRef.current = 100;
    setPlayerHp(100); // Sync reset HP to parent state
    setBattleOutcome("ongoing");
    setIsPlayingSlider(false);
    setIsTransitioning(false);
    setActionLog(`You re-entered the battlefield. Face ${boss.name}!`);
    setFloatingTexts([]);
  };

  // Cleanup floatings
  useEffect(() => {
    if (floatingTexts.length > 5) {
      setFloatingTexts((prev) => prev.slice(prev.length - 5));
    }
  }, [floatingTexts]);

  // Clean actionLog after 2 seconds except for initial entry message
  useEffect(() => {
    if (
      actionLog &&
      actionLog !== "Face the hooded villain in the dark alleyway..." &&
      actionLog !== "You re-entered the dark alleyway. Let the duel begin!"
    ) {
      const timer = setTimeout(() => {
        setActionLog("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [actionLog]);

  // Real-time inactivity / passive damage tracker
  useEffect(() => {
    let passiveDamageInterval: NodeJS.Timeout | null = null;

    if (isPlayingSlider && !isSliderFrozen && battleOutcome === "ongoing" && !isTransitioning) {
      passiveDamageInterval = setInterval(() => {
        if (battleOutcomeRef.current !== "ongoing" || isTransitioning) return;

        // Deal dynamic damage for remaining inactive / not hitting
        const passiveDamage = 5; // Little by little over time
        const nextPlayerHp = Math.max(0, battlePlayerHpRef.current - passiveDamage);
        
        setBattlePlayerHp(nextPlayerHp);
        battlePlayerHpRef.current = nextPlayerHp;
        setPlayerHp(nextPlayerHp); // Sync with parent state

        addFloatingText(`-${passiveDamage} HP`, "boss-attack");
        setIsScreenShaking(true);
        setTimeout(() => setIsScreenShaking(false), 200);

        setActionLog(`${bossName} absorbs your life energy while you remain inactive!`);

        if (nextPlayerHp <= 0) {
          setBattleOutcome("defeat");
          setActionLog(`DEFEAT! Overwhelmed by ${bossName}'s passive life drain from hesitation.`);
          // Stop slider
          setIsPlayingSlider(false);
          setIsSliderFrozen(false);
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }
        }
      }, 1500); // every 1.5s of inactivity
    }

    return () => {
      if (passiveDamageInterval) {
        clearInterval(passiveDamageInterval);
      }
    };
  }, [isPlayingSlider, isSliderFrozen, battleOutcome, setPlayerHp, isTransitioning, bossName]);

  return (
    <div className={`relative w-[95%] mx-auto mt-4 select-none overflow-hidden rounded-2xl border-4 border-[#121312] md:max-w-md bg-[#121312] shadow-[8px_8px_0px_0px_#1C0770] flex flex-col ${
      isScreenShaking ? "animate-bounce" : ""
    }`}>
      
      {/* Rectangle top Boss status layout */}
      <div className="w-full bg-[#1C0770] border-b-4 border-[#121312] p-3 flex flex-col gap-1.5 shrink-0">
        <div className="flex justify-between items-center">
          <span className="font-display-hero text-red-500 text-xl tracking-wider uppercase text-stroke-black">
            {currentBossIndex === 1 ? "🧠" : currentBossIndex === 2 ? "👹" : "👿"} BOSS: {bossName}
          </span>
          <span className="font-pixel text-[9px] text-red-400">
            HP {bossHp} / {maxBossHp}
          </span>
        </div>
        <div className="h-3.5 bg-gray-950 rounded-full border-2 border-red-950 overflow-hidden relative">
          <motion.div
            className="h-full bg-red-650"
            style={{ backgroundColor: "#dc2626" }}
            animate={{ width: `${(bossHp / maxBossHp) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
          {/* Striped overlay for health cells */}
          <div className="absolute inset-0 bg-stripes opacity-30 pointer-events-none" />
        </div>
      </div>

      {/* Compressed Widescreen 16:10 Epic Battle Arena background */}
      <div 
        onClick={() => {
          if (isPlayingSlider && !isSliderFrozen) {
            handleStopSlider();
          }
        }}
        className={`relative w-full aspect-[16/10] overflow-hidden bg-[#1D1E2C] border-b-4 border-[#121312] shrink-0 ${
          isPlayingSlider && !isSliderFrozen ? "cursor-pointer active:scale-[0.98] transition-transform duration-75" : ""
        }`}
      >
        <div 
          className={`absolute inset-0 bg-cover bg-top transition-all duration-300 brightness-125 saturate-110 scale-100 ${
            isEnemyFlashing ? "brightness-150 contrast-125 saturate-150" : ""
          }`}
          style={{
            backgroundImage: `url('${currentBoss.bgUrl}')`,
          }}
        >
          {/* Subtle Rainy overlay with lighter opacity for high contrast background visibility */}
          <div className="absolute inset-0 bg-black/10 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4px_20px] pointer-events-none opacity-80" />
        </div>

        {/* Mid-Battle Emergency Escape Retreat Option */}
        {battleOutcome === "ongoing" && (
          <button
            id="emergency-battle-retreat-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleRetreatEmergency();
            }}
            className="absolute top-2 right-2 bg-[#991b1b] hover:bg-red-700 text-white font-pixel text-[8px] tracking-wider px-2.5 py-1.5 rounded-md border-2 border-black flex items-center justify-center gap-1 z-30 cursor-pointer shadow-[0_3px_6px_rgba(0,0,0,0.6)] active:scale-95 transition-all text-stroke-black select-none font-bold uppercase hover:shadow-[0_0_12px_rgba(220,38,38,0.5)]"
          >
            <LogOut className="w-2.5 h-2.5 shrink-0 animate-pulse" />
            <span>Retreat</span>
          </button>
        )}

        {/* Comic slash animation */}
        <AnimatePresence>
          {isSlashing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: [1, 1.25, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-4 bg-white border-y-2 border-yellow-450 rotate-6 shadow-[0_0_15px_#f59e0b] animate-pulse" />
              <div className="absolute w-full h-1 bg-[#3a9aff] -rotate-6 shadow-[0_0_12px_#3a9aff]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Epic Victory Celebration State Overlay */}
        {battleOutcome === "victory" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/90 z-40 flex flex-col items-center justify-center p-3 text-center border-3 border-yellow-400 m-2 rounded-lg shadow-[0_0_30px_rgba(234,179,8,0.7)]"
          >
            <motion.div
              animate={{
                scale: [1, 1.12, 0.98, 1.12, 1],
                rotate: [0, 4, -4, 4, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mb-1 text-yellow-400 filter drop-shadow-[0_0_15px_rgba(234,179,8,1)]"
            >
              <Trophy className="w-12 h-12" />
            </motion.div>

            <h2 className="font-pixel text-[10px] md:text-xs text-yellow-400 tracking-wider mb-1 animate-bounce uppercase">
              👑 CELESTIAL VICTORY 👑
            </h2>
            <p className="font-pixel text-[7px] text-green-400 tracking-tight leading-relaxed uppercase mb-2">
              The Tomorrow Titan Overthrown!
            </p>

            {/* Falling pixelated confetti simulation using standard divs and keyframes/motion */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`gold-${i}`}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-none"
                  initial={{
                    left: `${Math.random() * 100}%`,
                    top: `-10px`,
                    opacity: Math.random() * 0.7 + 0.3,
                  }}
                  animate={{
                    top: `110%`,
                    left: `${Math.sin(i) * 15 + Math.random() * 100}%`,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1.2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 1.5,
                  }}
                />
              ))}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`cyan-${i}`}
                  className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-none"
                  initial={{
                    left: `${Math.random() * 100}%`,
                    top: `-10px`,
                    opacity: Math.random() * 0.8 + 0.2,
                  }}
                  animate={{
                    top: `110%`,
                    left: `${Math.cos(i) * 20 + Math.random() * 100}%`,
                  }}
                  transition={{
                    duration: Math.random() * 2.5 + 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 1.5,
                  }}
                />
              ))}
            </div>

            <div className="font-pixel text-[7px] md:text-[8px] text-slate-300 leading-normal border-t border-b border-yellow-500/30 py-1.5 w-full max-w-[90%] text-center">
              SYSTEM TIER ALL-CLEAR!<br />
              <span className="text-yellow-400 font-bold block mt-1 animate-pulse">+150 XP AWARDED</span>
              <span className="text-cyan-400 font-bold block mt-0.5 animate-pulse">+500 CREDITS AWARDED</span>
            </div>
          </motion.div>
        )}

        {/* Floating Damage Text Indicators */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
          <AnimatePresence>
            {floatingTexts.map((txt) => {
              let textClass = "absolute font-pixel uppercase text-stroke-black text-center tracking-normal ";
              if (txt.type === "perfect") {
                // Bright yellow or gold flashing text
                textClass += "text-yellow-400 text-xs md:text-sm drop-shadow-[0_0_12px_rgba(234,179,8,1)] animate-pulse";
              } else if (txt.type === "good") {
                // Vibrant green or cyan text
                textClass += "text-cyan-400 text-[10px] md:text-xs drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]";
              } else if (txt.type === "okay") {
                // Standard white or orange text
                textClass += "text-orange-400 text-[9px] md:text-[10px]";
              } else if (txt.type === "boss-attack") {
                textClass += "text-red-500 text-[9px] md:text-[10px]";
              } else if (txt.type === "heal") {
                textClass += "text-teal-400 text-[9px] md:text-[10px]";
              } else {
                textClass += "text-gray-400 text-[9px] md:text-[10px]";
              }

              return (
                <motion.div
                  key={txt.id}
                  initial={{ opacity: 0, scale: 0.5, y: 30 + (txt.yOffset || 0), x: (txt.xOffset || 0) }}
                  animate={{ opacity: 1, scale: [0.7, 1.2, 1.0], y: -50 + (txt.yOffset || 0), x: (txt.xOffset || 0) }}
                  exit={{ opacity: 0, scale: 0.8, y: -75 + (txt.yOffset || 0) }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={textClass}
                >
                  <div>{txt.text}</div>
                  {txt.damage !== undefined && txt.damage > 0 && (
                    <div className="text-[8px] md:text-[9px] text-red-500 font-pixel mt-0.5 animate-bounce">
                      -{txt.damage} HP
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Universal Post-Battle Decision Menu Dialogue Overlay */}
        {showDecisionMenu && (
          <div className="absolute inset-0 bg-[#000]/85 z-45 flex flex-col items-center justify-center p-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-[#000b1d] border-4 border-yellow-400 p-4 rounded-xl max-w-[90%] text-center shadow-[0_0_20px_rgba(234,179,8,0.6)]"
            >
              <div className="font-pixel text-yellow-400 text-[10px] uppercase tracking-wider mb-2 animate-pulse">
                🏆 STAGE CLEARED! 🏆
              </div>
              <p className="font-pixel text-[8px] text-green-400 leading-normal mb-3">
                {decisionNextBossIndex === 1 
                  ? "MIDNIGHT GLUTTON VANQUISHED!" 
                  : "DR. DISTRACTION VANQUISHED!"}
              </p>
              <div className="font-pixel text-[7px] text-gray-300 leading-normal mb-3 border-t border-b border-gray-800 py-2">
                REWARDS SECURED:<br/>
                <span className="text-yellow-400 font-bold block mt-1">XP +{decisionNextBossIndex === 1 ? "75" : "125"}</span>
                <span className="text-cyan-400 font-bold block mt-0.5">CREDITS +{decisionNextBossIndex === 1 ? "100" : "175"}</span>
              </div>
              <p className="font-sans text-[10px] text-teal-300 font-semibold italic px-1">
                "{decisionNextBossIndex === 1 
                  ? "But suddenly, Dr. Distraction blocks your path!" 
                  : "But the system's core ruptures... The Tomorrow Titan rises!"}"
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Cybernetic Combat Retinal Scan Log Overlay (Utilizing the newly saved vertical space beautifully) */}
      <div className="w-full px-4 pt-3 pb-1 shrink-0 bg-[#121312]">
        <div className="bg-black/95 border-2 border-[#3A9AFF]/30 p-2.5 rounded-xl text-left">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 bg-[#3A9AFF] rounded-full animate-ping shrink-0" />
            <span className="font-pixel text-[8px] text-[#3A9AFF]/90 uppercase tracking-widest">RETINAL SCAN STATUS UPDATE</span>
          </div>
          <div className="min-h-[2.5rem] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {actionLog ? (
                <motion.p
                  key={actionLog}
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.2 }}
                  className="font-sans text-[11px] text-teal-300/90 leading-relaxed font-semibold italic"
                >
                  "{actionLog}"
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  className="text-[9px] text-[#3A9AFF]/60 font-pixel uppercase tracking-wider"
                >
                  [ SYSTEMS NOMINAL - READY FOR IMPACT ]
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* PIXEL ACTIVE UI OVERLAY PANEL (Bottom Controls framed perfectly below background) */}
      <div className="w-full bg-[#121312] p-4 flex-grow flex flex-col justify-center">
        <div className={`ui-panel pixel-corners w-full relative flex bg-[#000b1d] border-4 p-3 text-left transition-all duration-200 ${
          isCooldown 
            ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4),inset_0_0_10px_rgba(249,115,22,0.4)] animate-bounce" 
            : "border-[#3A9AFF] shadow-[0_0_15px_#3A9AFF,inset_0_0_10px_#3A9AFF]"
        } ${
          isPlayingSlider 
            ? "flex-col min-h-[185px] gap-3" 
            : "flex-row justify-between items-stretch min-h-[120px]"
        }`}>
          
          {isPlayingSlider ? (
            /* FULL-WIDTH UNDERTALE CRITICAL ATTACK MINI-GAME */
            <div 
              onClick={() => {
                if (!isSliderFrozen && !isCooldown) {
                  handleStopSlider();
                }
              }}
              className="w-full h-full flex flex-col justify-between p-1 text-center select-none cursor-crosshair min-h-[105px]"
            >
              <div className="w-full flex justify-between items-center text-[9px] font-pixel text-gray-400 mb-1">
                {isCooldown ? (
                  <>
                    <span className="text-orange-500 font-bold tracking-widest animate-pulse">
                      ⚡ COOLDOWN IN ACTION
                    </span>
                    <span className="text-orange-300 font-bold">
                      RECHARGING...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[#3A9AFF] font-bold tracking-widest animate-pulse">
                      ⚔️ ATTACK PROTOCOL ACTIVE
                    </span>
                    <span className="text-yellow-400 font-bold">
                      PRESS KEY OR CLICK TO STRIKE!
                    </span>
                  </>
                )}
              </div>
              
              {/* Undertale Style Target Bar with 5 segment zones */}
              <div className={`w-full h-12 bg-black border-3 rounded-lg relative overflow-hidden shadow-[inset_0_0_12px_rgba(0,0,0,0.9)] mb-1 transition-colors duration-200 ${
                isCooldown ? "border-orange-600/60" : "border-gray-400"
              }`}>
                {/* Left Outer Red Zone (0% - 20%) */}
                <div className="absolute top-0 bottom-0 left-0 w-[20%] bg-red-600/35 flex items-center justify-center font-pixel text-[8px] text-red-300 select-none pointer-events-none border-r border-black/20">
                  LOW
                </div>
                {/* Left Flanking Yellow Zone (20% - 40%) */}
                <div className="absolute top-0 bottom-0 left-[20%] w-[20%] bg-yellow-500/35 flex items-center justify-center font-pixel text-[8px] text-yellow-200 select-none pointer-events-none border-r border-black/20">
                  MID
                </div>
                {/* Center Green Zone (40% - 60%) */}
                <div className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-green-500/40 flex items-center justify-center font-pixel text-[8px] text-green-200 font-bold select-none pointer-events-none border-r border-black/20 shadow-[inset_0_0_8px_rgba(34,197,94,0.5)]">
                  🎯 CRIT
                </div>
                {/* Right Flanking Yellow Zone (60% - 80%) */}
                <div className="absolute top-0 bottom-0 left-[60%] w-[20%] bg-yellow-500/35 flex items-center justify-center font-pixel text-[8px] text-yellow-200 select-none pointer-events-none border-r border-black/20">
                  MID
                </div>
                {/* Right Outer Red Zone (80% - 100%) */}
                <div className="absolute top-0 bottom-0 left-[80%] w-[20%] bg-red-600/35 flex items-center justify-center font-pixel text-[8px] text-red-300 select-none pointer-events-none">
                  LOW
                </div>

                {/* Subtly brighter border dividers for high fidelity segmented style */}
                <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-white/20 pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-[40%] w-[1px] bg-white/30 pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-[60%] w-[1px] bg-white/30 pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-[80%] w-[1px] bg-white/20 pointer-events-none" />

                {/* Moving indicator */}
                <motion.div
                  className={`absolute top-0 bottom-0 w-3 bg-white border-2 border-black z-30 shadow-[0_0_12px_rgba(255,255,255,0.9)] ${
                    isSliderFrozen ? "animate-ping bg-yellow-300 border-yellow-500 shadow-[0_0_20px_#fbbf24]" : ""
                  }`}
                  style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
                />
              </div>

              {/* Perfectly aligned Grid labeling under the 5 equal width zones */}
              <div className="grid grid-cols-5 w-full text-[8px] font-pixel leading-none text-center mb-3">
                <span className="text-red-400 font-bold">RED [LOW]</span>
                <span className="text-yellow-405 text-yellow-500 font-bold">YEL [MID]</span>
                <span className="text-green-450 text-green-400 font-bold">🎯 GRN [CRIT]</span>
                <span className="text-yellow-405 text-yellow-500 font-bold">YEL [MID]</span>
                <span className="text-red-400 font-bold">RED [LOW]</span>
              </div>

              {/* Visual Hero Health Bar (Zero Layout Overlap, placed elegantly at the bottom) */}
              <div className="w-full border-t border-[#3A9AFF]/20 pt-2 flex flex-col gap-1 select-none text-left">
                <div className="flex justify-between items-center text-[8px] font-pixel">
                  <span className="text-[#3A9AFF] font-bold tracking-wider">
                    🛡️ HERO VITALITY STATUS
                  </span>
                  <span className="text-green-400 font-bold">
                    HP: {battlePlayerHp} / {battleMaxPlayerHp}
                  </span>
                </div>
                <div className="h-3.5 bg-gray-950 rounded-full border border-[#3A9AFF]/30 overflow-hidden relative shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: "#22c55e" }}
                    animate={{ width: `${(battlePlayerHp / battleMaxPlayerHp) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Striped aesthetic overlay for extra retro fidelity */}
                  <div className="absolute inset-0 bg-stripes opacity-20 pointer-events-none" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Active standard view selection */}
              <div className="w-2/3 pr-3 flex flex-col justify-end pb-0 border-r border-[#3A9AFF]/30">
                <div className="flex flex-col gap-1.5">
                  {showDecisionMenu ? (
                    <>
                      <button
                        onClick={handleFightNextEnemy}
                        className="btn-pixel bg-[#3A9AFF] hover:bg-[#1e40af] text-black hover:text-white border-2 border-[#3A9AFF] p-1.5 font-pixel text-[9px] uppercase text-center font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Swords className="w-3.5 h-3.5 shrink-0" />
                        FIGHT NEXT ENEMY
                      </button>
                      
                      <button
                        onClick={handleReturnToHub}
                        className="btn-pixel bg-transparent hover:bg-slate-850 hover:text-white text-slate-300 border-2 border-slate-500 p-1.5 font-pixel text-[9px] uppercase text-center font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        style={{ backgroundColor: "#1e293b", borderColor: "#475569" }}
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        RETURN TO HUB
                      </button>
                    </>
                  ) : battleOutcome === "ongoing" ? (
                    <>
                      {isTransitioning ? (
                        <div className="w-full font-pixel text-[9px] text-yellow-400 animate-pulse text-center p-2.5 border border-dashed border-yellow-500/50 rounded-lg">
                          ⚠️ NEW ENEMY SPAWNING...
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={handleFightClick}
                            className="btn-pixel bg-transparent hover:bg-[#3A9AFF] hover:text-[#000b1d] text-[#3A9AFF] border-2 border-[#3A9AFF] p-1.5 font-pixel text-[10px] flex items-center justify-center gap-1.5 select-none active:scale-95 transition-all text-left"
                          >
                            <Swords className="w-3.5 h-3.5 shrink-0" />
                            FIGHT
                          </button>
                          
                          <button
                            onClick={onRetreat}
                            className="btn-pixel bg-transparent hover:bg-red-500 hover:text-white text-red-400 border-2 border-red-500 p-1.5 font-pixel text-[10px] flex items-center justify-center gap-1.5 select-none active:scale-95 transition-all text-left"
                          >
                            <LogOut className="w-3.5 h-3.5 shrink-0" />
                            RETREAT
                          </button>
                        </>
                      )}
                    </>
                  ) : battleOutcome === "victory" ? (
                    <div className="flex flex-col items-start gap-1.5 w-full text-left">
                      <span className="font-display-hero text-[#00ff00] text-lg tracking-wider uppercase text-stroke-black animate-pulse">
                        EPIC VICTORY!
                      </span>
                      <div className="bg-[#022c22]/70 border border-green-500 p-2 rounded-lg w-full mb-1.5">
                        <p className="font-pixel text-[7px] text-yellow-400 leading-tight uppercase font-bold">🏆 THE TOMORROW TITAN CONQUERED!</p>
                        <p className="font-pixel text-[6px] text-gray-300 leading-tight">CONQUEROR OF CHAOS BADGE AWARDED</p>
                        <p className="font-pixel text-[7px] text-white/90 leading-tight mt-1">💰 +150 XP | +500 CREDITS</p>
                      </div>
                      <button
                        onClick={handleFinalVictoryReturn}
                        className="btn-pixel w-full bg-[#22c55e] hover:bg-[#16a34a] text-black hover:text-white border-2 border-black p-2 font-pixel text-[9px] uppercase text-center font-bold flex items-center justify-center gap-2 select-none active:scale-95 transition-all shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        RETURN TO HUB
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-display-hero text-red-500 text-2xl tracking-widest uppercase text-stroke-black">
                        DEFEATED
                      </span>
                      <button
                        onClick={handleRestartBattle}
                        className="btn-pixel w-full bg-red-600 text-white border-2 border-black p-1.5 font-pixel text-[10px] flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        TRY AGAIN
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Status Panel */}
              <div className="w-1/3 flex flex-col items-end justify-between pl-3">
                <div className="animate-pulse">
                  <Heart className="w-12 h-12 text-red-600 fill-red-600 filter drop-shadow-[0_0_8px_rgba(230,0,0,0.6)]" />
                </div>
                
                <div className="text-right">
                  <div className="font-pixel text-[10px] text-white/50 mb-1">
                    LV {level}
                  </div>
                  <div className="font-pixel text-[10px] text-white">
                    HP {playerHp}/{maxPlayerHp}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
