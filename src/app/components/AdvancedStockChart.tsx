import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Activity, CircleAlert } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface AdvancedStockChartProps {
  symbol: string;
  height?: number;
  showSourceBadge?: boolean;
}

interface ChartDataPoint {
  date: string;
  time: string;
  price: number;
  volume: number;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90`;

export default function AdvancedStockChart({ symbol, height = 400, showSourceBadge = true }: AdvancedStockChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('Unknown');

  useEffect(() => {
    fetchStockData();
  }, [symbol]);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current price from TurjiTrade server
      const priceResponse = await fetch(`${SERVER_URL}/stock/${symbol}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Accept': 'application/json',
        }
      });
      
      if (!priceResponse.ok) {
        throw new Error('Failed to fetch stock price');
      }
      
      const priceData = await priceResponse.json();
      
      console.log(`[AdvancedStockChart] Price data for ${symbol}:`, priceData);
      
      if (!priceData.success || !priceData.price) {
        throw new Error('Invalid price data from server');
      }
      
      const currentPriceValue = priceData.price;
      const change = priceData.changePercent;
      
      setCurrentPrice(currentPriceValue);
      setPriceChange(change);

      // Get historical data from server (tries Yahoo, Finnhub, Alpha Vantage)
      const historyResponse = await fetch(`${SERVER_URL}/stock/${symbol}/history?days=30`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Accept': 'application/json',
        }
      });
      
      const historyData = await historyResponse.json();

      console.log(`[AdvancedStockChart] History data for ${symbol}:`, historyData);

      // Check if server returned error (no real data available)
      if (historyData.s === 'error') {
        setError(historyData.message || 'נתוני היסטוריה לא זמינו');
        setData([]);
        return;
      }

      if (historyData.s === 'ok' && historyData.c && historyData.c.length > 0) {
        // Use REAL historical data from Yahoo/Finnhub/AlphaVantage
        setDataSource(historyData.source || 'Unknown');
        
        const dataPoints: ChartDataPoint[] = historyData.t.map((timestamp: number, index: number) => {
          const date = new Date(timestamp * 1000);
          return {
            date: date.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
            time: date.toISOString(),
            price: Number(historyData.c[index].toFixed(2)),
            volume: historyData.v[index]
          };
        });
        
        // Override the last data point with the current real-time price
        if (dataPoints.length > 0) {
          const today = new Date();
          dataPoints[dataPoints.length - 1] = {
            date: today.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
            time: today.toISOString(),
            price: Number(currentPriceValue.toFixed(2)),
            volume: dataPoints[dataPoints.length - 1].volume
          };
        }
        
        setData(dataPoints);
        console.log(`✅ Loaded ${dataPoints.length} REAL data points from ${historyData.source}`);
      } else {
        throw new Error('No real historical data available from any source');
      }
    } catch (error) {
      console.error('[AdvancedStockChart] Error fetching stock data:', error);
      setError('לא ניתן לטעון נתונים אמיתיים כרגע. אנא נסה שוב מאוחר יותר.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-3 shadow-xl">
          <p className="text-[#94A3B8] text-xs mb-1">{payload[0].payload.date}</p>
          <p className="text-[#F1F5F9] font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-[#94A3B8] text-xs mt-1">
            Vol: {(payload[0].payload.volume / 1000000).toFixed(1)}M
          </p>
        </div>
      );
    }
    return null;
  };

  const averagePrice = data.length > 0 ? data.reduce((sum, d) => sum + d.price, 0) / data.length : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="relative">
      <div 
        className="rounded-xl overflow-hidden border-2 border-[#334155] bg-gradient-to-b from-[#1E293B] to-[#0F172A] shadow-2xl p-4"
        style={{ height: `${height}px` }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Activity className="w-12 h-12 text-[#F97316] animate-pulse mx-auto mb-3" />
              <p className="text-[#94A3B8]">טוען נתונים אמיתיים...</p>
            </div>
          </div>
        ) : error || data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <CircleAlert className="w-16 h-16 text-[#F97316] mx-auto mb-4" />
              <h3 className="text-[#F1F5F9] text-lg font-bold mb-2">נתונים אמיתיים לא זמינו</h3>
              <p className="text-[#94A3B8] mb-4">{error || 'לא ניתן לטעון נתוני היסטוריה אמיתיים'}</p>
              <button
                onClick={fetchStockData}
                className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white px-6 py-2 rounded-lg hover:from-[#EA580C] hover:to-[#C2410C] transition-all"
              >
                נסה שוב
              </button>
              <p className="text-[#64748B] text-xs mt-4">
                TurjiTrade מציגה רק נתונים אמיתיים ממקורות מהימנים:<br/>
                Yahoo Finance • Finnhub • Alpha Vantage
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Stats */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#94A3B8] text-xs mb-1">מחיר נוכחי</p>
                <div className="flex items-center gap-2">
                  <span className="text-[#F1F5F9] text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    ${currentPrice.toFixed(2)}
                  </span>
                  <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <p className="text-[#94A3B8] text-xs mb-1">ממוצע 30 יום</p>
                <span className="text-[#06B6D4] text-xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  ${averagePrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={height - 100}>
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94A3B8" 
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94A3B8' }}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94A3B8' }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={averagePrice} stroke="#06B6D4" strokeDasharray="3 3" strokeWidth={2} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
      
      {/* Source Badge */}
      {showSourceBadge && (
        <div className="absolute top-3 left-3 bg-[#1E293B]/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#334155] shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#F97316] rounded-full animate-pulse"></div>
            <span className="text-[#94A3B8] text-xs font-medium">Turji Advanced</span>
          </div>
        </div>
      )}
    </div>
  );
}