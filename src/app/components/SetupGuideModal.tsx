import { X, Mail, Send, CircleAlert, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface SetupGuideModalProps {
  channel: 'email' | 'telegram';
  onClose: () => void;
}

export default function SetupGuideModal({ channel, onClose }: SetupGuideModalProps) {
  const [copied, setCopied] = useState('');

  const copyText = (text: string, label: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(label);
          setTimeout(() => setCopied(''), 2000);
        })
        .catch(() => {
          // Fallback to older method
          fallbackCopy(text, label);
        });
    } else {
      // Use fallback for browsers that don't support clipboard API
      fallbackCopy(text, label);
    }
  };

  const fallbackCopy = (text: string, label: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show the text in an alert as last resort
      alert(`העתק את הטקסט הזה:\n\n${text}`);
    }
    
    document.body.removeChild(textArea);
  };

  const type = channel; // For backwards compatibility

  const emailGuide = (
    <div className="space-y-6">
      {/* Warning */}
      <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CircleAlert className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[#F97316] font-medium mb-2">שגיאה: כתובת הנמען ריקה</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              EmailJS דורש הגדרה מיוחדת ב-Template. יש להגדיר את שדה ה-"To Email" ב-Template Settings.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h3 className="text-[#F1F5F9] font-medium">פתח את ה-Template ב-EmailJS</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mb-3 mr-8">
          לך ל-EmailJS Dashboard ופתח את ה-Template שלך:
        </p>
        <button
          onClick={() => copyText('template_mf55m0s', 'template')}
          className="mr-8 w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 flex items-center justify-between hover:bg-[#334155] transition-colors group"
        >
          <span className="text-[#F1F5F9] text-xs" dir="ltr">template_mf55m0s</span>
          {copied === 'template' ? (
            <Check className="w-4 h-4 text-[#10B981]" />
          ) : (
            <Copy className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F97316]" />
          )}
        </button>
        <a
          href="https://dashboard.emailjs.com/admin/templates"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 mr-8 flex items-center gap-2 text-[#06B6D4] text-sm hover:text-[#0EA5E9] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>פתח EmailJS Dashboard</span>
        </a>
      </div>

      {/* Step 2 */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center text-sm font-bold">
            2
          </div>
          <h3 className="text-[#F1F5F9] font-medium">הגדר את "To Email"</h3>
        </div>
        <div className="mr-8 space-y-3">
          <p className="text-[#94A3B8] text-sm">
            בחלק העליון של עמוד ה-Template, תמצא שדה בשם <span className="text-[#F97316] font-medium">"To email"</span>
          </p>
          <p className="text-[#94A3B8] text-sm">
            הזן בו את המשתנה הזה:
          </p>
          <button
            onClick={() => copyText('{{to_email}}', 'to_email')}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 flex items-center justify-between hover:bg-[#334155] transition-colors group"
          >
            <span className="text-[#F1F5F9] text-xs" dir="ltr">{'{{to_email}}'}</span>
            {copied === 'to_email' ? (
              <Check className="w-4 h-4 text-[#10B981]" />
            ) : (
              <Copy className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F97316]" />
            )}
          </button>
          <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-lg p-3 mt-3">
            <p className="text-[#06B6D4] text-xs leading-relaxed">
              💡 <strong>טיפ:</strong> זה אומר ל-EmailJS לקחת את כתובת המייל מה-params שאנחנו שולחים מהאפליקציה
            </p>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center text-sm font-bold">
            3
          </div>
          <h3 className="text-[#F1F5F9] font-medium">שמור את ה-Template</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mr-8">
          לחץ על כפתור "Save" בחלק העליון של העמוד
        </p>
      </div>

      {/* Step 4 */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-bold">
            ✓
          </div>
          <h3 className="text-[#F1F5F9] font-medium">סיימת!</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mr-8">
          חזור ל-TurjiTrade ונסה שוב לשלוח התראה
        </p>
      </div>
    </div>
  );

  const telegramGuide = (
    <div className="space-y-6">
      {/* Warning */}
      <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CircleAlert className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[#F97316] font-medium mb-2">שגיאה: Chat not found</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              הבוט לא יכול למצוא את הצ'אט שלך. צריך לקבל את ה-Chat ID ולהפעיל את הבוט.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#06B6D4] text-white flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h3 className="text-[#F1F5F9] font-medium">הפעל את TurjiBot שלך</h3>
        </div>
        <div className="mr-8 space-y-3">
          <p className="text-[#94A3B8] text-sm">
            <strong className="text-[#F97316]">חשוב מאוד:</strong> לפני הכל, שלח /start לבוט של TurjiTrade
          </p>
          <a
            href="https://t.me/TurjiTrade_Bot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity font-medium"
          >
            <Send className="w-5 h-5" />
            <span>פתח את TurjiBot בטלגרם</span>
          </a>
          <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg p-3">
            <p className="text-[#F97316] text-xs leading-relaxed">
              ⚠️ לחץ על הכפתור למעלה, ואז שלח לבוט <span className="font-bold" dir="ltr">/start</span>
            </p>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#06B6D4] text-white flex items-center justify-center text-sm font-bold">
            2
          </div>
          <h3 className="text-[#F1F5F9] font-medium">קבל את ה-Chat ID שלך</h3>
        </div>
        <div className="mr-8 space-y-3">
          <p className="text-[#94A3B8] text-sm">
            עכשיו פתח את הבוט @userinfobot:
          </p>
          <button
            onClick={() => copyText('@userinfobot', 'userinfo')}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 flex items-center justify-between hover:bg-[#334155] transition-colors group"
          >
            <span className="text-[#F1F5F9] text-xs" dir="ltr">@userinfobot</span>
            {copied === 'userinfo' ? (
              <Check className="w-4 h-4 text-[#10B981]" />
            ) : (
              <Copy className="w-4 h-4 text-[#94A3B8] group-hover:text-[#06B6D4]" />
            )}
          </button>
          <a
            href="https://t.me/userinfobot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#06B6D4] text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 hover:bg-[#0EA5E9] transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>פתח @userinfobot בטלגרם</span>
          </a>
          <p className="text-[#94A3B8] text-sm mt-3">
            שלח לו <span className="text-[#06B6D4] font-medium" dir="ltr">/start</span> והוא ייתן לך מספר - זה ה-Chat ID שלך
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#06B6D4] text-white flex items-center justify-center text-sm font-bold">
            3
          </div>
          <h3 className="text-[#F1F5F9] font-medium">הזן את ה-Chat ID</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mr-8">
          חזור ל-TurjiTrade והזן את ה-Chat ID שקיבלת מ-@userinfobot (לדוגמה: 608024760)
        </p>
      </div>

      {/* Step 4 */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-bold">
            ✓
          </div>
          <h3 className="text-[#F1F5F9] font-medium">בדוק שהכל עובד</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mr-8">
          לחץ על "בדוק התראה עכשיו" ותקבל הודעה בטלגרם!
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#1E293B] rounded-2xl w-full max-w-2xl border border-[#334155] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-[#334155] sticky top-0 bg-[#1E293B] z-10">
          <div className="flex items-center gap-3">
            {type === 'email' ? (
              <Mail className="w-6 h-6 text-[#F97316]" />
            ) : (
              <Send className="w-6 h-6 text-[#06B6D4]" />
            )}
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl font-medium">
              {type === 'email' ? 'מדריך הגדרת EmailJS' : 'מדריך הגדרת Telegram Bot'}
            </h2>
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
          {type === 'email' ? emailGuide : telegramGuide}
        </div>

        {/* Footer */}
        <div className="border-t border-[#334155] p-5 sm:p-6 bg-[#0F172A]/50">
          <button
            onClick={onClose}
            className="w-full bg-[#F97316] text-white rounded-lg py-3 px-4 hover:bg-[#EA580C] transition-colors active:scale-95 font-medium"
          >
            הבנתי, תודה!
          </button>
        </div>
      </div>
    </div>
  );
}