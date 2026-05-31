import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Moon,
  Brain,
  Zap,
  Shield,
  CheckCircle2,
  Circle,
  Clock,
  Sun,
  Utensils,
  Upload,
  RefreshCw,
  X,
  Award,
  Smile,
  Mic,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { DailyHabit } from "../types";

interface HomeViewProps {
  xp: number;
  maxXp: number;
  levelName: string;
  habits: DailyHabit[];
  onToggleHabit: (id: string) => void;
  onEnterBattle: () => void;
  doubleXp: boolean;
  onCompleteHabitByAI: (habitNumber: number, xpReward: number, creditsReward: number, customMessage: string) => void;
  avatarUrl: string;
  onInstantLevelUp: () => void;
}

export default function HomeView({
  xp,
  maxXp,
  levelName,
  habits,
  onToggleHabit,
  onEnterBattle,
  doubleXp,
  onCompleteHabitByAI,
  avatarUrl,
  onInstantLevelUp,
}: HomeViewProps) {
  // Expanded row state
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  // General state for active AI processing
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Habit 1: Sleep/Sunlight Synchronizer State ---
  const [morningTime, setMorningTime] = useState<string>("07:30");
  const [sleepResult, setSleepResult] = useState<any | null>(null);

  // --- Habit 2: Feynman Tutor State ---
  const [feynmanTopic, setFeynmanTopic] = useState<string>("");
  const [feynmanExplanation, setFeynmanExplanation] = useState<string>("");
  const [feynmanResult, setFeynmanResult] = useState<any | null>(null);

  // --- Habit 3: Brain Dump Organizer State ---
  const [brainDumpText, setBrainDumpText] = useState<string>("");
  const [brainResult, setBrainResult] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // --- Habit 4: Meet Meal 3-Color Rule State ---
  const [mealText, setMealText] = useState<string>("");
  const [nutritionResult, setNutritionResult] = useState<any | null>(null);
  const [mealImageBase64, setMealImageBase64] = useState<string | null>(null);
  const [mealImageMime, setMealImageMime] = useState<string | null>(null);

  // AI Scoring network helper
  const executeAIScoring = async (apiPath: string, payload: any, successCallback: (data: any) => void) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "An unexpected AI processing error occurred.");
      }

      const data = await response.json();
      successCallback(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to contact vanguard AI Core.");
    } finally {
      setLoading(false);
    }
  };

  // Preset loaders for simplified testing
  const loadMealPreset = (text: string) => {
    setMealText(text);
    setMealImageBase64(null);
  };

  const loadBrainPreset = (text: string) => {
    setBrainDumpText(text);
  };

  const loadFeynmanPreset = (topic: string, explanation: string) => {
    setFeynmanTopic(topic);
    setFeynmanExplanation(explanation);
  };

  // Image Upload helper
  const handleMealImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Only image files are permitted for nutrition scanning.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const base64Data = reader.result.split(",")[1];
        setMealImageBase64(base64Data);
        setMealImageMime(file.type);
        setMealText(`Photo upload: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Submit Sunlight
  const handleTriggerSleepSync = () => {
    executeAIScoring("/api/ai/sleep-sunset", { morningSunlightTime: morningTime }, (data) => {
      setSleepResult(data);
    });
  };

  // 1. Claim sleep reward
  const handleClaimSleepCompletion = () => {
    if (!sleepResult) return;
    onCompleteHabitByAI(
      1,
      25,
      15,
      `⏰ SUNLIGHT ALIGNMENT CONFIRMED: Digital Sunset Alarm calibrated at ${sleepResult.sunsetTime}! Sleep habit synchronization loaded.`
    );
    setSleepResult(null);
    setExpandedHabitId(null);
  };

  // 2. Submit Feynman Tutorial
  const handleTriggerFeynman = () => {
    executeAIScoring("/api/ai/feynman-eval", { topic: feynmanTopic, explanation: feynmanExplanation }, (data) => {
      setFeynmanResult(data);
    });
  };

  // 2. Claim Feynman Tutor reward
  const handleClaimFeynmanCompletion = () => {
    if (!feynmanResult) return;
    onCompleteHabitByAI(
      2,
      50,
      25,
      `🎓 CONCEPT MASTERED! Score ${feynmanResult.clarityScore}% simple-analogy achieved. Academic study zone habit unlocked!`
    );
    setFeynmanResult(null);
    setExpandedHabitId(null);
  };

  // 3. Submit Brain Dump
  const handleTriggerBrainDump = () => {
    executeAIScoring("/api/ai/brain-dump", { text: brainDumpText }, (data) => {
      setBrainResult(data);
    });
  };

  // 3. Mic Dictaphone Simulation
  const toggleRecordingSim = () => {
    if (isRecording) {
      setIsRecording(false);
      setBrainDumpText(
        "I'm feeling really stressed about our applet demo deadline tomorrow at 10 AM. We still have typescript errors on the layout, and I haven't slept enough because of the late coding. Also need to dry clean my superhero suit before the conference."
      );
    } else {
      setIsRecording(true);
      setBrainDumpText("Listening to voice transcript...");
    }
  };

  // 3. Claim Brain Dump reward
  const handleClaimBrainCompletion = () => {
    if (!brainResult) return;
    onCompleteHabitByAI(
      3,
      50,
      40,
      `🧠 COGNITIVE BUFFER CLEARED: Action items processed. Brain Dump organizer habit completed!`
    );
    setBrainResult(null);
    setExpandedHabitId(null);
  };

  // 4. Submit Nutrition
  const handleTriggerNutritionScan = () => {
    executeAIScoring(
      "/api/ai/nutrition",
      {
        mealDescription: mealText,
        imageBase64: mealImageBase64,
        imageMime: mealImageMime,
      },
      (data) => {
        setNutritionResult(data);
      }
    );
  };

  // 4. Claim Nutrition reward
  const handleClaimNutritionCompletion = () => {
    if (!nutritionResult) return;
    onCompleteHabitByAI(
      4,
      30,
      30,
      `🥗 DIETARY FUEL SYNCHRONIZED: Meal analyzed with Grade ${nutritionResult.vitaminVarietyRating}. 3-Color spectrum verified!`
    );
    setNutritionResult(null);
    setExpandedHabitId(null);
  };

  const getVarietyBadgeClass = (rating: string) => {
    const r = rating.toUpperCase();
    if (r.includes("A") || r.includes("DIVERSE")) return "bg-green-600 border-green-400 text-white";
    if (r.includes("B") || r.includes("GOOD")) return "bg-yellow-600 border-yellow-400 text-white";
    return "bg-red-600 border-red-400 text-white";
  };

  return (
    <main className="px-5 flex flex-col gap-6 mt-24 mb-24 w-full max-w-sm mx-auto">
      
      {/* Dynamic Profile Section */}
      <section className="bg-[#1C0770] comic-border rounded-2xl p-4 comic-shadow flex items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-stripes opacity-20 pointer-events-none" />

        <div className="w-20 h-20 rounded-full border-3 border-[#121312] bg-[#261CC1] flex-shrink-0 relative z-10 overflow-hidden p-1">
          <img
            alt={`${levelName} Avatar`}
            className="w-full h-full object-cover rounded-full bg-[#3A9AFF]"
            src={avatarUrl}
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex-grow z-10 relative">
          <h2 className="font-display-hero text-xl text-yellow-400 mb-1 leading-none tracking-wide text-stroke-black">
            {levelName}
          </h2>
          
          {/* XP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs font-label-sm text-white mb-0.5">
              <span className="font-bold">XP</span>
              <span className="font-bold">{xp.toLocaleString()} / {maxXp.toLocaleString()}</span>
            </div>
            <div className="h-4 w-full bg-[#121312] border-2 border-[#3A9AFF] rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-[#3A9AFF] border-r-2 border-white"
                animate={{ width: `${(xp / maxXp) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
              {/* Cells overlay */}
              <div className="absolute inset-0 flex justify-around pointer-events-none">
                <div className="w-px h-full bg-[#121312] opacity-40" />
                <div className="w-px h-full bg-[#121312] opacity-40" />
                <div className="w-px h-full bg-[#121312] opacity-40" />
                <div className="w-px h-full bg-[#121312] opacity-40" />  
              </div>
            </div>
          </div>

          {/* Economy Indicator Subtitle Labels */}
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Zap className="w-5 h-5 text-[#3A9AFF] fill-[#3A9AFF]" />
              <span className="font-display-hero text-white tracking-wider text-base pt-0.5">XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-display-hero text-white tracking-wider text-base pt-0.5">CREDITS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Battle CTA Button Module */}
      <section className="w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnterBattle}
          className="w-full cursor-pointer text-left bg-gradient-to-br from-[#261CC1] to-[#3A9AFF] comic-border border-3 border-black rounded-2xl p-5 comic-shadow-accent relative overflow-hidden group"
        >
          {/* Kirby dots background details */}
          <div className="absolute inset-0 bg-stripes opacity-15 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none text-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="drop-shadow-[2px_2px_0px_#121312] mb-1.5"
            >
              <Zap className="w-12 h-12 text-yellow-400 fill-yellow-400" />
            </motion.div>
            
            <h2 className="font-display-hero text-3xl text-white italic tracking-wider text-stroke-black text-center uppercase select-none">
              ENTER BATTLE STAGE
            </h2>
            <p className="font-pixel text-[8px] text-yellow-300 mt-1 uppercase select-none">
              Face the levitating boss!
            </p>
          </div>
        </motion.button>
      </section>

      {/* Daily habit tracking section */}
      <section className="flex flex-col gap-3.5 w-full">
        <h3 className="font-display-hero text-2xl text-white tracking-wide text-stroke-black">
          DAILY HERO HABITS {doubleXp && <span className="text-orange-400 text-sm ml-2 animate-pulse">[2X XP ACTIVE!]</span>}
        </h3>

        {errorMsg && (
          <div className="bg-red-950/80 text-red-300 border-2 border-red-500 rounded-xl p-3 flex gap-2 items-start text-xs text-left">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <p className="font-bold">COGNITIVE ACTION ERROR</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const isCompleted = habit.completedToday;
            const isExpanded = expandedHabitId === habit.id;

            return (
              <motion.div
                whileHover={{ x: isExpanded ? 0 : 2 }}
                onClick={() => {
                  setExpandedHabitId(isExpanded ? null : habit.id);
                  setErrorMsg(null);
                }}
                key={habit.id}
                className={`comic-border rounded-xl p-4 flex flex-col comic-shadow relative overflow-hidden transition-all ${
                  isCompleted 
                    ? "bg-[#1C0770]/60 border-green-500 opacity-90" 
                    : "bg-[#121312] border-[#3A9AFF] hover:border-white"
                }`}
              >
                {/* Visual strip tint background overlay in card margin */}
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#3A9AFF]/10 -skew-x-12 transform origin-bottom pointer-events-none" />
                
                {/* TOP HEADER ROW OF THE CARD */}
                <div className="flex items-center justify-between relative z-10 w-full select-none cursor-pointer">
                  
                  <div className="flex items-center gap-3.5 pr-2">
                    {/* Checklist checkbox (Actively toggles state manually) */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleHabit(habit.id);
                      }}
                      title="Click to toggle manually"
                      className={`w-12 h-12 rounded-lg border-2 bg-[#1C0770] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-transform ${
                        isCompleted ? "border-green-500 text-green-400" : "border-[#3A9AFF] text-[#3A9AFF]"
                      }`}
                    >
                      {habit.id === "habit_1" ? (
                        <Moon className={`w-7 h-7 ${isCompleted ? "fill-green-500" : "fill-[#3A9AFF]"}`} />
                      ) : habit.id === "habit_2" ? (
                        <BookOpen className={`w-7 h-7 ${isCompleted ? "fill-green-500" : "fill-[#3A9AFF]"}`} />
                      ) : habit.id === "habit_3" ? (
                        <Brain className={`w-7 h-7 ${isCompleted ? "fill-green-500" : "fill-[#3A9AFF]"}`} />
                      ) : (
                        <Utensils className={`w-7 h-7 ${isCompleted ? "fill-green-500" : "fill-[#3A9AFF]"}`} />
                      )}
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="font-label-sm text-[10px] text-[#3A9AFF] uppercase tracking-wider font-bold flex items-center gap-1.5">
                        Habit {habit.number} {isCompleted && <span className="text-green-400">✨ Completed</span>}
                      </span>
                      <span className={`font-body-md text-sm italic font-bold leading-tight ${
                        isCompleted ? "text-gray-400 line-through" : "text-white"
                      }`}>
                        {habit.name}
                      </span>
                    </div>
                  </div>

                  {/* Rewards Cluster & expand indicator */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1 items-end shrink-0 font-sans">
                      {/* Reward XP Badge */}
                      <div className={`flex items-center gap-1 border-1.5 px-2 py-0.5 rounded-lg transition-colors ${
                        isCompleted 
                          ? "bg-[#1C0770]/80 border-green-600 text-green-400" 
                          : "bg-[#1C0770]/60 border-slate-700 text-white"
                      }`}>
                        <span className={`font-display-hero text-xs ${isCompleted ? "text-green-400" : "text-[#3A9AFF]"}`}>
                          +{habit.xpReward * (doubleXp ? 2 : 1)}
                        </span>
                        <span className="font-display-hero text-[9px] uppercase">XP</span>
                      </div>

                      {/* Reward Credits Badge */}
                      <div className={`flex items-center gap-1 border-1.5 px-2 py-0.5 rounded-lg transition-colors ${
                        isCompleted 
                          ? "bg-[#1C0770]/80 border-green-600 text-green-400/80" 
                          : "bg-[#1C0770]/60 border-slate-700 text-white"
                      }`}>
                        <Shield className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        <span className={`font-display-hero text-xs ${isCompleted ? "text-green-400/80" : "text-yellow-400"}`}>
                          +{habit.creditsReward}
                        </span>
                        <span className="font-display-hero text-[9px] uppercase">C</span>
                      </div>
                    </div>

                    {/* Expand Indicator Chevron */}
                    <div className="text-gray-400 hover:text-white pl-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 animate-pulse" />}
                    </div>
                  </div>

                </div>

                {/* BOTTOM EXPANDED INTERACTIVE AI FEATURE DRAWER */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800 mt-4 pt-4 text-left text-xs text-slate-200 z-20 relative"
                      onClick={(e) => e.stopPropagation()} // Prevent closing drawer on panel clicks
                    >
                      {/* ------------------------------------------------ */}
                      {/* SUB-PANEL FOR HABIT 1: SLEEP / SUNLIGHT SYNCHRONIZER */}
                      {/* ------------------------------------------------ */}
                      {habit.id === "habit_1" && (
                        <div className="flex flex-col gap-3">
                          <p className="leading-relaxed text-slate-300 italic">
                            Align your sleeping patterns natively! Track visual morning natural bright light to calculate dynamic serotonin shifts and trigger melatonin sunset timing 14 hours later.
                          </p>

                          {!sleepResult ? (
                            <div className="flex flex-col gap-3">
                              <div className="bg-black/45 rounded-xl p-3 border-2 border-slate-800 flex flex-col gap-2">
                                <label className="font-bold text-yellow-400 uppercase tracking-widest text-[9px] block">
                                  LOG MORNING SUNLIGHT DIRECT TIME:
                                </label>
                                <div className="flex gap-2 items-center">
                                  <Sun className="w-5 h-5 text-yellow-400 shrink-0 animate-spin-slow" />
                                  <input
                                    type="time"
                                    value={morningTime}
                                    onChange={(e) => setMorningTime(e.target.value)}
                                    className="bg-slate-900 border-2 border-[#3A9AFF] p-1.5 rounded text-white font-mono text-sm uppercase focus:outline-none"
                                  />
                                  <span className="text-[9px] text-slate-400 italic">Recommended: 06:00 - 09:00 AM</span>
                                </div>
                              </div>

                              <button
                                onClick={handleTriggerSleepSync}
                                disabled={loading}
                                className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-display-hero text-xs rounded-lg border-2 border-black comic-shadow-accent uppercase flex items-center justify-center gap-2 hover:bg-yellow-400 cursor-pointer disabled:opacity-50"
                              >
                                {loading ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    SYNCING SEROTONIN BIO-WAVES...
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-4 h-4" />
                                    CALCULATE CIRCADIAN ALIGNMENT
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex flex-col gap-3 bg-[#110133] border-2 border-yellow-400 p-4 rounded-xl relative"
                            >
                              <div className="absolute top-2 right-2 flex gap-1.5">
                                <button onClick={() => setSleepResult(null)} className="text-gray-400 hover:text-white">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <h5 className="font-display-hero text-sm text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                                <Award className="w-4 h-4 fill-yellow-400" />
                                Circadian Spectrum Balanced
                              </h5>

                              <div className="grid grid-cols-2 gap-3 bg-black/40 p-2.5 rounded-lg border border-slate-800">
                                <div>
                                  <div className="text-[9px] text-[#3A9AFF] uppercase font-bold">Sunlight Log</div>
                                  <div className="font-mono text-sm text-white font-bold">{morningTime}</div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-orange-400 uppercase font-bold">DIGITAL SUNSET</div>
                                  <div className="font-mono text-sm text-yellow-400 font-bold">{sleepResult.sunsetTime}</div>
                                </div>
                              </div>

                              <div className="bg-black/30 p-2.5 border-l-2 border-[#3A9AFF] text-gray-300 italic">
                                <strong className="text-white block not-italic uppercase text-[8px] tracking-wider mb-0.5">BIO-SYNAPSE INSIGHT:</strong>
                                {sleepResult.insight}
                              </div>

                              <div>
                                <span className="text-[9px] text-yellow-300 font-bold uppercase tracking-wider block mb-1">DECREE FOR REST PREPARATION:</span>
                                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[10px]">
                                  {sleepResult.tips.map((tip: string, idx: number) => (
                                    <li key={idx}>{tip}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-[#1C0770]/40 p-2 border border-slate-700 rounded text-[10px] text-cyan-200">
                                <strong className="text-white uppercase text-[8px] block mb-0.5">ENVIRONMENT INSTRUCTION:</strong>
                                {sleepResult.environment}
                              </div>

                              <button
                                onClick={handleClaimSleepCompletion}
                                className="w-full py-2.5 bg-green-500 hover:bg-white text-slate-950 hover:text-slate-900 font-display-hero text-xs rounded-xl border-2 border-black comic-shadow uppercase flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                CONFIRM SUNSET ALIGN & CLAIM REWARDS
                              </button>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* ------------------------------------------------ */}
                      {/* SUB-PANEL FOR HABIT 2: THE FEYNMAN TUTOR */}
                      {/* ------------------------------------------------ */}
                      {habit.id === "habit_2" && (
                        <div className="flex flex-col gap-3">
                          <p className="leading-relaxed text-slate-300 italic">
                            Explain a complex topic in extremely simple terms, as if explaining it to a **5-year-old child**. The AI processes conceptual clarity and evaluates whether you have truly mastered the knowledge.
                          </p>

                          {!feynmanResult ? (
                            <div className="flex flex-col gap-3">
                              <div>
                                <span className="text-[9px] text-[#3A9AFF] font-bold uppercase tracking-wider block mb-1 font-mono">LOAD DEMO CLARITY PRESETS:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => loadFeynmanPreset("Quantum Computers", "Normal computers solve math problems by checking lines in a maze one by one. Quantum computers are magic machines that can explore all maze tunnels at the exact same split second, using super coins that are both heads and tails at the same time.")}
                                    className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-0.5 rounded text-[10px] text-white cursor-pointer"
                                  >
                                    🧪 Quantum Theory (Simple)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => loadFeynmanPreset("Capitalism", "Capitalism is an dynamic socio-economic framework predicated on the decentralization of markets, where aggregate capital accumulation is sequestered by private stakeholders following supply-and-demand telemetry.")}
                                    className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-0.5 rounded text-[10px] text-white cursor-pointer"
                                  >
                                    💼 Capitalism (Overly complex jargon)
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2.5 mt-1">
                                <div>
                                  <label className="font-bold text-slate-400 uppercase tracking-widest text-[8px] block mb-0.5">TOPIC / COGNITIVE TARGET:</label>
                                  <input
                                    type="text"
                                    value={feynmanTopic}
                                    onChange={(e) => setFeynmanTopic(e.target.value)}
                                    placeholder="e.g., Photosynthesis, Black Holes, API REST..."
                                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-1.5 rounded text-white text-xs focus:outline-none text-left animate-fade-in"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-[#3A9AFF] uppercase tracking-widest text-[8px] block mb-0.5">YOUR 5-YEAR-OLD TYPE EXPLANATION:</label>
                                  <textarea
                                    value={feynmanExplanation}
                                    onChange={(e) => setFeynmanExplanation(e.target.value)}
                                    placeholder="Explain it in easy words without fancy textbook terms..."
                                    rows={4}
                                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-2 rounded-xl text-white font-sans text-xs focus:outline-none resize-none"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleTriggerFeynman}
                                disabled={loading || !feynmanTopic.trim() || !feynmanExplanation.trim()}
                                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-display-hero text-xs rounded-lg border-2 border-black comic-shadow-accent uppercase flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer disabled:opacity-50"
                              >
                                {loading ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    COMPILING COGNITIVE MASTERY SCORE...
                                  </>
                                ) : (
                                  <>
                                    <GraduationCap className="w-4 h-4" />
                                    EVALUATE SIMPLICITY LEVEL
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex flex-col gap-3 bg-[#001D2C] border-2 border-cyan-500 p-4 rounded-xl relative hover:scale-[1.01] transition-transform duration-150"
                            >
                              <div className="absolute top-2 right-2">
                                <button type="button" onClick={() => setFeynmanResult(null)} className="text-gray-400 hover:text-white">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <h5 className="font-display-hero text-sm text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Feynman Mastery Index
                              </h5>

                              <div className="grid grid-cols-2 gap-2.5 font-sans">
                                <div className="bg-black/40 p-2.5 rounded border border-slate-800 flex flex-col justify-center items-center text-center">
                                  <span className="text-[8px] text-cyan-400 uppercase font-bold">CLARITY SCORE</span>
                                  <span className="font-display-hero text-2xl text-white font-black mt-1">
                                    {feynmanResult.clarityScore}%
                                  </span>
                                  <div className="h-2 w-full max-w-[80px] bg-slate-800 rounded-full overflow-hidden mt-1 relative border border-slate-700">
                                    <div
                                      className={`h-full ${feynmanResult.clarityScore >= 80 ? 'bg-green-400' : feynmanResult.clarityScore >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                      style={{ width: `${feynmanResult.clarityScore}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="bg-black/40 p-2.5 rounded border border-slate-800 flex flex-col justify-center text-center">
                                  <span className="text-[8px] text-slate-400 uppercase font-bold">SIMPLICITY RATE</span>
                                  <span className="font-display-hero text-[11px] text-yellow-400 uppercase font-bold leading-tight mt-1.5 break-words">
                                    {feynmanResult.simplicityRating}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-black/30 p-2.5 border-l-2 border-cyan-500 text-slate-300">
                                <strong className="text-white block uppercase text-[9px] mb-0.5 tracking-wider">TUTOR EVALUATION COMMENTS:</strong>
                                {feynmanResult.tutorFeedback}
                              </div>

                              {feynmanResult.missedConcepts && feynmanResult.missedConcepts.length > 0 && (
                                <div className="bg-red-950/25 border border-red-900/40 p-2.5 rounded">
                                  <strong className="text-[#FF3A5C] uppercase text-[9px] block mb-1 font-mono">OMITTED CORE INSIGHTS (NEED COVERAGE):</strong>
                                  <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[10px]">
                                    {feynmanResult.missedConcepts.map((missed: string, idx: number) => (
                                      <li key={idx}>{missed}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="bg-[#1C0770]/40 p-2.5 border border-slate-800 rounded text-cyan-200">
                                <strong className="text-[#3A9AFF] uppercase text-[9px] block mb-1">IDEAL 5-YEAR-OLD METAPHOR ANALOG:</strong>
                                <p className="text-[10px] leading-relaxed italic">
                                  "{feynmanResult.revisedExplanationExample}"
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={handleClaimFeynmanCompletion}
                                className="w-full py-3 mt-1 bg-green-500 hover:bg-white text-slate-950 font-display-hero text-xs rounded-xl border-2 border-black comic-shadow uppercase flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                COMMIT UNDERSTANDING & ACQUIRE EXP
                              </button>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* ------------------------------------------------ */}
                      {/* SUB-PANEL FOR HABIT 3: BRAIN DUMP ORGANIZER */}
                      {/* ------------------------------------------------ */}
                      {habit.id === "habit_3" && (
                        <div className="flex flex-col gap-3">
                          <p className="leading-relaxed text-slate-300 italic">
                            Clear emotional noise! Stream chaos, anxieties, and unfiled chores out of your head. The system isolated worries and refilled structured actionable tasks directly.
                          </p>

                          {!brainResult ? (
                            <div className="flex flex-col gap-3">
                              <div>
                                <span className="text-[9px] text-[#a251ff] font-bold uppercase tracking-wider block mb-1 font-mono">SIMULATION PRESETS:</span>
                                <button
                                  type="button"
                                  onClick={() => loadBrainPreset("Worrying about study exams coming up, need to fix my daily habits, have to walk the dog, didn't drink enough water today and my brain feels dry. I'm afraid I won't succeed on the physical agility check.")}
                                  className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-1 rounded text-[10px] text-white cursor-pointer"
                                >
                                  ✍🏼 Load Stress Clutter
                                </button>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-[#3A9AFF] uppercase tracking-widest text-[9px] block">
                                  MIND REFLECTION SHEET (FREELY DUMP ALL THOUGHTS):
                                </label>
                                <textarea
                                  value={brainDumpText}
                                  onChange={(e) => setBrainDumpText(e.target.value)}
                                  placeholder="Type anything bothering you - list chores, pending issues, stresses..."
                                  rows={4}
                                  className="bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-2 rounded-xl text-white font-sans text-xs focus:outline-none resize-none w-full"
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={toggleRecordingSim}
                                  className={`flex-1 py-1.5 rounded-lg border border-black flex items-center justify-center gap-2 font-display-hero text-[10px] cursor-pointer ${
                                    isRecording ? "bg-red-600 text-white animate-pulse" : "bg-[#1C0770] text-slate-300 shadow"
                                  }`}
                                >
                                  <Mic className="w-3.5 h-3.5" />
                                  {isRecording ? "STOP & TRANSCRIBE" : "🎙️ TRANSCRIBE SCRIPT"}
                                </button>

                                <button
                                  onClick={handleTriggerBrainDump}
                                  disabled={loading || !brainDumpText.trim()}
                                  className="flex-1 py-1 px-3 bg-gradient-to-r from-purple-500 to-[#a251ff] text-slate-950 font-display-hero text-xs rounded-lg border-2 border-black comic-shadow-accent uppercase flex items-center justify-center gap-1 hover:opacity-90 cursor-pointer disabled:opacity-50"
                                >
                                  {loading ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      FILTERING CLUTTER...
                                    </>
                                  ) : (
                                    <>
                                      <Brain className="w-3.5 h-3.5" />
                                      COMPILE BRAIN DUMP
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex flex-col gap-3 bg-[#17002C] border-2 border-[#a251ff] p-4 rounded-xl relative"
                            >
                              <div className="absolute top-2 right-2">
                                <button onClick={() => setBrainResult(null)} className="text-gray-400 hover:text-white">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <h5 className="font-display-hero text-sm text-[#b87fff] uppercase tracking-wider flex items-center gap-2">
                                <Smile className="w-4 h-4" />
                                Cognitive Buffer Clear
                              </h5>

                              <div className="bg-black/30 p-2.5 rounded border border-slate-800">
                                <div className="text-[8px] text-[#a251ff] uppercase font-bold mb-1">OFFLOAD SUMMARY</div>
                                <p className="text-slate-300 leading-tight italic">{brainResult.summary}</p>
                              </div>

                              <div>
                                <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider block mb-1">MIND DETOX CHORE MATRIX:</span>
                                <div className="space-y-1 bg-black/40 p-2.5 rounded border border-slate-800">
                                  {brainResult.actionableTodoList.map((task: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                                      <input type="checkbox" className="rounded bg-slate-900 border-slate-700" defaultChecked={false} />
                                      <span className="text-[10px] leading-tight">{task}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span className="text-[9px] text-[#FF3A5C] font-bold uppercase tracking-wider block mb-1 font-mono">HIGHLIGHTED STRESSORS EXTRUDED:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {brainResult.recurringStressors.map((str: string, idx: number) => (
                                    <span key={idx} className="bg-red-950/40 border border-red-900 px-2 py-0.5 rounded text-[8.5px] font-mono text-red-300 uppercase">
                                      ⚠ {str}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-[#1C0770]/40 p-2.5 border-l-2 border-purple-500 rounded text-slate-300 italic">
                                <strong className="text-white block uppercase text-[8px] not-italic mb-0.5 tracking-widest">COMMANDER MIND TUNING:</strong>
                                "{brainResult.mindfulCoachingMessage}"
                              </div>

                              <button
                                onClick={handleClaimBrainCompletion}
                                className="w-full py-2.5 bg-green-500 hover:bg-white text-slate-950 font-display-hero text-xs rounded-xl border-2 border-black comic-shadow uppercase flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                CLEAR MIND & HARVEST STATS
                              </button>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* ------------------------------------------------ */}
                      {/* SUB-PANEL FOR HABIT 4: MEET MEAL 3-COLOR RULE */}
                      {/* ------------------------------------------------ */}
                      {habit.id === "habit_4" && (
                        <div className="flex flex-col gap-3">
                          <p className="leading-relaxed text-slate-300 italic">
                            Skip manual calorie logging! Write down or submit a screenshot. AI automatically parses ingredients to verify if you met the 3-color rule (multi-color antioxidants layout).
                          </p>

                          {!nutritionResult ? (
                            <div className="flex flex-col gap-3">
                              <div>
                                <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider block mb-1">TRIAL QUICK FEED:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => loadMealPreset("Mediterranean Salad: Fresh baby spinach, sliced red tomatoes, yellow bell peppers, red onion, salmon fillet, and cold-pressed olive oil.")}
                                    className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-white cursor-pointer"
                                  >
                                    🥗 Salmon Salad (3-Color)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => loadMealPreset("Sirloin heavy beef steak, white mashed potatoes, butter slice.")}
                                    className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-white cursor-pointer"
                                  >
                                    🥩 Steak & Mash (Limited)
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="font-bold text-[#3A9AFF] uppercase tracking-widest text-[9px]">
                                  INGREDIENT SHIELD LISTING DESCRIPTION:
                                </label>
                                <textarea
                                  value={mealText}
                                  onChange={(e) => setMealText(e.target.value)}
                                  placeholder="e.g. Avocado slices, fresh dark green broccoli, organic carrots, chicken thigh..."
                                  rows={3}
                                  className="bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-2 rounded-xl text-white font-sans text-xs focus:outline-none resize-none w-full"
                                />
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                                  <Upload className="w-3.5 h-3.5 text-[#3A9AFF]" />
                                  OR ATTACH VISUAL FOOD SNAPSHOT:
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleMealImageUpload}
                                  className="block w-full text-[10px] text-slate-400
                                    file:mr-3 file:py-1 file:px-2.5
                                    file:rounded-lg file:border-2 file:border-slate-800
                                    file:text-[10px] file:font-semibold
                                    file:bg-[#1C0770] file:text-white
                                    hover:file:bg-[#261CC1] cursor-pointer"
                                />
                              </div>

                              <button
                                onClick={handleTriggerNutritionScan}
                                disabled={loading || !mealText.trim()}
                                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-slate-950 font-display-hero text-xs rounded-lg border-2 border-black comic-shadow-accent uppercase flex items-center justify-center gap-2 hover:bg-green-400 cursor-pointer disabled:opacity-50"
                              >
                                {loading ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    SCANNING SPECTRUMS WITH COGNITIVE AI...
                                  </>
                                ) : (
                                  <>
                                    <Utensils className="w-4 h-4" />
                                    RUN NUTRITION SCANNER
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex flex-col gap-3 bg-[#0A1A10] border-2 border-green-500 p-4 rounded-xl relative"
                            >
                              <div className="absolute top-2 right-2">
                                <button onClick={() => setNutritionResult(null)} className="text-gray-400 hover:text-white">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <h5 className="font-display-hero text-sm text-green-400 uppercase tracking-wider flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Diet Variety Assessment
                              </h5>

                              <div className="grid grid-cols-2 gap-2.5">
                                <div className="bg-black/40 p-2 rounded border border-slate-800">
                                  <div className="text-[8px] text-green-400 uppercase font-bold mb-1">COLOR SPECTRUM</div>
                                  <div className="flex flex-wrap gap-1">
                                    {nutritionResult.colorsDetected.map((c: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 border rounded-full text-[9px] font-bold uppercase"
                                        style={{
                                          borderColor: c.toLowerCase(),
                                          color: c.toLowerCase() === "white" ? "#fff" : c.toLowerCase(),
                                          backgroundColor: "rgba(0,0,0,0.4)"
                                        }}
                                      >
                                        ● {c}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-black/40 p-2 rounded border border-slate-800 flex flex-col justify-between">
                                  <div>
                                    <div className="text-[8px] text-[#3A9AFF] uppercase font-bold">3-COLOR RULE</div>
                                    <span className={`text-[10px] font-bold ${nutritionResult.threeColorRuleMet ? "text-green-400" : "text-amber-400"}`}>
                                      {nutritionResult.threeColorRuleMet ? "✓ RULE MET" : "✗ LACK VARIETY"}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    <span className="text-[8px] text-slate-400 uppercase block font-bold">GRADE</span>
                                    <span className={`inline-block px-1.5 border font-bold text-[9px] rounded uppercase ${getVarietyBadgeClass(nutritionResult.vitaminVarietyRating)}`}>
                                      {nutritionResult.vitaminVarietyRating}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-black/30 p-2.5 border-l-2 border-green-500 text-slate-300 text-[10px]">
                                <strong className="text-white block uppercase text-[8.5px] mb-0.5 tracking-wider">AI DIET FEEDBACK:</strong>
                                {nutritionResult.nutritionalInsight}
                              </div>

                              <div className="bg-[#1C0770]/40 p-2.5 border border-slate-800 rounded">
                                <strong className="text-yellow-400 uppercase text-[8.5px] block mb-1">SUGGESTED SPECTRUM BOOSTERS:</strong>
                                <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[9.5px]">
                                  {nutritionResult.suggestedAdditions.map((item: string, idx: number) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>

                              <button
                                onClick={handleClaimNutritionCompletion}
                                className="w-full py-2.5 bg-green-500 hover:bg-white text-slate-950 font-display-hero text-xs rounded-xl border-2 border-black comic-shadow uppercase flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                VALIDATE MEAL & FUEL STATS
                              </button>
                            </motion.div>
                          )}
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>
      </section>

    </main>
  );
}
