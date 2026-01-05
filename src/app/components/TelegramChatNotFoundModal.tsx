import { X, Send, TriangleAlert } from 'lucide-react';

interface TelegramChatNotFoundModalProps {
  onClose: () => void;
  chatId: string;
}

export default function TelegramChatNotFoundModal({ onClose, chatId }: TelegramChatNotFoundModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-2xl max-w-md w-full border border-[#334155] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F97316]/20 flex items-center justify-center">
              <TriangleAlert className="w-5 h-5 text-[#F97316]" />
            </div>
            <h2 className="text-[#F1F5F9] text-lg font-medium">שגיאה בטלגרם</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center hover:bg-[#334155] transition-colors"
          >
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg p-4">
            <p className="text-[#F97316] text-sm leading-relaxed">
              <strong>Chat not found</strong> - הבוט לא יכול למצוא את הצ'אט שלך
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
            <h3 className="text-[#F1F5F9] font-medium mb-2">למה זה קורה?</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              קיבלת את ה-Chat ID <span className="text-[#06B6D4] font-medium" dir="ltr">({chatId})</span> מ-@userinfobot, 
              אבל <strong className="text-[#F97316]">לא שלחת /start לבוט של TurjiTrade</strong>.
            </p>
          </div>

          {/* Solution - Big Orange Button */}
          <div className="space-y-3">
            <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-lg p-3">
              <p className="text-[#06B6D4] text-xs leading-relaxed">
                💡 <strong>הפתרון:</strong> לחץ על הכפתור למטה ושלח /start לבוט
              </p>
            </div>

            <a
              href="https://t.me/TurjiTrade_Bot?start=setup"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity font-medium shadow-lg hover:shadow-xl active:scale-[0.98]"
              onClick={() => {
                setTimeout(onClose, 500);
              }}
            >
              <Send className="w-6 h-6" />
              <div className="text-right">
                <div className="text-base">פתח את @TurjiTrade_Bot</div>
                <div className="text-xs opacity-90">ושלח /start</div>
              </div>
            </a>
          </div>

          {/* Steps */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 space-y-2">
            <h3 className="text-[#F1F5F9] font-medium mb-3">מה קורה אחרי שתלחץ?</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#06B6D4] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-[#94A3B8] text-sm">
                  טלגרם יפתח את הבוט <span className="text-[#06B6D4]">@TurjiTrade_Bot</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#06B6D4] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-[#94A3B8] text-sm">
                  תראה כפתור <strong className="text-[#F1F5F9]">START</strong> - לחץ עליו
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <p className="text-[#94A3B8] text-sm">
                  חזור ל-TurjiTrade ונסה שוב "בדוק התראה עכשיו"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#334155] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#0F172A] text-[#94A3B8] py-3 rounded-xl hover:bg-[#334155] transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}