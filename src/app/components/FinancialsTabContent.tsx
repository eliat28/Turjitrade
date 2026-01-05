import { DollarSign, Percent, ChartPie, TrendingUp, Info } from 'lucide-react';
import { getFinancialData } from '../services/financialData';
import { fetchCompanyFinancials } from '../services/stockApi';
import { useState, useEffect } from 'react';

interface FinancialsTabContentProps {
  symbol: string;
}

export default function FinancialsTabContent({ symbol }: FinancialsTabContentProps) {
  const staticFinancials = getFinancialData(symbol);
  const [liveFinancials, setLiveFinancials] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<'static' | 'api'>('static');

  useEffect(() => {
    // Try to fetch live data from API
    const fetchLiveData = async () => {
      setIsLoading(true);
      try {
        const apiData = await fetchCompanyFinancials(symbol);
        if (apiData) {
          setLiveFinancials(apiData);
          setSource('api');
          console.log(`✅ Using LIVE financials from ${apiData.source} for ${symbol}`);
        } else {
          setSource('static');
          console.log(`📚 Using static financials for ${symbol}`);
        }
      } catch (error) {
        console.error(`❌ Failed to fetch live financials for ${symbol}:`, error);
        setSource('static');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveData();
  }, [symbol]);

  // Use live data if available, otherwise fall back to static data
  const financials = liveFinancials || staticFinancials;

  return (
    <>
      {/* Financial Header */}
      <div className="bg-gradient-to-r from-[#F97316]/10 to-[#EA580C]/10 rounded-xl p-4 border border-[#F97316]/30 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[#F1F5F9] text-lg font-bold">נתונים פיננסיים</h3>
              <p className="text-[#94A3B8] text-sm">
                {isLoading ? 'טוען נתונים...' : 
                 source === 'api' && liveFinancials ? `מקור: ${liveFinancials.source.toUpperCase()} API` :
                 'מסד נתונים מקומי'}
              </p>
            </div>
          </div>
          {isLoading && (
            <div className="w-5 h-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Market Cap */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <ChartPie className="w-4 h-4" />
            <span className="text-xs sm:text-sm">שווי שוק</span>
          </div>
          <div className="text-[#10B981] text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.marketCap}
          </div>
          <div className="text-[#64748B] text-xs mt-1">Market Cap</div>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs sm:text-sm">הכנסות שנתיות</span>
          </div>
          <div className="text-[#06B6D4] text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.revenue}
          </div>
          <div className="text-[#64748B] text-xs mt-1">Annual Revenue</div>
        </div>

        {/* Net Income */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs sm:text-sm">רווח נקי</span>
          </div>
          <div className="text-[#10B981] text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.netIncome}
          </div>
          <div className="text-[#64748B] text-xs mt-1">Net Income</div>
        </div>

        {/* P/E Ratio */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Percent className="w-4 h-4" />
            <span className="text-xs sm:text-sm">יחס מחיר-רווח</span>
          </div>
          <div className="text-[#F97316] text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.peRatio}
          </div>
          <div className="text-[#64748B] text-xs mt-1">P/E Ratio</div>
        </div>

        {/* EPS */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs sm:text-sm">רווח למניה</span>
          </div>
          <div className="text-[#06B6D4] text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.eps}
          </div>
          <div className="text-[#64748B] text-xs mt-1">EPS (Earnings Per Share)</div>
        </div>

        {/* Dividend */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs sm:text-sm">דיבידנד</span>
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${financials.dividend === 'אין דיבידנד' ? 'text-[#64748B]' : 'text-[#10B981]'}`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.dividend}
          </div>
          <div className="text-[#64748B] text-xs mt-1">Dividend Yield</div>
        </div>

        {/* Debt to Equity */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <ChartPie className="w-4 h-4" />
            <span className="text-xs sm:text-sm">יחס חוב להון</span>
          </div>
          <div className="text-[#F97316] text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.debtToEquity}
          </div>
          <div className="text-[#64748B] text-xs mt-1">Debt-to-Equity Ratio</div>
        </div>

        {/* Profit Margin */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Percent className="w-4 h-4" />
            <span className="text-xs sm:text-sm">שולי רווח</span>
          </div>
          <div className="text-[#10B981] text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.profitMargin}
          </div>
          <div className="text-[#64748B] text-xs mt-1">Profit Margin</div>
        </div>

        {/* Operating Margin */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Percent className="w-4 h-4" />
            <span className="text-xs sm:text-sm">שולי תפעול</span>
          </div>
          <div className="text-[#06B6D4] text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {financials.operatingMargin}
          </div>
          <div className="text-[#64748B] text-xs mt-1">Operating Margin</div>
        </div>
      </div>

      {/* Financial Health Indicator */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 sm:p-5 border border-[#334155]">
        <h4 className="text-[#F97316] text-sm sm:text-base mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          מדד בריאות פיננסית
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#94A3B8] text-xs sm:text-sm">רווחיות</span>
            <span className="text-[#10B981] text-xs sm:text-sm font-medium">
              {financials.profitMargin !== 'N/A' && parseFloat(financials.profitMargin) > 15 ? 'חזקה 💪' : 
               financials.profitMargin !== 'N/A' && parseFloat(financials.profitMargin) > 5 ? 'בינונית ✅' : 
               financials.profitMargin !== 'N/A' ? 'חלשה ⚠️' : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#94A3B8] text-xs sm:text-sm">רמת חוב</span>
            <span className="text-[#06B6D4] text-xs sm:text-sm font-medium">
              {financials.debtToEquity !== 'N/A' && parseFloat(financials.debtToEquity) < 0.5 ? 'נמוכה ✅' :
               financials.debtToEquity !== 'N/A' && parseFloat(financials.debtToEquity) < 1.5 ? 'בינונית ⚠️' :
               financials.debtToEquity !== 'N/A' ? 'גבוהה 🔴' : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#94A3B8] text-xs sm:text-sm">שווי יחסי (P/E)</span>
            <span className="text-[#F97316] text-xs sm:text-sm font-medium">
              {financials.peRatio !== 'N/A' && parseFloat(financials.peRatio) < 20 ? 'זול 💰' :
               financials.peRatio !== 'N/A' && parseFloat(financials.peRatio) < 40 ? 'הוגן ✅' :
               financials.peRatio !== 'N/A' ? 'יקר ⚠️' : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}