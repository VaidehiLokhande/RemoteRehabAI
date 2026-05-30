import React, { useState, useEffect } from "react";

export default function Rewards({ reps }) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [dailyHistory, setDailyHistory] = useState({});

  const getTodayDate = () => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  // 1. Load All Data (Total + History)
  useEffect(() => {
    const savedTotal = localStorage.getItem("user_total_points_v2");
    const savedHistory = localStorage.getItem("user_rewards_history");

    if (savedTotal) setTotalPoints(parseInt(savedTotal));
    if (savedHistory) setDailyHistory(JSON.parse(savedHistory));
  }, []);

  // 2. Real-time Update when Reps increase
  useEffect(() => {
    if (reps > 0) {
      const today = getTodayDate();
      const pointsToAdd = 10; // 1 Rep = 10 Points

      // Update Total Points
      setTotalPoints((prevTotal) => {
        const newTotal = prevTotal + pointsToAdd;
        localStorage.setItem("user_total_points_v2", newTotal);
        return newTotal;
      });

      // Update Daily History
      setDailyHistory((prevHistory) => {
        const currentDailyPoints = (prevHistory[today] || 0) + pointsToAdd;
        const newHistory = { ...prevHistory, [today]: currentDailyPoints };
        localStorage.setItem("user_rewards_history", JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [reps]);

  // Sort history to show latest date first
  const sortedDates = Object.keys(dailyHistory).reverse();

  return (
    <div className="flex flex-col gap-4">
      {/* --- CURRENT REWARDS CARD (Theme: Light Blue/Indigo) --- */}
      <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-6 rounded-[2rem] shadow-xl text-white border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black tracking-tight italic">⭐ TODAY'S EARNING</h2>
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">
            {getTodayDate()}
          </span>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-5xl font-black">{dailyHistory[getTodayDate()] || 0}</span>
          <span className="text-xl font-bold opacity-80 mb-1">PTS</span>
        </div>
        
        <p className="text-[11px] mt-2 opacity-70 font-medium uppercase tracking-wider">
          Keep moving to earn more badges!
        </p>
      </div>

      {/* --- PREVIOUS REWARDS BOX (Storage Box) --- */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 mb-4 px-2 uppercase tracking-widest">
          📜 Rewards History
        </h3>
        
        <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <div 
                key={date} 
                className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">
                    📅
                  </div>
                  <span className="font-bold text-slate-700">{date}</span>
                </div>
                <div className="text-right">
                  <span className="block font-black text-blue-600">+{dailyHistory[date]}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Points</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 py-4 text-sm font-medium">
              No history found. Start exercising!
            </p>
          )}
        </div>
      </div>

      {/* TOTAL ACCUMULATED DISPLAY */}
      <div className="bg-indigo-900 p-4 rounded-2xl flex justify-between items-center text-white">
        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Lifetime Points</span>
        <span className="text-xl font-black text-yellow-400">{totalPoints}</span>
      </div>
    </div>
  );
}