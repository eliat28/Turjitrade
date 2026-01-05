import image_e8295e16e152b832bab37b22caaea879ba6d1f3a from 'figma:asset/e8295e16e152b832bab37b22caaea879ba6d1f3a.png';

interface WelcomeScreenProps {
  onSignup: () => void;
  onLogin: () => void;
}

export default function WelcomeScreen({ onSignup, onLogin }: WelcomeScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-between bg-[#111422] px-[6vw] py-[4vh] overflow-y-auto font-sans">
      
      {/* Top Section: Logo & Text */}
      <div className="flex flex-col items-center w-full gap-[2vh] flex-grow justify-center">
        {/* Logo */}
        <img 
            src={image_e8295e16e152b832bab37b22caaea879ba6d1f3a} 
            alt="TurjiTrade" 
            className="w-[55vw] max-w-[240px] h-auto object-contain mb-[1vh]" 
        />
        
        {/* Title */}
        <h1 className="text-white text-[3.5vh] font-black tracking-wide text-center font-['Heebo']">
          ברוכים הבאים
        </h1>
        
        {/* Separator */}
        <div className="w-full h-[1px] bg-[#F97316] opacity-80 my-[1vh]"></div>
        
        {/* Description */}
        <p className="text-gray-200 text-center text-[4.5vw] md:text-[3vw] lg:text-[2.2vw] font-medium leading-relaxed px-[2vw]">
          קבל המלצות מסחר מבוססות נתונים
          <br className="md:hidden" />
          אמיתיים וניתוח טכני מתקדם
        </p>
      </div>

      {/* Middle Section: Risk Warning */}
      <div className="w-full my-[3vh]">
        <div 
          className="w-full bg-[#162032] border border-[#EF4444]/50 rounded-2xl p-[5vw] shadow-lg relative overflow-hidden"
          dir="rtl"
        >
          {/* Subtle background glow for the card */}
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[#EF4444]/40 to-transparent opacity-50"></div>
          
          <div className="flex flex-col gap-[1vh]">
            <div className="flex items-center gap-[2vw]">
               <span className="text-yellow-500 text-[2.5vh]">⚠️</span>
               <h3 className="text-[#EF4444] font-bold text-[2.2vh]">אזהרת סיכון:</h3>
            </div>
            <p className="text-[#94A3B8] text-[1.8vh] leading-relaxed font-light">
              המלצות אלו מבוססות על ניתוח טכני בלבד ואינן מהוות ייעוץ פיננסי. מסחר במניות כרוך בסיכון אובדן הון משמעותי. השקע רק כסף שאתה יכול להרשות לעצמך להפסיד.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Buttons */}
      <div className="w-full flex flex-col items-center gap-[2vh] mt-auto">
          <button
            onClick={onSignup}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white text-[2.2vh] font-bold py-[2vh] rounded-xl shadow-lg transition-all active:scale-[0.98]"
          >
            צור חשבון
          </button>
          
          <button
            onClick={onLogin}
            className="w-full bg-transparent border-[2px] border-[#F97316] text-[#F97316] text-[2.2vh] font-bold py-[2vh] rounded-xl hover:bg-[#F97316]/10 transition-all active:scale-[0.98]"
          >
            התחבר
          </button>

          <span className="text-[#475569] text-[1.5vh] mt-[1vh] font-medium tracking-wide">
            Design by EliaTurjeman
          </span>
      </div>
    </div>
  );
}
