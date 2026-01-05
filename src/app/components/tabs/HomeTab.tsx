import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, Sparkles } from 'lucide-react';
import imgRectangle from "figma:asset/42b4feaffde11c0d50ae778c18adbffc4596aa27.png";
import { fetchMultipleStockPrices, fetchMultipleStockRecommendations, isMarketOpen } from '../../services/stockApi';
import StockCard from '../StockCard';
import StockDetailModal from '../StockDetailModal';
import MarketStatusBanner from '../MarketStatusBanner';

interface HomeTabProps {
  user: {
    name: string;
    email: string;
    tradingStyle: 'day' | 'long';
  };
  onOpenTurjiBot?: (context: string) => void;
  priceRange?: { min: string; max: string };
  onNavigateToProfile?: () => void;
}

interface MarketStatus {
  isOpen: boolean;
  status: string;
  statusHebrew: string;
  reason?: string;
  marketTimeEST: string;
}

const mockStocks = [
  // Premium Stocks (Updated Dec 21, 2024 - Real Yahoo Finance prices)
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 273.08,
    change: 1.24,
    signal: 'קנייה חזקה',
    strength: 88,
    target: 310,
    stopLoss: 235,
    source: 'yahoo',
    sourceRating: 'Strong Buy',
    analysts: 28,
    aiConfidence: 92,
    potentialGrowth: 72,
    exchange: 'NASDAQ',
    open: 272.81,
    high: 274.08,
    low: 272.28,
    pe: 36.74,
    recommendationGrowth: 72,
    recommendationText: 'הערכה: המניה עשויה לעלות ב-72% השנה'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 188.54,
    change: 2.15,
    signal: 'קנייה חזקה',
    strength: 90,
    target: 220,
    stopLoss: 160,
    source: 'tradingview',
    sourceRating: 'Strong Buy',
    analysts: 38,
    aiConfidence: 94,
    potentialGrowth: 60,
    exchange: 'NASDAQ',
    open: 189.57,
    high: 190.56,
    low: 188.09,
    pe: 46.70,
    recommendationGrowth: 60,
    recommendationText: 'הערכה: המניה עשויה לעלות ב-60% השנה'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 436.23,
    change: -0.85,
    signal: 'המתן',
    strength: 62,
    target: 480,
    stopLoss: 400,
    source: 'yahoo',
    sourceRating: 'Neutral',
    analysts: 34,
    aiConfidence: 58,
    potentialGrowth: 10,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 185.67,
    change: 0.92,
    signal: 'קנייה',
    strength: 75,
    target: 215,
    stopLoss: 170,
    source: 'tradingview',
    sourceRating: 'Buy',
    analysts: 42,
    aiConfidence: 78,
    potentialGrowth: 16,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 445.12,
    change: 0.54,
    signal: 'קנייה חזקה',
    strength: 82,
    target: 495,
    stopLoss: 420,
    source: 'yahoo',
    sourceRating: 'Strong Buy',
    analysts: 45,
    aiConfidence: 85,
    potentialGrowth: 11,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 225.34,
    change: 1.34,
    signal: 'קנייה',
    strength: 78,
    target: 255,
    stopLoss: 205,
    source: 'investing',
    sourceRating: 'Buy',
    analysts: 51,
    aiConfidence: 81,
    potentialGrowth: 13,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 638.45,
    change: 0.78,
    signal: 'קנייה',
    strength: 76,
    target: 695,
    stopLoss: 600,
    source: 'tradingview',
    sourceRating: 'Buy',
    analysts: 48,
    aiConfidence: 79,
    potentialGrowth: 9,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    price: 132.56,
    change: 1.89,
    signal: 'קנייה',
    strength: 76,
    target: 165,
    stopLoss: 120,
    source: 'investing',
    sourceRating: 'Buy',
    analysts: 31,
    aiConfidence: 79,
    potentialGrowth: 24,
    exchange: 'NASDAQ'
  },
  // Cheap High-Potential Stocks (Under $85 - Updated with real prices)
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies',
    price: 81.23,
    change: 3.45,
    signal: 'קנייה חזקה',
    strength: 86,
    target: 105,
    stopLoss: 72,
    source: 'yahoo',
    sourceRating: 'Strong Buy',
    analysts: 22,
    aiConfidence: 89,
    potentialGrowth: 29,
    isCheapGem: true,
    exchange: 'NYSE'
  },
  {
    symbol: 'SOFI',
    name: 'SoFi Technologies',
    price: 16.89,
    change: 2.87,
    signal: 'קנייה חזקה',
    strength: 84,
    target: 24,
    stopLoss: 14,
    source: 'yahoo',
    sourceRating: 'Strong Buy',
    analysts: 18,
    aiConfidence: 87,
    potentialGrowth: 42,
    isCheapGem: true,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'NIO',
    name: 'NIO Inc.',
    price: 5.12,
    change: 4.56,
    signal: 'קנייה חזקה',
    strength: 82,
    target: 8.5,
    stopLoss: 4.2,
    source: 'yahoo',
    sourceRating: 'Buy',
    analysts: 26,
    aiConfidence: 81,
    potentialGrowth: 66,
    isCheapGem: true,
    exchange: 'NYSE'
  },
  {
    symbol: 'RIVN',
    name: 'Rivian Automotive',
    price: 14.78,
    change: 1.98,
    signal: 'קנייה',
    strength: 74,
    target: 21,
    stopLoss: 12,
    source: 'investing',
    sourceRating: 'Buy',
    analysts: 20,
    aiConfidence: 76,
    potentialGrowth: 42,
    isCheapGem: true,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'PLUG',
    name: 'Plug Power Inc.',
    price: 3.45,
    change: 3.67,
    signal: 'קנייה חזקה',
    strength: 88,
    target: 6.5,
    stopLoss: 2.8,
    source: 'tradingview',
    sourceRating: 'Strong Buy',
    analysts: 15,
    aiConfidence: 90,
    potentialGrowth: 88,
    isCheapGem: true,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'LCID',
    name: 'Lucid Group Inc.',
    price: 2.89,
    change: 5.23,
    signal: 'קנייה חזקה',
    strength: 85,
    target: 5.5,
    stopLoss: 2.2,
    source: 'investing',
    sourceRating: 'Strong Buy',
    analysts: 14,
    aiConfidence: 83,
    potentialGrowth: 90,
    isCheapGem: true,
    exchange: 'NASDAQ'
  },
  {
    symbol: 'BB',
    name: 'BlackBerry Limited',
    price: 3.12,
    change: 2.91,
    signal: 'קנייה',
    strength: 72,
    target: 5.5,
    stopLoss: 2.5,
    source: 'tradingview',
    sourceRating: 'Buy',
    analysts: 12,
    aiConfidence: 74,
    potentialGrowth: 76,
    isCheapGem: true,
    exchange: 'NYSE'
  },
  {
    symbol: 'INTC',
    name: 'Intel Corporation',
    price: 21.45,
    change: 3.12,
    signal: 'קנייה חזקה',
    strength: 80,
    target: 30,
    stopLoss: 18,
    source: 'investing',
    sourceRating: 'Buy',
    analysts: 35,
    aiConfidence: 78,
    potentialGrowth: 40,
    isCheapGem: true,
    exchange: 'NASDAQ'
  }
];

