import { useState, useEffect } from 'react';
import { Bell, Mail, MessageCircle, Send, Clock, CircleCheck, Bot, Check, X, Settings, CircleHelp, RefreshCw } from 'lucide-react';
import ContactSetupModal from '../ContactSetupModal';
import AlertChannelSelectionModal from '../AlertChannelSelectionModal';
import SetupGuideModal from '../SetupGuideModal';
import TelegramChatNotFoundModal from '../TelegramChatNotFoundModal';
import BotInfoModal from '../BotInfoModal';
import GetChatIdGuide from '../GetChatIdGuide';
import { isEmailConfigured, isTelegramConfigured } from '../../config/apiConfig';
import { sendEmailAlert } from '../../services/emailService';
import { sendTelegramAlert, formatTelegramBuyAlert, getBotInfo, BotInfo } from '../../services/telegramService';

interface AlertsTabProps {
  user: {
    name: string;
    email: string;
    tradingStyle: 'day' | 'long';
  };
  onOpenTurjiBot?: (context: string) => void;
}

const alertHistory = [
  {
    id: 1,
    date: '15/12/2024',
    time: '10:00',
    status: 'sent',
    channel: 'email' as 'email' | 'telegram'
  },
  {
    id: 2,
    date: '14/12/2024',
    time: '10:00',
    status: 'sent',
    channel: 'telegram' as 'email' | 'telegram'
  },
  {
    id: 3,
    date: '13/12/2024',
    time: '10:00',
    status: 'sent',
    channel: 'email' as 'email' | 'telegram'
  }
];

