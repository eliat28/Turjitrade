import { useState } from 'react';
import { X, Search, TrendingUp, TrendingDown, Loader, Target, TriangleAlert, Maximize2, Minimize2, ExternalLink, Calendar } from 'lucide-react';
import { fetchStockQuote } from '../services/stockApi';
import TradingViewChart from './TradingViewChart';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface NewAnalysisModalProps {
  onClose: () => void;
  onAddAnalysis: (analysisData: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    signal: string;
    recommendation: string;
    hasPosition?: boolean;
    entryPrice?: number;
    quantity?: number;
    alertActive?: boolean;
    alertPrice?: number;
  }) => void;
}

export default function NewAnalysisModal({ onClose, onAddAnalysis }: NewAnalysisModalProps) {
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('3 חודשים');
  const [stockData, setStockData] = useState<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    signal: string;
    strength: number;
    target: number;
    stopLoss: number;
    aiConfidence: number;
    recommendation: string;
  } | null>(null);
  const [error, setError] = useState('');
  
  // Position tracking
  const [hasPosition, setHasPosition] = useState(false);
  const [entryPrice, setEntryPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [investment, setInvestment] = useState('');
  const [alertActive, setAlertActive] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');

  // Company name to symbol mapping
  const nameToSymbolMap: Record<string, string> = {
    'apple': 'AAPL',
    'tesla': 'TSLA',
    'nvidia': 'NVDA',
    'microsoft': 'MSFT',
    'google': 'GOOGL',
    'alphabet': 'GOOGL',
    'amazon': 'AMZN',
    'meta': 'META',
    'facebook': 'META',
    'amd': 'AMD',
    'netflix': 'NFLX',
    'disney': 'DIS',
    'coca cola': 'KO',
    'pepsi': 'PEP',
    'nike': 'NKE',
    'intel': 'INTC',
    'cisco': 'CSCO',
    'oracle': 'ORCL',
    'salesforce': 'CRM',
    'adobe': 'ADBE',
    'paypal': 'PYPL',
    'visa': 'V',
    'mastercard': 'MA',
    'walmart': 'WMT',
    'target': 'TGT',
    'starbucks': 'SBUX',
    'mcdonalds': 'MCD',
    'boeing': 'BA',
    'airbus': 'EADSY',
    'ford': 'F',
    'gm': 'GM',
    'general motors': 'GM',
    'exxon': 'XOM',
    'chevron': 'CVX',
    'pfizer': 'PFE',
    'moderna': 'MRNA',
    'johnson': 'JNJ',
    'uber': 'UBER',
    'lyft': 'LYFT',
    'airbnb': 'ABNB',
    'spotify': 'SPOT',
    'snap': 'SNAP',
    'snapchat': 'SNAP',
    'twitter': 'TWTR',
    'pinterest': 'PINS',
    'zoom': 'ZM',
    'slack': 'WORK',
    'square': 'SQ',
    'robinhood': 'HOOD',
    'coinbase': 'COIN',
    'shopify': 'SHOP',
    'etsy': 'ETSY',
    'ebay': 'EBAY',
    'alibaba': 'BABA',
    'tencent': 'TCEHY',
    'baidu': 'BIDU',
    'jd': 'JD',
    'nio': 'NIO',
    'lucid': 'LCID',
    'rivian': 'RIVN',
    'palantir': 'PLTR',
    'snowflake': 'SNOW',
    'databricks': 'SNOW',
    'roblox': 'RBLX',
    'unity': 'U',
    'draftkings': 'DKNG',
    'penn': 'PENN'
  };

  const analyzeStock = async () => {
    if (!symbol.trim()) {
      setError('אנא הזן סימול או שם מניה');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Try to find symbol from company name
      let symbolToSearch = symbol.toUpperCase();
      const lowerInput = symbol.toLowerCase().trim();
      
      // Check if user entered a company name
      if (nameToSymbolMap[lowerInput]) {
        symbolToSearch = nameToSymbolMap[lowerInput];
      }

      // Fetch Real Data from Server (Consistent with StockCard)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90/stock-details/${symbolToSearch}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        setError('לא נמצאה מניה עם הסימול או השם הזה');
        setIsLoading(false);
        return;
      }

      // Use REAL data from server (No Randomness)
      const quote = {
        symbol: data.symbol,
        price: data.price,
        changePercent: data.changePercent,
        name: data.name
      };

      setStockData({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.changePercent,
        signal: data.signal || 'המתן',
        strength: data.strength || 50,
        target: data.targetPrice || quote.price,
        stopLoss: data.price * 0.9, // Default fallback if not provided
        aiConfidence: data.strength || 50, // Use signal strength as confidence
        recommendation: data.analysis || 'ניתוח מבוסס נתונים טכניים'
      });

    } catch (err) {
      console.error("Analysis Error:", err);
      setError('שגיאה בטעינת נתוני המניה. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      analyzeStock();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" dir="rtl">
      <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 w-full max-w-lg border border-[#334155] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <h3 className="text-[#F1F5F9] text-lg sm:text-xl font-['Heebo']">ניתוח מניה חדש</h3>
          <button 
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-[#F1F5F9] mb-2 text-sm sm:text-base font-['Heebo']">
            הזן סימול או שם חברה (לדוגמה: AAPL, Tesla, Nvidia)
          </label>
          <div className="relative">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-[#0F172A] border border-[#334155] text-[#F1F5F9] px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] text-base"
              placeholder="AAPL או Apple"
              style={{ fontFamily: 'Roboto Mono, monospace' }}
              disabled={isLoading}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
          </div>
        </div>

        {/* Timeframe Input */}
        <div className="mb-6">
          <label className="block text-[#F1F5F9] mb-2 text-sm sm:text-base font-['Heebo']">
            טווח ניתוח (אופציונלי)
          </label>
          <div className="relative">
            <input
              type="text"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] text-[#F1F5F9] px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] text-base font-['Heebo']"
              placeholder="לדוגמה: 4 חודשים, שנה, טווח קצר..."
              disabled={isLoading}
            />
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
          </div>
          <p className="text-[#64748B] text-xs mt-1 font-['Heebo']">
            הניתוח יותאם ככל הניתן לטווח הזמן המבוקש.
          </p>
          
          {error && (
            <p className="text-[#EF4444] text-xs sm:text-sm mt-2 font-['Heebo']">{error}</p>
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeStock}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span className="font-['Heebo']">מנתח...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span className="font-['Heebo']">נתח מניה</span>
            </>
          )}
        </button>

        {/* Analysis Results */}
        {stockData && (
          <div className="space-y-4">
            {/* Stock Header */}
            <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-[#F1F5F9] text-lg sm:text-xl mb-1" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {stockData.symbol}
                  </h4>
                  <p className="text-[#94A3B8] text-xs sm:text-sm font-['Heebo']">{stockData.name}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm sm:text-base ${stockData.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {stockData.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-[#F1F5F9] text-2xl sm:text-3xl" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                ${stockData.price.toFixed(2)}
              </div>
            </div>

            {/* AI Signal */}
            <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></div>
                <span className="text-[#94A3B8] text-xs sm:text-sm font-['Heebo']">AI TurjiTrade ({timeframe})</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#F1F5F9] text-base sm:text-lg font-['Heebo']">אות מסחר:</span>
                <span className={`text-base sm:text-lg font-medium font-['Heebo'] ${
                  stockData.signal.includes('קנייה חזקה') ? 'text-[#10B981]' :
                  stockData.signal.includes('קנייה') ? 'text-[#06B6D4]' :
                  'text-[#94A3B8]'
                }`}>
                  {stockData.signal}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs sm:text-sm mb-1 font-['Heebo']">
                  <span className="text-[#94A3B8]">רמת ביטחון AI</span>
                  <span className="text-[#F1F5F9]">{stockData.aiConfidence}%</span>
                </div>
                <div className="w-full bg-[#1E293B] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#F97316] to-[#EA580C] h-2 rounded-full transition-all"
                    style={{ width: `${stockData.aiConfidence}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-[#94A3B8] text-xs sm:text-sm font-['Heebo'] leading-relaxed">{stockData.recommendation}</p>
            </div>

            {/* Price Targets */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[#94A3B8] text-xs sm:text-sm font-['Heebo']">מחיר יעד</span>
                </div>
                <div className="text-[#10B981] text-lg sm:text-xl" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  ${stockData.target.toFixed(2)}
                </div>
                <div className="text-[#64748B] text-xs mt-1 font-['Heebo']" dir="ltr">
                  +{((stockData.target / stockData.price - 1) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
                <div className="flex items-center gap-2 mb-2">
                  <TriangleAlert className="w-4 h-4 text-[#EF4444]" />
                  <span className="text-[#94A3B8] text-xs sm:text-sm font-['Heebo']">סטופ לוס</span>
                </div>
                <div className="text-[#EF4444] text-lg sm:text-xl" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  ${stockData.stopLoss.toFixed(2)}
                </div>
                <div className="text-[#64748B] text-xs mt-1 font-['Heebo']" dir="ltr">
                  {((stockData.stopLoss / stockData.price - 1) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* TradingView Chart */}
            <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[#F1F5F9] text-sm font-['Heebo']">גרף מחיר</h4>
                <a
                  href={`https://www.tradingview.com/chart/?symbol=NASDAQ:${stockData.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#06B6D4] hover:text-[#0EA5E9] transition-colors flex items-center gap-1 text-xs"
                  title="פתח ב-TradingView"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>TradingView</span>
                </a>
              </div>
              <TradingViewChart symbol={stockData.symbol} height={300} />
            </div>

            {/* Position Tracking */}
            <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[#F1F5F9] text-sm sm:text-base flex items-center gap-2 font-['Heebo']">
                  <span>סוחר במנייה זו?</span>
                </label>
                <button
                  onClick={() => setHasPosition(!hasPosition)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    hasPosition ? 'bg-[#F97316]' : 'bg-[#334155]'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      hasPosition ? 'left-1' : 'left-7'
                    }`}
                  ></div>
                </button>
              </div>

              {hasPosition && (
                <div className="space-y-3 pt-2 border-t border-[#334155]">
                  
                  {/* Alert Section */}
                  <div className="flex items-center justify-between">
                     <label className="text-[#94A3B8] text-xs sm:text-sm font-['Heebo']">קבלת התראה</label>
                     <button
                        onClick={() => setAlertActive(!alertActive)}
                        className={`relative w-10 h-5 rounded-full transition-all ${
                          alertActive ? 'bg-[#10B981]' : 'bg-[#334155]'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                            alertActive ? 'left-1' : 'left-6'
                          }`}
                        ></div>
                      </button>
                  </div>

                  {alertActive && (
                    <div>
                        <label className="block text-[#94A3B8] text-xs sm:text-sm mb-1.5 font-['Heebo']">
                          מחיר קבלת התראה ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={alertPrice}
                          onChange={(e) => setAlertPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-[#1E293B] border border-[#334155] text-[#F1F5F9] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-sm"
                          style={{ fontFamily: 'Roboto Mono, monospace' }}
                        />
                    </div>
                  )}

                  {/* Entry Price */}
                  <div>
                    <label className="block text-[#94A3B8] text-xs sm:text-sm mb-1.5 font-['Heebo']">
                      מחיר כניסה ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={entryPrice}
                      onChange={(e) => {
                          const val = e.target.value;
                          setEntryPrice(val);
                          if (quantity && val) {
                              setInvestment((parseFloat(val) * parseFloat(quantity)).toFixed(2));
                          }
                      }}
                      placeholder="0.00"
                      className="w-full bg-[#1E293B] border border-[#334155] text-[#F1F5F9] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-sm"
                      style={{ fontFamily: 'Roboto Mono, monospace' }}
                    />
                  </div>
                  
                  {/* Quantity */}
                  <div>
                    <label className="block text-[#94A3B8] text-xs sm:text-sm mb-1.5 font-['Heebo']">
                      כמות מניות
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={quantity}
                      onChange={(e) => {
                          const val = e.target.value;
                          setQuantity(val);
                          if (entryPrice && val) {
                              setInvestment((parseFloat(entryPrice) * parseFloat(val)).toFixed(2));
                          }
                      }}
                      placeholder="0"
                      className="w-full bg-[#1E293B] border border-[#334155] text-[#F1F5F9] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-sm"
                      style={{ fontFamily: 'Roboto Mono, monospace' }}
                    />
                  </div>

                  {/* Investment (Synced) */}
                  <div>
                    <label className="block text-[#94A3B8] text-xs sm:text-sm mb-1.5 font-['Heebo']">
                      השקעה בדולרים
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={investment}
                      onChange={(e) => {
                          const val = e.target.value;
                          setInvestment(val);
                          if (entryPrice && val && parseFloat(entryPrice) > 0) {
                              setQuantity((parseFloat(val) / parseFloat(entryPrice)).toFixed(2));
                          }
                      }}
                      placeholder="0.00"
                      className="w-full bg-[#1E293B] border border-[#334155] text-[#F1F5F9] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] text-sm"
                      style={{ fontFamily: 'Roboto Mono, monospace' }}
                    />
                  </div>

                  {/* P&L Calculation */}
                  {entryPrice && quantity && parseFloat(entryPrice) > 0 && parseFloat(quantity) > 0 && (
                    <div className="bg-[#1E293B] rounded-lg p-3 border border-[#334155]">
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div>
                          <div className="text-[#94A3B8] mb-1 font-['Heebo']">השקעה</div>
                          <div className="text-[#F1F5F9]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                            ${(parseFloat(entryPrice) * parseFloat(quantity)).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#94A3B8] mb-1 font-['Heebo']">ערך נוכחי</div>
                          <div className="text-[#F1F5F9]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                            ${(stockData.price * parseFloat(quantity)).toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-[#94A3B8] mb-1 font-['Heebo']">רווח/הפסד</div>
                          <div className={`text-base ${
                            (stockData.price - parseFloat(entryPrice)) * parseFloat(quantity) >= 0
                              ? 'text-[#10B981]'
                              : 'text-[#EF4444]'
                          }`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
                            {(stockData.price - parseFloat(entryPrice)) * parseFloat(quantity) >= 0 ? '+' : ''}
                            ${((stockData.price - parseFloat(entryPrice)) * parseFloat(quantity)).toFixed(2)}
                            {' '}
                            ({(stockData.price - parseFloat(entryPrice)) * parseFloat(quantity) >= 0 ? '+' : ''}
                            {(((stockData.price - parseFloat(entryPrice)) / parseFloat(entryPrice)) * 100).toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onAddAnalysis({
                  symbol: stockData.symbol,
                  name: stockData.name,
                  price: stockData.price,
                  change: stockData.change,
                  signal: stockData.signal,
                  recommendation: stockData.recommendation,
                  hasPosition,
                  entryPrice: hasPosition ? parseFloat(entryPrice) : undefined,
                  quantity: hasPosition ? parseFloat(quantity) : undefined,
                  alertActive,
                  alertPrice: alertActive ? parseFloat(alertPrice) : undefined
                })}
                className="flex-1 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] font-['Heebo']"
              >
                שמור ניתוח
              </button>
              <button
                onClick={() => {
                  setStockData(null);
                  setHasPosition(false);
                  setEntryPrice('');
                  setQuantity('');
                }}
                className="px-6 bg-[#0F172A] border border-[#334155] text-[#94A3B8] py-3 rounded-xl hover:border-[#F97316] hover:text-[#F97316] transition-all active:scale-[0.98] font-['Heebo']"
              >
                נתח אחר
              </button>
            </div>
          </div>
        )}

        {/* Popular Suggestions */}
        {!stockData && !isLoading && (
          <div>
            <p className="text-[#94A3B8] text-xs sm:text-sm mb-3 font-['Heebo']">מניות פופולריות:</p>
            <div className="flex flex-wrap gap-2">
              {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className="px-3 py-2 bg-[#0F172A] border border-[#334155] text-[#94A3B8] rounded-lg hover:border-[#F97316] hover:text-[#F97316] transition-all active:scale-[0.95] text-xs sm:text-sm"
                  style={{ fontFamily: 'Roboto Mono, monospace' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}