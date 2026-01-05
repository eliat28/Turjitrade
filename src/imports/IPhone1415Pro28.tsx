import imgPhoto20251217183412Photoroom5 from "figma:asset/327dd8ee4059d89fe3ac2837887f67eb58262423.png";

function Background() {
  return (
    <div className="absolute bg-[#19192e] h-[917px] left-0 overflow-clip top-0 w-[412px]" data-name="Background">
      <div className="absolute bg-[#19192e] h-[917px] left-0 top-0 w-[412px]" />
      <div className="absolute h-[78px] left-[calc(50%+0.5px)] top-[calc(50%-0.5px)] translate-x-[-50%] translate-y-[-50%] w-[97px]" data-name="photo_2025-12-17 18.34.12-Photoroom 5">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPhoto20251217183412Photoroom5} />
      </div>
    </div>
  );
}

function TextContainer() {
  return (
    <div className="absolute h-[41px] left-[197px] overflow-clip top-[404px] w-px" data-name="Text container">
      <div className="absolute flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[40px] justify-center leading-[0] left-[60.5px] text-[48px] text-center text-white top-[20px] translate-x-[-50%] translate-y-[-50%] w-[121px]">
        <p className="leading-[140px]">Hello</p>
      </div>
    </div>
  );
}

export default function IPhone1415Pro() {
  return (
    <div className="bg-[#19192e] relative size-full" data-name="iPhone 14 & 15 Pro - 28">
      <Background />
      <TextContainer />
    </div>
  );
}