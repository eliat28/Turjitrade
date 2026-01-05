import { useState, useEffect } from 'react';
import { TrendingUp, PieChart, Plus, Wallet, ArrowUpRight, ArrowDownRight, Clock, Trash2, X } from 'lucide-react';
import StockCard from '../StockCard';
import StockDetailModal from '../StockDetailModal';
import NewAnalysisModal from '../NewAnalysisModal';

interface PortfolioTabProps {
  onOpenTurjiBot?: (context: string) => void;
  tradingStyle?: 'day' | 'long';
}

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number; // Will be updated via StockCard logic or passed down
  change: number;
  dateAdded: string;
}

export default function PortfolioTab({ onOpenTurjiBot, tradingStyle }: PortfolioTabProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [showNewPositionModal, setShowNewPositionModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);

  // Load portfolio from localStorage (synced with AnalysisTab logic ideally)
  useEffect(() => {
    // We are going to "read" from the same source as AnalysisTab to find items with 'hasPosition'
    // But for a dedicated portfolio, we might want a separate storage or filter the analysis list.
    // Based on user request: "If he already added them and marked has active position in analysis, sync them"
    
    const loadPortfolio = () => {
      const savedAnalyses = localStorage.getItem('turjiTrade_analyses');
      if (savedAnalyses) {
        try {
          const parsedAnalyses: any[] = JSON.parse(savedAnalyses);
          const activePositions = parsedAnalyses
            .filter((a: any) => a.hasPosition && a.quantity > 0)
            .map((a: any) => ({
              id: a.id.toString(),
              symbol: a.symbol,
              name: a.name,
              quantity: a.quantity || 0,
              entryPrice: a.entryPrice || 0,
              currentPrice: a.price, // Initial price from analysis, will update via Card
              change: a.change,
              dateAdded: a.date
            }));
          
          setPortfolio(activePositions);
        } catch (e) {
          console.error("Failed to load portfolio from analyses", e);
        }
      }
    };

    loadPortfolio();
    
    // Listen for storage changes to sync in real-time if multiple tabs open
    window.addEventListener('storage', loadPortfolio);
    return () => window.removeEventListener('storage', loadPortfolio);
  }, []);

  // Calculate Totals
  useEffect(() => {
    let value = 0;
    let invested = 0;
    
    portfolio.forEach(item => {
      value += item.quantity * item.currentPrice;
      invested += item.quantity * item.entryPrice;
    });

    setTotalValue(value);
    setTotalInvested(invested);
  }, [portfolio]);

  const totalReturn = totalValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const handleAddPosition = (analysisData: any) => {
    // This is essentially adding an analysis with position=true
    // We need to save this to the main 'turjiTrade_analyses' storage to keep sync
    const savedAnalyses = localStorage.getItem('turjiTrade_analyses');
    let analyses = savedAnalyses ? JSON.parse(savedAnalyses) : [];
    
    const now = new Date();
    const newAnalysis = {
      id: Date.now(),
      date: now.toLocaleDateString('he-IL'),
      time: now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      symbol: analysisData.symbol,
      name: analysisData.name,
      price: analysisData.price,
      change: analysisData.change,
      signal: analysisData.signal || 'המתן',
      note: analysisData.recommendation || 'נוסף ידנית לתיק',
      source: 'portfolio-manual',
      sourceRating: 'Neutral',
      hasPosition: true,
      entryPrice: analysisData.entryPrice,
      quantity: analysisData.quantity
    };

    analyses = [newAnalysis, ...analyses];
    localStorage.setItem('turjiTrade_analyses', JSON.stringify(analyses));
    
    // Update local state
    setPortfolio(prev => [{
      id: newAnalysis.id.toString(),
      symbol: newAnalysis.symbol,
      name: newAnalysis.name,
      quantity: newAnalysis.quantity,
      entryPrice: newAnalysis.entryPrice,
      currentPrice: newAnalysis.price,
      change: newAnalysis.change,
      dateAdded: newAnalysis.date
    }, ...prev]);
    
    setShowNewPositionModal(false);
  };

  const handleRemovePosition = (id: string) => {
    // We need to update the main storage
    const savedAnalyses = localStorage.getItem('turjiTrade_analyses');
    if (savedAnalyses) {
      let analyses = JSON.parse(savedAnalyses);
      // We don't delete the analysis, just mark hasPosition = false
      analyses = analyses.map((a: any) => {
        if (a.id.toString() === id) {
          return { ...a, hasPosition: false };
        }
        return a;
      });
      localStorage.setItem('turjiTrade_analyses', JSON.stringify(analyses));
    }
    
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="px-[4vw] py-[3vh] pb-[12vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-[3vh]">
        <h1 className="text-[#F1F5F9] text-[5vw] sm:text-2xl font-['Heebo']">תיק השקעות</h1>
        <button
          onClick={() => setShowNewPositionModal(true)}
          className="w-[10vw] h-[10vw] sm:w-12 sm:h-12 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-[0.95] flex items-center justify-center"
        >
          <Plus className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Portfolio Summary Card */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[4vw] p-[4vw] border border-[#334155] shadow-xl mb-[4vh] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F97316] to-[#EA580C]"></div>
        
        <div className="flex flex-col gap-[2vh]">
          <div>
            <span className="text-[#94A3B8] text-[3.5vw] font-['Heebo']">שווי תיק כולל</span>
            <div className="flex items-baseline gap-[2vw]">
              <span className="text-[#F1F5F9] text-[8vw] font-bold font-['Roboto_Mono'] tracking-tight">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[4vw] pt-[2vh] border-t border-[#334155]/50">
            <div>
              <span className="text-[#94A3B8] text-[3vw] font-['Heebo'] block mb-[0.5vh]">רווח/הפסד פתוח</span>
              <div className={`flex items-center gap-[1vw] ${totalReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {totalReturn >= 0 ? <ArrowUpRight className="w-[4vw] h-[4vw]" /> : <ArrowDownRight className="w-[4vw] h-[4vw]" />}
                <span className="text-[4.5vw] font-bold font-['Roboto_Mono']">
                  {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}
                </span>
              </div>
              <span className={`text-[3vw] font-['Roboto_Mono'] ${totalReturn >= 0 ? 'text-[#10B981]/80' : 'text-[#EF4444]/80'}`}>
                ({totalReturnPercent.toFixed(2)}%)
              </span>
            </div>
            
            <div>
              <span className="text-[#94A3B8] text-[3vw] font-['Heebo'] block mb-[0.5vh]">הושקע</span>
              <span className="text-[#F1F5F9] text-[4.5vw] font-bold font-['Roboto_Mono']">
                ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Positions List */}
      {portfolio.length > 0 ? (
        <div className="space-y-[2vh]">
          <div className="flex items-center gap-[2vw] mb-[1vh]">
            <PieChart className="w-[4vw] h-[4vw] text-[#F97316]" />
            <h2 className="text-[#F1F5F9] text-[4.5vw] font-['Heebo']">החזקות ({portfolio.length})</h2>
          </div>
          
          {portfolio.map((item) => (
            <div key={item.id} className="relative group">
              <StockCard 
                stock={{
                  symbol: item.symbol,
                  name: item.name,
                  price: item.currentPrice,
                  change: item.change,
                  signal: 'החזקה', // Custom signal for portfolio
                  strength: 0,
                  target: 0,
                  stopLoss: 0,
                  hasPosition: true,
                  entryPrice: item.entryPrice,
                  quantity: item.quantity,
                  positionDate: item.dateAdded,
                  alertActive: true, // Mock
                  alertPrice: item.entryPrice * 1.1 // Mock
                }}
                onClick={() => setSelectedStock(item)}
                tradingType={tradingStyle}
              />
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm('להסיר את הפוזיציה מהתיק? (הניתוח יישמר)')) {
                    handleRemovePosition(item.id);
                  }
                }}
                className="absolute top-[2vw] left-[2vw] z-10 p-[2vw] bg-[#334155]/80 backdrop-blur-sm rounded-full text-[#94A3B8] hover:text-[#EF4444] transition-colors"
              >
                <Trash2 className="w-[4vw] h-[4vw]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-[10vh]">
          <div className="w-[20vw] h-[20vw] bg-[#1E293B] rounded-full flex items-center justify-center mb-[3vh] animate-pulse">
            <Wallet className="w-[10vw] h-[10vw] text-[#334155]" />
          </div>
          <h3 className="text-[#F1F5F9] text-[5vw] mb-[1vh] font-['Heebo']">התיק ריק</h3>
          <p className="text-[#94A3B8] text-center text-[3.5vw] max-w-[70%] font-['Heebo']">
            הוסף פוזיציות ידנית או סמן מניות כ"מוחזקות" דרך מסך הניתוחים
          </p>
          <button
            onClick={() => setShowNewPositionModal(true)}
            className="mt-[4vh] text-[#F97316] font-['Heebo'] border border-[#F97316] px-[6vw] py-[1.5vh] rounded-full hover:bg-[#F97316] hover:text-white transition-all"
          >
            הוסף פוזיציה ראשונה
          </button>
        </div>
      )}

      {/* New Position Modal (Reusing Analysis Modal logic but styled for Portfolio) */}
      {showNewPositionModal && (
        <NewAnalysisModal
          onClose={() => setShowNewPositionModal(false)}
          onAddAnalysis={handleAddPosition}
        />
      )}
    </div>
  );
}