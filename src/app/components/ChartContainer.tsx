import { useState, useEffect } from 'react';
import InvestingChart from './InvestingChart';
import TradingViewWidget from './TradingViewWidget';
import GoogleFinanceChart from './GoogleFinanceChart';
import YahooFinanceChart from './YahooFinanceChart';
import ChartSelectorModal from './ChartSelectorModal';
import { Settings, TrendingUp, CircleAlert, TriangleAlert } from 'lucide-react';

interface ChartContainerProps {
  symbol: string;
  height?: number;
}

type ChartSource = 'investing' | 'tradingview' | 'google' | 'yahoo';

// Fallback order: TradingView -> Investing -> Yahoo -> Google
const FALLBACK_ORDER: ChartSource[] = ['tradingview', 'investing', 'yahoo', 'google'];

export default function ChartContainer({ symbol, height = 400 }: ChartContainerProps) {
  // Load preference from localStorage, default to TradingView (first in fallback order)
  const [chartSource, setChartSource] = useState<ChartSource>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chartSource');
      // If saved source was 'finlogix', default to 'tradingview'
      if (saved === 'finlogix') {
        return 'tradingview';
      }
      return (saved as ChartSource) || 'tradingview';
    }
    return 'tradingview';
  });

  const [currentSource, setCurrentSource] = useState<ChartSource>(chartSource);
  const [failedSources, setFailedSources] = useState<Set<ChartSource>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('chartSource', chartSource);
  }, [chartSource]);

  // Reset failed sources when symbol changes
  useEffect(() => {
    setFailedSources(new Set());
    setCurrentSource(chartSource);
    setShowFallbackNotice(false);
  }, [symbol, chartSource]);

  const handleChartError = (source: ChartSource) => {
    console.log(`⚠️ Chart error detected for ${source}, attempting fallback...`);
    
    const newFailedSources = new Set(failedSources);
    newFailedSources.add(source);
    setFailedSources(newFailedSources);

    // Find next available source from fallback order
    const currentIndex = FALLBACK_ORDER.indexOf(source);
    const nextSource = FALLBACK_ORDER.slice(currentIndex + 1).find(s => !newFailedSources.has(s));

    if (nextSource) {
      console.log(`✅ Falling back to: ${nextSource}`);
      setCurrentSource(nextSource);
      setShowFallbackNotice(true);
      
      // Hide notice after 5 seconds
      setTimeout(() => setShowFallbackNotice(false), 5000);
    } else {
      console.error('❌ All chart sources have failed!');
    }
  };

  const getSourceName = (source: ChartSource): string => {
    const names: Record<ChartSource, string> = {
      investing: 'Investing.com',
      tradingview: 'TradingView',
      google: 'Google Finance',
      yahoo: 'Yahoo Finance',
    };
    return names[source];
  };

  const getSourceColor = (source: ChartSource): string => {
    const colors: Record<ChartSource, string> = {
      investing: '#F97316',
      tradingview: '#2962FF',
      google: '#4285F4',
      yahoo: '#720E9E',
    };
    return colors[source];
  };

  return (
    <div className="space-y-3">
      {/* Fallback Notice */}
      {showFallbackNotice && currentSource !== chartSource && (
        <div className="bg-gradient-to-r from-[#F97316]/20 to-[#FB923C]/20 border-2 border-[#F97316] rounded-xl p-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="bg-[#F97316] p-2 rounded-lg mt-0.5">
              <TriangleAlert className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[#F1F5F9] font-bold mb-1">מעבר אוטומטי למקור חלופי</p>
              <p className="text-[#CBD5E1] text-sm">
                {getSourceName(chartSource)} לא זמין כרגע. המערכת עברה אוטומטית ל-{getSourceName(currentSource)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Source Button - Floating action button style */}
      <div className="relative">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-4 border-2 border-[#334155] hover:border-[#475569] shadow-xl hover:shadow-2xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-lg transition-all group-hover:scale-110"
                style={{ backgroundColor: `${getSourceColor(currentSource)}20` }}
              >
                <TrendingUp 
                  className="w-5 h-5"
                  style={{ color: getSourceColor(currentSource) }}
                />
              </div>
              <div className="text-right">
                <p className="text-[#94A3B8] text-xs mb-0.5">מקור נתונים נוכחי</p>
                <p className="text-[#F1F5F9] font-bold">
                  {getSourceName(currentSource)}
                  {currentSource !== chartSource && (
                    <span className="text-[#F97316] text-xs mr-2">(חלופי)</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8] text-sm hidden sm:block">לחץ לשינוי מקור</span>
              <div className="bg-[#334155] group-hover:bg-[#475569] p-2 rounded-lg transition-all">
                <Settings className="w-5 h-5 text-[#94A3B8] group-hover:text-[#F1F5F9] group-hover:rotate-90 transition-all" />
              </div>
            </div>
          </div>
        </button>

        {/* Quick hint */}
        <div className="mt-2 text-center">
          <p className="text-[#64748B] text-xs">
            💡 סדר עדיפות אוטומטי: TradingView → Investing → Yahoo → Google
          </p>
        </div>
      </div>

      {/* Chart Display with smooth transition */}
      <div className="relative animate-fadeIn">
        {currentSource === 'investing' && (
          <InvestingChart 
            symbol={symbol} 
            height={height} 
            showSourceBadge={false}
            onError={() => handleChartError('investing')}
          />
        )}
        {currentSource === 'tradingview' && (
          <TradingViewWidget 
            symbol={symbol} 
            height={height}
            onError={() => handleChartError('tradingview')}
          />
        )}
        {currentSource === 'google' && (
          <GoogleFinanceChart 
            symbol={symbol} 
            height={height}
            onError={() => handleChartError('google')}
          />
        )}
        {currentSource === 'yahoo' && (
          <YahooFinanceChart 
            symbol={symbol} 
            height={height}
            onError={() => handleChartError('yahoo')}
          />
        )}
      </div>

      {/* Chart Selector Modal */}
      <ChartSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentSource={chartSource}
        onSelect={(source) => {
          setChartSource(source);
          setCurrentSource(source);
          setFailedSources(new Set());
          setShowFallbackNotice(false);
        }}
      />
    </div>
  );
}