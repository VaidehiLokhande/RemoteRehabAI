import React, { useEffect, useState } from 'react';
import { 
  Users, ChevronRight, Download, Eye, Bell, UserCircle, Send, ClipboardList, Activity
} from 'lucide-react';

// PDF Libraries
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import ReportCard from '../components/patient/ReportCard'; 

import appLogo from '../assets/logo.png';
import girl1 from '../assets/girl1.png';
import boy1 from '../assets/boy1.png';
import boy2 from '../assets/boy2.png';

const avatarList = [girl1, boy1, boy2];

const Dashboard = () => {
  const [patientsData, setPatientsData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [incomingReports, setIncomingReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState("Doctor");

  // Exercise Plan State
  const [plan, setPlan] = useState({ exercise: "Neck Tilt", sets: "", reps: "" });

  useEffect(() => {
    const storedName = localStorage.getItem("doctorName");
    if (storedName) {
      setCurrentDoctor(storedName);
    }

    fetch("http://127.0.0.1:5000/api/patients")
      .then(res => res.json())
      .then(data => {
        setPatientsData(data);
        if (data.length > 0) setSelectedPatient(data[0]);
      });
  }, []);

  const fetchIncomingReports = () => {
    fetch("http://127.0.0.1:5000/api/doctor/all-reports")
      .then(res => res.json())
      .then(data => setIncomingReports(data))
      .catch(err => console.error("Error fetching reports:", err));
  };

  useEffect(() => {
    fetchIncomingReports();
    const interval = setInterval(fetchIncomingReports, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleSendPlan = async () => {
    if(!plan.sets || !plan.reps) {
      alert("Please enter Sets and Reps!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/send-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient.profile_id,
          exercise: plan.exercise,
          sets: plan.sets,
          reps: plan.reps,
          doctor_name: currentDoctor
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Plan successfully sent to ${selectedPatient?.name}!`);
        setPlan({ ...plan, sets: "", reps: "" }); 
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error sending plan:", error);
      alert("Server error. Please try again.");
    }
  };

  const openDetailedReport = (report) => {
    setActiveReport(report); 
    setShowReportModal(true);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Clinic Report Summary", 14, 20);
    doc.autoTable({
      startY: 30,
      head: [["Patient", "Exercise", "Reps", "Errors", "Date"]],
      body: incomingReports.map(r => [r.patient_name.toUpperCase(), r.exercise, r.reps, r.errors, r.date]),
    });
    doc.save(`Summary_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex font-sans text-slate-800">
      
      {/* 🟦 SIDEBAR */}
      <aside className="w-72 p-6 border-r bg-white shadow-sm h-screen sticky top-0 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <img src={appLogo} className="h-8 w-8" alt="logo"/>
          <span className="text-indigo-900 font-black text-lg uppercase tracking-tighter">Remote Rehab</span>
        </div>

        <div className="mb-8 pb-6 border-b border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Logged In As</p>
          <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100 flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-xl">
                <UserCircle size={20} />
             </div>
             <div>
                <p className="text-sm font-bold leading-none">{currentDoctor}</p>
                <p className="text-[9px] opacity-70 mt-1 font-bold uppercase tracking-tighter">Physiotherapist</p>
             </div>
          </div>
        </div>

        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Patient Directory</p>
        <div className="space-y-1 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {patientsData.map((p, idx) => (
            <div key={p.profile_id}
              onClick={() => setSelectedPatient(p)}
              className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all
              ${selectedPatient?.profile_id === p.profile_id ? "bg-slate-100 text-indigo-700 shadow-sm" : "hover:bg-slate-50 text-slate-500"}`}>
              <div className="flex items-center gap-3">
                <img src={avatarList[idx % 3]} className="w-7 h-7 rounded-full border border-slate-200" alt="avatar"/>
                <span className="text-sm font-bold">{p.name}</span>
              </div>
              {selectedPatient?.profile_id === p.profile_id && <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full"></div>}
            </div>
          ))}
        </div>
      </aside>

      {/* ⬜ MAIN CONTENT */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 uppercase">Medical Dashboard</h1>
          <button 
            onClick={exportPDF}
            className="bg-white border border-slate-200 text-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-sm"
          >
            <Download size={14}/> Export Summary
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SECTION (Reports Table + Prescribe Box) */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-8">
            
            {/* INCOMING REPORTS */}
            <section className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h2 className="flex items-center gap-2 font-black text-indigo-900 text-xs uppercase tracking-tight">
                  <Bell size={16} className="text-indigo-600"/> Patient Activity Feed
                </h2>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white shadow-sm z-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b">
                    <tr>
                      <th className="p-5">Patient</th>
                      <th className="p-5">Exercise</th>
                      <th className="p-5">Reps/Errors</th>
                      <th className="p-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold divide-y divide-slate-50">
                    {incomingReports.map((report, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="p-5 text-slate-900 uppercase">{report.patient_name}</td>
                        <td className="p-5 text-indigo-600 uppercase">{report.exercise}</td>
                        <td className="p-5">
                          <span className="text-emerald-600">{report.reps} Reps</span> • <span className="text-red-400">{report.errors} Errors</span>
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => openDetailedReport(report)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all mx-auto shadow-md"
                          >
                            <Eye size={14}/> View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PRESCRIBE PLAN */}
            {selectedPatient && (
              <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Prescribe Exercise Plan</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Assigning to: <span className="text-indigo-600">{selectedPatient.name}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Exercise</label>
                    <select 
                      value={plan.exercise}
                      onChange={(e) => setPlan({...plan, exercise: e.target.value})}
                      className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option>Neck Tilt</option>
                      <option>Shoulder Rotation</option>
                      <option>Knee Extension</option>
                      <option>Squats</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Daily Sets</label>
                    <input type="number" placeholder="Sets" value={plan.sets} onChange={(e) => setPlan({...plan, sets: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Target Reps</label>
                    <input type="number" placeholder="Reps" value={plan.reps} onChange={(e) => setPlan({...plan, reps: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleSendPlan} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                      <Send size={14}/> Send Plan
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ✅ RIGHT SECTION: MEDICAL ILLUSTRATION (Chat Replacement) */}
          <div className="lg:col-span-12 xl:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-full min-h-[600px] justify-between relative overflow-hidden">
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Activity size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">System Health: Optimal</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase leading-tight">Patient Care <br/> Intelligence</h2>
              </div>

              {/* Central Illustration Area */}
              <div className="flex-1 flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-3xl opacity-50"></div>
                 <div className="relative flex flex-col items-center text-center">
                    <div className="w-48 h-48 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-8 border border-slate-100 relative group transition-all duration-500 hover:-translate-y-2">
                       <div className="absolute inset-4 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center">
                          <Users size={64} className="text-white" />
                       </div>
                       {/* Floating Badges */}
                       <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg">LIVE FEED</div>
                    </div>
                    
                    <h3 className="text-indigo-900 font-black uppercase text-sm mb-3">Physio Tracking Active</h3>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-[250px]">
                      Use this interface to monitor and analyze skeletal tracking data. Every report sent by patients is analyzed for accuracy.
                    </p>
                 </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Clinic Status Update</p>
                </div>
                <p className="text-[11px] font-bold text-indigo-900 italic">"Empowering recovery through precision data and AI assistance."</p>
              </div>

            </div>
          </div>

        </div> 
      </main>

      {/* 🟢 REPORT MODAL */}
      {showReportModal && activeReport && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Analysis: {activeReport.patient_name}</span>
               <button onClick={() => setShowReportModal(false)} className="bg-red-50 text-red-500 h-10 w-10 rounded-full font-bold hover:bg-red-500">✕</button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 bg-white">
              <ReportCard 
                patientInfo={{ name: activeReport.patient_name, id: activeReport.patient_id }}
                currentSession={{ reps: activeReport.reps, errors: activeReport.errors, exercise: activeReport.exercise }}
                exerciseHistory={[]} 
              />
            </div>
            <div className="p-6 bg-slate-50 flex gap-4 border-t">
              <button className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-black text-slate-700 uppercase tracking-widest text-[10px]" onClick={() => window.print()}>🖨️ Print</button>
              <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setShowReportModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;