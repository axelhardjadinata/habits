import { useState } from "react";
import { motion } from "motion/react";
import { Volume2, Sun, Moon, Gift, Ticket, CircleAlert, LogOut, User } from "lucide-react";

interface SettingsViewProps {
  volume: number;
  setVolume: (v: number) => void;
  visualMode: "DARK" | "LIGHT";
  setVisualMode: (mode: "DARK" | "LIGHT") => void;
  onRedeemCode: (code: string) => string | Promise<string>; // returns feedback message
  userEmail?: string | null;
  userDisplayName?: string | null;
  onLogOut: () => void;
}

export default function SettingsView({
  volume,
  setVolume,
  visualMode,
  setVisualMode,
  onRedeemCode,
  userEmail,
  userDisplayName,
  onLogOut,
}: SettingsViewProps) {
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!code.trim()) return;
    const msg = await onRedeemCode(code.trim().toUpperCase());
    setFeedback(msg);
    setCode("");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <main className="px-5 flex flex-col gap-6 mt-24 mb-24 w-full max-w-md mx-auto">
      
      <h2 className="font-display-hero text-3xl text-white italic mb-2 tracking-wide text-stroke-black uppercase">
        COMMAND CENTER CONFIG
      </h2>

      <div className="flex flex-col gap-6 w-full">
        
        {/* Audio Calibration Card */}
        <div className="comic-card p-5">
          <div className="flex items-start gap-4 mb-4">
            <Volume2 className="w-9 h-9 text-[#3A9AFF] filter drop-shadow-[0_0_6px_rgba(58,154,255,0.6)]" />
            <div className="flex-1">
              <h3 className="font-display-hero text-xl text-white uppercase italic tracking-wider">
                AUDIO CALIBRATION
              </h3>
              <p className="font-body-md text-xs text-gray-300 italic font-medium">
                Vanguard Operative Music Volume
              </p>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-label-sm text-[10px] text-gray-400 italic">SYSTEM STATUS: ACTIVE</span>
              <span className="font-label-sm text-xs text-[#3A9AFF] italic">Volume: {volume}%</span>
            </div>
            <div className="px-1 py-2">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-[#3A9AFF] cursor-pointer h-2 bg-black rounded"
              />
            </div>
          </div>
        </div>

        {/* Visual Protocols Card */}
        <div className="comic-card p-5">
          <div className="flex items-start gap-4 mb-4">
            {visualMode === "DARK" ? (
              <Moon className="w-9 h-9 text-[#FFD700] fill-[#FFD700]" />
            ) : (
              <Sun className="w-9 h-9 text-[#FFD700] fill-[#FFD700]" />
            )}
            <div className="flex-1">
              <h3 className="font-display-hero text-xl text-white uppercase italic tracking-wider">
                VISUAL PROTOCOLS
              </h3>
              <p className="font-body-md text-xs text-gray-300 italic font-medium">
                App Environmental Filter Mode
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 mt-2">
            <span className="font-label-sm text-[10px] text-gray-400 italic">
              Active: {visualMode} MODE
            </span>
            <div className="flex bg-[#080038] border-2 border-black rounded-xl overflow-hidden w-full">
              <button
                onClick={() => setVisualMode("LIGHT")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 font-display-hero text-sm transition-colors cursor-pointer ${
                  visualMode === "LIGHT"
                    ? "bg-[#3A9AFF] text-[#121212] font-bold"
                    : "text-gray-400 hover:bg-white/10"
                }`}
              >
                LIGHT
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisualMode("DARK")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 font-display-hero text-sm transition-colors cursor-pointer ${
                  visualMode === "DARK"
                    ? "bg-[#3A9AFF] text-[#121212] font-bold"
                    : "text-gray-400 hover:bg-white/10"
                }`}
              >
                DARK
                <Moon className="w-4 h-4 fill-[#121212]" />
              </button>
            </div>
          </div>
        </div>

        {/* Redeem Vanguard Codes Card */}
        <div className="comic-card p-5">
          <div className="flex items-start gap-4 mb-3">
            <Ticket className="w-9 h-9 text-[#3A9AFF] animate-pulse" />
            <div className="flex-1">
              <h3 className="font-display-hero text-xl text-white uppercase italic tracking-wider">
                REDEEM VANGUARD CODES
              </h3>
              <p className="font-body-md text-xs text-gray-300 italic font-medium">
                Claim Vanguard Reward Drops
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE (e.g. VANGUARD)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                className="comic-input flex-grow px-3 py-2 font-body-md text-xs italic bg-black/60 rounded"
              />
              <button
                onClick={handleClaim}
                className="comic-button px-4 py-2 font-display-hero text-xs tracking-wider uppercase rounded-lg bg-[#3A9AFF] text-[#121212] hover:bg-white transition-all cursor-pointer select-none"
              >
                REDEEM
              </button>
            </div>
            
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-2 border-2 text-[10px] uppercase font-pixel tracking-tighter text-center rounded ${
                  feedback.includes("FAILED") || feedback.includes("INVALID")
                    ? "bg-red-950 border-red-500 text-red-300"
                    : "bg-green-950 border-green-500 text-green-300"
                }`}
              >
                {feedback}
              </motion.div>
            )}
          </div>
        </div>

        {/* Secure User Session & Logout Card */}
        <div className="comic-card p-5 border-[#FF3A5C]">
          <div className="flex items-start gap-4 mb-4">
            <User className="w-9 h-9 text-[#FF3A5C]" />
            <div className="flex-1 text-left">
              <h3 className="font-display-hero text-xl text-white uppercase italic tracking-wider">
                VANGUARD ACCOUNT
              </h3>
              <p className="font-body-md text-xs text-gray-300 italic font-medium">
                Authenticated Operator Session
              </p>
            </div>
          </div>

          <div className="bg-black/30 p-3.5 comic-border rounded-xl text-left flex flex-col gap-1.5 mb-4 font-mono text-xs text-gray-300">
            <div>
              <span className="text-[#3A9AFF] font-bold uppercase mr-1">OPERATOR:</span>
              <span className="text-white font-bold">{userDisplayName || "COSMIC GUARDIAN"}</span>
            </div>
            <div className="truncate">
              <span className="text-[#3A9AFF] font-bold uppercase mr-1">ENCRYPT_ID:</span>
              <span className="text-white tracking-widest">{userEmail || "anonymous@vanguard.org"}</span>
            </div>
          </div>

          <button
            onClick={onLogOut}
            className="w-full flex items-center justify-center gap-2.5 font-display-hero text-sm uppercase tracking-wider py-3 px-4 rounded-xl border-3 border-black comic-shadow bg-[#FF3A5C] hover:bg-white text-white hover:text-black transition-all cursor-pointer select-none"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            SIGN OUT PROTOCOL
          </button>
        </div>

      </div>

    </main>
  );
}
