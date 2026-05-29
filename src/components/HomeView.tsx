import { motion } from "motion/react";
import { Moon, Brain, Terminal, Zap, Shield, CheckCircle2, Circle } from "lucide-react";
import { DailyHabit } from "../types";

interface HomeViewProps {
  xp: number;
  maxXp: number;
  levelName: string;
  habits: DailyHabit[];
  onToggleHabit: (id: string) => void;
  onEnterBattle: () => void;
  doubleXp: boolean;
}

export default function HomeView({
  xp,
  maxXp,
  levelName,
  habits,
  onToggleHabit,
  onEnterBattle,
  doubleXp,
}: HomeViewProps) {
  return (
    <main className="px-5 flex flex-col gap-6 mt-24 mb-24 w-full max-w-sm mx-auto">
      
      {/* Dynamic Profile Section */}
      <section className="bg-[#1C0770] comic-border rounded-2xl p-4 comic-shadow flex items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-stripes opacity-20 pointer-events-none" />
        
        <div className="w-20 h-20 rounded-full border-3 border-[#121312] bg-[#261CC1] flex-shrink-0 relative z-10 overflow-hidden p-1">
          <img
            alt="Level 3 The Invincible Avatar"
            className="w-full h-full object-cover rounded-full bg-[#3A9AFF]"
            src="https://lh3.googleusercontent.com/aida/ADBb0ugnKdmczKzHQhPxmPLW44DkJnEzHyJJl1XZvy4--2KC4uxFLDSx_QNvy1_H-hzaMawRIdO_FhjyYP4lA3uRoIPniUJG5PNkz-Fsv7egkhqZkkC458Tce_OZkSWcEyXjfH6agR6KXhCWIHnhWWSaUfaS-7f7Xuaf-M7RaNyJ_1uGAXqJAoaO8f7lezcO-4sbvsD7NMAKB6j7ddD3sDD8bR7MQvryQFNfZmGE4LMU9Y8HIfpfy5WP46NJIZI"
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

        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const isCompleted = habit.completedToday;
            return (
              <motion.div
                whileHover={{ x: 2 }}
                onClick={() => onToggleHabit(habit.id)}
                key={habit.id}
                className={`comic-border rounded-xl p-4 flex items-center justify-between comic-shadow relative overflow-hidden cursor-pointer select-none transition-all ${
                  isCompleted 
                    ? "bg-[#1C0770]/60 border-green-500 opacity-80" 
                    : "bg-[#121312] border-[#3A9AFF] hover:border-white"
                }`}
              >
                {/* Visual strip tint background overlay in card margin */}
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#3A9AFF]/10 -skew-x-12 transform origin-bottom" />
                
                <div className="flex items-center gap-3.5 relative z-10 pr-2">
                  <div className={`w-12 h-12 rounded-lg border-2 bg-[#1C0770] flex items-center justify-center shrink-0 overflow-hidden ${
                    isCompleted ? "border-green-500 text-green-400" : "border-[#3A9AFF] text-[#3A9AFF]"
                  }`}>
                    {habit.iconName === "bedtime" ? (
                      <Moon className={`w-7 h-7 ${isCompleted ? "fill-green-500" : "fill-[#3A9AFF]"}`} />
                    ) : habit.iconName === "shield" ? (
                      <img
                        alt="Aegis Nano Shield badge"
                        className="w-10 h-10 object-contain p-0.5"
                        src="https://lh3.googleusercontent.com/aida/ADBb0uh43cBNrDsxFjRvYG_eiYIGfGHIhCzMwf_Uch9dZBkHIe068Y9PMHU1tyXgQ3omi3Zyt9uuASTBj-yVhkFnfVUN0wnO2quQ7M9rbxWAqaA7Rl4Y3gM2tT5XaK3hsQl5bUOVYFNS_T1gFe2Yr4ZgzUJVJfP_bXZBcEocfHhUqOh8WzRY-imOeHpiKK4uw4f-BMfN_tg1VHNtbH7QHA8IYyS_1Yw2IQL9rcEofrAnEE5LWo7_rkS4OzV4xDw"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Terminal className="w-7 h-7" />
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="font-label-sm text-[10px] text-[#3A9AFF] uppercase tracking-wider font-bold">
                      Habit {habit.number} {isCompleted && "✨ Completed"}
                    </span>
                    <span className={`font-body-md text-sm italic font-bold leading-tight ${
                      isCompleted ? "text-gray-400 line-through" : "text-white"
                    }`}>
                      {habit.name}
                    </span>
                  </div>
                </div>

                {/* Reward XP Badge */}
                <div className={`flex items-center gap-1 border-2 px-2.5 py-1 rounded-lg shrink-0 relative z-10 transition-colors ${
                  isCompleted 
                    ? "bg-[#1C0770] border-green-600 text-green-400" 
                    : "bg-[#1C0770] border-black text-white"
                }`}>
                  <span className={`font-display-hero text-lg ${isCompleted ? "text-green-400" : "text-[#3A9AFF]"}`}>
                    +{habit.xpReward * (doubleXp ? 2 : 1)}
                  </span>
                  <span className="font-display-hero text-xs">XP</span>
                </div>

              </motion.div>
            );
          })}
        </div>
      </section>

    </main>
  );
}
