import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Moon,
  Sun,
  Utensils,
  Brain,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  RefreshCw,
  Award,
  AlertCircle,
  HelpCircle,
  FileText,
  Activity,
  Mic,
  Smile,
  GraduationCap
} from "lucide-react";

interface AIApplicationsProps {
  onCompleteHabitByAI: (habitNumber: number, xpReward: number, creditsReward: number, customMessage: string) => void;
  doubleXp: boolean;
}

export default function AIApplications({ onCompleteHabitByAI, doubleXp }: AIApplicationsProps) {
  // Collapsed sections
  const [activeTab, setActiveTab] = useState<"sleep" | "nutrition" | "brain" | "feynman" | null>(null);

  // General state
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Sleep/Sunlight Synchronizer state ---
  const [morningTime, setMorningTime] = useState<string>("07:30");
  const [sleepResult, setSleepResult] = useState<any | null>(null);

  // --- Nutrition state ---
  const [mealText, setMealText] = useState<string>("");
  const [nutritionResult, setNutritionResult] = useState<any | null>(null);
  const [mealImageBase64, setMealImageBase64] = useState<string | null>(null);
  const [mealImageMime, setMealImageMime] = useState<string | null>(null);

  // --- Brain Dump state ---
  const [brainDumpText, setBrainDumpText] = useState<string>("");
  const [brainResult, setBrainResult] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // --- Feynman Tutor state ---
  const [feynmanTopic, setFeynmanTopic] = useState<string>("");
  const [feynmanExplanation, setFeynmanExplanation] = useState<string>("");
  const [feynmanResult, setFeynmanResult] = useState<any | null>(null);

  // Trigger loading helper
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
  const loadMealPreset = (name: string, text: string) => {
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

  // Dynamic file upload mock reader
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

  // 1. Trigger Circadian Sync
  const handleTriggerSleepSync = () => {
    executeAIScoring("/api/ai/sleep-sunset", { morningSunlightTime: morningTime }, (data) => {
      setSleepResult(data);
    });
  };

  // 1. Claim sleep completion reward
  const handleClaimSleepCompletion = () => {
    if (!sleepResult) return;
    onCompleteHabitByAI(
      1,
      25,
      15,
      `⏰ SUNLIGHT ALIGNMENT CONFIRMED: Digital Sunset Alarm calibrated at ${sleepResult.sunsetTime}! Sleep habit synchronization loaded.`
    );
    setSleepResult(null);
    setActiveTab(null);
  };

  // 2. Trigger Nutrition analysis
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

  // 2. Claim nutrition completion reward
  const handleClaimNutritionCompletion = () => {
    if (!nutritionResult) return;
    onCompleteHabitByAI(
      4, // Special bonus XP/credits or maps back to dynamic lists
      30,
      20,
      `🥗 DIETARY FUEL SYNCHRONIZED: Meal analyzed with Grade ${nutritionResult.vitaminVarietyRating}. 3-Color spectrum verified!`
    );
    setNutritionResult(null);
    setActiveTab(null);
  };

  // 3. Trigger Brain dump
  const handleTriggerBrainDump = () => {
    executeAIScoring("/api/ai/brain-dump", { text: brainDumpText }, (data) => {
      setBrainResult(data);
    });
  };

  // 3. Simulated Dictaphone
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

  // 3. Claim brain dump completion reward
  const handleClaimBrainCompletion = () => {
    if (!brainResult) return;
    onCompleteHabitByAI(
      2,
      25,
      15,
      `🧠 COGNITIVE BUFFER CLEARED: Action items processed. Screen-Free habit synced for tactical focus!`
    );
    setBrainResult(null);
    setActiveTab(null);
  };

  // 4. Trigger Feynman scoring
  const handleTriggerFeynman = () => {
    executeAIScoring("/api/ai/feynman-eval", { topic: feynmanTopic, explanation: feynmanExplanation }, (data) => {
      setFeynmanResult(data);
    });
  };

  // 4. Claim Feynman study reward
  const handleClaimFeynmanCompletion = () => {
    if (!feynmanResult) return;
    onCompleteHabitByAI(
      3,
      50,
      25,
      `🎓 CONCEPT MASTERED! Score ${feynmanResult.clarityScore}% simple-analogy achieved. Academic study zone habit unlocked!`
    );
    setFeynmanResult(null);
    setActiveTab(null);
  };

  const getVarietyBadgeClass = (rating: string) => {
    const r = rating.toUpperCase();
    if (r.includes("A") || r.includes("DIVERSE")) return "bg-green-600 border-green-400 text-white";
    if (r.includes("B") || r.includes("GOOD")) return "bg-yellow-600 border-yellow-400 text-white";
    return "bg-red-600 border-red-400 text-white";
  };

  return (
    <section className="flex flex-col gap-3.5 w-full mt-6 bg-[#0B024C] border-3 border-[#3A9AFF] p-5 rounded-2xl comic-shadow-accent relative">

      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" />
        <h3 className="font-display-hero text-2xl text-white uppercase italic tracking-wider text-stroke-black">
          General Applications
        </h3>
      </div>

      <p className="font-body-md text-xs text-gray-300 italic mb-3 text-left">
        Engage smart machine-learning systems to verify your actions, align sleeping patterns, organize chaotic minds, and score conceptual academic knowledge.
      </p>

      {errorMsg && (
        <div className="bg-red-950/80 text-red-300 border-2 border-red-500 rounded-xl p-3 flex gap-2 items-start text-xs text-left">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <div>
            <p className="font-bold">INTEGRATED COGNITIVE ERROR</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* TABS SELECTOR LIST */}
      <div className="flex flex-col gap-2.5">
        {/* ========================================== */}
        {/* SLEEP & SUNLIGHT SYNCHRONIZER TAB */}
        {/* ========================================== */}
        <div className="border-2 border-slate-700 rounded-xl overflow-hidden bg-black/30">
          <button
            onClick={() => {
              setActiveTab(activeTab === "sleep" ? null : "sleep");
              setErrorMsg(null);
            }}
            className="w-full flex justify-between items-center px-4 py-3 bg-[#130B62] hover:bg-[#1D147A] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-yellow-500/10 border border-yellow-400 flex items-center justify-center text-yellow-400">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="font-display-hero text-sm text-white uppercase tracking-wider">
                  Sleep/Sunlight Synchronizer
                </h4>
                <p className="text-[10px] text-yellow-300 uppercase font-mono">The Sunlight Anchor</p>
              </div>
            </div>
            {activeTab === "sleep" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          <AnimatePresence>
            {activeTab === "sleep" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 border-t border-slate-800 text-left text-xs text-slate-200"
              >
                {!sleepResult ? (
                  <div className="flex flex-col gap-3">
                    <p className="leading-relaxed">
                      By recording when you look at natural bright morning sunlight, the AI calculates your exact biochemical serotonin peak and maps a **Digital Sunset alarm exactly 14 hours later** for melatonin conversion.
                    </p>

                    <div className="bg-black/40 rounded-xl p-3 border border-slate-800 flex flex-col gap-2">
                      <label className="font-bold text-yellow-400 uppercase tracking-widest text-[9px] block">
                        CHOOSE LOG TIME OF MORNING SUNLIGHT:
                      </label>
                      <div className="flex gap-2 items-center">
                        <Sun className="w-5 h-5 text-yellow-400 shrink-0" />
                        <input
                          type="time"
                          value={morningTime}
                          onChange={(e) => setMorningTime(e.target.value)}
                          className="bg-slate-900 border-2 border-[#3A9AFF] p-1.5 rounded text-white font-mono text-sm uppercase focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 italic">Recommended: 06:30 - 08:30 AM</span>
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
                          CALCULATING CIRCADIAN SPECTRUM...
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          LOG SUNLIGHT & RUN AI ESTIMATOR
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
                      Circadian Profile Calibrated
                    </h5>

                    <div className="grid grid-cols-2 gap-3 bg-black/40 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-[9px] text-[#3A9AFF] uppercase font-bold">Morning Input</div>
                        <div className="font-mono text-sm text-white font-bold">{morningTime}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-orange-400 uppercase font-bold">DIGITAL SUNSET</div>
                        <div className="font-mono text-sm text-yellow-400 font-bold">{sleepResult.sunsetTime}</div>
                      </div>
                    </div>

                    <div className="bg-black/30 p-2.5 border-l-2 border-[#3A9AFF] text-gray-300 italic">
                      <strong className="text-white block not-italic uppercase text-[9px] tracking-wider mb-0.5">VANGUARD SECURE INSIGHT:</strong>
                      {sleepResult.insight}
                    </div>

                    <div>
                      <span className="text-[9px] text-yellow-300 font-bold uppercase tracking-wider block mb-1">SUNSET ECO-PREPARATION STATS:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        {sleepResult.tips.map((tip: string, idx: number) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#1C0770]/40 p-2 border border-slate-700 rounded text-[10px] text-cyan-200">
                      <strong className="text-white uppercase text-[8px] block mb-0.5">ENVIRONMENT ACTION:</strong>
                      {sleepResult.environment}
                    </div>

                    <button
                      onClick={handleClaimSleepCompletion}
                      className="w-full py-3 mt-1 bg-green-500 hover:bg-white text-slate-950 hover:text-slate-900 font-display-hero text-xs rounded-xl border-2 border-black comic-shadow uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      SYNC DIGITAL SUNSET & CLAIM XP
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================== */}
        {/* NUTRITION ANALYSIS - RAINBOW PLATE TAB */}
        {/* ========================================== */}
        <div className="border-2 border-slate-700 rounded-xl overflow-hidden bg-black/30">
          <button
            onClick={() => {
              setActiveTab(activeTab === "nutrition" ? null : "nutrition");
              setErrorMsg(null);
            }}
            className="w-full flex justify-between items-center px-4 py-3 bg-[#130B62] hover:bg-[#1D147A] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-green-500/10 border border-green-400 flex items-center justify-center text-green-400">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="font-display-hero text-sm text-white uppercase tracking-wider">
                  Nutrition Analysis
                </h4>
                <p className="text-[10px] text-green-300 uppercase font-mono">The Rainbow Plate</p>
              </div>
            </div>
            {activeTab === "nutrition" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          <AnimatePresence>
            {activeTab === "nutrition" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 border-t border-slate-800 text-left text-xs text-slate-200"
              >
                {!nutritionResult ? (
                  <div className="flex flex-col gap-3">
                    <p className="leading-relaxed">
                      Instead of manual logging, describe or snap a dinner plate. Our AI verifies if it meets the **3-Color Rule** for optimal nutritional variety.
                    </p>

                    <div>
                      <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider block mb-1">FAST TRIAL PRESETS:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => loadMealPreset("salad", "Mediterranean Salad: Fresh baby spinach, sliced red tomatoes, yellow bell peppers, red onion, salmon fillet, and cold-pressed olive oil.")}
                          className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-1 rounded text-[10px] text-white cursor-pointer"
                        >
                          🥗 Salad & Salmon (3-Color)
                        </button>
                        <button
                          onClick={() => loadMealPreset("steak", "Sirloin heavy beef steak, white mashed potatoes, butter slice.")}
                          className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-1 rounded text-[10px] text-white cursor-pointer"
                        >
                          🥩 Beef & Mash (Limited)
                        </button>
                        <button
                          onClick={() => loadMealPreset("shake", "Protein Smoothie: Blueberries, red strawberries, chia seeds, dark oats, coconut milk.")}
                          className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-1 rounded text-[10px] text-white cursor-pointer"
                        >
                          🥤 Berry Catalyst (2-Color)
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="font-bold text-[#3A9AFF] uppercase tracking-widest text-[9px]">
                        DESCRIBE MEAL DIETARY COMPOSITION:
                      </label>
                      <textarea
                        value={mealText}
                        onChange={(e) => setMealText(e.target.value)}
                        placeholder="e.g. Scrambled eggs, sliced avocados, green kale, blueberies, wholegrain toast..."
                        rows={3}
                        className="bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-2 rounded-xl text-white font-sans text-xs focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-[#3A9AFF]" />
                        OR CHOOSE IMAGE PROOF:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMealImageUpload}
                        className="block w-full text-[10px] text-slate-400
                          file:mr-3 file:py-1.5 file:px-3
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
                          ANALYZING HEALTH LEVEL SPECTRUMS...
                        </>
                      ) : (
                        <>
                          <Utensils className="w-4 h-4" />
                          RUN NUTRITIONAL ANALYSIS
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
                      Nutrition Report Generated
                    </h5>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-black/40 p-2 rounded border border-slate-800">
                        <div className="text-[8px] text-green-400 uppercase font-bold mb-1">COLOR SPECTRUM</div>
                        <div className="flex flex-wrap gap-1">
                          {nutritionResult.colorsDetected.map((c: string, i: number) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 border rounded-full text-[9px] font-bold uppercase style-chips"
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
                          <div className="text-[8px] text-[#3A9AFF] uppercase font-bold">3-COLOR STATUS</div>
                          <span className={`text-[10px] font-bold ${nutritionResult.threeColorRuleMet ? "text-green-400" : "text-amber-400"}`}>
                            {nutritionResult.threeColorRuleMet ? "✓ RULE ENGAGED" : "✗ SPECTRUM INADEQUATE"}
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

                    <div className="bg-black/30 p-2.5 border-l-2 border-green-500 text-slate-300">
                      <strong className="text-white block uppercase text-[9px] mb-0.5 tracking-wider">AI VITAMIN SYNAPSE FEEDBACK:</strong>
                      {nutritionResult.nutritionalInsight}
                    </div>

                    <div className="bg-[#1C0770]/40 p-2.5 border border-slate-800 rounded">
                      <strong className="text-yellow-400 uppercase text-[9px] block mb-1">RAINBOW ADDITION TRIGGERS:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                        {nutritionResult.suggestedAdditions.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={handleClaimNutritionCompletion}
                      className="w-full py-3 mt-1 bg-green-500 hover:bg-white text-slate-950 font-display-hero text-xs rounded-xl border-2 border-black comic-shadow uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      LOG BALANCED MEAL & FUEL STATED
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* ========================================== */}
        {/* BRAIN DUMP ORGANIZER TAB */}
        {/* ========================================== */}
        <div className="border-2 border-slate-700 rounded-xl overflow-hidden bg-black/30">
          <button
            onClick={() => {
              setActiveTab(activeTab === "brain" ? null : "brain");
              setErrorMsg(null);
            }}
            className="w-full flex justify-between items-center px-4 py-3 bg-[#130B62] hover:bg-[#1D147A] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#a251ff]/10 border border-[#a251ff] flex items-center justify-center text-[#a251ff]">
                <Brain className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="font-display-hero text-sm text-white uppercase tracking-wider">
                  Brain Dump Organizer
                </h4>
                <p className="text-[10px] text-[#b87fff] uppercase font-mono">The Brain Dump</p>
              </div>
            </div>
            {activeTab === "brain" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          <AnimatePresence>
            {activeTab === "brain" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 border-t border-slate-800 text-left text-xs text-slate-200"
              >
                {!brainResult ? (
                  <div className="flex flex-col gap-3">
                    <p className="leading-relaxed">
                      Record or type your unstructured, cluttered thoughts first thing in the morning to offload pressure. Our AI extracts actionable chores, isolates real stressors, and delivers a clean mind.
                    </p>

                    <div>
                      <span className="text-[9px] text-[#a251ff] font-bold uppercase tracking-wider block mb-1 font-mono">SIMULATION PRESET:</span>
                      <button
                        onClick={() => loadBrainPreset("Worrying about study exams coming up, need to fix my daily habits, have to walk the dog, didn't drink enough water today and my brain feels dry. I'm afraid I won't succeed on the physical agility check.")}
                        className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-1 rounded text-[10px] text-white cursor-pointer"
                      >
                        ✍🏼 Load Stress Clutter
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="font-bold text-[#3A9AFF] uppercase tracking-widest text-[9px] block">
                        WRITE DOWN YOUR MENTAL LOG PAGES:
                      </label>
                      <textarea
                        value={brainDumpText}
                        onChange={(e) => setBrainDumpText(e.target.value)}
                        placeholder="Pour every anxiety, to-do, stressor, or random thought directly into this box..."
                        rows={4}
                        className="bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-2 rounded-xl text-white font-sans text-xs focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={toggleRecordingSim}
                        className={`flex-1 py-2 rounded-lg border border-black flex items-center justify-center gap-2 font-display-hero text-[10px] cursor-pointer ${
                          isRecording ? "bg-red-600 text-white animate-pulse" : "bg-[#1C0770] text-slate-300"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        {isRecording ? "STOP RECORDING & TRANSCRIBE" : "🎙️ TRANSCRIBE VERBAL VOICE"}
                      </button>

                      <button
                        onClick={handleTriggerBrainDump}
                        disabled={loading || !brainDumpText.trim()}
                        className="flex-1 py-1 bg-gradient-to-r from-purple-500 to-[#a251ff] text-slate-950 font-display-hero text-xs rounded-lg border-2 border-black comic-shadow-accent uppercase flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ORGANIZING SYSTOLE...
                          </>
                        ) : (
                          <>
                            <Brain className="w-3.5 h-3.5" />
                            REFINE BRAIN
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
                      Cognitive Alignment Complete
                    </h5>

                    <div className="bg-black/30 p-2.5 rounded border border-slate-800">
                      <div className="text-[8px] text-[#a251ff] uppercase font-bold mb-1">OFFLOAD SUMMARY</div>
                      <p className="text-slate-300 leading-tight italic">{brainResult.summary}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider block mb-1">ACTIONABLE TASK MATRIX (UNCLUTTERED):</span>
                      <div className="space-y-1 bg-black/40 p-2.5 rounded border border-slate-800">
                        {brainResult.actionableTodoList.map((task: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-300">
                            <input type="checkbox" className="rounded bg-slate-900 border-slate-700" />
                            <span className="text-[11px] leading-tight">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-[#FF3A5C] font-bold uppercase tracking-wider block mb-1">ISOLATED WORRIES / RECURRING STRESS CONSTRAINTS:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {brainResult.recurringStressors.map((str: string, idx: number) => (
                          <span key={idx} className="bg-red-950/40 border border-red-900 px-2 py-0.5 rounded text-[9.5px] font-mono text-red-300 uppercase">
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
                      className="w-full py-3 mt-1 bg-green-500 hover:bg-white text-slate-950 font-display-hero text-xs rounded-xl border-2 border-black comic-shadow uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      DEPOSIT WORRIES & SECURE FREE MIND
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* ========================================== */}
        {/* THE FEYNMAN TUTOR TAB */}
        {/* ========================================== */}
        <div className="border-2 border-slate-700 rounded-xl overflow-hidden bg-black/30">
          <button
            onClick={() => {
              setActiveTab(activeTab === "feynman" ? null : "feynman");
              setErrorMsg(null);
            }}
            className="w-full flex justify-between items-center px-4 py-3 bg-[#130B62] hover:bg-[#1D147A] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="font-display-hero text-sm text-white uppercase tracking-wider">
                  The Feynman Tutor
                </h4>
                <p className="text-[10px] text-cyan-300 uppercase font-mono">The Learning Habit</p>
              </div>
            </div>
            {activeTab === "feynman" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          <AnimatePresence>
            {activeTab === "feynman" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 border-t border-slate-800 text-left text-xs text-slate-200"
              >
                {!feynmanResult ? (
                  <div className="flex flex-col gap-3">
                    <p className="leading-relaxed">
                      Explain a complex topic in extremely simple terms, as if explaining it to a **5-year-old child**. The AI processes conceptual clarity and evaluates whether you have truly mastered the knowledge.
                    </p>

                    <div>
                      <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block mb-1 font-mono">LOAD DEMO CLARITY PRESETS:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => loadFeynmanPreset("Quantum Computers", "Normal computers solve math problems by checking lines in a maze one by one. Quantum computers are magic machines that can explore all maze tunnels at the exact same split second, using super coins that are both heads and tails at the same time.")}
                          className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-0.5 rounded text-[10px] text-white cursor-pointer"
                        >
                          🧪 Quantum Theory (Simple)
                        </button>
                        <button
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
                          className="w-full bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-1.5 rounded text-white text-xs focus:outline-none"
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
                    className="flex flex-col gap-3 bg-[#001D2C] border-2 border-cyan-500 p-4 rounded-xl relative"
                  >
                    <div className="absolute top-2 right-2">
                      <button onClick={() => setFeynmanResult(null)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <h5 className="font-display-hero text-sm text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Feynman Mastery Index
                    </h5>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-black/40 p-2.5 rounded border border-slate-800 flex flex-col justify-center items-center text-center">
                        <span className="text-[8px] text-cyan-400 uppercase font-bold">CLARITY SCORE</span>
                        <span className="font-display-hero text-2xl text-white font-black mt-1">
                          {feynmanResult.clarityScore}%
                        </span>
                        <div className="h-2 w-full max-w-[80px] bg-slate-800 rounded-full overflow-hidden mt-1 text-stroke-thin relative">
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

                    {feynmanResult.missedConcepts.length > 0 && (
                      <div className="bg-red-950/25 border border-red-900/40 p-2.5 rounded">
                        <strong className="text-[#FF3A5C] uppercase text-[9px] block mb-1">OMITTED CORE INSIGHTS (NEED COVERAGE):</strong>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[10px]">
                          {feynmanResult.missedConcepts.map((missed: string, idx: number) => (
                            <li key={idx}>{missed}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-[#1C0770]/40 p-2.5 border border-slate-800 rounded">
                      <strong className="text-[#3A9AFF] uppercase text-[9px] block mb-1">IDEAL 5-YEAR-OLD METAPHOR ANALOG:</strong>
                      <p className="text-[10px] text-cyan-200 leading-relaxed italic">
                        "{feynmanResult.revisedExplanationExample}"
                      </p>
                    </div>

                    <button
                      onClick={handleClaimFeynmanCompletion}
                      className="w-full py-3 mt-1 bg-green-500 hover:bg-white text-slate-950 font-display-hero text-xs rounded-xl border-2 border-black comic-shadow uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      COMMIT UNDERSTANDING & ACQUIRE EXP
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
