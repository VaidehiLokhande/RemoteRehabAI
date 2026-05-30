import { useState } from "react";
import logo from "../assets/logo.png";
import rehab from "../assets/bg1.jpeg";
import { Link, useNavigate } from "react-router-dom"; 

function RegisterPage() {
  const [role, setRole] = useState("patient");
  const [lang, setLang] = useState("en");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const text = {
    en: {
      title: "Create Account", patient: "Patient", doctor: "Doctor", name: "Full Name",
      email: "Email", password: "Password", confirm: "Confirm Password",
      register: "Register", login: "Already have an account?", loginBtn: "Login"
    },
    mr: {
      title: "नवीन खाते तयार करा", patient: "रुग्ण", doctor: "डॉक्टर", name: "पूर्ण नाव",
      email: "ईमेल", password: "पासवर्ड", confirm: "पासवर्ड पुन्हा टाका",
      register: "नोंदणी", login: "आधीच खाते आहे?", loginBtn: "लॉगिन"
    }
  };
  const t = text[lang];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); 
  };

  const validateForm = () => {
    let newErrors = {};
    const nameRegex = /^[a-zA-Z\s]+$/;
    
    if (!formData.name.trim()) {
      newErrors.name = lang === 'en' ? "Name is required" : "नाव आवश्यक आहे";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = lang === 'en' ? "Name should contain only letters" : "नावामध्ये फक्त अक्षरे असावीत";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = lang === 'en' ? "Email is required" : "ईमेल आवश्यक आहे";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = lang === 'en' ? "Invalid email format" : "चुकीचा ईमेल फॉरमॅट";
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = lang === 'en' ? "Password is required" : "पासवर्ड आवश्यक आहे";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = lang === 'en' 
        ? "Password must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character" 
        : "पासवर्डमध्ये किमान ८ अक्षरे, १ कॅपिटल अक्षर, १ नंबर आणि १ स्पेशल कॅरेक्टर असावे";
    }
    
    if (formData.password !== formData.confirm) {
      newErrors.confirm = lang === 'en' ? "Passwords do not match" : "पासवर्ड जुळत नाहीत";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: role
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          // ✅ NEW LOGIC: Save Doctor's name for Dashboard
          if (role === "doctor") {
            localStorage.setItem("doctorName", "Dr. " + formData.name);
          } else {
            localStorage.setItem("patientName", formData.name);
          }

          alert(lang === 'en' ? "Registration Successful!" : "नोंदणी यशस्वी झाली!");
          navigate("/"); // Login page var navigate kara
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Error connecting to server:", error);
        alert("Server error. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <div className="flex bg-white shadow-xl rounded-2xl overflow-hidden w-[900px]">
        
        {/* Left Side Image */}
        <div className="w-1/2 bg-sky-100 flex items-center justify-center p-8">
          <img src={rehab} alt="rehab" className="w-full h-auto rounded-lg shadow-sm" />
        </div>

        {/* Right Side Form */}
        <div className="w-1/2 p-10">
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="logo" className="w-10"/>
            <h1 className="text-2xl font-black text-sky-600 uppercase tracking-tighter">Remote Rehab</h1>
          </div>

          <div className="flex justify-end mb-4">
            <button type="button" onClick={() => setLang("en")} className={`px-3 py-1 text-[10px] font-bold ${lang==="en" ? "bg-sky-500 text-white rounded-l-md" : "bg-gray-100 text-gray-400 rounded-l-md"}`}>EN</button>
            <button type="button" onClick={() => setLang("mr")} className={`px-3 py-1 text-[10px] font-bold ${lang==="mr" ? "bg-sky-500 text-white rounded-r-md" : "bg-gray-100 text-gray-400 rounded-r-md"}`}>मराठी</button>
          </div>

          <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">{t.title}</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex mb-4 bg-sky-50 p-1 rounded-xl">
              <button type="button" onClick={() => setRole("patient")} className={`w-1/2 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${role === "patient" ? "bg-white text-sky-600 shadow-sm" : "text-sky-300"}`}>{t.patient}</button>
              <button type="button" onClick={() => setRole("doctor")} className={`w-1/2 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${role === "doctor" ? "bg-white text-sky-600 shadow-sm" : "text-sky-300"}`}>{t.doctor}</button>
            </div>

            <div>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t.name} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-400" />
              {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase">{errors.name}</p>}
            </div>

            <div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t.email} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-400" />
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase">{errors.email}</p>}
            </div>

            <div>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={t.password} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-400" />
              {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase">{errors.password}</p>}
            </div>

            <div>
              <input type="password" name="confirm" value={formData.confirm} onChange={handleChange} placeholder={t.confirm} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-400" />
              {errors.confirm && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase">{errors.confirm}</p>}
            </div>

            <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-sky-100 transition-all mt-4">
              {t.register}
            </button>
          </form>

          <p className="text-center mt-6 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            {t.login} <Link to="/" className="text-sky-600 hover:underline">{t.loginBtn}</Link>
          </p>
        </div> 
      </div>
    </div>
  );
}

export default RegisterPage;