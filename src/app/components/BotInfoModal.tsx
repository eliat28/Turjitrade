import { X, Bot, CircleAlert } from 'lucide-react';
import { BotInfo } from '../services/telegramService';

interface BotInfoModalProps {
  onClose: () => void;
  botInfo: BotInfo | null;
  error?: string;
  userChatId: string;
}

export default function BotInfoModal({ onClose, botInfo, error, userChatId }: BotInfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-2xl max-w-md w-full border border-[#334155] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-[#06B6D4]" />
            <h2 className="text-[#F1F5F9] text-xl">🔍 פרטי הבוט</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CircleAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-500 font-medium mb-1">שגיאה בבדיקת הבוט</h3>
                  <p className="text-[#94A3B8] text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : botInfo ? (
            <>
              {/* Bot Info */}
              <div className="bg-[#0F172A] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">שם הבוט:</span>
                  <span className="text-[#F1F5F9] font-medium">{botInfo.first_name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Username:</span>
                  <span className="text-[#06B6D4] font-medium">
                    @{botInfo.username || 'לא מוגדר'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Bot ID:</span>
                  <span className="text-[#F1F5F9] font-mono text-sm">{botInfo.id}</span>
                </div>
              </div>

              {/* Your Chat ID */}
              <div className="bg-[#0F172A] rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-[#94A3B8] text-sm block mb-1">ה-Chat ID שלך:</span>
                  <span className="text-[#F97316] font-mono font-medium text-lg">{userChatId}</span>
                </div>
                {userChatId && userChatId.length < 9 && (
                  <div className="mt-3 pt-3 border-t border-[#334155]">
                    <p className="text-[#F97316] text-xs font-medium mb-2">
                      ⚠️ זה נראה כמו מספר טלפון!
                    </p>
                    <p className="text-[#94A3B8] text-xs mb-3">
                      Chat ID בטלגרם הוא בדרך כלל 9-10 ספרות. אם הזנת מספר טלפון, עליך לקבל את ה-Chat ID האמיתי מ-@userinfobot.
                    </p>
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#06B6D4] text-white px-3 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors text-xs font-medium"
                    >
                      <Bot className="w-3 h-3" />
                      <span>קבל Chat ID נכון מ-@userinfobot</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-lg p-4">
                <h3 className="text-[#06B6D4] font-medium mb-3">⚠️ כדי שההתראות יעבדו:</h3>
                <ol className="space-y-2 text-[#94A3B8] text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#06B6D4] font-bold shrink-0">1.</span>
                    <span>
                      פתח את{' '}
                      <a
                        href={`https://t.me/${botInfo.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F97316] hover:underline font-medium"
                      >
                        @{botInfo.username}
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#06B6D4] font-bold shrink-0">2.</span>
                    <span>שלח למנו <strong className="text-[#F1F5F9]">/start</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#06B6D4] font-bold shrink-0">3.</span>
                    <span>חזור לכאן ונסה שוב "בדוק התראה עכשיו"</span>
                  </li>
                </ol>
              </div>

              {/* Open Bot Button */}
              <a
                href={`https://t.me/${botInfo.username}?start=setup`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity font-medium shadow-lg"
                onClick={() => setTimeout(onClose, 500)}
              >
                <Bot className="w-5 h-5" />
                <span>פתח את @{botInfo.username}</span>
              </a>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}