export default function AlertsTab({ user, onOpenTurjiBot }: AlertsTabProps) {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [channels, setChannels] = useState({
    email: true,
    whatsapp: false,
    telegram: false
  });
  const [alertTime, setAlertTime] = useState('10:00');
  const [contentType, setContentType] = useState<'daily' | 'all' | 'positions'>('daily');
  const [showContactModal, setShowContactModal] = useState<'email' | 'telegram' | null>(null);
  const [showChannelSelection, setShowChannelSelection] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState<'email' | 'telegram' | null>(null);
  const [userEmail, setUserEmail] = useState(user.email);
  const [userTelegramId, setUserTelegramId] = useState('');
  const [testingChannel, setTestingChannel] = useState<'email' | 'telegram' | 'bot-check' | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean, message: string }>({ success: false, message: '' });
  const [showGetChatIdGuide, setShowGetChatIdGuide] = useState(false);
  const [currentBotUsername, setCurrentBotUsername] = useState('TurjiTrade_Bot');
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [botInfoError, setBotInfoError] = useState('');
  const [showBotInfoModal, setShowBotInfoModal] = useState(false);

  // Load alert settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('turjiTrade_alertSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAlertsEnabled(parsed.alertsEnabled ?? true);
        setChannels(parsed.channels ?? { email: true, whatsapp: false, telegram: false });
        setAlertTime(parsed.alertTime ?? '10:00');
        setContentType(parsed.contentType ?? 'daily');
      } catch (error) {
        console.error('Failed to load alert settings:', error);
      }
    }

    // Load contact info
    const savedEmail = localStorage.getItem('turjiTrade_user_email');
    const savedTelegram = localStorage.getItem('turjiTrade_user_telegram_id');
    if (savedEmail) setUserEmail(savedEmail);
    if (savedTelegram) {
      setUserTelegramId(savedTelegram);
      // If telegram ID exists, enable telegram channel
      setChannels(prev => ({ ...prev, telegram: true }));
    }
  }, []);

  // Save alert settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      alertsEnabled,
      channels,
      alertTime,
      contentType
    };
    localStorage.setItem('turjiTrade_alertSettings', JSON.stringify(settings));
  }, [alertsEnabled, channels, alertTime, contentType]);

  const handleTestAlert = async (channel: 'email' | 'telegram') => {
    setTestingChannel(channel);
    setTestResult({ success: false, message: '' });

    // Validate before sending
    if (channel === 'telegram') {
      // Check if Chat ID looks valid
      if (!userTelegramId) {
        setTestResult({
          success: false,
          message: '❌ לא הוזן Chat ID. לחץ על "עזרה לטלגרם" להגדרת Telegram Bot.'
        });
        setTestingChannel(null);
        return;
      }

      // Check if it's a phone number (too short)
      if (userTelegramId.length < 9) {
        setTestResult({
          success: false,
          message: `❌ ה-Chat ID שהזנת (${userTelegramId}) נראה כמו מספר טלפון! צריך Chat ID מ-@userinfobot (9-10 ספרות). לחץ על "🔍 בדוק את הבוט שלך" למעלה.`
        });
        setTestingChannel(null);
        return;
      }

      // Get bot info first to show correct username
      const botInfoResult = await getBotInfo();
      if (botInfoResult.success && botInfoResult.botInfo) {
        setTestResult({
          success: false,
          message: `🔍 שולח התראה ל-@${botInfoResult.botInfo.username}... אם תקבל שגיאה, ודא ש:\n1. שלחת /start ל-@${botInfoResult.botInfo.username}\n2. ה-Chat ID (${userTelegramId}) נכון (מ-@userinfobot)`
        });
      }
    }

    try {
      console.log('Testing alerts...');
      console.log('User email:', userEmail);
      console.log('User telegram:', userTelegramId);
      console.log('Channels:', channels);
      
      if (channel === 'email') {
        if (!userEmail) {
          setTestResult({ success: false, message: '❌ לא הוזן כתובת מייל. לחץ על "הגדרת התראות" להזנת כתובת מייל.' });
          return;
        }
        console.log('Attempting to send email to:', userEmail);
        const emailSuccess = await sendEmailAlert(userEmail, 'AAPL', 150.00, 145.00, 155.00);
        if (emailSuccess) {
          setTestResult({ success: true, message: '✅ מייל נשלח' });
        } else {
          setTestResult({ success: false, message: '❌ שגיאה במייל - לחץ על "עזרה למייל"' });
          setTimeout(() => setShowSetupGuide('email'), 500);
        }
      }
      
      if (channel === 'telegram') {
        console.log('Attempting to send telegram to:', userTelegramId);
        const telegramMessage = formatTelegramBuyAlert('AAPL', 150.00, 145.00, 155.00);
        const telegramResult = await sendTelegramAlert(userTelegramId, telegramMessage);
        if (telegramResult.success) {
          setTestResult({ success: true, message: '✅ טלגרם נשלח' });
        } else {
          if (telegramResult.error === 'chat_not_found') {
            // Get bot info to show in guide
            const botInfoResult = await getBotInfo();
            if (botInfoResult.success && botInfoResult.botInfo) {
              setCurrentBotUsername(botInfoResult.botInfo.username || 'TurjiTrade_Bot');
            }
            setTestResult({ success: false, message: '❌ Chat not found - לחץ כאן לפתרון →' });
            setTimeout(() => setShowGetChatIdGuide(true), 800);
          } else {
            setTestResult({ success: false, message: `❌ שגיאה בטלגרם: ${telegramResult.error || 'לא ידוע'} - לחץ על "עזרה לטלגרם"` });
            setTimeout(() => setShowSetupGuide('telegram'), 500);
          }
        }
      }
    } catch (error) {
      console.error('Error testing alert:', error);
      setTestResult({ success: false, message: `❌ שגיאה בבדיקה: ${error}` });
    } finally {
      setTestingChannel(null);
    }
  };

  const handleCheckBotConnection = async () => {
    setTestingChannel('bot-check');
    setTestResult({ success: false, message: '' });

    // Validate before sending
    if (!userTelegramId) {
      setTestResult({
        success: false,
        message: '❌ לא הוזן Chat ID. לחץ על "עזרה לטלגרם" להגדרת Telegram Bot.'
      });
      setTestingChannel(null);
      return;
    }

    // Check if it's a phone number (too short)
    if (userTelegramId.length < 9) {
      setTestResult({
        success: false,
        message: `❌ ה-Chat ID שהזנת (${userTelegramId}) נראה כמו מספר טלפון! צריך Chat ID מ-@userinfobot (9-10 ספרות). לחץ על "🔍 בדוק את הבוט שלך" למעלה.`
      });
      setTestingChannel(null);
      return;
    }

    // Get bot info first to show correct username
    const botInfoResult = await getBotInfo();
    if (botInfoResult.success && botInfoResult.botInfo) {
      setTestResult({
        success: false,
        message: `🔍 בודק חיבור ל-@${botInfoResult.botInfo.username}... אם תקבל שגיאה, ודא ש:\n1. שלחת /start ל-@${botInfoResult.botInfo.username}\n2. ה-Chat ID (${userTelegramId}) נכון (מ-@userinfobot)`
      });
    }

    try {
      console.log('Testing bot connection...');
      console.log('User telegram:', userTelegramId);
      console.log('Channels:', channels);
      
      if (channels.telegram && userTelegramId) {
        console.log('Attempting to send telegram to:', userTelegramId);
        const telegramMessage = formatTelegramBuyAlert('AAPL', 150.00, 145.00, 155.00);
        const telegramResult = await sendTelegramAlert(userTelegramId, telegramMessage);
        if (telegramResult.success) {
          setTestResult({ success: true, message: '✅ חיבור בוט מומלץ' });
        } else {
          if (telegramResult.error === 'chat_not_found') {
            // Get bot info to show in guide
            const botInfoResult = await getBotInfo();
            if (botInfoResult.success && botInfoResult.botInfo) {
              setCurrentBotUsername(botInfoResult.botInfo.username || 'TurjiTrade_Bot');
            }
            setTestResult({ success: false, message: '❌ Chat not found - לחץ כאן לפתרון →' });
            setTimeout(() => setShowGetChatIdGuide(true), 800);
          } else {
            setTestResult({ success: false, message: '❌ שגיאה בטלגרם - לחץ על \"עזרה לטלגרם\"' });
          }
        }
      }
      
      if (!testResult.success) {
        // Show appropriate modal based on error type
        if (channels.telegram) {
          setTimeout(() => setShowSetupGuide('telegram'), 500);
        }
      }
    } catch (error) {
      console.error('Error testing bot connection:', error);
      setTestResult({ success: false, message: '❌ שגיאה בבדיקה' });
    } finally {
      setTestingChannel(null);
    }
  };

  const handleAskTurjiBot = () => {
    if (onOpenTurjiBot) {
      const activeChannels = Object.entries(channels)
        .filter(([_, enabled]) => enabled)
        .map(([channel]) => channel === 'email' ? 'מייל' : channel === 'whatsapp' ? 'ווצאפ' : 'טלגרם')
        .join(', ');
      
      const context = `אני נמצא בדף ההתראות של TurjiTrade. ההתראות ${alertsEnabled ? 'מופעלות' : 'כבויות'}. ${alertsEnabled ? `אני מקבל התראות ב: ${activeChannels}. ההתראה היומית מגיעה בשעה ${alertTime} ומכילה ${contentType === 'daily' ? 'המלצות יומיות בלבד' : contentType === 'positions' ? 'פוזיציות פעילות שלי' : 'את כל הניתוחים שלי'}. ` : ''}איך אני יכול לשפר את הגדרות ההתראות שלי?`;
      onOpenTurjiBot(context);
    }
  };

  const handleEmailClick = () => {
    if (!isEmailConfigured()) {
      // Show setup guide if not configured
      setShowSetupGuide('email');
      return;
    }
    setShowContactModal('email');
  };

  const handleTelegramClick = () => {
    if (!isTelegramConfigured()) {
      // Show setup guide if not configured
      setShowSetupGuide('telegram');
      return;
    }
    setShowContactModal('telegram');
  };

  const handleGetBotInfo = async () => {
    try {
      const info = await getBotInfo();
      setBotInfo(info);
      setShowChannelSelection(true);
    } catch (error) {
      setBotInfoError('Failed to get bot info');
      setShowBotInfoModal(true);
    }
  };

  const handleSaveEmail = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('turjiTrade_user_email', email);
  };

  const handleSaveTelegramId = (chatId: string) => {
    console.log('Saving Telegram Chat ID:', chatId);
    setUserTelegramId(chatId);
    localStorage.setItem('turjiTrade_user_telegram_id', chatId);
    // Enable telegram channel when saving chat ID
    setChannels(prev => ({ ...prev, telegram: true }));
  };

  return (
    <div className="px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#F1F5F9] text-xl sm:text-2xl">התראות</h1>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 sm:w-14 sm:h-7 bg-[#334155] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F97316]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-[#F97316]"></div>
          </label>
        </div>
      </div>

      {/* Alert Configuration Reminder */}
      {alertsEnabled && (channels.email && !userEmail || channels.telegram && !userTelegramId) && (
        <div className="mb-4 bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CircleHelp className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-[#F97316] font-medium mb-1">יש להשלים הגדרות</h3>
              <p className="text-[#94A3B8] text-sm">
                {channels.email && !userEmail && 'לחץ על "עזרה למייל" למדריך הגדרת EmailJS'}
                {channels.email && !userEmail && channels.telegram && !userTelegramId && ' | '}
                {channels.telegram && !userTelegramId && 'לחץ על "עזרה לטלגרם" למדריך הגדרת Telegram'}
              </p>
            </div>
          </div>
        </div>
      )}

      {alertsEnabled ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Alert Settings Button */}
          <button
            onClick={() => setShowChannelSelection(true)}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">הגדרת התראות</span>
          </button>

          {/* Test Buttons */}
          <div className="space-y-2">
            <h2 className="text-[#F1F5F9] mb-2 text-base sm:text-lg">בדוק התראות:</h2>
            <button
              onClick={() => handleTestAlert('email')}
              disabled={testingChannel === 'email'}
              className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <Mail className="w-5 h-5" />
              <span>{testingChannel === 'email' ? 'שולח מייל...' : 'בדוק התראת מייל'}</span>
            </button>
            <button
              onClick={() => handleTestAlert('telegram')}
              disabled={testingChannel === 'telegram'}
              className="w-full bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9] text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{testingChannel === 'telegram' ? 'שולח טלגרם...' : 'בדוק התראת טלגרם'}</span>
            </button>
            {testResult.message && (
              <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                <p className="text-sm whitespace-pre-line">{testResult.message}</p>
              </div>
            )}
          </div>

          {/* Alert Time */}
          <div className="bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-[#334155]">
            <h2 className="text-[#F1F5F9] mb-4 text-base sm:text-lg">שעת ההתראה היומית:</h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="time"
                value={alertTime}
                onChange={(e) => setAlertTime(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] text-[#F1F5F9] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] text-base"
                style={{ fontFamily: 'Roboto Mono, monospace' }}
              />
            </div>
          </div>

          {/* Content Type */}
          <div className="bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-[#334155]">
            <h2 className="text-[#F1F5F9] mb-4 text-base sm:text-lg">תוכן ההתראה:</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#0F172A] p-1.5 rounded-xl">
              <button
                onClick={() => setContentType('daily')}
                className={`w-full py-2.5 px-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                  contentType === 'daily'
                    ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5'
                }`}
              >
                המלצות יומיות
              </button>
              <button
                onClick={() => setContentType('positions')}
                className={`w-full py-2.5 px-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                  contentType === 'positions'
                    ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5'
                }`}
              >
                פוזיציות פעילות שלי
              </button>
              <button
                onClick={() => setContentType('all')}
                className={`w-full py-2.5 px-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                  contentType === 'all'
                    ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5'
                }`}
              >
                כל הניתוחים
              </button>
            </div>
          </div>

          {/* Alert History */}
          <div className="bg-[#1E293B] rounded-xl p-4 sm:p-5 border border-[#334155]">
            <h2 className="text-[#F1F5F9] mb-4 text-base sm:text-lg">היסטוריית התראות</h2>
            
            <div className="space-y-2 sm:space-y-3">
              {alertHistory.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-2 sm:gap-3 p-3 bg-[#0F172A] rounded-lg border border-[#334155]"
                >
                  <CircleCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F1F5F9] text-sm sm:text-base">התראה נשלחה</div>
                    <div className="text-[#94A3B8] text-xs sm:text-sm">
                      {alert.date} {alert.time}
                    </div>
                  </div>
                  {alert.channel === 'email' ? <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#F97316] shrink-0" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5 text-[#06B6D4] shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16">
          <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-[#334155] mb-4" />
          <h3 className="text-[#F1F5F9] text-lg sm:text-xl mb-2">התראות מכובות</h3>
          <p className="text-[#94A3B8] text-center text-sm sm:text-base">
            הפעל את ההתראות כדי לקבל עדכונים יומיים
          </p>
        </div>
      )}

      {/* Contact Setup Modal */}
      {showContactModal && (
        <ContactSetupModal
          channel={showContactModal}
          onClose={() => setShowContactModal(null)}
          onSave={showContactModal === 'email' ? handleSaveEmail : handleSaveTelegramId}
          currentValue={showContactModal === 'email' ? userEmail : userTelegramId}
        />
      )}

      {/* Alert Channel Selection Modal */}
      {showChannelSelection && (
        <AlertChannelSelectionModal
          onClose={() => setShowChannelSelection(false)}
          onSelectEmail={handleEmailClick}
          onSelectTelegram={handleTelegramClick}
          onSaveEmail={(email) => {
            setUserEmail(email);
            localStorage.setItem('turjiTrade_user_email', email);
          }}
          onSaveTelegram={(chatId) => {
            setUserTelegramId(chatId);
            localStorage.setItem('turjiTrade_user_telegram_id', chatId);
          }}
          userEmail={userEmail}
          userTelegramId={userTelegramId}
        />
      )}

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <SetupGuideModal
          channel={showSetupGuide}
          onClose={() => setShowSetupGuide(null)}
        />
      )}

      {/* Get Chat ID Guide */}
      {showGetChatIdGuide && (
        <GetChatIdGuide
          onClose={() => setShowGetChatIdGuide(false)}
          botUsername={currentBotUsername}
          currentChatId={userTelegramId}
          onUpdateChatId={handleSaveTelegramId}
        />
      )}

      {/* Telegram Chat Not Found Modal */}
      {testResult.message.includes('Chat not found') && (
        <TelegramChatNotFoundModal
          onClose={() => setTestResult({ success: false, message: '' })}
          botUsername={currentBotUsername}
          currentChatId={userTelegramId}
          onUpdateChatId={handleSaveTelegramId}
        />
      )}

      {/* Bot Info Modal */}
      {botInfoError && (
        <BotInfoModal
          onClose={() => setBotInfoError('')}
          error={botInfoError}
        />
      )}
    </div>
  );
}