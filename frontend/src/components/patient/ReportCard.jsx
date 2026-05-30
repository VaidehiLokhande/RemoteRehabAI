import React from "react";

export default function ReportCard({ patientInfo, exerciseHistory, currentSession, selectedReport }) {
  
  let displayHistory = [...exerciseHistory];

  if (selectedReport) {
    const existingIndex = displayHistory.findIndex(item => item.date === selectedReport.date);
    if (existingIndex !== -1) {
      const [selectedRow] = displayHistory.splice(existingIndex, 1);
      displayHistory = [{ ...selectedRow, isSelected: true }, ...displayHistory];
    } else {
      displayHistory = [{ ...selectedReport, isSelected: true, exercise: "Selected Session" }, ...displayHistory];
    }
  }

  const isLiveActive = currentSession && (currentSession.reps > 0 || currentSession.errors > 0);
  if (isLiveActive) {
    const liveEntry = {
      date: "Today (Live)",
      exercise: currentSession.exercise || "Active Session",
      reps: currentSession.reps,
      errors: currentSession.errors,
      isLive: true
    };
    displayHistory = [liveEntry, ...displayHistory];
  }

  // Header summary sathi current session chi accuracy
  const safeReps = Number(currentSession?.reps || 0);
  const safeErrors = Number(currentSession?.errors || 0);
  const totalReps = safeReps + safeErrors;
  const currentAccuracy = totalReps > 0 ? Math.round((safeReps / totalReps) * 100) : 0;

  return (
    <div id="printable-report" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-2xl mx-auto font-sans relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 z-0"></div>

      <div className="relative z-10 border-b-2 border-indigo-50 pb-6 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-indigo-900 tracking-tighter uppercase">Remote Rehab AI</h1>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Movement Analysis Report</p>
        </div>
        <div className="text-right text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
          <p>Report ID: #RR-{patientInfo.id || '9942'}</p>
          <p>Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-4 mb-8">
        <div className="col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
           <span className="text-[9px] uppercase text-slate-400 font-black block mb-2 tracking-widest">Patient Name</span>
           <p className="font-black text-slate-800 text-xl uppercase tracking-tight">{patientInfo.name}</p>
        </div>
        <div className="bg-indigo-900 p-5 rounded-2xl text-center shadow-lg shadow-indigo-200">
           <span className="text-[9px] uppercase text-indigo-300 font-bold block mb-1">Session Accuracy</span>
           <p className="font-black text-white text-2xl">
             {currentAccuracy}% 
           </p>
        </div>
      </div>

      <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
              <th className="p-4">Date / Session</th>
              <th className="p-4">Exercise</th>
              <th className="p-4 text-center">Correct</th>
              <th className="p-4 text-center">Incorrect</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {displayHistory.map((row, index) => {
              // ✅ PRATYEK ROW SATHI CALCULATE KARA
              const rReps = Number(row.reps || 0);
              const rErrors = Number(row.errors || 0);
              const rTotal = rReps + rErrors;
              const rAccuracy = rTotal > 0 ? Math.round((rReps / rTotal) * 100) : 0;

              return (
                <tr key={index} className={`border-b border-slate-50 ${row.isLive ? "bg-blue-50/60" : ""} ${row.isSelected ? "bg-indigo-50/80 border-l-4 border-l-indigo-600 shadow-sm" : ""}`}>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs">{row.date}</span>
                      {/* ✅ Itha pratyek row chi swatantra accuracy disel */}
                      <span className="text-[9px] text-emerald-600 font-black uppercase">
                         {rAccuracy}% Accuracy
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-700 uppercase text-xs">
                    {row.exercise || "General Rehab"}
                  </td>
                  <td className="p-4 text-center font-black text-lg text-indigo-600">
                    {row.reps}
                  </td>
                  <td className="p-4 text-center text-red-400 font-bold text-lg">
                    {row.errors}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-between items-center relative z-10">
        <div className="text-[9px] text-slate-400 italic max-w-[70%] leading-relaxed uppercase font-bold">
          * This medical log is generated by AI skeletal tracking.
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
           <p className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">Verified AI Output</p>
        </div>
      </div>
    </div>
  );
}