import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import rehab from "../assets/bg1.jpeg";

function AuthPage() {
  const [role, setRole] = useState("patient"); 
  const [lang, setLang] = useState("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPass, setNewPass] = useState("");

  const navigate = useNavigate();

  // 1. LOGIN LOGIC (UPDATED FOR DYNAMIC NAME SUPPORT)
  const handleLogin = async () => {
    if (!email || !password) {
      setError(lang === 'en' ? "Please enter both!" : "कृपया माहिती भरा!");
      return;
    }
    setError("");
    
    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await response.json();

      if (response.ok) {
        // --- 🛡️ ROLE VALIDATION ---
        if (data.user.role !== role) {
          setError(lang === 'en' 
            ? `Access Denied: You are registered as a ${data.user.role}` 
            : `प्रवेश नाकारला: तुमची नोंदणी ${data.user.role} म्हणून आहे`);
          return;
        }

        // --- ✅ SAVE DATA & REDIRECT ---
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user.id);
        
        // 🆕 IMPORTANT: Save name with key that Dashboard expects
        if (data.user.role === "doctor") {
          // Dashbord madhe aapan 'doctorName' vaprat aahot
          localStorage.setItem("doctorName", "Dr. " + data.user.name);
          navigate("/doctor");
        } else {
          localStorage.setItem("userName", data.user.name);
          navigate("/patient"); 
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError(lang === 'en' ? "Server connection failed" : "सर्व्हरशी संपर्क होऊ शकला नाही");
    }
  };

  // 2. RESET PASSWORD LOGIC
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail || !newPass) {
      alert(lang === 'en' ? "Please fill all fields" : "कृपया सर्व माहिती भरा");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: resetEmail.trim(), 
          new_password: newPass 
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(lang === 'en' ? "Password updated! Now login." : "पासवर्ड बदलला आहे! आता लॉगिन करा.");
        setIsResetMode(false);
      } else {
        alert(data.error || "User not found!");
      }
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  const text = {
    en: { title: "Remote Rehab AI", patient: "Patient", doctor: "Doctor", email: "Email", password: "Password", login: "Login", register: "Register", newUser: "New user?", forgot: "Forgot Password?" },
    mr: { title: "रिमोट रिहॅब एआय", patient: "रुग्ण", doctor: "डॉक्टर", email: "ईमेल", password: "पासवर्ड", login: "लॉगिन", register: "नोंदणी", newUser: "नवीन वापरकर्ता?", forgot: "पासवर्ड विसरलात?" }
  };
  const t = text[lang];

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <div className="flex bg-white shadow-xl rounded-2xl overflow-hidden w-[850px]">
        {/* Left Side */}
        <div className="w-1/2 bg-sky-100 flex items-center justify-center p-8">
          <img src={rehab} alt="rehab" className="w-72" />
        </div>

        {/* Right Side */}
        <div className="w-1/2 p-10">
          {!isResetMode ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="logo" className="w-10"/>
                <h1 className="text-2xl font-bold text-sky-600">{t.title}</h1>
              </div>
              <div className="flex justify-end mb-4">
                <button onClick={() => setLang("en")} className={`px-2 py-1 text-xs font-bold ${lang==="en"?"bg-sky-500 text-white":"bg-gray-200"}`}>EN</button>
                <button onClick={() => setLang("mr")} className={`px-2 py-1 text-xs font-bold ${lang==="mr"?"bg-sky-500 text-white":"bg-gray-200"}`}>मराठी</button>
              </div>
              
              {/* Role Toggle */}
              <div className="flex mb-6 bg-sky-100 rounded-lg overflow-hidden">
                <button onClick={() => setRole("patient")} className={`w-1/2 py-2 text-xs font-bold transition-all ${role === "patient" ? "bg-sky-500 text-white" : "text-sky-600"}`}>{t.patient}</button>
                <button onClick={() => setRole("doctor")} className={`w-1/2 py-2 text-xs font-bold transition-all ${role === "doctor" ? "bg-sky-500 text-white" : "text-sky-600"}`}>{t.doctor}</button>
              </div>

              {error && <p className="text-red-500 text-xs mb-4 text-center bg-red-50 p-2 rounded border border-red-200 font-medium">{error}</p>}
              
              <input type="email" placeholder={t.email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-3 border rounded-xl mb-4 text-sm font-bold outline-sky-400" />
              <input type="password" placeholder={t.password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 border rounded-xl mb-2 text-sm font-bold outline-sky-400" />
              
              <p onClick={() => setIsResetMode(true)} className="text-right text-[11px] font-bold text-sky-600 cursor-pointer mb-4 hover:underline uppercase">{t.forgot}</p>
              
              <button onClick={handleLogin} className="w-full bg-sky-500 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 active:scale-95">
                {t.login}
              </button>
              <p className="text-center mt-6 text-[11px] font-bold text-gray-400 uppercase tracking-tight">{t.newUser} <Link to="/register" className="text-sky-600 hover:underline">{t.register}</Link></p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-sky-600 mb-6 uppercase">Reset Password</h2>
              <input type="email" placeholder="Registered Email" value={resetEmail} onChange={(e)=>setResetEmail(e.target.value)} className="w-full p-3 border rounded-xl mb-4 text-sm font-bold outline-sky-400" />
              <input type="password" placeholder="New Password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} className="w-full p-3 border rounded-xl mb-6 text-sm font-bold outline-sky-400" />
              <button type="button" onClick={handleResetSubmit} className="w-full bg-green-500 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest mb-4 hover:bg-green-600 shadow-md transition-all">
                Update Password
              </button>
              <button onClick={() => setIsResetMode(false)} className="w-full text-gray-400 font-bold hover:underline text-[10px] uppercase">
                Cancel & Go Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;