import svgPaths from "./svg-qhidg7jhgx";

function Icon() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-1/2 left-[20.83%] right-[20.83%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-0.83px_-7.14%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 1.66667">
              <path d="M0.833333 0.833333H12.5" id="Vector" stroke="var(--stroke-0, #F97316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[20.83%] left-1/2 right-[20.83%] top-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-7.14%_-14.29%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.5 13.3333">
              <path d={svgPaths.p2f52ca80} id="Vector" stroke="var(--stroke-0, #F97316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute content-stretch flex items-center left-[428px] size-[20px] top-0" data-name="Button">
      <Icon />
    </div>
  );
}

function Label() {
  return <div className="h-[24px] shrink-0 w-[50px]" data-name="Label" />;
}

function EmailInput() {
  return (
    <div className="bg-[#1e293b] h-[50px] relative rounded-[16px] shrink-0 w-[349px]" data-name="Email Input">
      <div className="content-stretch flex items-center overflow-clip px-[16px] py-[12px] relative rounded-[inherit] size-full">
        <p className="font-['Heebo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-[rgba(241,245,249,0.5)] text-nowrap">xxxxx@gmail.com</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#334155] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[82px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <EmailInput />
      <p className="absolute font-['Heebo:Medium',sans-serif] font-medium leading-[24px] right-[104px] text-[#f1f5f9] text-[16px] top-0 translate-x-[100%] w-[104px]" dir="auto">{` אימייל (חובה)*`}</p>
    </div>
  );
}

function Label1() {
  return <div className="h-[24px] shrink-0 w-[50px]" data-name="Label" />;
}

function PasswordInput() {
  return (
    <div className="bg-[#1e293b] h-[50px] relative rounded-[16px] shrink-0 w-full" data-name="Password Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <p className="font-['Heebo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-[rgba(241,245,249,0.5)] text-nowrap" dir="auto">
            לפחות 6 תווים
          </p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#334155] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[82px] items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <p className="absolute font-['Heebo:Medium',sans-serif] font-medium leading-[24px] right-[104px] text-[#f1f5f9] text-[16px] top-0 translate-x-[100%] w-[106px]" dir="auto">{`סיסמה (חובה)* `}</p>
      <PasswordInput />
    </div>
  );
}

function Label2() {
  return <div className="h-[24px] shrink-0 w-[65px]" data-name="Label" />;
}

function TextInput() {
  return (
    <div className="bg-[#1e293b] h-[50px] relative rounded-[16px] shrink-0 w-full" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <p className="font-['Heebo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-[rgba(241,245,249,0.5)] text-nowrap" dir="auto">
            שם מלא
          </p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#334155] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[82px] items-start relative shrink-0 w-full" data-name="Container">
      <Label2 />
      <p className="absolute font-['Heebo:Medium',sans-serif] font-medium leading-[24px] right-[61px] text-[#f1f5f9] text-[16px] top-0 translate-x-[100%] w-[61px]" dir="auto">
        שם פרטי
      </p>
      <TextInput />
    </div>
  );
}

function RadioButton() {
  return <div className="shrink-0 size-[20px]" data-name="Radio Button" />;
}

function Label3() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pl-[348.656px] pr-0 py-0 relative size-full">
          <RadioButton />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col h-[11px] items-start relative shrink-0 w-full" data-name="Container">
      <Label3 />
    </div>
  );
}

function Label4() {
  return <div className="absolute h-[26px] left-[calc(50%+3px)] top-[-4px] translate-x-[-50%] w-[75px]" data-name="Label" />;
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[11px] items-start relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Label4 />
    </div>
  );
}

function RadioButton1() {
  return <div className="shrink-0 size-[20px]" data-name="Radio Button" />;
}

