import { Coins } from "lucide-react";

interface HeaderProps {
  credits: number;
}

export default function Header({ credits }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-5 py-4 border-b-4 border-[#121312] bg-[#121312] shadow-[4px_4px_0px_0px_rgba(8,0,56,1)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-[#121312] overflow-hidden bg-[#3A9AFF] shrink-0">
          <img
            alt="Hero Avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida/ADBb0ugnKdmczKzHQhPxmPLW44DkJnEzHyJJl1XZvy4--2KC4uxFLDSx_QNvy1_H-hzaMawRIdO_FhjyYP4lA3uRoIPniUJG5PNkz-Fsv7egkhqZkkC458Tce_OZkSWcEyXjfH6agR6KXhCWIHnhWWSaUfaS-7f7Xuaf-M7RaNyJ_1uGAXqJAoaO8f7lezcO-4sbvsD7NMAKB6j7ddD3sDD8bR7MQvryQFNfZmGE4LMU9Y8HIfpfy5WP46NJIZI"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl md:text-3xl font-display-hero text-[#3A9AFF] uppercase tracking-wider text-stroke-black">
          HERO HABIT
        </h1>
      </div>
      
      <div className="flex items-center gap-2 bg-[#1C0770] border-3 border-[#121312] px-3.5 py-1.5 rounded-xl comic-shadow">
        <Coins className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <span className="font-display-hero text-white tracking-widest text-lg pt-0.5 select-none">
          {credits.toLocaleString()} C
        </span>
      </div>
    </header>
  );
}
