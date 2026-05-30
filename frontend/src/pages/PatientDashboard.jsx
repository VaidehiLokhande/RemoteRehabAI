import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, User } from "lucide-react"; 
import ExerciseSlider from "../components/patient/ExerciseSlider";
import BodyDetection from "../components/patient/BodyDetection";
import FeedbackPanel from "../components/patient/FeedbackPanel";
import ProgressChart from "../components/patient/ProgressChart";
import Rewards from "../components/patient/Rewards";
// ❌ ChatBox import kadhla aahe
import ReportCard from "../components/patient/ReportCard"; 
import logo from "../assets/logo.png"; 

export default function PatientDashboard() {
  const navigate = useNavigate();
  const patientId = localStorage.getItem("userId") || "9942"; 
  const userName = localStorage.getItem("userName") || "Patient";

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("Neck Tilt");
  const [feedbackMsg, setFeedbackMsg] = useState("Ready to start. Select an exercise.");
  const [showReport, setShowReport] = useState(false);
  const [sessionReps, setSessionReps] = useState(0);
  const [sessionErrors, setSessionErrors] = useState(0); 
  const [history, setHistory] = useState([]);
  const [selectedChartDate, setSelectedChartDate] = useState(null);
  const [assignedPlan, setAssignedPlan] = useState(null);

  const exerciseData = {
    "Neck Tilt": { video: "/videos/neck_tilt.mp4", voiceMsg: "Starting Neck Tilt rehab." },
    "Squat": { video: "/videos/squat.mp4", voiceMsg: "Starting Squat session." },
    "Lunge": { video: "/videos/lunge.mp4", voiceMsg: "Starting Lunges." },
    "Knee Raise": { video: "/videos/knee.mp4", voiceMsg: "Starting Knee Raise." }
  };

  const handleSendDoctor = async () => {
    const reportData = {
      patient_id: patientId,
      patient_name: userName,
      exercise: selectedProgram,
      reps: sessionReps,
      errors: sessionErrors,
      date: new Date().toLocaleDateString('en-GB')
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (res.ok) {
        alert("🚀 Report successfully sent to Doctor!");
        setShowReport(false);
      } else {
        alert("❌ Failed to send report. Please check backend.");
      }
    } catch (err) {
      alert("❌ Error: Flask Server is not responding.");
    }
  };

  const fetchAssignedPlan = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/get-plan/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setAssignedPlan(data);
      }
    } catch (err) {
      console.warn("No plan found or server error.");
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/progress/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      setHistory([{ date: "25 Apr", exercise: "Neck Tilt", reps: 10, errors: 2 }]);
    }
  };

  useEffect(() => { 
    loadHistory(); 
    fetchAssignedPlan();
  }, [patientId]);

  const toggleSession = async () => {
    if (!isSessionActive) {
      setIsSessionActive(true);
      setSessionReps(0);
      setSessionErrors(0);
      setFeedbackMsg(`AI Tracking started for ${selectedProgram}...`);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(exerciseData[selectedProgram].voiceMsg));
    } else {
      setIsSessionActive(false);
      window.speechSynthesis.cancel();
      setFeedbackMsg("Session stopped. Saving...");
      setTimeout(() => loadHistory(), 1000);
    }
  };

  return (
    <div className="bg-[#f3f4f6] min-h-screen font-sans pb-10">
      
      <header className="bg-white px-8 py-4 shadow-sm flex items-center justify-between sticky top-0 z-[100] border-b border-blue-50">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-xl font-black text-indigo-900 leading-none uppercase">Remote Rehab AI</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Welcome, {userName}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setSelectedChartDate(null); setShowReport(true); }} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all">📄 VIEW REPORT</button>
          <button onClick={() => { localStorage.clear(); navigate("/"); }} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold text-xs">LOGOUT</button>
        </div>
      </header>

      <main className="max-w-[1450px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold mb-4 italic text-slate-500 uppercase tracking-tight">Step 1: Select Exercise</h2>
            <ExerciseSlider setExName={setSelectedProgram} />
            <div className="mt-6 flex flex-col gap-3">
              <select 
                value={selectedProgram} 
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="p-4 rounded-2xl bg-slate-50 border font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                disabled={isSessionActive}
              >
                {Object.keys(exerciseData).map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
              <button onClick={toggleSession} className={`py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${isSessionActive ? "bg-red-500 shadow-red-200" : "bg-indigo-600 hover:scale-[1.01] shadow-indigo-200"}`}>
                {isSessionActive ? "STOP SESSION" : "START AI DETECTION"}
              </button>
            </div>
          </section>

          <section className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-3 text-indigo-900 text-[10px] tracking-widest uppercase">🎬 Tutorial Guide</h3>
            <div className="bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center border-4 border-slate-50 shadow-inner">
              <video key={selectedProgram} controls autoPlay muted loop className="w-full h-full object-contain">
                <source src={exerciseData[selectedProgram].video} type="video/mp4" />
              </video>
            </div>
          </section>
          
          <Rewards reps={sessionReps} patientId={patientId} />

          {assignedPlan && (
            <section className="bg-white border-2 border-indigo-900 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 bg-indigo-900 text-white px-3 py-1 rounded-full">
                    <ClipboardList size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Prescribed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <User size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-tighter">Dr. {assignedPlan.doctor_name || "Specialist"}</p>
                  </div>
               </div>

               <h2 className="text-2xl font-black text-indigo-900 mb-4 uppercase">{assignedPlan.exercise}</h2>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Daily Sets</p>
                    <p className="text-2xl font-black text-indigo-900">{assignedPlan.sets}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Target Reps</p>
                    <p className="text-2xl font-black text-indigo-900">{assignedPlan.reps}</p>
                  </div>
               </div>

               <button 
                onClick={() => setSelectedProgram(assignedPlan.exercise)}
                className="w-full mt-4 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100"
               >
                 Activate Prescribed Task
               </button>
            </section>
          )}
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-md p-2 border border-slate-100 overflow-hidden relative min-h-[450px]">
             <BodyDetection isActive={isSessionActive} setFeedbackMsg={setFeedbackMsg} selectedProgram={selectedProgram} setSessionReps={setSessionReps} setSessionErrors={setSessionErrors} />
          </div>

          {/* ✅ UPDATED: ChatBox kadhun FeedbackPanel full width kela aahe */}
          <div className="grid grid-cols-1 gap-4">
            <FeedbackPanel feedbackMsg={feedbackMsg} />
          </div>

          <div className="w-full">
            <ProgressChart sessionReps={sessionReps} sessionErrors={sessionErrors} isSessionActive={isSessionActive} patientId={patientId} onDateSelect={(data) => { setSelectedChartDate(data); setShowReport(true); }} />
          </div>
        </div>
      </main>

      {showReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative border border-slate-200">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-black text-slate-400 px-4 uppercase tracking-widest">Medical Analysis Report</span>
                <button onClick={() => setShowReport(false)} className="bg-red-50 text-red-500 h-10 w-10 rounded-full flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm">✕</button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 bg-white">
              <ReportCard 
                patientInfo={{ id: patientId, name: userName }}
                exerciseHistory={history} 
                currentSession={{ reps: sessionReps, errors: sessionErrors, exercise: selectedProgram }}
                selectedReport={selectedChartDate} 
              />
            </div>
            <div className="p-6 bg-slate-50 flex gap-4 border-t border-slate-100">
              <button className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-black text-slate-700 text-[10px] uppercase tracking-widest shadow-sm" onClick={() => window.print()}>🖨️ Print Report</button>
              <button onClick={handleSendDoctor} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">🚀 Send to Doctor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}