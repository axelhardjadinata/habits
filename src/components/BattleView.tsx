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
  const bossName = "ELDER VEX";

  // Slider State for checking hits
  const [isPlayingSlider, setIsPlayingSlider] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const directionRef = useRef(1);
  const sliderSpeedRef = useRef(3); // Speed of slider (percent per tick)

  // Game state
  const [battleOutcome, setBattleOutcome] = useState<"ongoing" | "victory" | "defeat">("ongoing");
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
    setSliderPosition((pos) => {
      let nextPos = pos + directionRef.current * sliderSpeedRef.current;
      if (nextPos >= 100) {
        nextPos = 100;
        directionRef.current = -1;
      } else if (nextPos <= 0) {
        nextPos = 0;
        directionRef.current = 1;
      }
      return nextPos;
    });
    requestRef.current = requestAnimationFrame(animateSlider);
  };

  useEffect(() => {
    if (isPlayingSlider && battleOutcome === "ongoing") {
      requestRef.current = requestAnimationFrame(animateSlider);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlayingSlider, battleOutcome]);

  // Handle player pressing FIGHT
  const handleFightClick = () => {
    if (battleOutcome !== "ongoing") return;
    setIsPlayingSlider(true);
    // Randomize initial position and direction
    setSliderPosition(Math.random() * 80);
    directionRef.current = Math.random() > 0.5 ? 1 : -1;
  };

  // Triggered when stopping the slider
  const handleStopSlider = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!isPlayingSlider || battleOutcome !== "ongoing") return;

    setIsPlayingSlider(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    // Determine accuracy zone
    // Zones: Track is 0% to 100%. Center is 50%
    const diff = Math.abs(50 - sliderPosition);
    let damageToBoss = 0;
    let feedback = "";
    let type: FloatingText["type"] = "miss";

    if (diff <= 8) {
      // Critical hit: 42% - 58%
      damageToBoss = 15;
      feedback = "CRITICAL BLAST! -15 HP";
      type = "critical";
      setIsEnemyFlashing(true);
      setTimeout(() => setIsEnemyFlashing(false), 300);
      setActionLog("Perfect strike! A blinding cosmic wave hits Elder Vex!");
    } else if (diff <= 25) {
      // Glancing blow: 25% - 41%, 59% - 75%
      damageToBoss = 6;
      feedback = "GLANCING HIT! -6 HP";
      type = "glancing";
      setIsEnemyFlashing(true);
      setTimeout(() => setIsEnemyFlashing(false), 200);
      setActionLog("A decent strike weakens Elder Vex's shadow aura.");
    } else {
      // Miss: < 25% or > 75%
      damageToBoss = 0;
      feedback = "MISS!";
      type = "miss";
      setActionLog("Your blast deflected into the rainy sky!");
    }

    // Apply boss damage
    if (damageToBoss > 0) {
      setBossHp((prev) => {
        const newHp = Math.max(0, prev - damageToBoss);
        if (newHp <= 0) {
          setBattleOutcome("victory");
          addXp(350);
          addCredits(250);
          setActionLog("VICTORY! Elder Vex is defeated and vanishes into stardust!");
        }
        return newHp;
      });
      addFloatingText(feedback, type);
    } else {
      addFloatingText(feedback, "miss");
    }

    // Boss retaliation check if boss is still alive
    if (bossHp - damageToBoss > 0) {
      // Let's delay the enemy retaliation slightly for better rhythm
      setTimeout(() => {
        enemyRetaliation(type === "miss");
      }, 900);
    }
  };

  // Enemy Turn
  const enemyRetaliation = (wasPlayerMiss: boolean) => {
    if (battleOutcome !== "ongoing") return;

    // Boss has higher hit chance if player missed
    const isHit = wasPlayerMiss ? Math.random() < 0.85 : Math.random() < 0.45;
    
    if (isHit) {
      const bossDamage = wasPlayerMiss ? 4 : 2;
      setPlayerHp((prev) => {
        const newHp = Math.max(0, prev - bossDamage);
        if (newHp <= 0) {
          setBattleOutcome("defeat");
          setActionLog("DEFEAT! Elder Vex's shadow bind overwhelms your senses.");
        }
        return newHp;
      });
      addFloatingText(`-${bossDamage} HP`, "boss-attack");
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 400);
      setActionLog("Elder Vex counters with shadow levitation spikes!");
    } else {
      addFloatingText("EVADED!", "heal");
      setActionLog("Elder Vex sweeps down, but you dodge his shadow claws!");
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
    <div className={`relative w-full h-[calc(100vh-100px)] mt-20 select-none overflow-hidden rounded-2xl border-4 border-[#121312] md:max-w-md md:mx-auto shadow-[8px_8px_0px_0px_#1C0770] ${
      isScreenShaking ? "animate-bounce" : ""
    }`}>
      {/* Cinematic Rainy Copocalypse Alley Wallpaper */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-300 ${
          isEnemyFlashing ? "brightness-150 contrast-125 saturate-150" : ""
        }`}
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLuWoX4Au0CUU2Gz9b3GfRAhDpWCg17zoqOpYs6nB_d1HG-PsVaiiSvU6ZSDBwj4wpPlfEarzqd4AVE94o8qSggFFTccJAJvhOQZ7vsKKD-ykzY13g9pNx5OkVEWc_WYilPoULLYa845fQqIl7ox02jTvnYNYUaBTT1JrpcHueqfl2dc9tWnr9jiLp1k_eIvDFmO83N1QYEjb4I-8shwj4qD8nwOgSYALI1IFk8aQ7_uKU2RxNjZ_qYq1A')",
        }}
      >
        {/* Subtle Rainy overlay using Tailwind */}
        <div className="absolute inset-0 bg-black/40 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4px_20px] pointer-events-none opacity-80" />
      </div>

      {/* Floating Damage Text Indicators */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
        <AnimatePresence>
          {floatingTexts.map((txt) => (
            <motion.div
              key={txt.id}
              initial={{ opacity: 0, y: 10, scale: 0.6 }}
              animate={{ opacity: 1, y: -80, scale: [0.8, 1.4, 1.2] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute font-display-hero uppercase text-stroke-black text-4xl tracking-widest text-center ${
                txt.type === "critical"
                  ? "text-green-400 text-5xl"
                  : txt.type === "glancing"
                  ? "text-yellow-400"
                  : txt.type === "boss-attack"
                  ? "text-red-500 font-pixel text-xl"
                  : txt.type === "heal"
                  ? "text-cyan-300"
                  : "text-gray-400 font-sans font-bold text-2xl"
              }`}
            >
              {txt.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BOSS HEALTH BAR (Aggressive, mirrored design in top gutter) */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-[#121312] border-3 border-red-500 rounded-lg p-2 filter drop-shadow-lg scale-95 md:scale-100">
          <div className="flex justify-between items-center mb-1">
            <span className="font-display-hero text-red-500 text-xl tracking-wide uppercase">
              👿 Boss: {bossName}
            </span>
            <span className="font-pixel text-[10px] text-red-400">
              HP {bossHp} / {maxBossHp}
            </span>
          </div>
          <div className="h-4 bg-gray-950 rounded-full border-2 border-red-950 overflow-hidden relative">
            <motion.div
              className="h-full bg-red-600 border-r-2 border-white"
              animate={{ width: `${(bossHp / maxBossHp) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
            {/* Striped overlay for health cells */}
            <div className="absolute inset-0 bg-stripes opacity-30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Action Logs narration block */}
      <div className="absolute top-22 left-4 right-4 z-20 text-center">
        <div className="inline-block bg-[#000b1d]/90 border-2 border-[#3A9AFF] rounded px-3 py-1.5 max-w-[90%] mx-auto backdrop-blur-sm">
          <p className="font-body-md text-xs italic text-gray-200 select-none">
            {actionLog}
          </p>
        </div>
      </div>

      {/* PIXEL ACTIVE UI OVERLAY PANEL (Bottom HUD) */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="ui-panel pixel-corners w-full relative flex flex-row justify-between items-stretch bg-[#000b1d]/95 border-4 border-[#3A9AFF] shadow-[0_0_15px_#3A9AFF,inset_0_0_10px_#3A9AFF] p-4 min-h-[140px] text-left">
          
          {/* Active slider state vs standard action buttons selection */}
          <div className="w-2/3 pr-3 flex flex-col justify-center border-r border-[#3A9AFF]/30">
            {!isPlayingSlider ? (
              <div className="flex flex-col gap-3">
                {battleOutcome === "ongoing" ? (
                  <>
                    <button
                      onClick={handleFightClick}
                      className="btn-pixel bg-transparent hover:bg-[#3A9AFF] hover:text-[#000b1d] text-[#3A9AFF] border-2 border-[#3A9AFF] p-2.5 font-pixel text-xs flex items-center justify-center gap-2 select-none active:scale-95 transition-all text-left"
                    >
                      <Swords className="w-4 h-4 shrink-0" />
                      FIGHT
                    </button>
                    
                    <button
                      onClick={onRetreat}
                      className="btn-pixel bg-transparent hover:bg-red-500 hover:text-white text-red-400 border-2 border-red-500 p-2.5 font-pixel text-xs flex items-center justify-center gap-2 select-none active:scale-95 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      RETREAT
                    </button>
                  </>
                ) : battleOutcome === "victory" ? (
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-display-hero text-green-400 text-2xl tracking-widest text-[#00ff00] uppercase text-stroke-black">
                      VICTORY!
                    </span>
                    <span className="font-pixel text-[8px] text-white/80 leading-relaxed mb-2">
                      +350 XP | +250 CREDITS
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
            ) : (
              /* ACTIVE COMBAT ACCURACY SLIDER */
              <div 
                onClick={handleStopSlider}
                className="flex flex-col items-center justify-center gap-3 w-full h-full cursor-pointer"
              >
                {/* Visual zone map track */}
                <div className="w-full h-6 border-2 border-white relative bg-gradient-to-r from-red-600 via-yellow-400 to-green-500 overflow-hidden">
                  
                  {/* Symmetric layout zone mapping indicator */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none">
                    {/* Left red zone bar */}
                    <div className="w-[20%] bg-red-600/20" />
                    {/* Left yellow bar */}
                    <div className="w-[20%] bg-yellow-500/20" />
                    {/* Central green bar (Hit zone) */}
                    <div className="w-[20%] bg-green-500 border-l border-r border-white font-bold" />
                    {/* Right yellow bar */}
                    <div className="w-[20%] bg-yellow-500/20" />
                    {/* Right red bar */}
                    <div className="w-[20%] bg-red-600/20" />
                  </div>

                  {/* Indicator cursor */}
                  <div
                    className="absolute top-0 bottom-0 w-2.5 bg-white border-x border-black transition-all"
                    style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
                  />
                </div>

                <div className="text-yellow-400 font-pixel text-[8px] text-center mt-1 animate-pulse tracking-tight select-none">
                  TAP ANYWHERE TO STOP SLIDER!
                </div>
              </div>
            )}
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

        </div>
      </div>
    </div>
  );
}
