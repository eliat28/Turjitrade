import logo from "figma:asset/da5fc13ec8be857a2ec0b609a046b92454a4d005.png";
import { LoaderCircle } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-6">
      <div className="flex-1 flex items-center justify-center">
        <img src={logo} alt="TurjiTrade" className="w-64 h-auto" />
      </div>
      
      <div className="mb-12 flex flex-col items-center gap-4">
        <LoaderCircle className="w-8 h-8 text-[#F97316] animate-spin" />
        <p className="text-[#94A3B8] text-sm">Design by EliaTurjeman</p>
      </div>
    </div>
  );
}
