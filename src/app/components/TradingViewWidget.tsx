import { useEffect, useRef, useState } from 'react';
import { ChartBar } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol: string;
  height?: number;
  onError?: () => void;
}

// Get correct stock exchange for TradingView
const getStockExchange = (symbol: string): string => {
  const nasdaqStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 
    'NFLX', 'AMD', 'INTC', 'CSCO', 'ADBE', 'AVGO', 'QCOM', 'TXN',
    'COST', 'CMCSA', 'PEP', 'TMUS', 'SBUX', 'MDLZ', 'PYPL', 'ABNB',
    'PANW', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MRVL', 'FTNT', 'WDAY',
    'DXCM', 'REGN', 'VRTX', 'ILMN', 'BIIB', 'MRNA', 'GILD', 'AMGN'
  ];
  
  const nyseStocks = [
    'WMT', 'V', 'MA', 'JPM', 'JNJ', 'UNH', 'HD', 'BAC', 'PG', 'CVX',
    'XOM', 'ABBV', 'LLY', 'MRK', 'KO', 'PFE', 'DIS', 'NKE', 'VZ',
    'ORCL', 'CRM', 'BA', 'T', 'GE', 'F', 'GM', 'C', 'WFC', 'MS',
    'GS', 'AXP', 'IBM', 'CAT', 'MMM', 'HON', 'UPS', 'RTX', 'LMT'
  ];

  if (nasdaqStocks.includes(symbol)) {
    return 'NASDAQ';
  } else if (nyseStocks.includes(symbol)) {
    return 'NYSE';
  } else {
    return 'NASDAQ'; // Default fallback
  }
};

export default function TradingViewWidget({ symbol, height = 400, onError }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';
    setLoading(true);

    const container = containerRef.current;
    const exchange = getStockExchange(symbol);
    const fullSymbol = `${exchange}:${symbol}`;

    // Create TradingView Advanced Chart Widget
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    
    const config = {
      "autosize": true,
      "symbol": fullSymbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(15, 23, 42, 1)",
      "gridColor": "rgba(51, 65, 85, 0.3)",
      "allow_symbol_change": false,
      "save_image": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    };

    script.innerHTML = JSON.stringify(config);

    // Create widget container
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    const innerDiv = document.createElement('div');
    innerDiv.className = 'tradingview-widget-container__widget';
    innerDiv.style.height = 'calc(100% - 32px)';
    innerDiv.style.width = '100%';

    widgetDiv.appendChild(innerDiv);
    widgetDiv.appendChild(script);

    container.appendChild(widgetDiv);

    // Set loading to false after a delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="relative">
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-[#0F172A] rounded-xl border-2 border-[#334155] z-10"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <ChartBar className="w-12 h-12 text-[#06B6D4] animate-pulse mx-auto mb-3" />
            <p className="text-[#94A3B8]">טוען TradingView...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="rounded-xl overflow-hidden border-2 border-[#334155] shadow-2xl bg-[#0F172A]"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}