export default function HomeTab({ user, onOpenTurjiBot, priceRange, onNavigateToProfile }: HomeTabProps) {
  const [tradingType, setTradingType] = useState<'day' | 'long'>(user.tradingStyle);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState(mockStocks);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterType, setFilterType] = useState<'price' | 'cheapGems' | null>(null);
  const [selectedStock, setSelectedStock] = useState<typeof mockStocks[0] | null>(null);
  const [liveStocks, setLiveStocks] = useState(mockStocks);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceFlash, setPriceFlash] = useState<Set<string>>(new Set());

  // Update trading type when user.tradingStyle changes
  useEffect(() => {
    setTradingType(user.tradingStyle);
  }, [user.tradingStyle]);

  // Apply price range from profile settings
  useEffect(() => {
    if (priceRange && (priceRange.min || priceRange.max)) {
      setMinPrice(priceRange.min);
      setMaxPrice(priceRange.max);
      
      // Automatically filter stocks based on saved price range
      const min = priceRange.min ? Number(priceRange.min) : 0;
      const max = priceRange.max ? Number(priceRange.max) : Infinity;
      
      const filtered = liveStocks.filter(stock => {
        const priceInRange = stock.price >= min && stock.price <= max;
        return priceInRange;
      });
      
      setFilteredStocks(filtered);
      setIsFiltered(true);
      setFilterType('price');
      
      console.log(`🎯 טווח מחיר מהפרופיל הופעל: $${priceRange.min || '0'} - $${priceRange.max || '∞'}`);
    }
  }, [priceRange, liveStocks]);

  // Fetch real-time prices from API
  const fetchRealTimePrices = async () => {
    setIsLoadingPrices(true);
    try {
      const symbols = mockStocks.map(s => s.symbol);
      
      // Fetch both prices and recommendations in parallel
      const [quotes, recommendations] = await Promise.all([
        fetchMultipleStockPrices(symbols),
        fetchMultipleStockRecommendations(symbols)
      ]);
      
      setLiveStocks(prevStocks => 
        prevStocks.map(stock => {
          const quote = quotes.get(stock.symbol);
          const recommendation = recommendations.get(stock.symbol);
          
          let updatedStock = { ...stock };
          
          // Update price data
          if (quote) {
            // Trigger flash animation if price changed
            if (Math.abs(quote.price - stock.price) > 0.01) {
              setPriceFlash(prev => new Set(prev).add(stock.symbol));
              setTimeout(() => {
                setPriceFlash(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(stock.symbol);
                  return newSet;
                });
              }, 1000);
            }
            
            updatedStock = {
              ...updatedStock,
              price: quote.price,
              change: quote.changePercent
            };
          }
          
          // Collect all recommendation sources
          const sources: Array<'yahoo' | 'tradingview' | 'investing' | 'aiturji'> = [];
          
          // Check if stock originally had a source (from mock data)
          if (stock.source) {
            sources.push(stock.source as 'yahoo' | 'tradingview' | 'investing');
          }
          
          // Update recommendation data from Yahoo Finance
          if (recommendation) {
            // Keep original target and stopLoss if they already exist, otherwise calculate new ones
            const targetPrice = stock.target && stock.target > 0 
              ? stock.target 
              : (recommendation.targetPrice || updatedStock.price * 1.15);
            
            const stopLoss = stock.stopLoss && stock.stopLoss > 0
              ? stock.stopLoss
              : updatedStock.price * 0.92;
            
            // If Yahoo recommendation is fallback or weak, calculate our own signal based on price action
            let finalSignal = recommendation.signal;
            let finalStrength = recommendation.strength;
            
            if (recommendation.isFallback || recommendation.strength < 60) {
              // Calculate signal based on technical analysis
              const changePercent = updatedStock.change;
              const priceRange = updatedStock.price;
              
              // Technical signal calculation
              let technicalStrength = 50; // Base
              
              // Factor 1: Daily price change (up to +/- 20 points)
              if (changePercent > 3) technicalStrength += 20;
              else if (changePercent > 1.5) technicalStrength += 15;
              else if (changePercent > 0.5) technicalStrength += 10;
              else if (changePercent < -3) technicalStrength -= 20;
              else if (changePercent < -1.5) technicalStrength -= 15;
              else if (changePercent < -0.5) technicalStrength -= 10;
              
              // Factor 2: Momentum boost for strong moves
              if (Math.abs(changePercent) > 2) {
                technicalStrength += changePercent > 0 ? 10 : -10;
              }
              
              // Factor 3: Price position (cheaper stocks get boost if moving up)
              if (priceRange < 50 && changePercent > 1) {
                technicalStrength += 8; // High potential gems
              }
              
              // Clamp between 0-100
              technicalStrength = Math.max(0, Math.min(100, technicalStrength));
              
              // Determine signal from strength
              if (technicalStrength >= 80) {
                finalSignal = 'קנייה חזקה';
              } else if (technicalStrength >= 65) {
                finalSignal = 'קנייה';
              } else if (technicalStrength >= 40) {
                finalSignal = 'המתן';
              } else {
                finalSignal = 'מכירה';
              }
              
              // Use the higher strength (Yahoo vs Technical)
              finalStrength = Math.max(technicalStrength, recommendation.strength);
            }
            
            // Add Yahoo Finance as a source only if recommendation is NOT a fallback (real data)
            if (!recommendation.isFallback && !sources.includes('yahoo')) {
              sources.push('yahoo');
            }
            
            // Add AI TurjiTrade as a source if AI confidence is high (>= 75)
            if (finalStrength >= 75 && finalSignal.includes('קנייה') && !sources.includes('aiturji')) {
              sources.push('aiturji');
            }
            
            updatedStock = {
              ...updatedStock,
              signal: finalSignal,
              strength: finalStrength,
              sourceRating: recommendation.sourceRating,
              analysts: recommendation.analysts,
              target: targetPrice,
              stopLoss: stopLoss,
              potentialGrowth: recommendation.potentialGrowth,
              sources: sources.length > 0 ? sources : undefined,
              aiConfidence: finalStrength // Use final strength as AI confidence
            };
            
            console.log(`💡 Updated ${stock.symbol}: ${finalSignal} (${finalStrength}/100) by ${recommendation.analysts} analysts - Sources: ${sources.join(', ')}${recommendation.isFallback ? ' (enhanced with technical analysis)' : ' (real Yahoo Finance data)'}`);
          } else if (sources.length > 0) {
            // Keep existing sources if no new recommendation
            updatedStock = {
              ...updatedStock,
              sources: sources
            };
          }
          
          return updatedStock;
        })
      );
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Failed to update prices/recommendations:', error);
      // Silently handle errors - fallback is already in API service
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchRealTimePrices();
  }, []);

  // Update prices every 10 seconds during market hours (16:00-23:00 Israel time), otherwise every 60 seconds
  useEffect(() => {
    const updateInterval = isMarketOpen() ? 10000 : 60000; // 10s during market hours, 60s otherwise
    
    console.log(`🔄 מגדיר רענון אוטומטי: ${isMarketOpen() ? '10 שניות (שוק פתוח)' : '60 שניות (שוק סגור)'}`);
    
    const interval = setInterval(() => {
      fetchRealTimePrices();
    }, updateInterval);

    return () => clearInterval(interval);
  }, []);

  // Update filtered stocks based on trading type and active filters
  useEffect(() => {
    let results = [...liveStocks];

    // 1. Base Filter: Trading Style (CRITICAL: Strict separation)
    if (tradingType === 'day') {
       // Day Trading: Focus on volatility, lower prices, and momentum
       results = results.filter(stock => 
         Math.abs(stock.change) >= 1.0 || // High volatility
         stock.price < 80 || // Cheaper stocks preferred for day trading volume
         stock.isCheapGem // Speculative gems
       );
       // Sort by daily volatility (opportunity magnitude)
       results.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    } else {
       // Long Term: Focus on stability, strength, and growth potential
       results = results.filter(stock => 
         stock.strength >= 70 || // Strong technicals
         stock.potentialGrowth > 15 || // High growth potential
         stock.price >= 80 // Established companies usually have higher share price
       );
       // Sort by Strength and Potential
       results.sort((a, b) => (b.strength + b.potentialGrowth) - (a.strength + a.potentialGrowth));
    }

    // 2. Secondary Filter: Specific User Filters (Price Range)
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      results = results.filter(stock => stock.price >= min && stock.price <= max);
    }

    // 3. Special Mode: Cheap Gems (If activated explicitly)
    if (filterType === 'cheapGems') {
      results = results.filter(stock => stock.isCheapGem === true);
    }

    setFilteredStocks(results);
  }, [liveStocks, tradingType, isFiltered, filterType, minPrice, maxPrice]);

  const handleSearch = () => {
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;

    const filtered = liveStocks.filter(stock => {
      const priceInRange = stock.price >= min && stock.price <= max;
      return priceInRange;
    });

    setFilteredStocks(filtered);
    setIsFiltered(true);
    setShowFilterModal(false);
    setFilterType('price');
  };

  const handleCheapGems = () => {
    let cheapStocks = liveStocks.filter(stock => stock.isCheapGem === true);
    
    // Sort based on trading style preference
    if (tradingType === 'day') {
      // For day trading: prioritize high volatility (change %) and high potential growth
      cheapStocks = cheapStocks.sort((a, b) => {
        const aScore = Math.abs(a.change) * 2 + a.potentialGrowth;
        const bScore = Math.abs(b.change) * 2 + b.potentialGrowth;
        return bScore - aScore;
      });
    } else {
      // For long-term: prioritize stability (positive change) and analyst confidence
      cheapStocks = cheapStocks.sort((a, b) => {
        const aScore = (a.change > 0 ? a.change : 0) + (a.analysts || 0) / 2 + a.aiConfidence;
        const bScore = (b.change > 0 ? b.change : 0) + (b.analysts || 0) / 2 + b.aiConfidence;
        return bScore - aScore;
      });
    }
    
    setFilteredStocks(cheapStocks);
    setIsFiltered(true);
    setFilterType('cheapGems');
  };

  const resetFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setFilteredStocks(liveStocks);
    setIsFiltered(false);
    setFilterType(null);
  };

  const handleAskTurjiBot = () => {
    if (onOpenTurjiBot) {
      const context = `אני נמצא בדף הבית של TurjiTrade. כרגע אני מסתכל על ${filteredStocks.length} מניות מומלצות. ${isFiltered ? `סינתי מניות בטווח מחירים של $${minPrice || '0'} עד $${maxPrice || '∞'}. ` : ''}סגנון המסחר שלי הוא ${tradingType === 'day' ? 'מסחר יומי' : 'השקעה לטווח ארוך'}. איזה מניות תמליץ לי לבחון בהתאם?`;
      onOpenTurjiBot(context);
    }
  };

  return (
    <div className="pb-[12vh] relative" dir="rtl">

      {/* Main Content */}
      <div className="px-[4vw] py-[3vh]">
        <div className="mb-[3vh] flex justify-between items-start">
          <h1 className="text-[#F1F5F9] text-[5vw] font-medium text-right mb-[1vh] font-['Heebo']" dir="rtl">שלום, {user.name.split(' ')[0]}!</h1>
          
          {/* User Profile Widget */}
          <div 
            className="flex items-center gap-[2vw] cursor-pointer"
            onClick={onNavigateToProfile}
          >
             <img 
               src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=334155&color=F97316&bold=true`} 
               alt={user.name} 
               className="w-[8vw] h-[8vw] rounded-full object-cover border-[1px] border-[#F97316] p-[2px] bg-[#1e293b]" 
             />
             <div className="flex flex-col items-start">
                <span className="text-[#f1f5f9] text-[3vw] font-medium font-['Heebo'] leading-none mb-[0.5vh] text-right">{user.name}</span>
                <span className="text-[#94a3b8] text-[2.5vw] font-normal font-['Heebo'] leading-none text-right">{user.email}</span>
             </div>
          </div>
        </div>
          
        <div className="text-center space-y-[0.5vh] mb-[3vh]">
              <h2 className="text-[#F1F5F9] text-[5vw] font-medium font-['Heebo']">מצא מניות פוטנציאליות</h2>
              <div className="text-[#94A3B8] text-[3vw] font-['Heebo'] leading-tight">
                  <p>מבוסס על נתונים אמיתיים בזמן אמת</p>
                  <p>TradingView | Yahoo Finance | Investing.com</p>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-[2vh] w-full">
             {/* Button 1: Search Stocks */}
             <button 
               onClick={() => setShowFilterModal(true)}
               className="w-full h-[7vh] bg-gradient-to-b from-[#f97316] to-[#ea580c] rounded-[4vw] shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center"
             >
               <span className="text-white text-[4vw] font-medium font-['Heebo']">חפש מניות</span>
             </button>
             
             {/* Button 2: High Potential */}
             <button 
               onClick={handleCheapGems}
               className="w-full h-[7vh] bg-gradient-to-b from-[#06B6D4] to-[#008aa1] rounded-[4vw] shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center"
             >
               <span className="text-white text-[4vw] font-medium font-['Heebo']">מצא מניות בפוטנציאל גבוה</span>
             </button>
          </div>

          {/* Legend */}
          <div className="mt-[2vh] flex items-center justify-center gap-[2vw] text-[2.5vw] text-[#94A3B8] flex-wrap font-['Heebo']">
            <div className="flex items-center gap-[1vw]">
              <div className="w-[1.5vw] h-[1.5vw] rounded-full bg-[#2962FF]"></div>
              <span>TradingView</span>
            </div>
            <span>|</span>
             <div className="flex items-center gap-[1vw]">
              <div className="w-[1.5vw] h-[1.5vw] rounded-full bg-[#FF9800]"></div>
              <span>Investing.com</span>
            </div>
            <span>|</span>
             <div className="flex items-center gap-[1vw]">
              <div className="w-[1.5vw] h-[1.5vw] rounded-full bg-[#8B5CF6]"></div>
              <span>Yahoo Finance</span>
            </div>
            <span>|</span>
             <div className="flex items-center gap-[1vw]">
              <div className="w-[1.5vw] h-[1.5vw] rounded-full bg-[#10B981]"></div>
              <span>AI TurjiTrade</span>
            </div>
          </div>
        </div>

        {/* Trading Style Section */}
        <div className="mb-[4vh] px-[4vw]">
           <h2 className="text-[#F1F5F9] text-[5vw] font-medium text-center mb-[2vh] font-['Heebo']">חפש מניות לפי שיטת מסחר</h2>
           <div className="grid grid-cols-2 gap-[4vw] w-full">
              <button
                 onClick={() => setTradingType('long')}
                 className={`w-full h-[7vh] rounded-[4vw] font-extrabold text-[4vw] transition-all flex items-center justify-center font-['Heebo'] ${
                   tradingType === 'long'
                     ? 'bg-transparent border-2 border-[#F97316] text-[#F97316] shadow-lg'
                     : 'bg-[#F97316] text-white'
                 }`}
              >
                 מסחר ארוך טווח
              </button>
              
              <button
                 onClick={() => setTradingType('day')}
                 className={`w-full h-[7vh] rounded-[4vw] font-extrabold text-[4vw] transition-all flex items-center justify-center font-['Heebo'] ${
                   tradingType === 'day'
                     ? 'bg-transparent border-2 border-[#F97316] text-[#F97316] shadow-lg'
                     : 'bg-[#F97316] text-white'
                 }`}
              >
                 מסחר יומי
              </button>
           </div>
        </div>

        {/* Stocks List Header */}
        <div className="px-[4vw]">
           <h2 className="text-white text-[3.5vw] font-extrabold text-right mb-[2vh] font-['Heebo']" dir="rtl">
              מניות מומלצות למסחר {tradingType === 'day' ? 'יומי' : 'ארוך טווח'}:
           </h2>
         
         <div className="space-y-[2vh]">
            {filteredStocks.map((stock) => (
               <StockCard 
                  key={stock.symbol} 
                  stock={stock} 
                  onClick={() => setSelectedStock(stock)}
                  tradingType={tradingType}
               />
            ))}
         </div>
      </div>

      {/* Filter Modal (Keep existing) */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-6 w-full max-w-md border border-[#334155]">
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h3 className="text-[#F1F5F9] text-lg sm:text-xl">בחר טווח מחירים</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-5 sm:mb-6">
              <div>
                <label className="block text-[#F1F5F9] mb-2 text-sm sm:text-base">מחיר מינימום ($)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] text-[#F1F5F9] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] text-base"
                  placeholder="לדוגמה: 100"
                  style={{ fontFamily: 'Roboto Mono, monospace' }}
                />
              </div>
              <div>
                <label className="block text-[#F1F5F9] mb-2 text-sm sm:text-base">מחיר מקסימום ($)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] text-[#F1F5F9] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] text-base"
                  placeholder="לדוגמה: 500"
                  style={{ fontFamily: 'Roboto Mono, monospace' }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                חפש מניות מומלצות
              </button>
              {isFiltered && (
                <button 
                  onClick={resetFilter}
                  className="w-full bg-transparent border-2 border-[#F97316] text-[#F97316] py-3 rounded-xl hover:bg-[#F97316]/10 transition-all active:scale-[0.98]"
                >
                  נקה סינון
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)} 
        />
      )}
    </div>
  );
}