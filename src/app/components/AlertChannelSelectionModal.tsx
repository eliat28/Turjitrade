import { X, Mail, Send, Settings } from 'lucide-react';
import { useState } from 'react';
import ContactSetupModal from './ContactSetupModal';

interface AlertChannelSelectionModalProps {
  onClose: () => void;
  onSelectEmail: () => void;
  onSelectTelegram: () => void;
  onSaveEmail: (email: string) => void;
  onSaveTelegram: (chatId: string) => void;
  userEmail?: string;
  userTelegramId?: string;
}

export default function AlertChannelSelectionModal({ 
  onClose, 
  onSelectEmail, 
  onSelectTelegram,
  onSaveEmail,
  onSaveTelegram,
  userEmail,
  userTelegramId
}: AlertChannelSelectionModalProps) {
  const [setupChannel, setSetupChannel] = useState<'email' | 'telegram' | null>(null);
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#1E293B] rounded-2xl w-full max-w-md border border-[#334155] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#F97316]" />
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl">הגדרת התראות</h2>
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
          <p className="text-[#94A3B8] text-sm sm:text-base mb-6">
            בחר את ערוץ ההתראות המועדף עליך:
          </p>

          {/* Email Option */}
          <button
            onClick={() => setSetupChannel('email')}
            className="w-full mb-4 bg-[#0F172A] border border-[#334155] rounded-xl p-4 hover:border-[#06B6D4] hover:bg-[#0F172A]/80 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#06B6D4]/10 flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-colors">
                <Mail className="w-6 h-6 text-[#06B6D4]" />
              </div>
              <div className="flex-1 text-right">
                <div className="text-[#F1F5F9] text-base font-medium mb-1">התראות במייל</div>
                <div className="text-[#94A3B8] text-sm">
                  {userEmail || 'הזן כתובת מייל'}
                </div>
              </div>
              <div className="text-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity">
                ←
              </div>
            </div>
          </button>

          {/* Telegram Option */}
          <button
            onClick={() => setSetupChannel('telegram')}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-4 hover:border-[#06B6D4] hover:bg-[#0F172A]/80 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#06B6D4]/10 flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-colors">
                <Send className="w-6 h-6 text-[#06B6D4]" />
              </div>
              <div className="flex-1 text-right">
                <div className="text-[#F1F5F9] text-base font-medium mb-1">TurjiBot בטלגרם</div>
                <div className="text-[#94A3B8] text-sm">
                  {userTelegramId || 'חבר אוטומטית בקליק'}
                </div>
              </div>
              <div className="text-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity">
                ←
              </div>
            </div>
          </button>

          {/* Info Note */}
          <div className="mt-6 bg-gradient-to-r from-[#F97316]/10 to-[#06B6D4]/10 border border-[#F97316]/30 rounded-lg p-4">
            <p className="text-[#94A3B8] text-xs leading-relaxed">
              💡 <span className="text-[#F97316] font-medium">טיפ:</span> תוכל להפעיל שני הערוצים יחד לקבלת התראות מיידיות
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-[#334155] text-[#F1F5F9] rounded-lg py-3 px-4 hover:bg-[#475569] transition-colors active:scale-95 text-sm"
          >
            סגור
          </button>
        </div>
      </div>

      {/* Contact Setup Modal */}
      {setupChannel && (
        <ContactSetupModal
          channel={setupChannel}
          onClose={() => setSetupChannel(null)}
          onSave={(value) => {
            if (setupChannel === 'email') {
              onSaveEmail(value);
              onSelectEmail();
            } else {
              onSaveTelegram(value);
              onSelectTelegram();
            }
            setSetupChannel(null);
            onClose();
          }}
          currentValue={setupChannel === 'email' ? userEmail : userTelegramId}
        />
      )}
    </div>
  );
}