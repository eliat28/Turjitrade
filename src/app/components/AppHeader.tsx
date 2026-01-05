import { useState, useEffect } from 'react';
import { isMarketOpen } from '../services/stockApi';
import logoText from "figma:asset/da5fc13ec8be857a2ec0b609a046b92454a4d005.png";

export default function AppHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full flex justify-between items-center bg-[#1E293B] h-auto py-[1.5vh] px-[4vw] border-b border-[#334155] shadow-md">
      
      {/* Right Side: Text & Clocks */}
      <div className="flex flex-col items-start gap-[0.8vh]">
          <div className="text-[2.6vw] text-white font-extrabold font-['Oxanium','Arimo',sans-serif] leading-none">
             <span>שעון ארה"ב: </span>
             <span className="font-['Oxanium']">
               {time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'America/New_York', hour12: false})}
             </span>
          </div>
           <div className="text-[3.6vw] font-extrabold font-['Oxanium','Arimo',sans-serif] leading-none mt-[0.2vh]">
             <span className="text-white">סטטוס שוק - </span>
             <span className={`${isMarketOpen() ? "text-[#00f629]" : "text-[#EF4444]"}`}>
               {isMarketOpen() ? 'פתוח' : 'סגור'}
             </span>
          </div>
      </div>

      {/* Left Side: Logo */}
      <div className="flex items-center justify-end" dir="ltr">
          <img 
            src={logoText} 
            alt="TURJi TRADE" 
            className="w-[30vw] h-auto object-contain"
          />
      </div>
    </div>
  );
}
