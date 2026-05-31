import { Coins, Sparkles } from "lucide-react";

interface HeaderProps {
  credits: number;
  userPhotoUrl?: string | null;
  onInstantLevelUp?: () => void;
}

export default function Header({ credits, userPhotoUrl, onInstantLevelUp }: HeaderProps) {
  const defaultAvatar = "https://lh3.googleusercontent.com/aida/ADBb0ugnKdmczKzHQhPxmPLW44DkJnEzHyJJl1XZvy4--2KC4uxFLDSx_QNvy1_H-hzaMawRIdO_FhjyYP4lA3uRoIPniUJG5PNkz-Fsv7egkhqZkkC458Tce_OZkSWcEyXjfH6agR6KXhCWIHnhWWSaUfaS-7f7Xuaf-M7RaNyJ_1uGAXqJAoaO8f7lezcO-4sbvsD7NMAKB6j7ddD3sDD8bR7MQvryQFNfZmGE4LMU9Y8HIfpfy5WP46NJIZI";

  return (
    <header className="absolute top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-3.5 py-3 border-b-4 border-[#121312] bg-[#121312] shadow-[3px_3px_0px_0px_rgba(8,0,56,1)] shrink-0 select-none">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full border-2 border-[#121312] overflow-hidden bg-[#3A9AFF] shrink-0">
          <img
            alt="Hero Avatar"
            className="w-full h-full object-cover"
            src={userPhotoUrl || defaultAvatar}
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-xl md:text-2xl font-display-hero text-[#3A9AFF] uppercase tracking-wider text-stroke-black">
          HERO HABIT
        </h1>
      </div>
      
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#1C0770] border-2 border-[#121312] px-2.5 py-1.5 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <Coins className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-display-hero text-white tracking-wider text-xs md:text-sm pt-0.5 select-none">
            {credits.toLocaleString()} C
          </span>
        </div>

        {onInstantLevelUp && (
          <button
            onClick={onInstantLevelUp}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 border-2 border-black rounded-xl px-2 py-1.5 hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[#121312]"
            title="Instant Level Up"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current shrink-0 animate-pulse" />
            <span className="text-[10px] md:text-[11px] font-display-hero uppercase tracking-wide leading-none pt-0.5 whitespace-nowrap">LVL UP</span>
          </button>
        )}
      </div>
    </header>
  );
}
