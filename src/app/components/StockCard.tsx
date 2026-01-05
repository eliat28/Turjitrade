import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId } from '../../../utils/supabase/info';

interface StockCardProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    signal: string;
    strength: number;
    target: number;
    stopLoss: number;
    sources?: Array<'yahoo' | 'tradingview' | 'investing' | 'aiturji'>;
    sourceRating?: string;
    analysts?: number;
    aiConfidence?: number;
    isCheapGem?: boolean;
    exchange?: string;
    open?: number;
    high?: number;
    low?: number;
    pe?: number;
    marketCap?: string;
    recommendationText?: string;
    recommendationGrowth?: number;
    dividend?: number; // Added dividend prop
    hasPosition?: boolean;
    entryPrice?: number;
    quantity?: number;
    positionDate?: string;
    alertActive?: boolean;
    alertPrice?: number;
  };
  onClick?: () => void;
  tradingType?: 'day' | 'long';
}

export default function StockCard({ stock, onClick, tradingType = 'day' }: StockCardProps) {
  const [stockData, setStockData] = useState(stock);
  const [isLoading, setIsLoading] = useState(true);

  // Sync props to state if parent updates data (e.g., HomeTab live updates)
  useEffect(() => {
    setStockData(current => ({
       ...current,
       ...stock
    }));
  }, [stock]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90/stock-details/${stock.symbol}`);
        if (response.ok) {
          const data = await response.json();
          if (mounted && data && !data.error) {
             setStockData(prev => ({
               ...prev,
               ...data,
               price: Number(data.price) || prev.price,
               change: Number(data.change) || prev.change,
               open: Number(data.open),
               high: Number(data.high),
               low: Number(data.low),
               pe: Number(data.pe),
               dividend: Number(data.dividend),
               recommendationText: data.analysis || prev.recommendationText,
               target: data.targetPrice || prev.target,
               signal: data.signal || prev.signal,
               strength: data.strength || prev.strength,
               recommendationGrowth: data.recommendationGrowth || prev.recommendationGrowth || 15
             }));
          }
        }
      } catch (err) {
        console.error("Stock fetch error", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchData();

    // Poll for updates every 30 seconds to ensure consistency across tabs (Analysis Tab vs Home Tab)
    const interval = setInterval(fetchData, 30000);

    return () => { 
        mounted = false; 
        clearInterval(interval);
    };
  }, [stock.symbol]);

  const [priceFlash, setPriceFlash] = useState(false);
  const [prevPrice, setPrevPrice] = useState(stockData.price);

  useEffect(() => {
    if (stockData.price !== prevPrice) {
      setPriceFlash(true);
      setPrevPrice(stockData.price);
      const timeout = setTimeout(() => setPriceFlash(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [stockData.price, prevPrice]);

  const isPositive = stockData.change >= 0;
  
  // Defaults
  const openPrice = stockData.open || 0;
  const highPrice = stockData.high || 0;
  const lowPrice = stockData.low || 0;
  const peRatio = stockData.pe ? stockData.pe.toFixed(2) : 'N/A';
  const exchange = stockData.exchange || 'NASDAQ';
  const recommendationGrowth = stockData.recommendationGrowth || 15;
  const dividend = stockData.dividend !== undefined ? `${stockData.dividend}%` : 'N/A';

  // Consistency Fix: Ensure Target Price is logical relative to Current Price and Recommendation
  let targetPrice = stockData.target;
  // If the recommendation implies growth (positive percent) but target is lower than current price, fix it
  if (recommendationGrowth > 0 && targetPrice <= stockData.price) {
      // Estimate 3-month target based on yearly growth (approx 1/4 of yearly growth, min 2%)
      const threeMonthGrowth = Math.max(recommendationGrowth / 4, 2); 
      targetPrice = Number((stockData.price * (1 + (threeMonthGrowth / 100))).toFixed(2));
  }

  const getSignalColor = (signal: string) => {
    if (signal === 'קנייה') return 'text-[#10b981]'; // Green
    if (signal === 'קנייה חזקה') return 'text-[#06b6d4]'; // Cyan/Light Blue
    if (signal === 'המתן') return 'text-[#f1f5f9]'; // White
    if (signal === 'מכירה') return 'text-[#f97316]'; // Orange
    if (signal === 'מכירה חזקה') return 'text-[#ef4444]'; // Red
    return 'text-[#10b981]'; // Default Green
  };

  return (
    <div 
      onClick={onClick}
      className="relative bg-[#1e293b] border-[#f97316] border-[0.6px] rounded-[3vw] w-full h-auto mx-auto p-[2.5vw] shadow-md active:scale-[0.99] transition-transform cursor-pointer overflow-hidden"
      dir="rtl"
    >
      {/* Header Row: Badges (Left) | Name (Right) */}
      <div className="flex justify-between items-start mb-[1.5vw]">
         {/* Right: Symbol & Name */}
         <div className="flex items-center gap-[1.5vw] order-1">
           <span className="font-['Roboto_Mono'] font-bold text-[#f97316] text-[2.5vw] leading-none">{stockData.symbol}</span>
           <span className="text-[#94a3b8] text-[2.2vw] leading-none">|</span>
           <span className="font-['Heebo'] text-[#94a3b8] text-[2.2vw] truncate max-w-[25vw] sm:max-w-none text-right leading-none" dir="auto">{stockData.name}</span>
         </div>
         
         {/* Left: Badges */}
         <div className="flex items-center gap-[1.5vw] order-2 flex-wrap justify-end max-w-[55%]">
            {stockData.sources?.includes('aiturji') && (
              <div className="flex items-center gap-[1vw] border border-[#10B981] bg-[#10B981]/10 rounded-full px-[1.5vw] py-[0.5vw]">
                 <div className="w-[1vw] h-[1vw] rounded-full bg-[#10B981] animate-pulse"></div>
                 <span className="text-[#10B981] text-[1.8vw] font-medium font-['Heebo'] leading-none">AI TurjiTrade</span>
              </div>
            )}
            {stockData.hasPosition && (
              <div className="flex items-center gap-[1vw] border border-[#06b6d4] rounded-full px-[1.5vw] py-[0.5vw]">
                 <div className="w-[1vw] h-[1vw] rounded-full bg-[#06b6d4]"></div>
                 <span className="text-[#06b6d4] text-[1.8vw] font-medium font-['Heebo'] leading-none">פוזיציה פעילה</span>
              </div>
            )}
            {/* Show Yahoo Finance if explicit in sources OR if no sources listed (default fallback) */}
            {(stockData.sources?.includes('yahoo') || (!stockData.sources?.length)) && (
              <div className="flex items-center gap-[1vw] border border-[#8B5CF6] rounded-full px-[1.5vw] py-[0.5vw]">
                 <div className="w-[1vw] h-[1vw] rounded-full bg-[#8B5CF6]"></div>
                 <span className="text-[#8B5CF6] text-[1.8vw] font-medium font-['Heebo'] leading-none">Yahoo Finance</span>
              </div>
            )}
            {stockData.sources?.includes('finnhub') && (
              <div className="flex items-center gap-[1vw] border border-[#FF9800] rounded-full px-[1.5vw] py-[0.5vw]">
                 <div className="w-[1vw] h-[1vw] rounded-full bg-[#FF9800]"></div>
                 <span className="text-[#FF9800] text-[1.8vw] font-medium font-['Heebo'] leading-none">Finnhub</span>
              </div>
            )}
            {stockData.sources?.includes('alphavantage') && (
              <div className="flex items-center gap-[1vw] border border-[#2962FF] rounded-full px-[1.5vw] py-[0.5vw]">
                 <div className="w-[1vw] h-[1vw] rounded-full bg-[#2962FF]"></div>
                 <span className="text-[#2962FF] text-[1.8vw] font-medium font-['Heebo'] leading-none">Alpha Vantage</span>
              </div>
            )}
            {/* Kept for backward compatibility if old data is loaded, but updated to correct names if needed */}
            {stockData.sources?.includes('investing') && !stockData.sources?.includes('finnhub') && (
              <div className="flex items-center gap-[1vw] border border-[#FF9800] rounded-full px-[1.5vw] py-[0.5vw]">
                 <div className="w-[1vw] h-[1vw] rounded-full bg-[#FF9800]"></div>
                 <span className="text-[#FF9800] text-[1.8vw] font-medium font-['Heebo'] leading-none">Investing</span>
              </div>
            )}
            {stockData.sources?.includes('tradingview') && !stockData.sources?.includes('alphavantage') && (
              <div className="flex items-center gap-[1vw] border border-[#2962FF] rounded-full px-[1.5vw] py-[0.5vw]">
                 <div className="w-[1vw] h-[1vw] rounded-full bg-[#2962FF]"></div>
                 <span className="text-[#2962FF] text-[1.8vw] font-medium font-['Heebo'] leading-none">TradingView</span>
              </div>
            )}
         </div>
      </div>

      {/* Main Content Grid - Adjusted Ratio */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-x-[3vw] relative min-h-[17vw]">
        
        {/* Right Column (in RTL logic, visually Right): Price & Info */}
        <div className="flex flex-col justify-between items-start text-right h-full">
            <div>
                {/* Price Row */}
                <div className="flex items-center gap-[2vw] mb-[0.8vw] w-full justify-start">
                   <span className="text-[#94a3b8] text-[2.5vw] font-['Heebo'] leading-none">מחיר נוכחי:</span>
                   <span className={`font-['Roboto_Mono'] text-[3.8vw] font-bold text-[#f1f5f9] leading-none`}>
                      ${stockData.price.toFixed(2)}
                   </span>
                </div>
                
                {/* Exchange Row */}
                <div className="flex items-center gap-[1vw] mb-[0.8vw] w-full justify-start">
                   <span className="text-[#94a3b8] text-[2.5vw] font-['Heebo'] leading-none">נסחרת במדד:</span>
                   <span className="text-[#f97316] text-[2.5vw] font-medium font-['Roboto_Mono'] leading-none">{exchange}</span>
                </div>
            </div>

            <div className="flex flex-col justify-end">
                {/* Evaluation Row */}
                <div className="flex items-center gap-[0.8vw] mb-[0.8vw] w-full justify-start flex-wrap">
                   <span className="text-[#94a3b8] text-[2vw] font-['Heebo'] leading-none">הערכה: המנייה עשויה</span>
                   <span className="text-[#10b981] text-[2vw] font-['Heebo'] font-bold leading-none">לעלות</span>
                   <span className="text-[#94a3b8] text-[2vw] font-['Heebo'] leading-none">ב</span>
                   <span className="text-[#f97316] text-[2vw] font-['Heebo'] font-bold leading-none">{recommendationGrowth}%</span>
                   <span className="text-[#94a3b8] text-[2vw] font-['Heebo'] leading-none">השנה</span>
                </div>

                {/* Signal Row */}
                <div className="flex items-center gap-[1vw] mb-[0.8vw] w-full justify-start whitespace-nowrap">
                   <span className="text-[#94a3b8] text-[2vw] font-['Heebo'] leading-none">המלצת המערכת:</span>
                   <span className={`${getSignalColor(stockData.signal)} text-[2.2vw] font-['Heebo'] leading-none`}>{stockData.signal}</span>
                   <span className="text-[#94a3b8] text-[2vw] font-['Heebo'] leading-none">|</span>
                   <span className="text-[#94a3b8] text-[2vw] font-['Heebo'] leading-none">עוצמת סיגנל:</span>
                   <span className="font-['Roboto_Mono'] text-[#f97316] text-[2.2vw] leading-none">{stockData.strength}%</span>
                </div>
                
                {/* Target Price Row */}
                <div className="flex items-center gap-[1vw] w-full justify-start">
                   <span className="text-[#94a3b8] text-[2vw] font-['Heebo'] leading-none">{tradingType === 'day' ? 'מחיר יעד יומי:' : 'מחיר יעד 3 חודשים קדימה:'}</span>
                   <span className="font-['Roboto_Mono'] text-[#10b981] text-[2vw] font-bold leading-none">${targetPrice}</span>
                </div>
            </div>
        </div>

        {/* Left Column (in RTL logic, visually Left): Data Table */}
        <div className="flex flex-col relative justify-between">
           {/* Data Grid */}
           <div className="grid grid-cols-[auto_1fr] gap-x-[2vw] gap-y-[0.8vw] text-[2vw] mb-[1.5vw]">
              <span className="text-[#94a3b8] font-['Heebo'] leading-none">פתיחה יומית:</span>
              <span className="font-['Roboto_Mono'] text-[#f97316] text-left leading-none" dir="ltr">
                {(openPrice > 0 ? openPrice : (stockData.price / (1 + stockData.change/100))).toFixed(2)}
              </span>
              
              <span className="text-[#94a3b8] font-['Heebo'] leading-none">גבוה יומי:</span>
              <span className="font-['Roboto_Mono'] text-[#f97316] text-left leading-none" dir="ltr">
                {(highPrice > 0 ? Math.max(highPrice, stockData.price) : Math.max(stockData.price, (stockData.price / (1 + stockData.change/100))) * 1.005).toFixed(2)}
              </span>
              
              <span className="text-[#94a3b8] font-['Heebo'] leading-none">נמוך יומי:</span>
              <span className="font-['Roboto_Mono'] text-[#f97316] text-left leading-none" dir="ltr">
                {(lowPrice > 0 ? Math.min(lowPrice, stockData.price) : Math.min(stockData.price, (stockData.price / (1 + stockData.change/100))) * 0.995).toFixed(2)}
              </span>
              
              <span className="text-[#94a3b8] font-['Heebo'] leading-none">שווי שוק:</span>
              <span className="font-['Roboto_Mono'] text-[#f97316] text-left leading-none" dir="ltr">{stockData.marketCap || '—'}</span>

              <span className="text-[#94a3b8] font-['Heebo'] leading-none">מכפיל רווח:</span>
              <span className="font-['Roboto_Mono'] text-[#f97316] text-left leading-none" dir="ltr">{peRatio !== 'N/A' && peRatio !== '0.00' ? peRatio : '—'}</span>
              
              <span className="text-[#94a3b8] font-['Heebo'] leading-none">אחוזי דיבידנד:</span>
              <span className="font-['Roboto_Mono'] text-[#f97316] text-left leading-none" dir="ltr">{dividend !== 'N/A' && dividend !== '0%' ? dividend : '—'}</span>
           </div>
           
           {/* Separator Line */}
           <div className="w-full h-[0.5px] bg-[#94A3B8] mb-[1vw] opacity-50"></div>
           
           {/* Daily Change */}
           <div className="flex items-center gap-[2vw] justify-end mt-auto">
              <span className="text-[#94a3b8] text-[2.2vw] font-['Heebo'] leading-none">שינוי יומי:</span>
              <span className={`font-['Roboto_Mono'] text-[3vw] font-bold leading-none ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {isPositive ? '+' : ''}{stockData.change.toFixed(2)}%
              </span>
           </div>
        </div>

      </div>

      {/* Recommendation Box */}
      <div className="mt-[2vw] bg-[#0f172a] border border-[#334155] rounded-[1.8vw] p-[1.5vw] text-center relative">
         <p className="text-[#f97316] text-[2vw] leading-[1.2] font-['Heebo'] font-bold">
           {stockData.recommendationText || (tradingType === 'day' ? 'מומלץ לקנות בהתחשב בעוצמת הסיגנל ומחיר היעד היומי' : 'מומלץ לקנות בהתחשב בעוצמת הסיגנל ומחיר היעד בעוד 3 חודשים קדימה')}
         </p>
      </div>

      {/* Position Details (Active Position Only) */}
      {stockData.hasPosition && stockData.entryPrice && stockData.quantity && (
        <div className="mt-[2vw] bg-[#0f172a] border border-[#334155] rounded-[1.8vw] p-[2vw] relative">
          
          {/* Header Line */}
          <div className="flex justify-between items-center mb-[2vw]">
            <div className="flex items-center gap-[1vw]">
              <span className="text-[#f97316] text-[2vw] font-['Heebo'] font-normal leading-tight">הפוזיציה שלך:</span>
            </div>
            <div className="flex items-center gap-[1vw]">
               <span className="text-[#94a3b8] text-[2vw] font-['Heebo'] font-normal leading-tight">תאריך פתיחת הפוזיציה:</span>
               <span className="text-[#f97316] text-[2vw] font-['Roboto_Mono'] leading-tight">
                 {stockData.positionDate || new Date().toLocaleDateString('he-IL')}
               </span>
            </div>
          </div>

          {/* Separator */}
          <div className="w-full h-[0.5px] bg-[#94A3B8] mb-[2vw] opacity-30"></div>

          {/* Grid Layout - 3 Columns with Vertical Separators */}
          <div className="grid grid-cols-3 text-right relative" dir="rtl">
            
            {/* Column 1 (Right) */}
            <div className="flex flex-col gap-[1.5vw] pl-[2vw]">
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">מחיר הכניסה שלך:</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Roboto_Mono'] leading-tight">${stockData.entryPrice ? stockData.entryPrice.toFixed(2) : '0.00'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">כמות מניות:</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Roboto_Mono'] leading-tight">{stockData.quantity}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">השקעה בדולרים:</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Roboto_Mono'] leading-tight">${(stockData.entryPrice && stockData.quantity ? stockData.entryPrice * stockData.quantity : 0).toFixed(2)}</span>
               </div>
            </div>

            {/* Vertical Line 1 */}
            <div className="absolute top-0 bottom-0 right-[33.33%] w-[0.5px] bg-[#94A3B8] opacity-30"></div>

            {/* Column 2 (Center) */}
            <div className="flex flex-col gap-[1.5vw] px-[2vw]">
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">קבלת התראה:</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Heebo'] font-normal leading-tight">{stockData.alertActive ? 'פועל' : 'כבוי'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">קבלת התראה במחיר:</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Roboto_Mono'] leading-tight">{stockData.alertPrice ? stockData.alertPrice.toFixed(2) : '-'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">רווח / הפסד (%):</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Roboto_Mono'] leading-tight whitespace-nowrap font-[Heebo]" dir="ltr">
                    {(() => {
                        const totalInvested = (stockData.entryPrice || 0) * (stockData.quantity || 0);
                        const totalValue = stockData.price * (stockData.quantity || 0);
                        const profit = totalValue - totalInvested;
                        const percent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
                        return `${profit >= 0 ? 'רווח' : 'הפסד'} ~${Math.abs(percent).toFixed(2)}%`;
                    })()}
                 </span>
               </div>
            </div>

            {/* Vertical Line 2 */}
            <div className="absolute top-0 bottom-0 left-[33.33%] w-[0.5px] bg-[#94A3B8] opacity-30"></div>

            {/* Column 3 (Left) */}
            <div className="flex flex-col gap-[1.5vw] pr-[2vw]">
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">רווח נוכחי:</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Roboto_Mono'] leading-tight" dir="ltr">
                    {(() => {
                        const profitPerShare = stockData.price - (stockData.entryPrice || 0);
                        return `${Math.abs(profitPerShare).toFixed(2)}`;
                    })()}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">רווח ממועד הכניסה:</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Roboto_Mono'] leading-tight" dir="ltr">
                    {(() => {
                         const profitPerShare = stockData.price - (stockData.entryPrice || 0);
                         return `${Math.abs(profitPerShare).toFixed(2)}`;
                    })()}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[#94a3b8] text-[1.8vw] font-['Heebo'] font-normal leading-tight whitespace-nowrap">שווי כולל:</span>
                 <span className="text-[#f97316] text-[1.8vw] font-['Roboto_Mono'] leading-tight">${(stockData.price * (stockData.quantity || 0)).toFixed(2)}</span>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}