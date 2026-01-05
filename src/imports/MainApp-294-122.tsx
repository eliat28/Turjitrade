import imgPhoto20251217183432Photoroom3 from "figma:asset/da5fc13ec8be857a2ec0b609a046b92454a4d005.png";

export default function MainApp() {
  return (
    <div className="bg-[#1e293b] border-[#334155] border-[1px_0px_0px] border-solid relative size-full" data-name="MainApp">
      <div className="absolute flex flex-col font-['Oxanium:ExtraBold','Arimo:Bold',sans-serif] font-extrabold h-[16px] justify-center leading-[0] right-[137px] text-[10px] text-white top-[26px] translate-x-[100%] translate-y-[-50%] w-[107px]">
        <p className="leading-[140px]" dir="auto">
          שעון (ארה״ב): 18:00
        </p>
      </div>
      <div className="absolute flex flex-col font-['Oxanium:ExtraBold','Arimo:Bold',sans-serif] font-extrabold h-[23px] justify-center leading-[0] left-[275px] text-[14px] text-white top-[45.5px] translate-y-[-50%] w-[121px]">
        <p className="leading-[140px]" dir="auto">
          <span>{`סטטוס שוק - `}</span>
          <span className="text-[#00f629]">פתוח</span>
        </p>
      </div>
      <div className="absolute h-[23px] left-[15px] top-[calc(50%-1.5px)] translate-y-[-50%] w-[124px]" data-name="photo_2025-12-17 18.34.32-Photoroom 3">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPhoto20251217183432Photoroom3} />
      </div>
      <div className="absolute flex flex-col font-['Oxanium:ExtraBold','Arimo:Bold',sans-serif] font-extrabold h-[15px] justify-center leading-[0] right-[137px] text-[10px] text-white top-[10.5px] translate-x-[100%] translate-y-[-50%] w-[79px]">
        <p className="leading-[140px]" dir="auto">
          שעון אזורי: 18:00
        </p>
      </div>
    </div>
  );
}