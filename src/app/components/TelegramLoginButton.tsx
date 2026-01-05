import { useState, useEffect } from 'react';
import { Send, CircleAlert, Check, ExternalLink, Copy, CheckCheck, CircleHelp } from 'lucide-react';

interface TelegramLoginButtonProps {
  botUsername: string;
  onAuth: (user: TelegramUser) => void;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const STORAGE_KEY = 'turjiTrade_telegram_chatId';

export default function TelegramLoginButton({ botUsername, onAuth }: TelegramLoginButtonProps) {
  const [chatId, setChatId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Load saved Chat ID from localStorage on mount
  useEffect(() => {
    const savedChatId = localStorage.getItem(STORAGE_KEY);
    if (savedChatId) {
      setChatId(savedChatId);
      // Auto-connect if we have saved Chat ID
      const mockUser: TelegramUser = {
        id: parseInt(savedChatId),
        first_name: 'Telegram User',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'manual'
      };
      setIsConnected(true);
      onAuth(mockUser);
    }
  }, [onAuth]);

  const handleChatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setChatId(value);
  };

  const handleConnect = () => {
    if (!chatId || chatId.length === 0) {
      return;
    }

    // Validate chat ID (should be a number)
    if (!/^\d+$/.test(chatId)) {
      alert('Chat ID חייב להיות מספר בלבד');
      return;
    }

    console.log('✅ Connecting with Chat ID:', chatId);

    // Save Chat ID to localStorage
    localStorage.setItem(STORAGE_KEY, chatId);

    // Create mock user and authenticate
    const mockUser: TelegramUser = {
      id: parseInt(chatId),
      first_name: 'Telegram User',
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'manual'
    };

    setIsConnected(true);
    onAuth(mockUser);
  };

  const openUserInfoBot = () => {
    window.open('https://t.me/userinfobot', '_blank');
    setShowGuide(true);
  };

  const openBot = () => {
    window.open('https://t.me/TurjiTrade_Bot', '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Success message */}
      {isConnected && (
        <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3 flex items-start gap-2">
          <Check className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <p className="text-green-200 text-sm font-medium">התחברות הצליחה! ✅</p>
            <p className="text-green-300/80 text-xs mt-1">Chat ID: {chatId}</p>
          </div>
        </div>
      )}

      {/* Help Button - Instructions */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="w-full bg-[#F97316]/10 hover:bg-[#F97316]/20 border border-[#F97316]/30 text-[#F97316] font-medium rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <CircleHelp className="w-4 h-4" />
        <span>❓ איך להשיג את ה-Chat ID?</span>
      </button>

      {/* Guide Box - Instructions - below help button */}
      {showGuide && (
        <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[#F1F5F9] font-medium">📋 הוראות שלב אחר שלב:</p>
            <button
              onClick={() => setShowGuide(false)}
              className="text-[#64748B] hover:text-[#F97316] transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-[#94A3B8] text-sm leading-relaxed">
            <div className="flex gap-2">
              <span className="text-[#F97316] font-bold shrink-0">1.</span>
              <div>
                <p>היכנס ל-<span className="text-[#06B6D4] font-medium">@userinfobot</span> בטלגרם</p>
                <p className="text-xs text-[#64748B] mt-1">(הבוט נפתח באפליקציית הטלגרם שלך)</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="text-[#F97316] font-bold shrink-0">2.</span>
              <div>
                <p>לחץ על כפתור <span className="text-white font-medium">START</span> או שלח <span className="text-white font-medium">/start</span></p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="text-[#F97316] font-bold shrink-0">3.</span>
              <div>
                <p>הבוט ישלח לך הודעה עם ה-<span className="text-white font-medium">Chat ID</span> שלך</p>
                <div className="bg-[#1E293B] border border-[#475569] rounded px-2 py-1 mt-2 font-mono text-[#06B6D4] text-xs">
                  Id: 123456789
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="text-[#F97316] font-bold shrink-0">4.</span>
              <div>
                <p><span className="text-white font-medium">לחץ ארוכות</span> על המספר כדי להעתיק אותו</p>
                <p className="text-xs text-[#64748B] mt-1">(או סמן אותו והעתק)</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="text-[#F97316] font-bold shrink-0">5.</span>
              <div>
                <p>חזור לכאן ו<span className="text-white font-medium">הדבק</span> את המספר בשדה למטה</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="text-[#F97316] font-bold shrink-0">6.</span>
              <div>
                <p>לחץ על <span className="text-white font-medium">\"שמור Chat ID\"</span> וזהו! 🎉</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#334155]">
            <p className="text-[#64748B] text-xs text-center">
              💡 <span className="text-[#94A3B8]">ה-Chat ID נראה כמו מספר ארוך, למשל:</span> <span className="text-[#06B6D4] font-mono">987654321</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
