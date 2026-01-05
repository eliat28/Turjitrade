import { X, Mail, Send, Check, Copy, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TelegramLoginButton, { TelegramUser } from './TelegramLoginButton';

interface ContactSetupModalProps {
  channel: 'email' | 'telegram';
  onClose: () => void;
  onSave: (value: string) => void;
  currentValue?: string;
}

export default function ContactSetupModal({ channel, onClose, onSave, currentValue }: ContactSetupModalProps) {
  const [value, setValue] = useState(currentValue || '');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [useAutoLogin, setUseAutoLogin] = useState(false);

  useEffect(() => {
    setValue(currentValue || '');
  }, [currentValue]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateTelegramPhone = (chatId: string) => {
    // Telegram Chat ID validation - can be positive or negative number
    return /^-?\d{6,15}$/.test(chatId.trim());
  };

  const handleSave = () => {
    if (!value.trim()) {
      setError(channel === 'email' ? 'נא להזין כתובת מייל' : 'נא להזין Chat ID');
      return;
    }

    if (channel === 'email' && !validateEmail(value)) {
      setError('כתובת מייל לא תקינה');
      return;
    }

    if (channel === 'telegram' && !validateTelegramPhone(value)) {
      setError('Chat ID לא תקין - צריך להיות מספר של 6-15 ספרות');
      return;
    }

    onSave(value);
    onClose();
  };

  const handleTelegramAuth = (user: TelegramUser) => {
    console.log('Telegram user authenticated:', user);
    // Save the user ID as Chat ID
    const chatId = user.id.toString();
    setValue(chatId);
    setError('');
    // Show success message
    toast.success('התחברת בהצלחה!', {
      style: { direction: 'rtl', fontFamily: 'inherit' }
    });
  };

  const copyBotUsername = () => {
    navigator.clipboard.writeText('@userinfobot');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getChannelInfo = () => {
    if (channel === 'email') {
      return {
        title: 'הגדרת התראות מייל',
        icon: <Mail className="w-6 h-6 text-[#06B6D4]" />,
        placeholder: 'your@email.com',
        description: 'הזן את כתובת המייל שלך לקבלת התראות קנייה',
        label: 'כתובת מייל',
        steps: [
          'הזן את כתובת המייל בה תרצה לקבל התראות',
          'וודא שהמייל תקין ונגיש',
          'ההתראות יישלחו אוטומטית כשמניה נכנסת לטווח המחיר שהגדרת'
        ]
      };
    } else {
      return {
        title: 'הגדרת TurjiBot בטלגרם',
        icon: <Send className="w-6 h-6 text-[#06B6D4]" />,
        placeholder: '608024760',
        description: '⚠️ שים לב: צריך Chat ID מ-@userinfobot, לא מספר טלפון!',
        label: 'Telegram Chat ID (לא מספר טלפון!)',
        steps: [
          '🔥 שלב 1 (חובה!): שלח /start לבוט של TurjiTrade',
          'שלב 2: פתח את @userinfobot',
          'שלב 3: שלח /start ל-@userinfobot',
          'שלב 4: תקבל מספר (זה ה-Chat ID שלך)',
          'שלב 5: העתק את המספר והדבק כאן (רק ספרות)',
          '✅ שלב 6: שמור ולחץ \"בדוק התראה עכשיו\"'
        ]
      };
    }
  };

  const info = getChannelInfo();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#1E293B] rounded-2xl w-full max-w-md border border-[#334155] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-[#334155] sticky top-0 bg-[#1E293B] z-10">
          <div className="flex items-center gap-3">
            {info.icon}
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl">{info.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#334155] transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {channel === 'telegram' ? (
            /* Telegram Quick Connect */
            <div className="text-center">
              <p className="text-[#94A3B8] text-sm sm:text-base mb-6">
                התחבר לטלגרם בקליק אחד וקבל את ה-Chat ID אוטומטית
              </p>

              {/* Telegram Login Button */}
              <div className="mb-6 flex justify-center">
                <TelegramLoginButton 
                  botUsername="turji_trade_bot"
                  onAuth={handleTelegramAuth}
                />
              </div>

              {/* Manual Chat ID Input */}
              <div className="mb-4">
                <label className="block text-[#F1F5F9] text-sm mb-2">
                  {info.label}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError('');
                  }}
                  placeholder={info.placeholder}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors"
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                />
                {error && (
                  <p className="text-[#EF4444] text-xs mt-2">{error}</p>
                )}
              </div>

              {/* Info Note */}
              <div className="bg-gradient-to-r from-[#F97316]/10 to-[#06B6D4]/10 border border-[#F97316]/30 rounded-lg p-4 mb-6">
                <p className="text-[#94A3B8] text-xs leading-relaxed">
                  💡 <span className="text-[#F97316] font-medium">טיפ:</span> לחץ על הכפתור למעלה, אשר בטלגרם, והמערכת תקבל אוטומטית את ה-Chat ID שלך. או הזן ידנית את ה-Chat ID מ-@userinfobot
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#334155] text-[#F1F5F9] rounded-lg py-3 px-4 hover:bg-[#475569] transition-colors active:scale-95 text-sm"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-[#F97316] text-white rounded-lg py-3 px-4 hover:bg-[#EA580C] transition-colors active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <Check className="w-5 h-5" />
                  <span>שמור</span>
                </button>
              </div>
            </div>
          ) : (
            /* Email Setup */
            <>
              <p className="text-[#94A3B8] text-sm sm:text-base mb-4">
                {info.description}
              </p>

              {/* Input */}
              <div className="mb-4">
                <label className="block text-[#F1F5F9] text-sm mb-2">
                  {info.label}
                </label>
                <input
                  type="email"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError('');
                  }}
                  placeholder={info.placeholder}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors"
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                />
                {error && (
                  <p className="text-[#EF4444] text-xs mt-2">{error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#334155] text-[#F1F5F9] rounded-lg py-3 px-4 hover:bg-[#475569] transition-colors active:scale-95 text-sm"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-[#F97316] text-white rounded-lg py-3 px-4 hover:bg-[#EA580C] transition-colors active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <Check className="w-5 h-5" />
                  <span>שמור</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}