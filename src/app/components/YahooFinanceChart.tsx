import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CircleAlert, RefreshCw, ChartBar, Activity } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

interface YahooFinanceChartProps {
  symbol: string;
  height?: number;
  onError?: () => void;
}

interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
  time: string;
}

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

type ChartType = 'line' | 'candlestick';

export default function YahooFinanceChart({ symbol, height = 400, onError }: YahooFinanceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [dataSource, setDataSource] = useState<string>('');
  const [dataPoints, setDataPoints] = useState<number>(0);
  const [chartType, setChartType] = useState<ChartType>('line');
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    loadChartData();
  }, [symbol]);

  useEffect(() => {
    if (chartType === 'candlestick' && data.length > 0) {
      initCandlestickChart();
    }
    
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [chartType, data]);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get data for the last 30 days
      const toTimestamp = Math.floor(Date.now() / 1000);
      const fromTimestamp = toTimestamp - (30 * 24 * 60 * 60); // 30 days ago

      // Call our backend server to fetch chart data
      const url = `https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90/chart-data?symbol=${symbol}&from=${fromTimestamp}&to=${toTimestamp}`;
      console.log('📊 Yahoo Finance Chart - Fetching REAL data from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', response.status, errorText);
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 Yahoo Finance - Server response:', result);
      
      if (result.error || result.s === 'no_data' || !result.data || result.data.length === 0) {
        setError('אין נתונים זמינו למנייה זו');
        setLoading(false);
        return;
      }

      // Use the transformed data from backend
      const chartData: ChartDataPoint[] = result.data;

      // Calculate price change
      if (chartData.length >= 2) {
        const firstPrice = chartData[0].price;
        const lastPrice = chartData[chartData.length - 1].price;
        const change = lastPrice - firstPrice;
        const changePercent = ((change / firstPrice) * 100);
        
        setPriceChange(change);
        setPriceChangePercent(changePercent);
      }

      setData(chartData);
      setDataSource(result.source);
      setDataPoints(chartData.length);
      console.log('✅ Yahoo Finance Chart - REAL DATA loaded:', chartData.length, 'points');
    } catch (err) {
      console.error('❌ Error loading Yahoo Finance chart:', err);
      setError('שגיאה בטעינת נתוני הגרף');
      if (onError) {
        onError();
      }
    } finally {
      setLoading(false);
    }
  };

  const initCandlestickChart = () => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94A3B8',
      },
      grid: {
        vertLines: { color: '#334155', style: 1 },
        horzLines: { color: '#334155', style: 1 },
      },
      width: chartContainerRef.current.clientWidth,
      height: height - 140,
      timeScale: {
        timeVisible: true,
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
    });

    chartRef.current = chart;

    // Convert data to candlestick format
    // Since we only have price data, we'll simulate OHLC using adjacent prices
    const candlestickData: CandlestickData[] = data.map((point, index) => {
      const basePrice = point.price;
      const prevPrice = index > 0 ? data[index - 1].price : basePrice;
      const nextPrice = index < data.length - 1 ? data[index + 1].price : basePrice;
      
      // Simulate OHLC from single price point
      const variation = basePrice * 0.002; // 0.2% variation
      const open = prevPrice;
      const close = basePrice;
      const high = Math.max(open, close) + variation;
      const low = Math.min(open, close) - variation;

      return {
        time: Math.floor(point.timestamp / 1000) as any,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      };
    });

    // Add candlestick series
    const candlestickSeriesData = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    candlestickSeriesData.setData(candlestickData);
    seriesRef.current = candlestickSeriesData;

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  const isPositive = priceChange >= 0;
  const chartColor = isPositive ? '#10B981' : '#EF4444';
  const gradientId = `gradient-yahoo-${symbol}`;

  if (loading) {
    return (
      <div 
        className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border-2 border-[#720E9E] flex items-center justify-center shadow-lg shadow-[#720E9E]/20"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-[#334155] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#720E9E] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#94A3B8]">טוען נתוני Yahoo Finance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border-2 border-[#720E9E] flex items-center justify-center shadow-lg shadow-[#720E9E]/20"
        style={{ height: `${height}px` }}
      >
        <div className="text-center px-6">
          <CircleAlert className="w-12 h-12 text-[#720E9E] mx-auto mb-3" />
          <p className="text-[#F1F5F9] font-bold mb-2">{error}</p>
          <p className="text-[#94A3B8] text-sm">נסה מנייה אחרת או בחר מקור נתונים שונה</p>
          <button
            onClick={loadChartData}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#720E9E] to-[#5B0A7F] hover:from-[#5B0A7F] hover:to-[#450860] text-white rounded-lg transition-all shadow-lg"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border-2 border-[#720E9E] p-4 shadow-xl shadow-[#720E9E]/20"
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-[#334155]">
        {/* Top Row - Title and Refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#720E9E] to-[#5B0A7F] p-2.5 rounded-lg shadow-lg shadow-[#720E9E]/30">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#F1F5F9] font-bold flex items-center gap-2">
                {symbol}
                <button
                  onClick={loadChartData}
                  disabled={loading}
                  className="p-1 hover:bg-[#334155] rounded-lg transition-all disabled:opacity-50"
                  title="רענן נתונים"
                >
                  <RefreshCw className={`w-4 h-4 text-[#94A3B8] hover:text-[#720E9E] ${loading ? 'animate-spin' : ''}`} />
                </button>
              </h3>
              <p className="text-[#94A3B8] text-xs">Yahoo Finance • 30 ימים</p>
            </div>
          </div>

          {data.length > 0 && (
            <div className="text-left">
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                )}
                <span 
                  className="font-bold text-lg"
                  style={{ color: chartColor }}
                >
                  {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-[#94A3B8] text-xs">
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} $ • ${data[data.length - 1].price.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Row - Chart Type Toggle */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 bg-[#0F172A] rounded-lg p-1 border border-[#334155]">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'line'
                  ? 'bg-gradient-to-r from-[#720E9E] to-[#5B0A7F] text-white shadow-lg'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
              title="גרף קווי"
            >
              <Activity className="w-3.5 h-3.5" />
              קווי
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'candlestick'
                  ? 'bg-gradient-to-r from-[#720E9E] to-[#5B0A7F] text-white shadow-lg'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
              title="נרות יפניים"
            >
              <ChartBar className="w-3.5 h-3.5" />
              נרות
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartType === 'line' ? (
        <ResponsiveContainer width="100%" height={height - 180}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#94A3B8"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis 
              stroke="#94A3B8"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '2px solid #720E9E',
                borderRadius: '12px',
                padding: '10px 14px',
                boxShadow: '0 10px 30px rgba(114, 14, 158, 0.3)',
              }}
              labelStyle={{ color: '#F1F5F9', fontWeight: 'bold', marginBottom: '6px' }}
              itemStyle={{ color: chartColor }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'מחיר']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={3}
              dot={false}
              fill={`url(#${gradientId})`}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div ref={chartContainerRef} style={{ width: '100%', height: height - 180 }} />
      )}

      {/* Footer */}
      <div className="mt-2 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#720E9E] to-[#5B0A7F] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-[#720E9E]/30">
            <DollarSign className="w-3 h-3" />
            Yahoo Finance
          </span>
          
          {chartType === 'candlestick' && (
            <span className="inline-flex items-center gap-1.5 bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#06B6D4] text-xs font-bold px-2.5 py-1 rounded-full">
              <ChartBar className="w-3 h-3" />
              נרות יפניים
            </span>
          )}
          
          {dataSource && (
            <span className="inline-flex items-center gap-1.5 bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-bold px-2.5 py-1 rounded-full">
              ✓ נתונים אמיתיים
            </span>
          )}
          
          {dataPoints > 0 && (
            <span className="inline-flex items-center gap-1 bg-[#334155] text-[#94A3B8] text-xs px-2.5 py-1 rounded-full">
              {dataPoints} נקודות
            </span>
          )}
        </div>
      </div>
    </div>
  );
}