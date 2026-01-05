import { useState, useEffect } from 'react';
import { Search, Clock, Plus, X, Bot, Filter } from 'lucide-react';
import StockDetailModal from '../StockDetailModal';
import NewAnalysisModal from '../NewAnalysisModal';
import StockCard from '../StockCard';

interface AnalysisTabProps {
  onOpenTurjiBot?: (context: string) => void;
  tradingStyle?: 'day' | 'long';
}

interface Analysis {
  id: number;
  date: string;
  time: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  signal: string;
  note: string;
  source: string;
  sourceRating: string;
  hasPosition?: boolean;
  entryPrice?: number;
  quantity?: number;
}

const initialAnalyses: Analysis[] = [
  {
    id: 1,
    date: '15/12/2024',
    time: '10:30',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.63,
    change: 1.24,
    signal: 'קנייה חזקה',
    note: 'מומלץ לקנות בהתבסס על מגמה עולה וחציית ממוצעים נעים',
    source: 'tradingview',
    sourceRating: 'Strong Buy',
    hasPosition: true,
    entryPrice: 175.50,
    quantity: 10
  },
  {
    id: 2,
    date: '14/12/2024',
    time: '14:15',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 245.12,
    change: -0.52,
    signal: 'המתן',
    note: 'נפח מסחר נמוך, מומלץ להמתין להתראה מTurjiTrade',
    source: 'investing',
    sourceRating: 'Neutral'
  },
  {
    id: 3,
    date: '13/12/2024',
    time: '09:45',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.85,
    change: 2.15,
    signal: 'קנייה',
    note: 'שבירת רמת התנגדות חשובה, אינדיקטור RSI מאוזן',
    source: 'tradingview',
    sourceRating: 'Buy'
  }
];

