import { X, BellRing, Mail, MessageCircle, Send, Check, CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sendEmailAlert } from '../services/emailService';
import { sendTelegramAlert, formatTelegramBuyAlert } from '../services/telegramService';

interface BuyAlertNotificationProps {
  symbol: string;
  price: number;
  priceMin: number;
  priceMax: number;
  channels: {
    email: boolean;
    whatsapp: boolean;
    telegram: boolean;
  };
  onDismiss: () => void;
}

export default function BuyAlertNotification({
  symbol,
  price,
  priceMin,
  priceMax,
  channels,
  onDismiss
}: BuyAlertNotificationProps) {
  const [sendingStatus, setSendingStatus] = useState<'sending' | 'success' | 'error'>('sending');
  const [statusMessage, setStatusMessage] = useState('');
  
  const activeChannels = [];
  if (channels.email) activeChannels.push({ name: 'מייל', icon: Mail });
  if (channels.whatsapp) activeChannels.push({ name: 'ווצאפ', icon: MessageCircle });
  if (channels.telegram) activeChannels.push({ name: 'טלגרם', icon: Send });

  // Send alerts on mount
  useEffect(() => {
    const sendAlerts = async () => {
      const userEmail = localStorage.getItem('turjiTrade_user_email');
      const userTelegramId = localStorage.getItem('turjiTrade_user_telegram_id');

      let emailSuccess = false;
      let telegramSuccess = false;
      const results: string[] = [];

      if (channels.email && userEmail) {
        console.log('Sending email alert to:', userEmail);
        emailSuccess = await sendEmailAlert(userEmail, symbol, price, priceMin, priceMax);
        if (emailSuccess) {
          results.push('✅ מייל נשלח');
          console.log('Email sent successfully');
        } else {
          results.push('❌ שגיאה במייל');
          console.log('Email failed');
        }
      }
      
      if (channels.telegram && userTelegramId) {
        console.log('Sending telegram alert to:', userTelegramId);
        const telegramMessage = formatTelegramBuyAlert(symbol, price, priceMin, priceMax);
        const telegramResult = await sendTelegramAlert(userTelegramId, telegramMessage);
        telegramSuccess = telegramResult.success;
        if (telegramSuccess) {
          results.push('✅ טלגרם נשלח');
          console.log('Telegram sent successfully');
        } else {
          results.push(`❌ שגיאה בטלגרם: ${telegramResult.errorMessage || 'לא ידוע'}`);
          console.log('Telegram failed:', telegramResult.errorMessage);
        }
      }

      // Update status
      if ((channels.email && !emailSuccess) || (channels.telegram && !telegramSuccess)) {
        setSendingStatus('error');
        setStatusMessage(results.join(' | '));
      } else {
        setSendingStatus('success');
        setStatusMessage(results.join(' | '));
      }
    };

    sendAlerts();
  }, []);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-slide-down">
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-4 shadow-2xl border border-[#10B981]/50">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <BellRing className="w-6 h-6 text-white animate-pulse" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white text-lg mb-1">🎯 זמן מעולה לקנות!</h3>
            <p className="text-white/90 text-sm mb-2">
              המניה <span className="font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>{symbol}</span> נמצאת בטווח המחיר המבוקש שלך
            </p>
            
            <div className="bg-white/20 rounded-lg p-2 mb-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-white/70">מחיר נוכחי</div>
                  <div className="text-white font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    ${price.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-white/70">מינימום</div>
                  <div className="text-white" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    ${priceMin.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-white/70">מקסימום</div>
                  <div className="text-white" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    ${priceMax.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/90 text-xs">
                <span>ערוצים:</span>
                {activeChannels.map((channel, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-white/20 rounded px-2 py-1">
                    <channel.icon className="w-3 h-3" />
                    <span>{channel.name}</span>
                  </div>
                ))}
              </div>
              
              {/* Status Message */}
              {statusMessage && (
                <div className={`flex items-center gap-2 text-xs ${
                  sendingStatus === 'error' ? 'text-red-200' : 'text-white'
                }`}>
                  {sendingStatus === 'success' ? (
                    <Check className="w-3 h-3" />
                  ) : sendingStatus === 'error' ? (
                    <CircleAlert className="w-3 h-3" />
                  ) : null}
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}