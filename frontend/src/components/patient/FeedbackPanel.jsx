import React from "react";

export default function FeedbackPanel({ feedbackMsg }) {
  
  // AI Voice Function: Jeva user button click karel tevach bolne
  const speakNow = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Junya voice la thambvane
      const utterance = new SpeechSynthesisUtterance(feedbackMsg || "Ready to start your session");
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Thoda friendly voice sathi
      window.speechSynthesis.speak(utterance);
    }
  };

  // Message nusar color tharvne (Success vs Warning)
  const isWarning = feedbackMsg?.toLowerCase().includes("bend") || feedbackMsg?.toLowerCase().includes("position");

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full min-h-[400px]">
      
      {/* Header Area */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-extrabold text-slate-800">Posture Feedback</h3>
        <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors cursor-pointer">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* Dynamic Feedback Display Area */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-6 text-center">
        
        {!feedbackMsg ? (
          <div className="opacity-30 flex flex-col items-center">
            <span className="text-5xl mb-3">📡</span>
            <p className="font-bold text-slate-400">Waiting for AI Session...</p>
          </div>
        ) : (
          <div className={`w-full p-8 rounded-3xl border-2 transition-all duration-500 ${
            isWarning 
            ? "bg-amber-50 border-amber-100 animate-pulse" 
            : "bg-emerald-50 border-emerald-100"
          }`}>
            <div className="flex justify-center mb-4">
              {isWarning ? (
                <div className="bg-amber-500 p-3 rounded-full text-white shadow-lg shadow-amber-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="bg-emerald-500 p-3 rounded-full text-white shadow-lg shadow-emerald-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <h4 className={`text-2xl font-black mb-2 ${isWarning ? "text-amber-800" : "text-emerald-800"}`}>
              {isWarning ? "Correction Needed" : "Looking Good!"}
            </h4>
            <p className={`text-lg font-bold leading-relaxed ${isWarning ? "text-amber-700" : "text-emerald-700"}`}>
              {feedbackMsg}
            </p>
          </div>
        )}

        <p className="text-xs text-slate-400 font-medium tracking-tight px-4 italic">
          AI Analysis is based on real-time skeletal tracking of your knee joint.
        </p>
      </div>

      {/* AI Voice Guide Button */}
      <button 
        onClick={speakNow}
        disabled={!feedbackMsg}
        className={`mt-5 w-full font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 active:scale-95 ${
          !feedbackMsg 
          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-indigo-100"
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        AI Voice Guide
      </button>
      
    </div>
  );
}