import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, RefreshCw, Maximize2, Minimize2, Bot } from 'lucide-react';
import { isMarketOpen } from '../services/stockApi';
import TradingViewChart from './TradingViewChart';
import FinancialsTabContent from './FinancialsTabContent';
import RecommendationsTabContent from './RecommendationsTabContent';
import CompanyTabContent from './CompanyTabContent';

interface StockDetailModalProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    signal: string;
    strength: number;
    target: number;
    stopLoss: number;
  };
  onClose: () => void;
  onRemoveFromWatchlist?: () => void;
  onRemoveFromAnalysis?: () => void;
  onOpenTurjiBot?: (context: string) => void;
  userPosition?: {
    isTrading: boolean;
    entryPrice?: number;
    quantity?: number;
  };
}

export default function StockDetailModal({ stock, onClose, onRemoveFromWatchlist, onRemoveFromAnalysis, onOpenTurjiBot, userPosition }: StockDetailModalProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'recommendations' | 'financials' | 'company'>('analysis');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentStock, setCurrentStock] = useState(stock);

  // Auto-refresh every 10 seconds during market hours, otherwise every 60 seconds
  useEffect(() => {
    const updateInterval = isMarketOpen() ? 10000 : 60000;
    
    const interval = setInterval(async () => {
      setIsRefreshing(true);
      
      try {
        // Fetch fresh price data from server during auto-refresh
        const { fetchStockPrice } = await import('../services/stockApi');
        const freshData = await fetchStockPrice(stock.symbol);
        
        if (freshData) {
          setCurrentStock({
            ...stock,
            price: freshData.price,
            change: freshData.changePercent
          });
          console.log(`🔄 Auto-refresh ${stock.symbol}: $${freshData.price} (${freshData.changePercent > 0 ? '+' : ''}${freshData.changePercent}%)`);
        }
      } catch (error) {
        console.error('❌ Auto-refresh failed:', error);
      }
      
      setLastUpdate(new Date());
      setRefreshTrigger(prev => prev + 1);
      setIsRefreshing(false);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [stock.symbol]);

  // Fetch fresh data immediately when modal opens
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log(`📊 Loading fresh data for ${stock.symbol}...`);
      try {
        const { fetchStockPrice } = await import('../services/stockApi');
        const freshData = await fetchStockPrice(stock.symbol);
        
        if (freshData) {
          setCurrentStock({
            ...stock,
            price: freshData.price,
            change: freshData.changePercent
          });
          console.log(`✅ Initial load ${stock.symbol}: $${freshData.price} (${freshData.changePercent > 0 ? '+' : ''}${freshData.changePercent}%)`);
        }
      } catch (error) {
        console.error('❌ Initial load failed:', error);
      }
    };
    
    fetchInitialData();
  }, [stock.symbol]);

  const manualRefresh = async () => {
    setIsRefreshing(true);
    console.log(`🔄 Manual refresh for ${stock.symbol}...`);
    
    try {
      // Import stockApi dynamically to avoid circular dependencies
      const { fetchStockPrice } = await import('../services/stockApi');
      
      // Fetch fresh price data from server
      const freshData = await fetchStockPrice(stock.symbol);
      
      if (freshData) {
        // Update the current stock with fresh data
        setCurrentStock({
          ...stock,
          price: freshData.price,
          change: freshData.changePercent
        });
        console.log(`✅ Refreshed ${stock.symbol}: $${freshData.price} (${freshData.changePercent > 0 ? '+' : ''}${freshData.changePercent}%)`);
      }
    } catch (error) {
      console.error('❌ Failed to refresh stock data:', error);
    }
    
    // Trigger re-fetch of all tabs
    setRefreshTrigger(prev => prev + 1);
    setLastUpdate(new Date());
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const isPositive = currentStock.change >= 0;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getStockExchange = (symbol: string): string => {
    const nasdaqStocks = [
      'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 
      'NFLX', 'AMD', 'INTC', 'CSCO', 'ADBE', 'AVGO', 'QCOM', 'TXN',
      'COST', 'CMCSA', 'PEP', 'TMUS', 'SBUX', 'MDLZ', 'PYPL', 'ABNB',
      'PANW', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MRVL', 'FTNT', 'WDAY',
      'DXCM', 'REGN', 'VRTX', 'ILMN', 'BIIB', 'MRNA', 'GILD', 'AMGN'
    ];
    
    const nyseStocks = [
      'WMT', 'V', 'MA', 'JPM', 'JNJ', 'UNH', 'HD', 'BAC', 'PG', 'CVX',
      'XOM', 'ABBV', 'LLY', 'MRK', 'KO', 'PFE', 'DIS', 'NKE', 'VZ',
      'ORCL', 'CRM', 'BA', 'T', 'GE', 'F', 'GM', 'C', 'WFC', 'MS',
      'GS', 'AXP', 'IBM', 'CAT', 'MMM', 'HON', 'UPS', 'RTX', 'LMT'
    ];

    if (nasdaqStocks.includes(symbol)) {
      return 'NASDAQ';
    } else if (nyseStocks.includes(symbol)) {
      return 'NYSE';
    } else {
      return 'NASDAQ';
    }
  };

  const handleAskTurjiBot = () => {
    if (onOpenTurjiBot) {
      const context = `אני מסתכל על ${stock.symbol} (${stock.name}). המחיר: $${stock.price.toFixed(2)} (${isPositive ? '+' : ''}${stock.change.toFixed(2)}%). הסיגנל: ${stock.signal}. עוצמה: ${stock.strength}%. ${userPosition?.isTrading ? `יש לי פוזיציה פתוחה - נכנסתי ב-$${userPosition.entryPrice?.toFixed(2)} עם ${userPosition.quantity} מניות.` : 'אין לי פוזיציה פתוחה כרגע.'}`;
      onOpenTurjiBot(context);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-[2vw]" onClick={onClose}>
        <div 
          className="bg-[#1E293B] rounded-[3vw] shadow-2xl w-full max-w-[95vw] max-h-[90vh] overflow-hidden border border-[#334155]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b border-[#334155] p-[3vw] flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-[2vw] flex-wrap mb-[1vh]">
                <h2 className="text-[#F1F5F9] text-[5vw]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  {stock.symbol}
                </h2>
                <span className="text-[#94A3B8] text-[3.5vw] font-['Heebo']">{stock.name}</span>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="text-[#F97316] hover:text-[#F1F5F9] transition-colors p-[1vw] hover:bg-[#334155] rounded-lg"
                  title="הצג גרף במסך מלא"
                >
                  <Maximize2 className="w-[4vw] h-[4vw]" />
                </button>
              </div>
              <div className="flex items-center gap-[3vw] flex-wrap">
                <div className="flex items-center gap-[2vw]">
                  <div className="flex flex-col items-start">
                    <span className="text-[#F1F5F9] text-[6vw]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      ${currentStock.price.toFixed(2)}
                    </span>
                    <span className="text-[#64748B] text-[2.5vw] font-['Heebo']">Finnhub API</span>
                  </div>
                  <div className={`flex items-center gap-[1vw] text-[4vw] ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {isPositive ? <TrendingUp className="w-[5vw] h-[5vw]" /> : <TrendingDown className="w-[5vw] h-[5vw]" />}
                    <span style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      {isPositive ? '+' : ''}{currentStock.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-[2vw] text-[#94A3B8] text-[2.5vw] font-['Heebo']">
                  <RefreshCw className={`w-[3vw] h-[3vw] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>עדכון אחרון: {formatTime(lastUpdate)}</span>
                  {isMarketOpen() && (
                    <span className="flex items-center gap-[1vw] text-[#10B981]">
                      <span className="w-[1.5vw] h-[1.5vw] bg-[#10B981] rounded-full animate-pulse"></span>
                      <span className="text-[2.5vw]">שוק פתוח</span>
                    </span>
                  )}
                  <button 
                    onClick={manualRefresh}
                    disabled={isRefreshing}
                    className="text-[#F97316] hover:text-[#F1F5F9] transition-colors px-[1.5vw] py-[0.5vh] hover:bg-[#334155] rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    רענן
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors p-[1vw] hover:bg-[#334155] rounded-lg shrink-0"
            >
              <X className="w-[5vw] h-[5vw]" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-20vh)]">
            {/* Tabs Navigation */}
            <div className="sticky top-0 z-10 bg-[#0F172A] border-b border-[#334155] px-[3vw] flex gap-[2vw] overflow-x-auto">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-[4vw] py-[2vh] text-[3vw] transition-all whitespace-nowrap font-['Heebo'] ${
                  activeTab === 'analysis'
                    ? 'text-[#F97316] border-b-2 border-[#F97316]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                ניתוח טכני
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-[4vw] py-[2vh] text-[3vw] transition-all whitespace-nowrap font-['Heebo'] ${
                  activeTab === 'recommendations'
                    ? 'text-[#F97316] border-b-2 border-[#F97316]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                המלצות AI
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`px-[4vw] py-[2vh] text-[3vw] transition-all whitespace-nowrap font-['Heebo'] ${
                  activeTab === 'financials'
                    ? 'text-[#F97316] border-b-2 border-[#F97316]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                נתונים פיננסיים
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`px-[4vw] py-[2vh] text-[3vw] transition-all whitespace-nowrap font-['Heebo'] ${
                  activeTab === 'company'
                    ? 'text-[#F97316] border-b-2 border-[#F97316]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                רקע על החברה
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-[4vw] space-y-[3vh]">
              {activeTab === 'analysis' && (
                <div className="space-y-[2vh]">
                  {/* TradingView Chart */}
                  <div className="bg-[#0F172A] rounded-[3vw] p-[3vw] border border-[#334155]">
                    <div className="bg-[#1E293B] rounded-[2vw] overflow-hidden">
                      <TradingViewChart symbol={stock.symbol} height={400} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(onRemoveFromWatchlist || onRemoveFromAnalysis) && (
                    <div className="flex gap-[3vw]">
                      {onRemoveFromWatchlist && (
                        <button
                          onClick={() => {
                            onRemoveFromWatchlist();
                            onClose();
                          }}
                          className="flex-1 bg-[#0F172A] hover:bg-[#EF4444]/10 text-[#EF4444] border border-[#334155] hover:border-[#EF4444] px-[4vw] py-[1.5vh] rounded-[2vw] transition-all flex items-center justify-center gap-[2vw] text-[3.5vw] font-['Heebo']"
                        >
                          <X className="w-[4vw] h-[4vw]" />
                          <span>הסר מרשימת מעקב</span>
                        </button>
                      )}
                      {onRemoveFromAnalysis && (
                        <button
                          onClick={() => {
                            onRemoveFromAnalysis();
                            onClose();
                          }}
                          className="flex-1 bg-[#0F172A] hover:bg-[#EF4444]/10 text-[#EF4444] border border-[#334155] hover:border-[#EF4444] px-[4vw] py-[1.5vh] rounded-[2vw] transition-all flex items-center justify-center gap-[2vw] text-[3.5vw] font-['Heebo']"
                        >
                          <X className="w-[4vw] h-[4vw]" />
                          <span>הסר מניתוחים</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <RecommendationsTabContent stock={stock} userPosition={userPosition} />
              )}

              {activeTab === 'financials' && (
                <FinancialsTabContent symbol={stock.symbol} />
              )}

              {activeTab === 'company' && (
                <CompanyTabContent symbol={stock.symbol} stockExchange={getStockExchange(stock.symbol)} />
              )}
            </div>
          </div>

          {/* Floating TurjiBot Button */}
          {onOpenTurjiBot && (
            <button
              onClick={handleAskTurjiBot}
              className="fixed bottom-[3vh] right-[4vw] w-[14vw] h-[14vw] bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] text-white rounded-full shadow-lg shadow-[#F97316]/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 group"
              title="שאל את TurjiBot"
            >
              <Bot className="w-[6vw] h-[6vw]" />
              <span className="absolute -top-[6vh] left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-[2.5vw] px-[3vw] py-[1vh] rounded-[1vw] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-[#334155] pointer-events-none font-['Heebo']">
                שאל את TurjiBot
              </span>
            </button>
          )}
        </div>
      </div>
      
      {/* Fullscreen Chart Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-[#0F172A] z-[60] flex flex-col">
          {/* Fullscreen Header */}
          <div className="bg-[#1E293B] border-b border-[#334155] p-4 sm:p-6 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <h2 className="text-[#F1F5F9] text-lg sm:text-2xl" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                {stock.symbol}
              </h2>
              <span className="text-[#94A3B8] text-sm sm:text-base hidden sm:inline">{stock.name}</span>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-[#F1F5F9] text-base sm:text-xl" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  ${currentStock.price.toFixed(2)}
                </span>
                <div className={`flex items-center gap-1 text-sm sm:text-base ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {isPositive ? '+' : ''}{currentStock.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-[#F97316] hover:text-[#F1F5F9] transition-colors p-2 hover:bg-[#334155] rounded-lg shrink-0"
            >
              <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          {/* Fullscreen Chart */}
          <div className="flex-1 p-2 sm:p-4 overflow-hidden">
            <div className="h-full w-full">
              <TradingViewChart symbol={stock.symbol} height={typeof window !== 'undefined' ? window.innerHeight - 120 : 600} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}