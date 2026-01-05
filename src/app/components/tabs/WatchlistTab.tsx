import { useState, useEffect } from 'react';
import { Star, Plus, Search, X, TrendingUp, TrendingDown, Target, TriangleAlert, Wifi, WifiOff, Bot, DollarSign, FileText, Bell, BellRing, Mail, MessageCircle, Send, Filter, Trash2 } from 'lucide-react';
import StockDetailModal from '../StockDetailModal';
import AddToWatchlistModal from '../AddToWatchlistModal';
import BuyAlertNotification from '../BuyAlertNotification';
import SellAlertNotification from '../SellAlertNotification';
import APIKeyBanner from '../APIKeyBanner';
import StockCard from '../StockCard'; // Import StockCard
import { fetchMultipleStockPrices, isUsingRealAPI, fetchStockPrice, isMarketOpen, fetchMultipleStockRecommendations } from '../../services/stockApi';

interface WatchlistTabProps {
  onOpenTurjiBot?: (context: string) => void;
}

interface WatchlistItem {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  alert?: number;
  notes?: string;
  isTrading: boolean;
  entryPrice?: number;
  quantity?: number;
  buyAlert?: boolean;
  buyPriceMin?: number;
  buyPriceMax?: number;
  sellAlert?: boolean;
  sellPriceMin?: number;
  sellPriceMax?: number;
  alertChannels?: {
    email: boolean;
    whatsapp: boolean;
    telegram: boolean;
  };
  buyAlertTriggered?: boolean;
  sellAlertTriggered?: boolean;
}

const mockWatchlist: WatchlistItem[] = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 182.63,
    change: 1.24,
    alert: 190,
    notes: 'מעקב אחרי השקה',
    isTrading: true,
    entryPrice: 180,
    quantity: 10
  },
  {
    id: 2,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    currentPrice: 245.12,
    change: -0.52,
    isTrading: false
  }
];

