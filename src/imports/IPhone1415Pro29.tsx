import imgPhoto20251217183412Photoroom5 from "figma:asset/327dd8ee4059d89fe3ac2837887f67eb58262423.png";
import imgPhoto20251217183432Photoroom2 from "figma:asset/da5fc13ec8be857a2ec0b609a046b92454a4d005.png";

function Paragraph() {
  return (
    <div className="absolute h-[27px] left-1/2 top-[800px] translate-x-[-50%] w-[146px]" data-name="Paragraph">
      <p className="absolute font-['Heebo:Regular',sans-serif] font-normal leading-[20px] left-0 text-[#94a3b8] text-[14px] text-nowrap top-[0.5px]">Design by EliaTurjeman</p>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#19192e] h-[917px] left-0 overflow-clip top-0 w-[412px]" data-name="Background">
      <div className="absolute h-[67px] left-[calc(50%-135.5px)] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[83px]" data-name="photo_2025-12-17 18.34.12-Photoroom 5">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPhoto20251217183412Photoroom5} />
      </div>
      <Paragraph />
      <div className="absolute h-[57px] left-[112px] top-[calc(50%-1px)] translate-y-[-50%] w-[253px]" data-name="photo_2025-12-17 18.34.32-Photoroom 2">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPhoto20251217183432Photoroom2} />
      </div>
    </div>
  );
}

export default function IPhone1415Pro() {
  return (
    <div className="bg-[#19192e] relative size-full" data-name="iPhone 14 & 15 Pro - 29">
      <Background />
    </div>
  );
}