export default function AnalysisTab({ onOpenTurjiBot, tradingStyle }: AnalysisTabProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'buy' | 'today' | 'week'>('all');
  const [showPositionsOnly, setShowPositionsOnly] = useState(false);
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);
  const [newStockSymbol, setNewStockSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    signal: string;
    strength: number;
    target: number;
    stopLoss: number;
    id: number;
    hasPosition?: boolean;
    entryPrice?: number;
    quantity?: number;
  } | null>(null);

  // Load analyses from localStorage on mount
  useEffect(() => {
    const savedAnalyses = localStorage.getItem('turjiTrade_analyses');
    const isInitialized = localStorage.getItem('turjiTrade_analyses_initialized');
    
    if (savedAnalyses) {
      try {
        const parsed = JSON.parse(savedAnalyses);
        setAnalyses(parsed);
      } catch (error) {
        console.error('Failed to load analyses:', error);
        setAnalyses([]);
      }
    } else if (isInitialized === 'true') {
      // User has explicitly cleared data - keep it empty
      setAnalyses([]);
    } else {
      // First time ever - set initial analyses and mark as initialized
      setAnalyses(initialAnalyses);
      localStorage.setItem('turjiTrade_analyses', JSON.stringify(initialAnalyses));
      localStorage.setItem('turjiTrade_analyses_initialized', 'true');
    }
  }, []);

  // Save analyses to localStorage whenever they change
  useEffect(() => {
    if (analyses.length >= 0) {
      localStorage.setItem('turjiTrade_analyses', JSON.stringify(analyses));
    }
  }, [analyses]);

  const filteredAnalyses = analyses.filter((analysis) => {
    if (searchQuery && 
        !analysis.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !analysis.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter === 'buy' && !analysis.signal.includes('קנייה')) {
      return false;
    }
    if (showPositionsOnly && !analysis.hasPosition) {
      return false;
    }
    // Additional filters can be added here
    return true;
  });

  const handleAddAnalysis = (analysisData: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    signal: string;
    recommendation: string;
    hasPosition?: boolean;
    entryPrice?: number;
    quantity?: number;
  }) => {
    const now = new Date();
    const date = now.toLocaleDateString('he-IL');
    const time = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    
    const newAnalysis: Analysis = {
      id: Date.now(),
      date,
      time,
      symbol: analysisData.symbol,
      name: analysisData.name,
      price: analysisData.price,
      change: analysisData.change,
      signal: analysisData.signal,
      note: analysisData.recommendation,
      source: 'ai-turji',
      sourceRating: analysisData.signal,
      hasPosition: analysisData.hasPosition,
      entryPrice: analysisData.entryPrice,
      quantity: analysisData.quantity
    };

    setAnalyses([newAnalysis, ...analyses]);
    setShowNewAnalysisModal(false);
  };

  const handleAnalysisClick = (analysis: Analysis) => {
    setSelectedStock({
      symbol: analysis.symbol,
      name: analysis.name,
      price: analysis.price,
      change: analysis.change,
      signal: analysis.signal,
      strength: 75,
      target: analysis.price * 1.15,
      stopLoss: analysis.price * 0.92,
      id: analysis.id,
      hasPosition: analysis.hasPosition,
      entryPrice: analysis.entryPrice,
      quantity: analysis.quantity
    });
  };

  const handleRemoveAnalysis = (analysisId: number) => {
    setAnalyses(analyses.filter(a => a.id !== analysisId));
  };

  const handleAskTurjiBot = () => {
    if (onOpenTurjiBot) {
      const context = `אני נמצא בדף הניתוחים של TurjiTrade. יש לי ${analyses.length} ניתוחים כרגע. ${filteredAnalyses.length < analyses.length ? `סינתי ${filter === 'buy' ? 'רק המלצות קנייה' : filter}. ` : ''}${filteredAnalyses.length > 0 ? `המניה האחרונה שניתחתי היא ${filteredAnalyses[0].symbol} (${filteredAnalyses[0].name}) במחיר $${filteredAnalyses[0].price} עם המלצה: ${filteredAnalyses[0].signal}. ` : ''}מה דעתך על הניתוחים שלי?`;
      onOpenTurjiBot(context);
    }
  };

  return (
    <div className="px-[4vw] py-[3vh] pb-[12vh]">
      {/* Header */}
      <div className="mb-[3vh]">
        <div className="flex justify-between items-center mb-[1vh]">
          <h1 className="text-[#F1F5F9] text-[5vw] sm:text-2xl font-['Heebo']">ניתוחים</h1>
          <button
            onClick={() => setShowNewAnalysisModal(true)}
            className="w-[10vw] h-[10vw] sm:w-12 sm:h-12 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-[0.95] flex items-center justify-center"
          >
            <Plus className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
          </button>
        </div>
        <p className="text-[#94A3B8] text-[3vw] sm:text-sm font-['Heebo']">
          נתוני השוק בזמן אמת מ-TradingView ו-Investing.com
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-[3vh]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חפש לפי סימל או שם חברה..."
          className="w-full bg-[#1E293B] border border-[#334155] text-[#F1F5F9] px-[4vw] py-[1.5vh] pr-[12vw] rounded-[3vw] focus:outline-none focus:ring-2 focus:ring-[#F97316] text-[4vw] font-['Heebo']"
        />
        <Search className="absolute left-[4vw] top-1/2 -translate-y-1/2 w-[4vw] h-[4vw] sm:w-5 sm:h-5 text-[#94A3B8]" />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-[2vw] mb-[3vh] overflow-x-auto pb-[1vh] scrollbar-hide -mx-[4vw] px-[4vw] items-center">
        <button
          onClick={() => setShowPositionsOnly(!showPositionsOnly)}
          className={`flex items-center gap-1 px-[3.5vw] sm:px-4 py-[1vh] rounded-full whitespace-nowrap transition-all text-[3.5vw] sm:text-base active:scale-[0.95] font-['Heebo'] border ${
            showPositionsOnly
              ? 'bg-[#F97316] text-white border-[#F97316]'
              : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
          }`}
        >
          <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>פוזיציות בלבד</span>
        </button>

        <div className="w-[1px] h-6 bg-[#334155] mx-1"></div>

        {[
          { id: 'all', label: 'כל הניתוחים' },
          { id: 'buy', label: 'קנייה בלבד' },
          { id: 'today', label: 'היום' },
          { id: 'week', label: 'השבוע' }
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilter(chip.id as any)}
            className={`px-[3.5vw] sm:px-4 py-[1vh] rounded-full whitespace-nowrap transition-all text-[3.5vw] sm:text-base active:scale-[0.95] font-['Heebo'] ${
              filter === chip.id
                ? 'bg-[#F97316] text-white'
                : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Analysis List */}
      {filteredAnalyses.length > 0 ? (
        <div className="space-y-[1.5vh] sm:space-y-4">
          {filteredAnalyses.map((analysis) => (
            <div key={analysis.id} className="transition-transform active:scale-[0.98] relative group">
              <StockCard 
                stock={{
                  symbol: analysis.symbol,
                  name: analysis.name,
                  price: analysis.price,
                  change: analysis.change,
                  signal: analysis.signal,
                  strength: 75, // Default, will update
                  target: analysis.price * 1.1, // Default, will update
                  stopLoss: analysis.price * 0.9, // Default
                  recommendationText: analysis.note,
                  sources: analysis.source ? [analysis.source as any] : [],
                  sourceRating: analysis.sourceRating,
                  hasPosition: analysis.hasPosition,
                  entryPrice: analysis.entryPrice,
                  quantity: analysis.quantity,
                  positionDate: analysis.date, // Use analysis date as position date fallback
                  alertActive: true, // Mock data or should be in analysis object?
                  alertPrice: analysis.entryPrice ? analysis.entryPrice * 1.1 : undefined // Mock target alert
                }}
                onClick={() => handleAnalysisClick(analysis)}
                tradingType={tradingStyle}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-[12vh] sm:py-16">
          <Clock className="w-[12vw] h-[12vw] sm:w-16 sm:h-16 text-[#334155] mb-[2vh]" />
          <h3 className="text-[#F1F5F9] text-[5vw] sm:text-xl mb-[1vh] font-['Heebo']">אין עדיין ניתוחים</h3>
          <p className="text-[#94A3B8] text-center text-[3.5vw] sm:text-base font-['Heebo']">
            התחל לנתח מניות מהעמוד הראשי
          </p>
        </div>
      )}

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onRemoveFromAnalysis={() => handleRemoveAnalysis(selectedStock.id)}
          userPosition={selectedStock.hasPosition ? {
            isTrading: true,
            entryPrice: selectedStock.entryPrice,
            quantity: selectedStock.quantity
          } : undefined}
        />
      )}

      {/* New Analysis Modal */}
      {showNewAnalysisModal && (
        <NewAnalysisModal
          onClose={() => setShowNewAnalysisModal(false)}
          onAddAnalysis={handleAddAnalysis}
        />
      )}
    </div>
  );
}