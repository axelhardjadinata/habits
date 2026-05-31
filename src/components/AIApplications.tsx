import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Award,
  AlertCircle,
  GraduationCap,
  CheckCircle
} from "lucide-react";

interface AIApplicationsProps {
  onCompleteHabitByAI: (habitNumber: number, xpReward: number, creditsReward: number, customMessage: string) => void;
  doubleXp: boolean;
}

export default function AIApplications({ onCompleteHabitByAI, doubleXp }: AIApplicationsProps) {
  // Collapsed sections (only feynman is left in custom apps)
  const [activeTab, setActiveTab] = useState<"feynman" | null>(null);

  // General state
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const loadFeynmanPreset = (topic: string, explanation: string) => {
    setFeynmanTopic(topic);
    setFeynmanExplanation(explanation);
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

  return (
    <section id="ai-applications-section" className="flex flex-col gap-3.5 w-full mt-6 bg-[#0B024C] border-3 border-[#3A9AFF] p-5 rounded-2xl comic-shadow-accent relative">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-6 h-6 text-cyan-400" />
        <h3 className="font-display-hero text-2xl text-white uppercase italic tracking-wider text-stroke-black">
          General Applications
        </h3>
      </div>

      <p className="font-body-md text-xs text-gray-300 italic mb-3 text-left">
        Engage smart machine-learning systems to score your conceptual academic knowledge and test explanations.
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
        {/* THE FEYNMAN TUTOR TAB */}
        {/* ========================================== */}
        <div className="border-2 border-slate-700 rounded-xl overflow-hidden bg-black/30">
          <button
            id="feynman-tutor-btn"
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
                          id="preset-quantum-btn"
                          onClick={() => loadFeynmanPreset("Quantum Computers", "Normal computers solve math problems by checking lines in a maze one by one. Quantum computers are magic machines that can explore all maze tunnels at the exact same split second, using super coins that are both heads and tails at the same time.")}
                          className="bg-[#1C0770] hover:bg-[#261CC1] border border-slate-700 px-2 py-0.5 rounded text-[10px] text-white cursor-pointer"
                        >
                          🧪 Quantum Theory (Simple)
                        </button>
                        <button
                          id="preset-capitalism-btn"
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
                          id="feynman-topic-input"
                          type="text"
                          value={feynmanTopic}
                          onChange={(e) => setFeynmanTopic(e.target.value)}
                          placeholder="e.g., Photosynthesis, Black Holes, API REST..."
                          className="w-full bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-1.5 rounded text-white text-xs focus:outline-none text-left"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#3A9AFF] uppercase tracking-widest text-[8px] block mb-0.5">YOUR 5-YEAR-OLD TYPE EXPLANATION:</label>
                        <textarea
                          id="feynman-explanation-input"
                          value={feynmanExplanation}
                          onChange={(e) => setFeynmanExplanation(e.target.value)}
                          placeholder="Explain it in easy words without fancy textbook terms..."
                          rows={4}
                          className="w-full bg-slate-900 border-2 border-slate-700 focus:border-[#3A9AFF] p-2 rounded-xl text-white font-sans text-xs focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <button
                      id="feynman-submit-btn"
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

                    {feynmanResult.missedConcepts && feynmanResult.missedConcepts.length > 0 && (
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
                      id="feynman-claim-btn"
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