export default function WatchlistTab({ onOpenTurjiBot }: WatchlistTabProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
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
  } | null>(null);
  const [newStock, setNewStock] = useState({
    symbol: '',
    notes: '',
    alert: '',
    isTrading: false,
    entryPrice: '',
    quantity: '',
    buyAlert: false,
    buyPriceMin: '',
    buyPriceMax: '',
    sellAlert: false,
    sellPriceMin: '',
    sellPriceMax: '',
    alertChannels: {
      email: true,
      whatsapp: false,
      telegram: false
    }
  });
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [buyAlertNotifications, setBuyAlertNotifications] = useState<{id: number, symbol: string, price: number, channels: any}[]>([]);
  const [sellAlertNotifications, setSellAlertNotifications] = useState<{id: number, symbol: string, price: number, channels: any}[]>([]);
  const [showPositionsOnly, setShowPositionsOnly] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('turjiTrade_watchlist');
    
    // Clear old initialization flag
    localStorage.removeItem('turjiTrade_watchlist_initialized');
    
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        setWatchlist(parsed);
      } catch (error) {
        console.error('Failed to load watchlist:', error);
        setWatchlist([]);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (watchlist.length >= 0) {
      localStorage.setItem('turjiTrade_watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  // Fetch real-time prices for all watchlist stocks
  const updateWatchlistPrices = async () => {
    if (watchlist.length === 0) return;
    
    const symbols = watchlist.map(item => item.symbol);
    const quotesMap = await fetchMultipleStockPrices(symbols);
    
    const updatedWatchlist = watchlist.map(item => {
      const quote = quotesMap.get(item.symbol);
      if (quote) {
        return {
          ...item,
          currentPrice: quote.price,
          change: quote.changePercent
        };
      }
      return item;
    });
    
    setWatchlist(updatedWatchlist);
  };

  // Initial fetch on mount
  useEffect(() => {
    updateWatchlistPrices();
  }, []);

  // Update prices every 10 seconds during market hours (16:00-23:00 Israel time), otherwise every 60 seconds
  useEffect(() => {
    const updateInterval = isMarketOpen() ? 10000 : 60000; // 10s during market hours, 60s otherwise
    
    console.log(`🔄 Watchlist: מגדיר רענון אוטומטי: ${isMarketOpen() ? '10 שניות (שוק פתוח)' : '60 שניות (שוק סגור)'}`);
    
    const interval = setInterval(() => {
      updateWatchlistPrices();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [watchlist]);

  // Check for buy alerts
  useEffect(() => {
    watchlist.forEach(item => {
      if (item.buyAlert && item.buyPriceMin && item.buyPriceMax && item.alertChannels && !item.buyAlertTriggered) {
        // Check if current price is within the buy range
        if (item.currentPrice >= item.buyPriceMin && item.currentPrice <= item.buyPriceMax) {
          // Trigger alert
          setBuyAlertNotifications(prev => {
            // Don't add duplicate notifications
            if (prev.some(n => n.id === item.id)) return prev;
            return [...prev, {
              id: item.id,
              symbol: item.symbol,
              price: item.currentPrice,
              channels: item.alertChannels
            }];
          });
          
          // Mark alert as triggered
          setWatchlist(prev => prev.map(i => 
            i.id === item.id ? { ...i, buyAlertTriggered: true } : i
          ));
        }
      }
    });
  }, [watchlist]);

  // Check for sell alerts
  useEffect(() => {
    watchlist.forEach(item => {
      if (item.sellAlert && item.sellPriceMin && item.sellPriceMax && item.alertChannels && !item.sellAlertTriggered) {
        // Check if current price is within the sell range
        if (item.currentPrice >= item.sellPriceMin && item.currentPrice <= item.sellPriceMax) {
          // Trigger alert
          setSellAlertNotifications(prev => {
            // Don't add duplicate notifications
            if (prev.some(n => n.id === item.id)) return prev;
            return [...prev, {
              id: item.id,
              symbol: item.symbol,
              price: item.currentPrice,
              channels: item.alertChannels
            }];
          });
          
          // Mark alert as triggered
          setWatchlist(prev => prev.map(i => 
            i.id === item.id ? { ...i, sellAlertTriggered: true } : i
          ));
        }
      }
    });
  }, [watchlist]);

  const calculatePnL = (item: WatchlistItem) => {
    if (!item.isTrading || !item.entryPrice || !item.quantity) return null;
    
    const investment = item.entryPrice * item.quantity;
    const currentValue = item.currentPrice * item.quantity;
    const profit = currentValue - investment;
    const profitPercent = ((profit / investment) * 100).toFixed(2);
    
    return { profit, profitPercent };
  };

  const handleStockClick = async (item: WatchlistItem) => {
    // Fetch recommendations for this stock
    try {
      const recommendations = await fetchMultipleStockRecommendations([item.symbol]);
      const recommendation = recommendations.get(item.symbol);
      
      // Calculate signal and strength based on price action if recommendation is weak/fallback
      let signal = 'המתן';
      let strength = 50;
      let target = item.currentPrice * 1.15;
      let stopLoss = item.currentPrice * 0.92;
      
      if (recommendation) {
        signal = recommendation.signal;
        strength = recommendation.strength;
        target = recommendation.targetPrice || target;
        stopLoss = item.currentPrice * 0.92; // Calculate based on current price
        
        // If recommendation is fallback or weak, enhance with technical analysis
        if (recommendation.isFallback || recommendation.strength < 60) {
          const changePercent = item.change;
          const priceRange = item.currentPrice;
          
          // Technical signal calculation
          let technicalStrength = 50;
          
          if (changePercent > 3) technicalStrength += 20;
          else if (changePercent > 1.5) technicalStrength += 15;
          else if (changePercent > 0.5) technicalStrength += 10;
          else if (changePercent < -3) technicalStrength -= 20;
          else if (changePercent < -1.5) technicalStrength -= 15;
          else if (changePercent < -0.5) technicalStrength -= 10;
          
          if (Math.abs(changePercent) > 2) {
            technicalStrength += changePercent > 0 ? 10 : -10;
          }
          
          if (priceRange < 50 && changePercent > 1) {
            technicalStrength += 8;
          }
          
          technicalStrength = Math.max(0, Math.min(100, technicalStrength));
          
          if (technicalStrength >= 80) {
            signal = 'קנייה חזקה';
          } else if (technicalStrength >= 65) {
            signal = 'קנייה';
          } else if (technicalStrength >= 40) {
            signal = 'המתן';
          } else {
            signal = 'מכירה';
          }
          
          strength = Math.max(technicalStrength, recommendation.strength);
        }
      } else {
        // No recommendation - use price change only
        if (item.change > 3) {
          signal = 'קנייה חזקה';
          strength = 85;
        } else if (item.change > 1) {
          signal = 'קנייה';
          strength = 70;
        }
      }
      
      setSelectedStock({
        symbol: item.symbol,
        name: item.name,
        price: item.currentPrice,
        change: item.change,
        signal,
        strength,
        target,
        stopLoss,
        id: item.id
      });
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Fallback to basic data
      setSelectedStock({
        symbol: item.symbol,
        name: item.name,
        price: item.currentPrice,
        change: item.change,
        signal: item.change >= 0 ? 'קנייה' : 'המתן',
        strength: 50,
        target: item.currentPrice * 1.15,
        stopLoss: item.currentPrice * 0.92,
        id: item.id
      });
    }
  };

  const handleAddStock = async () => {
    if (!newStock.symbol) return;
    
    setIsAddingStock(true);
    
    try {
      // Fetch real price from API
      const quote = await fetchStockPrice(newStock.symbol.toUpperCase());
      
      if (!quote) {
        alert(`לא הצלחנו למצוא את המניה ${newStock.symbol.toUpperCase()}. אנא בדוק את הסימבול ונסה שוב.`);
        setIsAddingStock(false);
        return;
      }
      
      const newItem: WatchlistItem = {
        id: Date.now(),
        symbol: newStock.symbol.toUpperCase(),
        name: `${newStock.symbol.toUpperCase()} Corp.`,
        currentPrice: quote.price, // Real price from API
        change: quote.changePercent, // Real change from API
        alert: newStock.alert ? Number(newStock.alert) : undefined,
        notes: newStock.notes || undefined,
        isTrading: newStock.isTrading,
        entryPrice: newStock.entryPrice ? Number(newStock.entryPrice) : undefined,
        quantity: newStock.quantity ? Number(newStock.quantity) : undefined,
        buyAlert: newStock.buyAlert,
        buyPriceMin: newStock.buyPriceMin ? Number(newStock.buyPriceMin) : undefined,
        buyPriceMax: newStock.buyPriceMax ? Number(newStock.buyPriceMax) : undefined,
        sellAlert: newStock.sellAlert,
        sellPriceMin: newStock.sellPriceMin ? Number(newStock.sellPriceMin) : undefined,
        sellPriceMax: newStock.sellPriceMax ? Number(newStock.sellPriceMax) : undefined,
        alertChannels: newStock.alertChannels
      };
      
      setWatchlist([...watchlist, newItem]);
      setShowAddModal(false);
      setNewStock({
        symbol: '',
        notes: '',
        alert: '',
        isTrading: false,
        entryPrice: '',
        quantity: '',
        buyAlert: false,
        buyPriceMin: '',
        buyPriceMax: '',
        sellAlert: false,
        sellPriceMin: '',
        sellPriceMax: '',
        alertChannels: {
          email: true,
          whatsapp: false,
          telegram: false
        }
      });
    } catch (error) {
      alert('ארעה שגיאה בטעינת המניה. אנא נסה שוב.');
    } finally {
      setIsAddingStock(false);
    }
  };

  const handleRemoveStock = (id: number) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
  };

  const handleAskTurjiBot = () => {
    if (onOpenTurjiBot) {
      const tradingPositions = watchlist.filter(item => item.isTrading).length;
      const watching = watchlist.length - tradingPositions;
      const context = `אני נמצא בדף רשימת המעקב של TurjiTrade. יש לי ${watchlist.length} מניות ברשימת המעקב: ${tradingPositions} פוזיציות פעילות ו-${watching} מניות במעקב בלבד. ${watchlist.length > 0 ? `המניות שלי הן: ${watchlist.map(item => `${item.symbol} (${item.change >= 0 ? '+' : ''}${item.change}%${item.isTrading ? `, רווח: ${calculatePnL(item)?.profitPercent}%` : ''})`).join(', ')}. ` : ''}מה דעתך על רשימת המעקב שלי?`;
      onOpenTurjiBot(context);
    }
  };

  return (
    <div className="px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#F1F5F9] text-xl sm:text-2xl">רשימת מעקב</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPositionsOnly(!showPositionsOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs sm:text-sm font-['Heebo'] border ${
              showPositionsOnly
                ? 'bg-[#F97316] text-white border-[#F97316]'
                : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
            }`}
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">פוזיציות בלבד</span>
            <span className="sm:hidden">פוזיציות</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-[#F97316] rounded-full flex items-center justify-center hover:bg-[#EA580C] transition-colors active:scale-95"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Watchlist Items */}
      {watchlist.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {watchlist
            .filter(item => !showPositionsOnly || item.isTrading)
            .map((item) => {
            return (
              <div key={item.id} className="relative group">
                 <StockCard 
                   stock={{
                     symbol: item.symbol,
                     name: item.name,
                     price: item.currentPrice,
                     change: item.change,
                     signal: 'מעקב', // Default signal
                     strength: 50,
                     target: item.currentPrice * 1.1,
                     stopLoss: item.currentPrice * 0.9,
                     recommendationText: item.notes, // Map notes to recommendation text
                     hasPosition: item.isTrading,
                     entryPrice: item.entryPrice,
                     quantity: item.quantity,
                     alertActive: item.buyAlert || item.sellAlert || !!item.alert,
                     alertPrice: item.alert || item.buyPriceMin || item.sellPriceMin,
                     positionDate: undefined // Date not stored in watchlist item currently
                   }}
                   onClick={() => handleStockClick(item)}
                 />
                 
                 {/* Remove Button overlay */}
                 <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm('להסיר מהרשימה?')) {
                        handleRemoveStock(item.id);
                      }
                    }}
                    className="absolute top-[2vw] left-[2vw] z-10 p-[2vw] bg-[#334155]/80 backdrop-blur-sm rounded-full text-[#94A3B8] hover:text-[#EF4444] transition-colors sm:p-2 sm:top-2 sm:left-2"
                  >
                    <Trash2 className="w-[4vw] h-[4vw] sm:w-5 sm:h-5" />
                  </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <Star className="w-12 h-12 sm:w-16 sm:h-16 text-[#334155] mb-4" />
          <h3 className="text-[#F1F5F9] text-lg sm:text-xl mb-2">רשימת המעקב ריקה</h3>
          <p className="text-[#94A3B8] text-center text-sm sm:text-base">
            הוסף מניות כדי לעקוב אחרי המחירים שלהן
          </p>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <AddToWatchlistModal
          onClose={() => setShowAddModal(false)}
          onAddStock={handleAddStock}
          newStock={newStock}
          setNewStock={setNewStock}
          isAddingStock={isAddingStock}
        />
      )}

      {/* Stock Detail Modal */}
      {selectedStock && (() => {
        const watchlistItem = watchlist.find(item => item.id === selectedStock.id);
        return (
          <StockDetailModal
            stock={selectedStock}
            onClose={() => setSelectedStock(null)}
            onRemoveFromWatchlist={() => handleRemoveStock(selectedStock.id)}
            onOpenTurjiBot={onOpenTurjiBot}
            userPosition={watchlistItem ? {
              isTrading: watchlistItem.isTrading,
              entryPrice: watchlistItem.entryPrice,
              quantity: watchlistItem.quantity
            } : undefined}
          />
        );
      })()}

      {/* Buy Alert Notifications */}
      {buyAlertNotifications.map((notification) => {
        const item = watchlist.find(i => i.id === notification.id);
        if (!item || !item.buyPriceMin || !item.buyPriceMax || !item.alertChannels) return null;
        
        return (
          <BuyAlertNotification
            key={notification.id}
            symbol={notification.symbol}
            price={notification.price}
            priceMin={item.buyPriceMin}
            priceMax={item.buyPriceMax}
            channels={item.alertChannels}
            onDismiss={() => {
              setBuyAlertNotifications(prev => prev.filter(n => n.id !== notification.id));
            }}
          />
        );
      })}

      {/* Sell Alert Notifications */}
      {sellAlertNotifications.map((notification) => {
        const item = watchlist.find(i => i.id === notification.id);
        if (!item || !item.sellPriceMin || !item.sellPriceMax || !item.alertChannels) return null;
        
        return (
          <SellAlertNotification
            key={notification.id}
            symbol={notification.symbol}
            price={notification.price}
            priceMin={item.sellPriceMin}
            priceMax={item.sellPriceMax}
            channels={item.alertChannels}
            onDismiss={() => {
              setSellAlertNotifications(prev => prev.filter(n => n.id !== notification.id));
            }}
          />
        );
      })}
    </div>
  );
}