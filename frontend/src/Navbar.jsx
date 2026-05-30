export default function Navbar({ onSettingsClick }) {
  return (
    <div className="bg-[#2563eb] px-8 py-5 flex justify-between items-center shadow-md">
      
      {/* डावी बाजू: Custom Logo आणि टायटल */}
      <div className="flex items-center gap-3.5">
        <img 
          src="/logo.png" 
          alt="Remote Rehab AI Logo" 
          className="w-11 h-11 object-contain bg-white rounded-full p-1 shadow-sm"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://cdn-icons-png.flaticon.com/512/3003/3003206.png"; 
          }}
        />
        {/* पांढऱ्या रंगातील टायटल */}
        <h1 className="font-extrabold text-[24px] text-white tracking-wide">
          Remote Rehab AI
        </h1>
      </div>
      
      {/* उजवी बाजू: पेशंट प्रोफाईल, सेटिंग्ज आणि लॉगआउट */}
      <div className="flex items-center space-x-6">
        
        {/* Profile Chip (पारदर्शक पांढरा इफेक्ट) */}
        <div className="flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
          <img 
            src="logo.png" 
            alt="Patient Logo" 
            className="w-8 h-8 rounded-full"
          />
          <span className="font-bold text-sm text-white hidden md:block pr-1">
            Priya Singh
          </span>
        </div>

        {/* Settings Button */}
        <button 
          onClick={onSettingsClick} 
          className="text-white/80 hover:text-white text-2xl hover:rotate-90 transition-all duration-300"
          title="Settings & Registration Details"
        >
          ⚙️
        </button>
        
        {/* Logout Button */}
        <button className="text-white font-bold text-sm hover:underline hover:text-blue-100 transition-all">
          Logout
        </button>
      </div>
    </div>
  );
}