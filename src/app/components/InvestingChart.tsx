import { useEffect, useRef, useState } from 'react';
import { Maximize2, X, TrendingUp } from 'lucide-react';

interface InvestingChartProps {
  symbol: string;
  height?: number;
  showSourceBadge?: boolean;
  onError?: () => void;
}

export default function InvestingChart({ symbol, height = 400, showSourceBadge = true, onError }: InvestingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';
    setLoading(true);
    const container = containerRef.current;

    // Verified pair IDs from Investing.com (December 2024)
    const symbolToPairId: { [key: string]: string } = {
      'AAPL': '6408',      // Apple Inc - verified
      'MSFT': '599',       // Microsoft Corp - verified
      'GOOGL': '941627',   // Alphabet Inc - verified
      'GOOG': '941627',    // Alphabet Inc - verified
      'AMZN': '952518',    // Amazon.com - verified
      'TSLA': '13994',     // Tesla Inc - verified
      'META': '952518',    // Meta Platforms - verified
      'NVDA': '6369',      // NVIDIA Corp - verified
      'AMD': '8274',       // AMD - verified
      'NFLX': '13063',     // Netflix - verified
      'INTC': '252',       // Intel - verified
      'BABA': '941155',    // Alibaba - verified
      'JPM': '267',        // JPMorgan - verified
      'V': '1061443',      // Visa - verified
      'WMT': '558',        // Walmart - verified
      'DIS': '223',        // Disney - verified
      'BA': '238',         // Boeing - verified
      'COST': '236',       // Costco - verified
      'NKE': '1067',       // Nike - verified
      'PYPL': '1145427',   // PayPal - verified
      'ADBE': '1193',      // Adobe - verified
      'CRM': '972543',     // Salesforce - verified
      'ORCL': '1130',      // Oracle - verified
      'CSCO': '234',       // Cisco - verified
    };

    const pairId = symbolToPairId[symbol];
    
    if (!pairId) {
      console.warn(`⚠️ Investing.com: No pair_ID for ${symbol}, triggering fallback`);
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'flex items-center justify-center h-full bg-[#0F172A] rounded-xl border-2 border-[#F97316]/30';
      errorDiv.style.height = `${height}px`;
      errorDiv.innerHTML = `
        <div class="text-center p-8">
          <p class="text-[#F97316] font-bold mb-2">⚠️ מנייה לא נתמכת</p>
          <p class="text-[#94A3B8] text-sm">עובר למקור חלופי...</p>
        </div>
      `;
      container.appendChild(errorDiv);
      
      // Trigger fallback
      if (onError) {
        setTimeout(() => onError(), 1000);
      }
      return;
    }
    
    const chartHeight = isFullscreen ? window.innerHeight - 100 : height;
    
    // Create iframe for Investing.com chart (candles only)
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = `${chartHeight}px`;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.borderRadius = isFullscreen ? '0' : '12px';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allowtransparency', 'true');
    
    // Build Investing.com chart URL - always use candles (plotStyle=1)
    const baseUrl = 'https://ssltvc.investing.com/';
    const params = new URLSearchParams({
      'pair_ID': pairId,
      'height': String(chartHeight),
      'width': '100%',
      'interval': '86400',        // Daily
      'plotStyle': '1',            // 1=candles (only supported style)
      'domain_ID': '1',           // International
      'lang_ID': '1',             // English
      'timezone_ID': '8',         // UTC
    });
    
    const fullUrl = `${baseUrl}?${params.toString()}`;
    iframe.src = fullUrl;
    
    console.log(`📊 Investing.com: Loading ${symbol} (pair_ID: ${pairId}) - Candles only`);
    
    container.appendChild(iframe);
    
    // Hide loading after delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, height, isFullscreen, onError]);

  const currentHeight = isFullscreen ? window.innerHeight - 100 : height;

  return (
    <div className="relative">
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border-2 border-[#F97316] z-30"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-[#F97316] animate-pulse mx-auto mb-3" />
            <p className="text-[#F1F5F9] font-bold mb-1">טוען Investing.com</p>
            <p className="text-[#94A3B8] text-sm">נתונים אמיתיים בזמן אמת...</p>
          </div>
        </div>
      )}

      {/* Control Buttons Bar - Only Fullscreen */}
      <div className="absolute top-2 right-2 z-20">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-[#1E293B]/95 backdrop-blur-sm hover:bg-[#334155] text-[#F1F5F9] p-2 rounded-lg transition-colors shadow-lg border border-[#334155]"
          title={isFullscreen ? 'צא ממסך מלא' : 'מסך מלא'}
        >
          {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Data Source Badge */}
      {showSourceBadge && !loading && (
        <div className="absolute bottom-2 left-2 z-20 bg-[#1E293B]/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-[#334155]">
          <span className="text-[#94A3B8] text-[10px] sm:text-xs flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-pulse"></span>
            Investing.com • 🕯️ נרות יפניים
          </span>
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className={`w-full rounded-xl overflow-hidden bg-[#0F172A] border-2 border-[#334155] ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
        }`}
        style={{ 
          minHeight: `${currentHeight}px`,
          ...(isFullscreen && {
            paddingTop: '50px',
            paddingBottom: '20px',
          })
        }}
      />

      {/* Fullscreen Overlay Background */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-[#0F172A] z-40" />
      )}
    </div>
  );
}
