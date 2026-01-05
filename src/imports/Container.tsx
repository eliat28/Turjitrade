import imgRectangle from "figma:asset/42b4feaffde11c0d50ae778c18adbffc4596aa27.png";

function Heading() {
  return (
    <div className="h-[16.375px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Heebo:Medium',sans-serif] font-medium leading-[16.375px] left-[104.37px] text-[#f1f5f9] text-[11.696px] text-nowrap text-right top-[0.49px] translate-x-[-100%]" dir="auto">
        אליה תורג’מן
      </p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex h-[14.036px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Heebo:Regular',sans-serif] font-normal leading-[14.036px] relative shrink-0 text-[#94a3b8] text-[9.357px] text-nowrap text-right">eliaturjeman@gmail.com</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Container">
      <Heading />
      <Paragraph />
      <div className="absolute flex items-center justify-center left-[109px] size-[31px] top-0">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="relative rounded-[512px] size-[31px]" data-name="Rectangle">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[512px] size-full" src={imgRectangle} />
          </div>
        </div>
      </div>
    </div>
  );
}