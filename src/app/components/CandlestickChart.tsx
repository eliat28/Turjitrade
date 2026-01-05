import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, TrendingUp, TrendingDown, CircleAlert, Activity } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface CandlestickChartProps {
  symbol: string;
  height?: number;
  showSourceBadge?: boolean;
}

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isPositive: boolean;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90`;

export default function CandlestickChart({ symbol, height = 400, showSourceBadge = true }: CandlestickChartProps) {
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ current: 0, change: 0, high: 0, low: 0 });
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('Unknown');

  useEffect(() => {
    fetchCandleData();
  }, [symbol]);

  const fetchCandleData = async () => {
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
      
      console.log(`[CandlestickChart] Price data for ${symbol}:`, priceData);
      
      if (!priceData.success || !priceData.price) {
        throw new Error('Invalid price data from server');
      }
      
      const currentPrice = priceData.price;
      const change = priceData.changePercent;

      // Get historical data from server (tries Yahoo, Finnhub, Alpha Vantage)
      const historyResponse = await fetch(`${SERVER_URL}/stock/${symbol}/history?days=20`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Accept': 'application/json',
        }
      });
      
      const candleData = await historyResponse.json();

      console.log(`[CandlestickChart] Candle data for ${symbol}:`, candleData);

      // Check if server returned error (no real data available)
      if (candleData.s === 'error') {
        setError(candleData.message || 'נתוני נרות לא זמינו');
        setData([]);
        return;
      }

      if (candleData.s === 'ok' && candleData.c && candleData.c.length > 0) {
        // Use REAL historical data from Yahoo/Finnhub/AlphaVantage
        setDataSource(candleData.source || 'Unknown');
        
        const candles: CandleData[] = candleData.t.map((timestamp: number, index: number) => {
          const date = new Date(timestamp * 1000);
          const open = candleData.o[index];
          const close = candleData.c[index];
          
          return {
            date: date.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
            open: Number(open.toFixed(2)),
            high: Number(candleData.h[index].toFixed(2)),
            low: Number(candleData.l[index].toFixed(2)),
            close: Number(close.toFixed(2)),
            volume: candleData.v[index],
            isPositive: close >= open
          };
        });
        
        // Override the last candle with current real-time data
        if (candles.length > 0) {
          const today = new Date();
          const lastCandle = candles[candles.length - 1];
          const lastIndex = candleData.c.length - 1;
          
          candles[candles.length - 1] = {
            date: today.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
            open: lastCandle.open,
            high: Math.max(candleData.h[lastIndex], currentPrice),
            low: Math.min(candleData.l[lastIndex], currentPrice),
            close: currentPrice,
            volume: lastCandle.volume,
            isPositive: currentPrice >= lastCandle.open
          };
        }
        
        setData(candles);
        
        // Calculate stats from all candles
        const allHighs = candleData.h;
        const allLows = candleData.l;
        setStats({
          current: currentPrice,
          change: change,
          high: Math.max(...allHighs, currentPrice),
          low: Math.min(...allLows, currentPrice)
        });
        console.log(`✅ Loaded ${candles.length} REAL candles from ${candleData.source}`);
      } else {
        throw new Error('No real candle data available from any source');
      }
    } catch (error) {
      console.error('[CandlestickChart] Error fetching candle data:', error);
      setError('לא ניתן לטעון נתוני נרות אמיתיים כרגע. אנא נסה שוב מאוחר יותר.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1E293B] border-2 border-[#334155] rounded-lg p-3 shadow-2xl">
          <p className="text-[#94A3B8] text-xs mb-2 font-bold">{data.date}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-[#94A3B8]">פתיחה:</span>
              <span className="text-[#F1F5F9] font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>${data.open}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[#94A3B8]">סגירה:</span>
              <span className={`font-bold ${data.isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
                ${data.close}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[#94A3B8]">גבוה:</span>
              <span className="text-[#06B6D4] font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>${data.high}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[#94A3B8]">נמוך:</span>
              <span className="text-[#F97316] font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>${data.low}</span>
            </div>
            <div className="flex justify-between gap-3 pt-1 border-t border-[#334155]">
              <span className="text-[#94A3B8]">נפח:</span>
              <span className="text-[#F1F5F9] font-bold">{(data.volume / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CandleShape = (props: any) => {
    const { x, y, width, height, payload } = props;
    const isPositive = payload.isPositive;
    const bodyHeight = Math.abs(payload.close - payload.open) / (payload.high - payload.low) * height;
    const bodyY = y + (isPositive ? (payload.high - payload.close) / (payload.high - payload.low) * height : (payload.high - payload.open) / (payload.high - payload.low) * height);
    
    return (
      <g>
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + height}
          stroke={isPositive ? '#10B981' : '#EF4444'}
          strokeWidth={1.5}
        />
        <rect
          x={x + width * 0.2}
          y={bodyY}
          width={width * 0.6}
          height={Math.max(bodyHeight, 2)}
          fill={isPositive ? '#10B981' : '#EF4444'}
          stroke={isPositive ? '#10B981' : '#EF4444'}
          strokeWidth={1}
          rx={2}
        />
      </g>
    );
  };

  const isPositive = stats.change >= 0;

  return (
    <div className="relative">
      <div 
        className="rounded-xl overflow-hidden border-2 border-[#334155] bg-gradient-to-b from-[#0F172A] to-[#020617] shadow-2xl p-4"
        style={{ height: `${height}px` }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Activity className="w-12 h-12 text-[#06B6D4] animate-pulse mx-auto mb-3" />
              <p className="text-[#94A3B8]">טוען נתוני נרות אמיתיים...</p>
            </div>
          </div>
        ) : error || data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <CircleAlert className="w-16 h-16 text-[#06B6D4] mx-auto mb-4" />
              <h3 className="text-[#F1F5F9] text-lg font-bold mb-2">נתוני נרות אמיתיים לא זמינו</h3>
              <p className="text-[#94A3B8] mb-4">{error || 'לא ניתן לטעון נתוני נרות אמיתיים'}</p>
              <button
                onClick={fetchCandleData}
                className="bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9] text-white px-6 py-2 rounded-lg hover:from-[#0EA5E9] hover:to-[#0284C7] transition-all"
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
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#1E293B]/50 rounded-lg p-2 border border-[#334155]">
                <p className="text-[#94A3B8] text-[10px] mb-1">נוכחי</p>
                <div className="flex items-center gap-1">
                  <span className="text-[#F1F5F9] font-bold text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    ${stats.current.toFixed(2)}
                  </span>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-[#EF4444]" />
                  )}
                </div>
              </div>
              
              <div className="bg-[#1E293B]/50 rounded-lg p-2 border border-[#334155]">
                <p className="text-[#94A3B8] text-[10px] mb-1">גבוה</p>
                <span className="text-[#06B6D4] font-bold text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  ${stats.high.toFixed(2)}
                </span>
              </div>
              
              <div className="bg-[#1E293B]/50 rounded-lg p-2 border border-[#334155]">
                <p className="text-[#94A3B8] text-[10px] mb-1">נמוך</p>
                <span className="text-[#F97316] font-bold text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                  ${stats.low.toFixed(2)}
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={height - 110}>
              <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94A3B8" 
                  style={{ fontSize: '10px' }}
                  tick={{ fill: '#94A3B8' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#94A3B8" 
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#94A3B8' }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="high" shape={<CandleShape />}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
      
      {showSourceBadge && (
        <div className="absolute top-3 left-3 bg-[#1E293B]/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#334155] shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#06B6D4] rounded-full animate-pulse"></div>
            <span className="text-[#94A3B8] text-xs font-medium">Turji Candles</span>
          </div>
        </div>
      )}
    </div>
  );
}