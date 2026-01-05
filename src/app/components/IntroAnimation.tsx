import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import logoSymbol from "figma:asset/327dd8ee4059d89fe3ac2837887f67eb58262423.png";
import logoText from "figma:asset/da5fc13ec8be857a2ec0b609a046b92454a4d005.png";

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [stage, setStage] = useState<1 | 2>(1);

  useEffect(() => {
    // Stage 1: Symbol only center - 1.2s
    const timer1 = setTimeout(() => {
      setStage(2);
    }, 1200);

    // Stage 2: Symbol + Text - hold 1.8s then complete
    const timer2 = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#19192e] overflow-hidden">
      {/* Symbol stays in fixed position */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
        <div className="flex items-center gap-0">
          {/* Text slides in from right - only visible in stage 2 */}
          {stage === 2 && (
            <motion.img 
              src={logoText} 
              alt="TURJITRADE" 
              className="w-[253px] h-[57px] object-contain"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
          
          {/* Symbol - always visible, stays in same position */}
          <motion.img 
            src={logoSymbol} 
            alt="TurjiTrade Symbol" 
            className="w-[83px] h-[67px] object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Design by credit - only in stage 2 */}
      {stage === 2 && (
        <motion.div
          className="absolute bottom-[117px] left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="font-['Heebo',sans-serif] text-[#94a3b8] text-[14px] whitespace-nowrap">
            Design by EliaTurjeman
          </p>
        </motion.div>
      )}
    </div>
  );
}