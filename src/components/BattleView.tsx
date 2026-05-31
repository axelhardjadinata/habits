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
}

interface FloatingText {
  id: number;
  text: string;
  type: "critical" | "glancing" | "miss" | "boss-attack" | "heal";
}

export default function BattleView({
  playerHp,
  maxPlayerHp,
  setPlayerHp,
  level,
  addXp,
  addCredits,
  onRetreat,
}: BattleViewProps) {
  // Boss state
  const [bossHp, setBossHp] = useState(60);
  const maxBossHp = 60;
  const bossName = "Midnight Glutton";

  // Dynamic state refs to guarantee synchronous checks inside async consecutive keypress timeouts
  const bossHpRef = useRef(bossHp);
  useEffect(() => {
    bossHpRef.current = bossHp;
  }, [bossHp]);

  const playerHpRef = useRef(playerHp);
  useEffect(() => {
    playerHpRef.current = playerHp;
  }, [playerHp]);

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
  const [actionLog, setActionLog] = useState<string>("Face the hooded villain in the dark alleyway...");
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isEnemyFlashing, setIsEnemyFlashing] = useState(false);

  // Animation Frame Ref
  const requestRef = useRef<number | null>(null);

  // Floating text Counter
  const textIdCounter = useRef(0);

  const addFloatingText = (text: string, type: FloatingText["type"]) => {
    const id = textIdCounter.current++;
    setFloatingTexts((prev) => [...prev, { id, text, type }]);
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
    if (!isPlayingSlider || isSliderFrozen || battleOutcomeRef.current !== "ongoing") return;

    setIsSliderFrozen(true);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    const finalPos = sliderPositionRef.current;

    let damageToBoss = 0;
    let feedback = "";
    let type: FloatingText["type"] = "miss";
    let logMsg = "";

    if (isTimeout) {
      damageToBoss = 0;
      feedback = "❌ TIMEOUT MISS!";
      type = "miss";
      logMsg = "Too slow! Your energy blast fizzled out before you could release it!";
    } else if (finalPos >= 40 && finalPos <= 60) {
      damageToBoss = 25;
      feedback = "🎯 CRITICAL BLAST! -25 HP";
      type = "critical";
      logMsg = "Bullseye! Stopped dead-center inside the Green CRITICAL zone!";
    } else if ((finalPos >= 20 && finalPos < 40) || (finalPos > 60 && finalPos <= 80)) {
      damageToBoss = 12;
      feedback = "🔥 SOLID HIT! -12 HP";
      type = "critical";
      logMsg = "Excellent timing! Stopped inside the Yellow MEDIUM zone.";
    } else {
      damageToBoss = 4;
      feedback = "⚡ WEAK HIT! -4 HP";
      type = "glancing";
      logMsg = "Decent strike, but stopped in the Red LOW zone.";
    }

    // Apply damage and logs immediately with no delays
    if (damageToBoss > 0) {
      const nextBossHp = Math.max(0, bossHpRef.current - damageToBoss);
      setBossHp(nextBossHp);
      bossHpRef.current = nextBossHp;
      
      addFloatingText(feedback, type);

      if (nextBossHp <= 0) {
        setBattleOutcome("victory");
        addXp(150);
        addCredits(250);
        setActionLog("VICTORY! Midnight Glutton is defeated and vanishes into stardust!");
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

    // Snaapily resets the slider pointer and maintains fight state for consecutive strikes
    setTimeout(() => {
      if (bossHpRef.current > 0 && playerHpRef.current > 0 && battleOutcomeRef.current === "ongoing") {
        const initialPos = Math.random() * 40 + 10;
        setSliderPosition(initialPos);
        sliderPositionRef.current = initialPos;
        directionRef.current = Math.random() > 0.5 ? 1 : -1;
        startTimeRef.current = Date.now();
        setIsSliderFrozen(false); // restarts animateSlider automatically inside useEffect
      } else {
        // If battle finished, exit active slider mode
        setIsPlayingSlider(false);
        setIsSliderFrozen(false);
      }
    }, 450);
  };

  // Enemy Turn
  const enemyRetaliation = (wasPlayerMiss: boolean) => {
    if (battleOutcomeRef.current !== "ongoing") return;

    // Boss has higher hit chance if player missed
    const isHit = wasPlayerMiss ? Math.random() < 0.85 : Math.random() < 0.45;
    
    if (isHit) {
      const bossDamage = wasPlayerMiss ? 4 : 2;
      const nextPlayerHp = Math.max(0, playerHpRef.current - bossDamage);
      setPlayerHp(nextPlayerHp);
      playerHpRef.current = nextPlayerHp;
      
      addFloatingText(`-${bossDamage} HP`, "boss-attack");
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 400);

      if (nextPlayerHp <= 0) {
        setBattleOutcome("defeat");
        setActionLog(`DEFEAT! ${bossName}'s shadow bind overwhelms your senses.`);
      } else {
        setActionLog(`${bossName} counters with shadow levitation spikes!`);
      }
    } else {
      addFloatingText("EVADED!", "heal");
      setActionLog(`${bossName} sweeps down, but you dodge his shadow claws!`);
    }
  };

  const handleRestartBattle = () => {
    setBossHp(maxBossHp);
    setPlayerHp(maxPlayerHp);
    setBattleOutcome("ongoing");
    setIsPlayingSlider(false);
    setActionLog("You re-entered the dark alleyway. Let the duel begin!");
    setFloatingTexts([]);
  };

  // Cleanup floatings
  useEffect(() => {
    if (floatingTexts.length > 5) {
      setFloatingTexts((prev) => prev.slice(prev.length - 5));
    }
  }, [floatingTexts]);

  return (
    <div className={`relative w-[95%] mx-auto mt-4 select-none overflow-hidden rounded-2xl border-4 border-[#121312] md:max-w-md bg-[#121312] shadow-[8px_8px_0px_0px_#1C0770] flex flex-col ${
      isScreenShaking ? "animate-bounce" : ""
    }`}>
      
      {/* Rectangle top Boss status layout */}
      <div className="w-full bg-[#1C0770] border-b-4 border-[#121312] p-3 flex flex-col gap-1.5 shrink-0">
        <div className="flex justify-between items-center">
          <span className="font-display-hero text-red-500 text-xl tracking-wider uppercase text-stroke-black">
            👿 BOSS: {bossName}
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
            backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLuWoX4Au0CUU2Gz9b3GfRAhDpWCg17zoqOpYs6nB_d1HG-PsVaiiSvU6ZSDBwj4wpPlfEarzqd4AVE94o8qSggFFTccJAJvhOQZ7vsKKD-ykzY13g9pNx5OkVEWc_WYilPoULLYa845fQqIl7ox02jTvnYNYUaBTT1JrpcHueqfl2dc9tWnr9jiLp1k_eIvDFmO83N1QYEjb4I-8shwj4qD8nwOgSYALI1IFk8aQ7_uKU2RxNjZ_qYq1A')",
          }}
        >
          {/* Subtle Rainy overlay with lighter opacity for high contrast background visibility */}
          <div className="absolute inset-0 bg-black/10 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4px_20px] pointer-events-none opacity-80" />
        </div>

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

        {/* Floating Damage Text Indicators */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
          <AnimatePresence>
            {floatingTexts.map((txt) => (
              <motion.div
                key={txt.id}
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: -45, scale: [0.8, 1.3, 1.1] }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`absolute font-display-hero uppercase text-stroke-black text-2xl tracking-widest text-center ${
                  txt.type === "critical"
                    ? "text-green-450 text-4xl text-[#22c55e] filter drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                    : txt.type === "glancing"
                    ? "text-yellow-400 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] text-3xl"
                    : txt.type === "boss-attack"
                    ? "text-red-500 font-pixel text-lg"
                    : txt.type === "heal"
                    ? "text-cyan-300 text-lg"
                    : "text-gray-400 font-sans font-bold text-xl"
                }`}
              >
                {txt.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Cybernetic Combat Retinal Scan Log Overlay (Utilizing the newly saved vertical space beautifully) */}
      <div className="w-full px-4 pt-3 pb-1 shrink-0 bg-[#121312]">
        <div className="bg-black/95 border-2 border-[#3A9AFF]/30 p-2.5 rounded-xl text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#3A9AFF] rounded-full animate-ping shrink-0" />
            <span className="font-pixel text-[8px] text-[#3A9AFF]/90 uppercase tracking-widest">RETINAL SCAN STATUS UPDATE</span>
          </div>
          <p className="font-sans text-[11px] text-teal-300/90 mt-1 leading-relaxed font-semibold italic">
            "{actionLog}"
          </p>
        </div>
      </div>

      {/* PIXEL ACTIVE UI OVERLAY PANEL (Bottom Controls framed perfectly below background) */}
      <div className="w-full bg-[#121312] p-4 flex-grow flex flex-col justify-center">
        <div className="ui-panel pixel-corners w-full relative flex flex-row justify-between items-stretch bg-[#000b1d] border-4 border-[#3A9AFF] shadow-[0_0_15px_#3A9AFF,inset_0_0_10px_#3A9AFF] p-3 min-h-[120px] text-left">
          
          {isPlayingSlider ? (
            /* FULL-WIDTH UNDERTALE CRITICAL ATTACK MINI-GAME */
            <div 
              onClick={() => {
                if (!isSliderFrozen) {
                  handleStopSlider();
                }
              }}
              className="w-full h-full flex flex-col justify-between p-1 text-center select-none cursor-crosshair min-h-[100px]"
            >
              <div className="w-full flex justify-between items-center text-[9px] font-pixel text-gray-400">
                <span className="text-[#3A9AFF] font-bold tracking-widest animate-pulse">
                  ⚔️ ATTACK PROTOCOL ACTIVE
                </span>
                <span className="text-yellow-405 text-yellow-400">
                  PRESS KEY OR CLICK TO STRIKE!
                </span>
              </div>
              
              {/* Undertale Style Target Bar with 5 segment zones */}
              <div className="w-full h-12 bg-black border-3 border-gray-400 rounded-lg relative overflow-hidden shadow-[inset_0_0_12px_rgba(0,0,0,0.9)]">
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
              <div className="grid grid-cols-5 w-full text-[8px] font-pixel leading-none text-center">
                <span className="text-red-400 font-bold">RED [LOW]</span>
                <span className="text-yellow-405 text-yellow-500 font-bold">YEL [MID]</span>
                <span className="text-green-450 text-green-400 font-bold">🎯 GRN [CRIT]</span>
                <span className="text-yellow-405 text-yellow-500 font-bold">YEL [MID]</span>
                <span className="text-red-400 font-bold">RED [LOW]</span>
              </div>
            </div>
          ) : (
            <>
              {/* Active standard view selection */}
              <div className="w-2/3 pr-3 flex flex-col justify-end pb-0 border-r border-[#3A9AFF]/30">
                <div className="flex flex-col gap-1.5">
                  {battleOutcome === "ongoing" ? (
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
                  ) : battleOutcome === "victory" ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-display-hero text-green-400 text-2xl tracking-widest text-[#00ff00] uppercase text-stroke-black">
                        VICTORY!
                      </span>
                      <span className="font-pixel text-[8px] text-white/80 leading-relaxed mb-2">
                         +150 XP | +250 CREDITS
                      </span>
                      <button
                        onClick={onRetreat}
                        className="btn-pixel w-full bg-[#3A9AFF] text-black border-2 border-black p-1.5 font-pixel text-[10px] uppercase text-center"
                      >
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
