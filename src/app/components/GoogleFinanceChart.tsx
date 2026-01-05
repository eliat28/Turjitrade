import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Globe, CircleAlert, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface GoogleFinanceChartProps {
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

export default function GoogleFinanceChart({ symbol, height = 400, onError }: GoogleFinanceChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [dataPoints, setDataPoints] = useState<number>(0);

  useEffect(() => {
    loadChartData();
  }, [symbol]);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get data for the last 30 days
      const toTimestamp = Math.floor(Date.now() / 1000);
      const fromTimestamp = toTimestamp - (30 * 24 * 60 * 60); // 30 days ago

      // Call our backend server to fetch chart data
      const url = `https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90/chart-data?symbol=${symbol}&from=${fromTimestamp}&to=${toTimestamp}`;
      console.log('📊 Google Finance Chart - Fetching REAL data from:', url);
      
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
      console.log('📊 Google Finance - Server response:', result);
      
      if (result.error || result.s === 'no_data' || !result.data || result.data.length === 0) {
        setError('אין נתונים זמינו למנייה זו');
        setLoading(false);
        // Call onError callback
        if (onError) {
          setTimeout(() => onError(), 1000);
        }
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
      setDataPoints(chartData.length);
      console.log('✅ Google Finance Chart - REAL DATA loaded:', chartData.length, 'points');
    } catch (err) {
      console.error('❌ Error loading Google Finance chart:', err);
      setError('שגיאה בטעינת נתוני הגרף');
      // Call onError callback
      if (onError) {
        setTimeout(() => onError(), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPositive = priceChange >= 0;
  const chartColor = isPositive ? '#10B981' : '#EF4444';
  const gradientId = `gradient-google-${symbol}`;

  if (loading) {
    return (
      <div 
        className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border-2 border-[#4285F4] flex items-center justify-center shadow-lg shadow-[#4285F4]/20"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-[#334155] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#94A3B8]">טוען נתוני Google Finance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border-2 border-[#4285F4] flex items-center justify-center shadow-lg shadow-[#4285F4]/20"
        style={{ height: `${height}px` }}
      >
        <div className="text-center px-6">
          <CircleAlert className="w-12 h-12 text-[#4285F4] mx-auto mb-3" />
          <p className="text-[#F1F5F9] font-bold mb-2">{error}</p>
          <p className="text-[#94A3B8] text-sm">נסה מנייה אחרת או בחר מקור נתונים שונה</p>
          <button
            onClick={loadChartData}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#4285F4] to-[#1967D2] hover:from-[#1967D2] hover:to-[#1557B0] text-white rounded-lg transition-all shadow-lg"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border-2 border-[#4285F4] p-4 shadow-xl shadow-[#4285F4]/20"
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#4285F4] to-[#1967D2] p-2.5 rounded-lg shadow-lg shadow-[#4285F4]/30">
            <Globe className="w-5 h-5 text-white" />
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
                <RefreshCw className={`w-4 h-4 text-[#94A3B8] hover:text-[#4285F4] ${loading ? 'animate-spin' : ''}`} />
              </button>
            </h3>
            <p className="text-[#94A3B8] text-xs">Google Finance Style • 30 ימים</p>
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

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height - 140}>
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
              border: '2px solid #4285F4',
              borderRadius: '12px',
              padding: '10px 14px',
              boxShadow: '0 10px 30px rgba(66, 133, 244, 0.3)',
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

      {/* Footer */}
      <div className="mt-2 text-center">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4285F4] to-[#1967D2] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-[#4285F4]/30">
            <Globe className="w-3.5 h-3.5" />
            Google Finance Style
          </span>
          
          {dataPoints > 0 && (
            <span className="inline-flex items-center gap-1 bg-[#334155] text-[#94A3B8] text-xs px-3 py-1.5 rounded-full">
              {dataPoints} נקודות מידע
            </span>
          )}
        </div>
      </div>
    </div>
  );
}