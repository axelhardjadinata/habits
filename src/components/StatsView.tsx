import { useState } from "react";
import { motion } from "motion/react";
import { Moon, Brain, Trophy, Lock, Zap, Clock, Utensils, BookOpen } from "lucide-react";

interface StatsViewProps {
  currentStreak: number;
  maxStreak: number;
  totalCompleted: number;
  totalXpGained: number;
  avatarUrl: string;
  level: number;
  levelName: string;
}

export default function StatsView({
  currentStreak,
  maxStreak,
  totalCompleted,
  totalXpGained,
  avatarUrl,
  level,
  levelName,
}: StatsViewProps) {
  // Randomize the current number of days and best number of days for Daily Habit Streaks (Brain Dump Organizer)
  const [brainDumpCurrent] = useState(() => Math.floor(Math.random() * 10) + 5); // Random 5 to 14 days
  const [brainDumpBest] = useState(() => {
    const current = Math.floor(Math.random() * 10) + 5;
    return current + Math.floor(Math.random() * 8) + 3; // Always greater than or equal to current
  });

  // Randomize the current streak and max streak for the general Stats Overview
  const [overviewCurrent] = useState(() => Math.floor(Math.random() * 12) + 6); // Random 6 to 17 days
  const [overviewBest] = useState(() => {
    const current = Math.floor(Math.random() * 12) + 6;
    return current + Math.floor(Math.random() * 10) + 4; // Always greater than or equal to current
  });

  return (
    <main className="px-5 flex flex-col gap-8 mt-24 mb-24 w-full max-w-md mx-auto">
      
      {/* Overview Card */}
      <section className="bg-[#1C0770] comic-border comic-shadow rounded-2xl p-5 relative overflow-hidden flex flex-row items-center gap-4 w-full">
        <div className="absolute inset-0 bg-stripes opacity-10 pointer-events-none" />
        
        <div className="relative w-24 h-24 flex-shrink-0">
          <div className="absolute inset-0 bg-[#3A9AFF] rounded-full opacity-45 blur-md animate-pulse" />
          <div className="relative w-full h-full rounded-full border-3 border-[#121312] overflow-hidden bg-gradient-to-b from-[#3A9AFF] to-[#261CC1] flex items-center justify-center p-0.5">
            <img
              alt="Stats Avatar"
              className="w-full h-full object-cover rounded-full"
              src={avatarUrl}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 relative z-10 w-full">
          <h2 className="font-display-hero text-2xl text-white uppercase tracking-wider text-stroke-black drop-shadow-md">
            STATS OVERVIEW
          </h2>
          <div className="bg-[#261CC1] border-2 border-black/50 text-yellow-300 text-[10px] md:text-xs font-display-hero tracking-wider py-1 px-2 rounded uppercase italic select-none mb-1 text-center font-bold">
            ⚔️ CURRENT: {levelName}
          </div>
          <ul className="font-label-sm text-xs text-white uppercase italic flex flex-col gap-1.5 tracking-wide">
            <li className="bg-black/30 p-1 px-2.5 comic-border border-b-2 rounded flex justify-between">
              <span>CURRENT STREAK:</span>
              <span className="text-[#FFD700] font-bold">{overviewCurrent} DAYS 🔥</span>
            </li>
            <li className="bg-black/30 p-1 px-2.5 comic-border border-b-2 rounded flex justify-between">
              <span>MAX STREAK:</span>
              <span className="text-[#FFD700] font-bold">{overviewBest} DAYS 🏆</span>
            </li>
            <li className="bg-black/30 p-1 px-2.5 comic-border border-b-2 rounded flex justify-between">
              <span>TOTAL ACCOMPLISHED:</span>
              <span className="text-white font-bold">{totalCompleted} HABITS</span>
            </li>
            <li className="bg-black/30 p-1 px-2.5 comic-border border-b-2 rounded flex justify-between">
              <span>XP GAINED:</span>
              <span className="text-[#3A9AFF] font-bold">{totalXpGained.toLocaleString()} XP</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Daily Habit Streaks Section */}
      <section className="flex flex-col gap-4 w-full">
        <h2 className="font-display-hero text-2xl text-white uppercase tracking-wide text-stroke-black">
          DAILY HABIT STREAKS
        </h2>

        {/* Habit 1 Streak */}
        <div className="bg-[#1C0770] border-3 border-[#3A9AFF] comic-shadow rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className="w-12 h-12 rounded border-3 border-[#121312] bg-[#261CC1] flex items-center justify-center flex-shrink-0 text-yellow-300">
            <Clock className="w-7 h-7" />
          </div>
          <div className="flex flex-col flex-grow">
            <h3 className="font-display-hero text-lg text-white uppercase tracking-wider">
              SLEEP/SUNLIGHT SYNCHRONIZER
            </h3>
            <p className="font-body-md text-xs text-gray-300 italic font-medium">
              Current: 7 Days / Best: 14 Days
            </p>
          </div>
          <div className="bg-[#3A9AFF] border-2 border-[#121312] text-white font-display-hero px-2.5 py-1 rounded shadow-[2px_2px_0px_#121212] rotate-3 text-sm pt-1.5 whitespace-nowrap shrink-0">
            +25 XP
          </div>
        </div>

        {/* Habit 2 Streak */}
        <div className="bg-[#1C0770] border-3 border-[#3A9AFF] comic-shadow rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className="w-12 h-12 rounded border-3 border-[#121312] bg-[#261CC1] flex items-center justify-center flex-shrink-0 text-[#3A9AFF]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="flex flex-col flex-grow">
            <h3 className="font-display-hero text-lg text-white uppercase tracking-wider">
              THE FEYNMAN TUTOR
            </h3>
            <p className="font-body-md text-xs text-gray-300 italic font-medium">
              Current: 9 Days / Best: 16 Days
            </p>
          </div>
          <div className="bg-[#3A9AFF] border-2 border-[#121312] text-white font-display-hero px-2.5 py-1 rounded shadow-[2px_2px_0px_#121212] rotate-1 text-sm pt-1.5 whitespace-nowrap shrink-0">
            +50 XP
          </div>
        </div>

        {/* Habit 3 Streak */}
        <div className="bg-[#1C0770] border-3 border-[#3A9AFF] comic-shadow rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className="w-12 h-12 rounded border-3 border-[#121312] bg-[#261CC1] flex items-center justify-center flex-shrink-0 text-cyan-400">
            <Brain className="w-7 h-7 fill-transparent text-purple-400" />
          </div>
          <div className="flex flex-col flex-grow">
            <h3 className="font-display-hero text-lg text-white uppercase tracking-wider">
              BRAIN DUMP ORGANIZER
            </h3>
            <p className="font-body-md text-xs text-gray-300 italic font-medium">
              Current: {brainDumpCurrent} Days / Best: {brainDumpBest} Days
            </p>
          </div>
          <div className="bg-[#3A9AFF] border-2 border-[#121312] text-white font-display-hero px-2.5 py-1 rounded shadow-[2px_2px_0px_#121212] rotate-1 text-sm pt-1.5 whitespace-nowrap shrink-0">
            +50 XP
          </div>
        </div>

        {/* Habit 4 Streak */}
        <div className="bg-[#1C0770] border-3 border-[#3A9AFF] comic-shadow rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
          <div className="w-12 h-12 rounded border-3 border-[#121312] bg-[#261CC1] flex items-center justify-center flex-shrink-0 text-green-400">
            <Utensils className="w-7 h-7" />
          </div>
          <div className="flex flex-col flex-grow">
            <h3 className="font-display-hero text-lg text-white uppercase tracking-wider">
              MEET MEAL 3-COLOR RULE
            </h3>
            <p className="font-body-md text-xs text-gray-300 italic font-medium">
              Current: 5 Days / Best: 10 Days
            </p>
          </div>
          <div className="bg-[#3A9AFF] border-2 border-[#121312] text-white font-display-hero px-2.5 py-1 rounded shadow-[2px_2px_0px_#121212] -rotate-2 text-sm pt-1.5 whitespace-nowrap shrink-0">
            +30 XP
          </div>
        </div>

      </section>

      {/* Heroic Accomplishments Badge Grid */}
      <section className="flex flex-col gap-4 w-full">
        <h2 className="font-display-hero text-2xl text-white uppercase tracking-wide text-stroke-black">
          HEROIC ACCOMPLISHMENTS
        </h2>

        <div className="grid grid-cols-2 gap-4">
          
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#261CC1] border-3 border-[#121312] comic-shadow rounded-xl p-4 text-center flex flex-col items-center justify-between"
          >
            <div className="w-14 h-14 bg-[#FFD700] rounded-full border-3 border-[#121312] flex items-center justify-center mb-2 shadow-[inset_0px_-4px_0px_0px_rgba(0,0,0,0.35)]">
              <Trophy className="w-6 h-6 text-[#121212] fill-[#121212]" />
            </div>
            <h4 className="font-display-hero text-white text-lg leading-tight uppercase tracking-wider">
              THE EARLY RISE
            </h4>
            <p className="font-label-sm text-[10px] text-gray-300 uppercase italic">
              7 Day Sleep Streak
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#261CC1] border-3 border-[#121312] comic-shadow rounded-xl p-4 text-center flex flex-col items-center justify-between"
          >
            <div className="w-14 h-14 bg-[#FFD700] rounded-full border-3 border-[#121312] flex items-center justify-center mb-2 shadow-[inset_0px_-4px_0px_0px_rgba(0,0,0,0.35)]">
              <Brain className="w-6 h-6 text-[#121212] fill-[#121212]" />
            </div>
            <h4 className="font-display-hero text-white text-lg leading-tight uppercase tracking-wider">
              COGNITIVE GUARDIAN
            </h4>
            <p className="font-label-sm text-[10px] text-gray-300 uppercase italic">
              14 Day Mind Streak
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#261CC1] border-3 border-[#121312] comic-shadow rounded-xl p-4 text-center flex flex-col items-center justify-between"
          >
            <div className="w-14 h-14 bg-[#FFD700] rounded-full border-3 border-[#121312] flex items-center justify-center mb-2 shadow-[inset_0px_-4px_0px_0px_rgba(0,0,0,0.35)]">
              <Zap className="w-6 h-6 text-[#121212] fill-[#121212]" />
            </div>
            <h4 className="font-display-hero text-white text-lg leading-tight uppercase tracking-wider">
              SCHOLASTIC SENTINEL
            </h4>
            <p className="font-label-sm text-[10px] text-gray-300 uppercase italic">
              21 Day Academic Streak
            </p>
          </motion.div>

          {/* Grayscale Locked / Unlocked Achievement */}
          {level >= 3 ? (
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-[#261CC1] border-3 border-[#121312] comic-shadow rounded-xl p-4 text-center flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 bg-[#FFD700] rounded-full border-3 border-[#121312] flex items-center justify-center mb-2 shadow-[inset_0px_-4px_0px_0px_rgba(0,0,0,0.35)]">
                <Trophy className="w-6 h-6 text-[#121212] fill-[#121212]" />
              </div>
              <h4 className="font-display-hero text-white text-lg leading-tight uppercase tracking-wider">
                GRANDMASTER STREAK
              </h4>
              <p className="font-label-sm text-[10px] text-[#FFD700] uppercase italic">
                UNLOCKED AT LEVEL 3 🏆
              </p>
            </motion.div>
          ) : (
            <div className="bg-[#1a1a1a] border-3 border-gray-600 rounded-xl p-4 text-center flex flex-col items-center justify-between relative opacity-60 grayscale">
              <div className="absolute inset-0 bg-black/40 z-10 rounded-xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-white filter drop-shadow-md" />
              </div>
              <div className="w-14 h-14 bg-gray-500 rounded-full border-3 border-gray-750 flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-gray-800" />
              </div>
              <h4 className="font-display-hero text-gray-400 text-lg leading-tight uppercase tracking-wider">
                GRANDMASTER STREAK
              </h4>
              <p className="font-label-sm text-[10px] text-gray-500 uppercase italic">
                Level 3 Locked
              </p>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}

