import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressChart({ sessionReps, sessionErrors, isSessionActive, patientId, onDateSelect }) {
  
  // 🔑 STORAGE_KEY same thevli aahe jyamule tumchi juni history delete honar nahi
  const STORAGE_KEY = `rehab_analytics_v8_pid_${patientId || 'guest'}`; 
  const scrollRef = useRef(null);

  const getTodayDate = () => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      { label: 'Correct', data: [], backgroundColor: '#1d4ed8', borderRadius: 5 },
      { label: 'Incorrect', data: [], backgroundColor: '#93c5fd', borderRadius: 5 }
    ],
  });

  // 🔄 1. Load Previous History: Jeva page reload hoil kiva patientId badalel
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setChartData(JSON.parse(saved));
    } else {
      // Jar navin user asel tarach dummy data dakhva
      const today = getTodayDate();
      const initial = {
        labels: ["20 Apr", "21 Apr", "22 Apr", "23 Apr", "24 Apr", today],
        datasets: [
          { label: 'Correct', data: [10, 15, 8, 12, 5, 0], backgroundColor: '#1d4ed8', borderRadius: 5 },
          { label: 'Incorrect', data: [2, 1, 3, 2, 1, 0], backgroundColor: '#93c5fd', borderRadius: 5 }
        ],
      };
      setChartData(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, [patientId, STORAGE_KEY]);

  // ⚡ 2. Live Detection Update: Jeva exercises chalu astil
  useEffect(() => {
    // 0 astana update naka karu (fakt detection zalyaverach kara)
    if (sessionReps === 0 && sessionErrors === 0) return;

    setChartData(prev => {
      if (prev.labels.length === 0) return prev;
      
      const today = getTodayDate();
      let newLabels = [...prev.labels];
      let newCorrect = [...prev.datasets[0].data];
      let newIncorrect = [...prev.datasets[1].data];

      let idx = newLabels.indexOf(today);
      
      if (idx === -1) {
        // Navin divas suru zala tar navin bar add kara
        newLabels.push(today);
        newCorrect.push(sessionReps);
        newIncorrect.push(sessionErrors);
      } else {
        // Tyach divshacha data asel tar overwright/update kara
        newCorrect[idx] = sessionReps; 
        newIncorrect[idx] = sessionErrors;
      }

      const updated = {
        ...prev,
        labels: newLabels,
        datasets: [
          { ...prev.datasets[0], data: newCorrect },
          { ...prev.datasets[1], data: newIncorrect }
        ]
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [sessionReps, sessionErrors, STORAGE_KEY]);

  // 📏 3. Auto-scroll: Navin dates aalya ki scrollbar automatic shevti jail
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [chartData]);

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm w-full overflow-hidden mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black text-indigo-900 uppercase tracking-tight flex items-center gap-2">
          <span>📊</span> REWARDS HISTORY & PROGRESS
        </h3>
        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">
          Live Tracking Active
        </span>
      </div>
      
      {/* 🟢 Scroll Container: Horizontal scroll sathi */}
      <div 
        ref={scrollRef} 
        className="overflow-x-auto pb-4 custom-scrollbar" 
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Dynamic width logic: Labels vadhalya ki width pan vadhte */}
        <div style={{ 
          width: chartData.labels.length > 6 ? `${chartData.labels.length * 90}px` : "100%", 
          height: '320px',
          minWidth: '100%' 
        }}>
          <Bar 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              // 🖱️ REPORT GENERATION: Bar var click kelyavar Dashboard la data pathva
              onClick: (e, el) => {
                if (el.length > 0 && onDateSelect) {
                  const i = el[0].index;
                  onDateSelect({
                    date: chartData.labels[i],
                    reps: chartData.datasets[0].data[i],
                    errors: chartData.datasets[1].data[i]
                  });
                }
              },
              scales: { 
                x: { 
                  stacked: true, 
                  grid: { display: false },
                  ticks: { font: { weight: 'bold', size: 10 } }
                }, 
                y: { 
                  stacked: true, 
                  beginAtZero: true,
                  grid: { color: '#f1f5f9' }
                } 
              },
              plugins: { 
                legend: { display: true, position: 'top', align: 'end' },
                tooltip: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10 }
              }
            }} 
          />
        </div>
      </div>
      <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 text-center tracking-widest">
        ⬅️ Swipe/Scroll to view previous rewards history ➡️
      </p>
    </div>
  );
}