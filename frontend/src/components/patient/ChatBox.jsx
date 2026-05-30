import { useState, useEffect, useRef } from "react";

export default function ChatBox({ currentUserRole = "patient", roomId = "room_1" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  
  // Backend URL - 127.0.0.1 vapra jyamule connection error yenar nahi
  const API_URL = "http://127.0.0.1:5000/api";

  // 1. Messages Fetch karne (Polling logic)
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/get-messages/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("❌ Fetch Error: Backend chalu aahe ka check kara.", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // Dar 2 secondala sync
    return () => clearInterval(interval);
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Message Send karne
  const send = async (e) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;

    const msg = {
      room: roomId,
      sender: currentUserRole,
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      console.log("📤 Sending message...");
      const res = await fetch(`${API_URL}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });

      if (res.ok) {
        console.log("✅ Message Sent!");
        setInput("");
        fetchMessages(); // Instant refresh
      } else {
        console.error("⚠️ Server Rejected message");
      }
    } catch (err) {
      console.error("🔥 Connection Error:", err);
      alert("Backend connected nahiye. Please check if Flask is running on Port 5000.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col h-full min-h-[400px] shadow-sm relative overflow-hidden">
      
      {/* 🟢 Status Header */}
      <div className="font-black text-indigo-900 mb-4 border-b border-slate-50 pb-3 text-[10px] uppercase tracking-widest flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>{currentUserRole === "patient" ? "Doctor Support" : "Patient Chat"}</span>
        </div>
        <span className="text-slate-300 font-bold">Room: {roomId}</span>
      </div>

      {/* 💬 Messages Display */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4 pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
             <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">No Messages Yet</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.sender === currentUserRole ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-2 rounded-[1.2rem] max-w-[85%] text-xs font-bold shadow-sm ${
                m.sender === currentUserRole 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200"
              }`}>
                {m.text}
              </div>
              <span className="text-[8px] text-slate-400 mt-1 font-bold tracking-tighter uppercase">{m.time}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ⌨️ Input Area */}
      <form onSubmit={send} className="flex gap-2 border-t border-slate-50 pt-4 bg-white">
        <input 
          className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-indigo-300 focus:bg-white transition-all placeholder:text-slate-300"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Write your message..."
          autoComplete="off"
        />
        <button 
          type="submit"
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
}