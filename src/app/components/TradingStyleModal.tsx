import { X, TrendingUp, ChartLine } from 'lucide-react';

interface TradingStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: 'day' | 'long';
  onSelectStyle: (style: 'day' | 'long') => void;
}

export default function TradingStyleModal({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle
}: TradingStyleModalProps) {
  if (!isOpen) return null;

  const handleSelect = (style: 'day' | 'long') => {
    onSelectStyle(style);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl w-full max-w-md border border-[#334155] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <h2 className="text-xl font-bold text-white">בחר סגנון מסחר</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#334155] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Day Trading Option */}
          <button
            onClick={() => handleSelect('day')}
            className={`w-full p-5 rounded-xl border-2 transition-all text-right ${
              currentStyle === 'day'
                ? 'border-[#F97316] bg-[#F97316]/10 shadow-lg shadow-[#F97316]/20'
                : 'border-[#334155] hover:border-[#F97316]/50 hover:bg-[#F97316]/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                currentStyle === 'day' 
                  ? 'bg-[#F97316] text-white' 
                  : 'bg-[#334155] text-[#F97316]'
              }`}>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">מסחר יומי</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  מתאים למסחר קצר טווח, תנועות מהירות, ורווחים יומיים. המערכת תמליץ על מניות עם תנודתיות גבוהה ופוטנציאל לרווח מהיר.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-[#F97316]/20 text-[#F97316] text-xs rounded-lg">
                    תנודתיות גבוהה
                  </span>
                  <span className="px-2 py-1 bg-[#F97316]/20 text-[#F97316] text-xs rounded-lg">
                    רווחים מהירים
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Long-term Trading Option */}
          <button
            onClick={() => handleSelect('long')}
            className={`w-full p-5 rounded-xl border-2 transition-all text-right ${
              currentStyle === 'long'
                ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg shadow-[#06B6D4]/20'
                : 'border-[#334155] hover:border-[#06B6D4]/50 hover:bg-[#06B6D4]/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                currentStyle === 'long' 
                  ? 'bg-[#06B6D4] text-white' 
                  : 'bg-[#334155] text-[#06B6D4]'
              }`}>
                <ChartLine className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">מסחר לטווח ארוך</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  מתאים להשקעות ארוכות טווח, צמיחה יציבה, וביטחון פיננסי. המערכת תמליץ על מניות יציבות עם פוטנציאל צמיחה לאורך זמן.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-[#06B6D4]/20 text-[#06B6D4] text-xs rounded-lg">
                    יציבות
                  </span>
                  <span className="px-2 py-1 bg-[#06B6D4]/20 text-[#06B6D4] text-xs rounded-lg">
                    צמיחה מתמדת
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#334155]">
          <p className="text-xs text-[#64748B] text-center">
            💡 ניתן לשנות את סגנון המסחר בכל עת מהפרופיל
          </p>
        </div>
      </div>
    </div>
  );
}
