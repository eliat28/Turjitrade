import { X, DollarSign, Bell, TrendingDown } from 'lucide-react';

interface AddToWatchlistModalProps {
  onClose: () => void;
  onAddStock: () => void;
  newStock: {
    symbol: string;
    notes: string;
    alert: string;
    isTrading: boolean;
    entryPrice: string;
    quantity: string;
    buyAlert: boolean;
    buyPriceMin: string;
    buyPriceMax: string;
    sellAlert: boolean;
    sellPriceMin: string;
    sellPriceMax: string;
    alertChannels: {
      email: boolean;
      whatsapp: boolean;
      telegram: boolean;
    };
  };
  setNewStock: (stock: any) => void;
  isAddingStock: boolean;
}

export default function AddToWatchlistModal({
  onClose,
  onAddStock,
  newStock,
  setNewStock,
  isAddingStock
}: AddToWatchlistModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E293B] rounded-2xl max-w-md w-full border border-[#334155] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#334155]">
          <h2 className="text-[#F1F5F9] text-xl">הוסף לרשימת מעקב</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#334155] hover:bg-[#475569] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Stock Symbol */}
          <div>
            <label className="block text-[#94A3B8] text-sm mb-2">סימבול מניה *</label>
            <input
              type="text"
              value={newStock.symbol}
              onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
              placeholder="לדוגמה: AAPL"
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            />
          </div>

          {/* Price Alert */}
          <div>
            <label className="block text-[#94A3B8] text-sm mb-2">התראת מחיר (אופציונלי)</label>
            <input
              type="number"
              value={newStock.alert}
              onChange={(e) => setNewStock({ ...newStock, alert: e.target.value })}
              placeholder="$0.00"
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors"
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#94A3B8] text-sm mb-2">הערות (אופציונלי)</label>
            <textarea
              value={newStock.notes}
              onChange={(e) => setNewStock({ ...newStock, notes: e.target.value })}
              placeholder="הוסף הערות למניה..."
              rows={3}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors resize-none"
            />
          </div>

          {/* Buy Alert Toggle */}
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newStock.buyAlert}
                onChange={(e) => setNewStock({ ...newStock, buyAlert: e.target.checked })}
                className="w-5 h-5 rounded border-[#475569] bg-[#1E293B] text-[#F97316] focus:ring-2 focus:ring-[#F97316] focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="text-[#F1F5F9] text-sm">קבל עדכון לקנייה</div>
                <div className="text-[#94A3B8] text-xs mt-1">התראה כשהמניה נמצאת בטווח מחיר מבוקש</div>
              </div>
              <Bell className="w-5 h-5 text-[#06B6D4]" />
            </label>

            {/* Buy Alert Details */}
            {newStock.buyAlert && (
              <div className="mt-4 space-y-3 pt-4 border-t border-[#334155]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#94A3B8] text-xs mb-2">מחיר מינימום *</label>
                    <input
                      type="number"
                      value={newStock.buyPriceMin}
                      onChange={(e) => setNewStock({ ...newStock, buyPriceMin: e.target.value })}
                      placeholder="$0.00"
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors text-sm"
                      style={{ fontFamily: 'Roboto Mono, monospace' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[#94A3B8] text-xs mb-2">מחיר מקסימום *</label>
                    <input
                      type="number"
                      value={newStock.buyPriceMax}
                      onChange={(e) => setNewStock({ ...newStock, buyPriceMax: e.target.value })}
                      placeholder="$0.00"
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors text-sm"
                      style={{ fontFamily: 'Roboto Mono, monospace' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] text-xs mb-2">ערוצי התראה:</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStock.alertChannels.email}
                        onChange={(e) => setNewStock({
                          ...newStock,
                          alertChannels: { ...newStock.alertChannels, email: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-[#475569] bg-[#0F172A] text-[#F97316] focus:ring-2 focus:ring-[#F97316] focus:ring-offset-0"
                      />
                      <span className="text-[#F1F5F9] text-sm flex items-center gap-1">
                        📧 מייל
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStock.alertChannels.telegram}
                        onChange={(e) => setNewStock({
                          ...newStock,
                          alertChannels: { ...newStock.alertChannels, telegram: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-[#475569] bg-[#0F172A] text-[#F97316] focus:ring-2 focus:ring-[#F97316] focus:ring-offset-0"
                      />
                      <span className="text-[#F1F5F9] text-sm flex items-center gap-1">
                        📱 טלגרם
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sell Alert Toggle */}
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newStock.sellAlert}
                onChange={(e) => setNewStock({ ...newStock, sellAlert: e.target.checked })}
                className="w-5 h-5 rounded border-[#475569] bg-[#1E293B] text-[#F97316] focus:ring-2 focus:ring-[#F97316] focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="text-[#F1F5F9] text-sm">קבל עדכון למכירה</div>
                <div className="text-[#94A3B8] text-xs mt-1">התראה כשהמניה נמצאת בטווח מחיר מבוקש</div>
              </div>
              <TrendingDown className="w-5 h-5 text-[#06B6D4]" />
            </label>

            {/* Sell Alert Details */}
            {newStock.sellAlert && (
              <div className="mt-4 space-y-3 pt-4 border-t border-[#334155]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#94A3B8] text-xs mb-2">מחיר מינימום *</label>
                    <input
                      type="number"
                      value={newStock.sellPriceMin}
                      onChange={(e) => setNewStock({ ...newStock, sellPriceMin: e.target.value })}
                      placeholder="$0.00"
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors text-sm"
                      style={{ fontFamily: 'Roboto Mono, monospace' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[#94A3B8] text-xs mb-2">מחיר מקסימום *</label>
                    <input
                      type="number"
                      value={newStock.sellPriceMax}
                      onChange={(e) => setNewStock({ ...newStock, sellPriceMax: e.target.value })}
                      placeholder="$0.00"
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors text-sm"
                      style={{ fontFamily: 'Roboto Mono, monospace' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] text-xs mb-2">ערוצי התראה:</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStock.alertChannels.email}
                        onChange={(e) => setNewStock({
                          ...newStock,
                          alertChannels: { ...newStock.alertChannels, email: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-[#475569] bg-[#0F172A] text-[#F97316] focus:ring-2 focus:ring-[#F97316] focus:ring-offset-0"
                      />
                      <span className="text-[#F1F5F9] text-sm flex items-center gap-1">
                        📧 מייל
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStock.alertChannels.telegram}
                        onChange={(e) => setNewStock({
                          ...newStock,
                          alertChannels: { ...newStock.alertChannels, telegram: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-[#475569] bg-[#0F172A] text-[#F97316] focus:ring-2 focus:ring-[#F97316] focus:ring-offset-0"
                      />
                      <span className="text-[#F1F5F9] text-sm flex items-center gap-1">
                        📱 טלגרם
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trading Position Toggle */}
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newStock.isTrading}
                onChange={(e) => setNewStock({ ...newStock, isTrading: e.target.checked })}
                className="w-5 h-5 rounded border-[#475569] bg-[#1E293B] text-[#F97316] focus:ring-2 focus:ring-[#F97316] focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="text-[#F1F5F9] text-sm">אני מחזיק את המניה הזאת</div>
                <div className="text-[#94A3B8] text-xs mt-1">עקוב אחר רווח והפסד בזמן אמת</div>
              </div>
              <DollarSign className="w-5 h-5 text-[#06B6D4]" />
            </label>

            {/* Position Details */}
            {newStock.isTrading && (
              <div className="mt-4 space-y-3 pt-4 border-t border-[#334155]">
                <div>
                  <label className="block text-[#94A3B8] text-xs mb-2">מחיר כניסה *</label>
                  <input
                    type="number"
                    value={newStock.entryPrice}
                    onChange={(e) => setNewStock({ ...newStock, entryPrice: e.target.value })}
                    placeholder="$0.00"
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors text-sm"
                    style={{ fontFamily: 'Roboto Mono, monospace' }}
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] text-xs mb-2">כמות מניות *</label>
                  <input
                    type="number"
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors text-sm"
                    style={{ fontFamily: 'Roboto Mono, monospace' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#334155] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#F1F5F9] rounded-xl px-6 py-3 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={onAddStock}
            disabled={!newStock.symbol || isAddingStock || (newStock.isTrading && (!newStock.entryPrice || !newStock.quantity))}
            className="flex-1 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] text-white rounded-xl px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingStock ? 'מוסיף...' : 'הוסף'}
          </button>
        </div>
      </div>
    </div>
  );
}