function Label5() {
  return (
    <div className="absolute h-[18px] left-[calc(50%+0.5px)] top-[342px] translate-x-[-50%] w-[190px]" data-name="Label">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center pl-[309.188px] pr-0 py-0 relative size-full">
          <RadioButton1 />
          <p className="absolute font-['Heebo:ExtraBold',sans-serif] font-extrabold leading-[24px] left-[calc(50%-61px)] text-[#f1f5f9] text-[25px] top-[-2px] w-[123px]" dir="auto">
            סגנון מסחר
          </p>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-gradient-to-b content-stretch flex from-[#f97316] h-[56px] items-start px-0 py-[16px] relative rounded-[16px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] shrink-0 to-[#ea580c] w-full" data-name="Button">
      <p className="basis-0 font-['Heebo:Medium',sans-serif] font-medium grow leading-[24px] min-h-px min-w-px relative shrink-0 text-[16px] text-center text-white" dir="auto">
        צור חשבון
      </p>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex h-[60px] items-start px-[2px] py-[18px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#f97316] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <p className="basis-0 font-['Heebo:Medium',sans-serif] font-medium grow leading-[24px] min-h-px min-w-px relative shrink-0 text-[#f97316] text-[16px] text-center" dir="auto">
        כבר יש לי חשבון
      </p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[132px] items-start left-[calc(50%+0.5px)] top-[494px] translate-x-[-50%] w-[326px]" data-name="Container">
      <Button1 />
      <Button2 />
    </div>
  );
}

function Form() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[350px] items-start left-0 top-[76px] w-[349px]" data-name="Form">
      <Container />
      <Container1 />
      <Container2 />
      <Container4 />
      <Label5 />
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[370px] left-[22px] top-[67px] w-[349px]" data-name="Container">
      <Button />
      <Form />
    </div>
  );
}

function Icon1() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <div className="absolute bottom-1/2 left-[20.83%] right-[20.83%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-0.83px_-7.14%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 1.66667">
              <path d="M0.833333 0.833333H12.5" id="Vector" stroke="var(--stroke-0, #F97316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[20.83%] left-1/2 right-[20.83%] top-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-7.14%_-14.29%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.5 13.3333">
              <path d={svgPaths.p2f52ca80} id="Vector" stroke="var(--stroke-0, #F97316)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute content-stretch flex items-center left-[341px] size-[20px] top-[47px]" data-name="Button">
      <Icon1 />
    </div>
  );
}

function Button4() {
  return <div className="absolute h-[24px] left-[18px] top-[781px] w-[349px]" data-name="Button" />;
}

function Paragraph() {
  return (
    <div className="absolute h-[27px] left-1/2 top-[800px] translate-x-[-50%] w-[146px]" data-name="Paragraph">
      <p className="absolute font-['Heebo:Regular',sans-serif] font-normal leading-[20px] left-0 text-[#94a3b8] text-[14px] text-nowrap top-[0.5px]">Design by EliaTurjeman</p>
    </div>
  );
}

export default function IPhone1415Pro() {
  return (
    <div className="bg-[#19192e] relative size-full" data-name="iPhone 14 & 15 Pro - 9">
      <Container6 />
      <p className="absolute font-['Heebo:Medium',sans-serif] font-medium leading-[36px] left-[calc(50%-63px)] text-[#f1f5f9] text-[30px] text-nowrap top-[75px]" dir="auto">
        צור חשבון
      </p>
      <Button3 />
      <Button4 />
      <Paragraph />
      <div className="absolute bg-[#f97316] font-['Heebo:ExtraBold',sans-serif] font-extrabold h-[56px] leading-[24px] left-[219px] rounded-[16px] text-[16px] text-center top-[523px] w-[139px]" data-name="Button/Default">
        <p className="absolute left-[69.5px] text-[#f97316] top-[16px] translate-x-[-50%] w-[111px]" dir="auto">
          מסחר ארוך טווח
        </p>
        <p className="absolute left-[69.5px] text-white top-[16px] translate-x-[-50%] w-[111px]" dir="auto">
          מסחר יומי
        </p>
      </div>
      <div className="absolute bg-gradient-to-b from-[#f97316] h-[56px] left-[34px] rounded-[16px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] to-[#ea580c] top-[523px] w-[139px]" data-name="Button">
        <p className="absolute font-['Heebo:ExtraBold',sans-serif] font-extrabold leading-[24px] left-[69.5px] text-[#f1f5f9] text-[16px] text-center top-[16px] translate-x-[-50%] w-[111px]" dir="auto">
          מסחר ארוך טווח
        </p>
      </div>
    </div>
  );
}