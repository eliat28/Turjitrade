import { X, TrendingUp, ChartBar, DollarSign, Activity, Zap, Check, Globe } from 'lucide-react';
import { useEffect } from 'react';

interface ChartSource {
  id: 'investing' | 'tradingview' | 'google' | 'yahoo';
  name: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  badge: string;
  recommended?: boolean;
}

const chartSources: ChartSource[] = [
  {
    id: 'tradingview',
    name: 'TradingView',
    description: 'גרפים מקצועיים עם כלי ניתוח טכני מתקדמים',
    icon: ChartBar,
    color: '#2962FF',
    gradient: 'from-[#2962FF] to-[#1E40AF]',
    badge: 'מומלץ ⭐',
    recommended: true,
  },
  {
    id: 'investing',
    name: 'Investing.com',
    description: 'גרפים יציבים ומהירים עם נתונים בזמן אמת',
    icon: TrendingUp,
    color: '#F97316',
    gradient: 'from-[#F97316] to-[#EA580C]',
    badge: 'יציב ✓',
    recommended: true,
  },
  {
    id: 'yahoo',
    name: 'Yahoo Finance',
    description: 'נתונים פיננסיים מקיפים עם נרות יפניים',
    icon: DollarSign,
    color: '#720E9E',
    gradient: 'from-[#720E9E] to-[#5B0A7F]',
    badge: 'נרות 🕯️',
    recommended: false,
  },
  {
    id: 'google',
    name: 'Google Finance',
    description: 'נתוני מניות בזמן אמת ממנוע החיפוש הגדול בעולם',
    icon: Globe,
    color: '#4285F4',
    gradient: 'from-[#4285F4] to-[#1967D2]',
    badge: 'גלובלי 🌍',
    recommended: false,
  },
];

interface ChartSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: string;
  onSelect: (source: ChartSource['id']) => void;
}

export default function ChartSelectorModal({ isOpen, onClose, currentSource, onSelect }: ChartSelectorModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (sourceId: ChartSource['id']) => {
    onSelect(sourceId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl border-2 border-[#334155] shadow-2xl animate-scaleIn max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#F97316] to-[#06B6D4] p-6 border-b-2 border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-2xl font-bold">בחר מקור גרף</h2>
              <p className="text-white/90 text-sm mt-1">בחר את ספק הנתונים המועדף עליך</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all hover:rotate-90"
              aria-label="סגור"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chartSources.map((source) => {
              const Icon = source.icon;
              const isSelected = currentSource === source.id;
              
              return (
                <button
                  key={source.id}
                  onClick={() => handleSelect(source.id)}
                  className={`relative group p-4 rounded-xl border-2 transition-all text-right overflow-hidden ${
                    isSelected
                      ? `bg-gradient-to-br ${source.gradient} border-white shadow-xl scale-[1.02]`
                      : 'bg-[#0F172A]/50 border-[#334155] hover:border-[#475569] hover:bg-[#1E293B]/50'
                  }`}
                >
                  {/* Recommended Badge */}
                  {source.recommended && !isSelected && (
                    <div className="absolute top-2 left-2 bg-[#10B981] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      מומלץ
                    </div>
                  )}
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 bg-white text-[#0F172A] rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div 
                      className={`p-3 rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-white/20' 
                          : 'bg-[#334155]/50 group-hover:bg-[#334155]'
                      }`}
                      style={!isSelected ? { backgroundColor: `${source.color}20` } : {}}
                    >
                      <Icon 
                        className={`w-6 h-6 transition-all ${
                          isSelected 
                            ? 'text-white scale-110' 
                            : 'group-hover:scale-110'
                        }`}
                        style={!isSelected ? { color: source.color } : {}}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${isSelected ? 'text-white' : 'text-[#F1F5F9]'}`}>
                          {source.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-[#334155] text-[#94A3B8]'
                        }`}>
                          {source.badge}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${
                        isSelected ? 'text-white/90' : 'text-[#94A3B8]'
                      }`}>
                        {source.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  {!isSelected && (
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                      style={{ backgroundColor: source.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-[#0F172A]/50 border-2 border-[#334155] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-[#06B6D4]/20 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <div>
                <h4 className="text-[#F1F5F9] font-bold text-sm mb-1">💡 טיפ מקצועי</h4>
                <p className="text-[#94A3B8] text-xs leading-relaxed">
                  כל המקורות מציגים <span className="text-[#F97316] font-bold">נתונים אמיתיים 100%</span> בזמן אמת. 
                  אנו ממליצים על <span className="text-[#06B6D4] font-bold">Investing.com</span> או{' '}
                  <span className="text-[#2962FF] font-bold">TradingView</span> לחוויה הטובה ביותר. יש לך גם <span className="text-[#4285F4] font-bold">Google Finance</span> ו-<span className="text-[#720E9E] font-bold">Yahoo Finance</span> כאופציות נוספות!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}