import { X, Send, CheckCircle, Copy, ExternalLink, CircleAlert } from 'lucide-react';
import { useState } from 'react';

interface GetChatIdGuideProps {
  onClose: () => void;
  botUsername: string;
  currentChatId: string;
  onUpdateChatId: (newChatId: string) => void;
}

export default function GetChatIdGuide({ onClose, botUsername, currentChatId, onUpdateChatId }: GetChatIdGuideProps) {
  const [step, setStep] = useState(1);
  const [newChatId, setNewChatId] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (newChatId.trim() && newChatId.length >= 9) {
      onUpdateChatId(newChatId.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-2xl max-w-lg w-full border border-[#334155] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#334155] sticky top-0 bg-[#1E293B] z-10">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-[#F97316]" />
            <h2 className="text-[#F1F5F9] text-xl">📋 מדריך קבלת Chat ID</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Problem */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-500 font-medium mb-2">הבעיה שלך:</h3>
                <p className="text-[#94A3B8] text-sm mb-2">
                  שלחת /start לבוט, אבל עדיין מקבל "Chat not found".
                </p>
                <p className="text-[#F1F5F9] text-sm font-medium">
                  ⚠️ הסיבה: ה-Chat ID שהזנת ({currentChatId}) לא נכון!
                </p>
              </div>
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                    step >= s
                      ? 'bg-[#F97316] text-white'
                      : 'bg-[#334155] text-[#94A3B8]'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      step > s ? 'bg-[#F97316]' : 'bg-[#334155]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Send /start to your bot */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-[#F1F5F9] text-lg font-medium">
                שלב 1: שלח /start לבוט שלך
              </h3>
              <div className="bg-[#0F172A] rounded-lg p-4 space-y-3">
                <p className="text-[#94A3B8] text-sm">
                  לחץ על הכפתור הזה כדי לפתוח את הבוט הנכון:
                </p>
                <a
                  href={`https://t.me/${botUsername}?start=setup`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity font-medium shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  <span>פתח @{botUsername}</span>
                </a>
                <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-lg p-3">
                  <p className="text-[#06B6D4] text-sm font-medium mb-1">
                    ✅ מה לעשות אחרי שנפתח:
                  </p>
                  <p className="text-[#94A3B8] text-xs">
                    לחץ על כפתור <strong className="text-[#F1F5F9]">"START"</strong> או שלח{' '}
                    <strong className="text-[#F1F5F9]">/start</strong> ידנית
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-[#F97316] text-white rounded-xl py-3 hover:bg-[#EA580C] transition-colors flex items-center justify-center gap-2"
              >
                <span>שלחתי /start ✓</span>
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Open @userinfobot */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-[#F1F5F9] text-lg font-medium">
                שלב 2: קבל את ה-Chat ID שלך
              </h3>
              <div className="bg-[#0F172A] rounded-lg p-4 space-y-3">
                <p className="text-[#94A3B8] text-sm">
                  עכשיו תפתח בוט מיוחד ששולח לך את ה-Chat ID שלך:
                </p>
                <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg p-3">
                  <p className="text-[#F97316] text-sm font-medium mb-2">
                    💡 מה זה Chat ID?
                  </p>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">
                    זה מספר ייחודי שטלגרם נותן לך (כמו מספר זהות). זה <strong className="text-[#F1F5F9]">לא</strong> מספר הטלפון שלך!
                    <br />
                    <br />
                    דוגמה: <span className="text-[#10B981] font-mono">608024760</span> (בדרך כלל 9-10 ספרות)
                  </p>
                </div>
                <a
                  href="https://t.me/userinfobot?start=get"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9] text-white rounded-xl px-6 py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity font-medium shadow-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>פתח @userinfobot</span>
                </a>
                <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-3">
                  <p className="text-[#10B981] text-sm font-medium mb-2">
                    ✅ מה יקרה אחרי שתלחץ:
                  </p>
                  <ol className="text-[#94A3B8] text-xs space-y-1 mr-4">
                    <li>1. יפתח לך @userinfobot בטלגרם</li>
                    <li>2. לחץ START או שלח /start</li>
                    <li>3. הבוט ישלח לך הודעה עם מספר</li>
                    <li>4. <strong className="text-[#F1F5F9]">זה ה-Chat ID שלך!</strong></li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-[#334155] text-[#F1F5F9] rounded-xl py-3 hover:bg-[#475569] transition-colors"
                >
                  חזור
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#F97316] text-white rounded-xl py-3 hover:bg-[#EA580C] transition-colors flex items-center justify-center gap-2"
                >
                  <span>קיבלתי את המספר ✓</span>
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Enter Chat ID */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-[#F1F5F9] text-lg font-medium">
                שלב 3: הזן את ה-Chat ID
              </h3>
              <div className="bg-[#0F172A] rounded-lg p-4 space-y-3">
                <p className="text-[#94A3B8] text-sm">
                  העתק את המספר שקיבלת מ-@userinfobot והדבק כאן:
                </p>
                <div>
                  <label className="block text-[#F1F5F9] text-sm mb-2">
                    Chat ID שלך (רק ספרות):
                  </label>
                  <input
                    type="text"
                    value={newChatId}
                    onChange={(e) => setNewChatId(e.target.value.replace(/\D/g, ''))}
                    placeholder="608024760"
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-3 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#F97316] transition-colors font-mono"
                    dir="ltr"
                    style={{ textAlign: 'left' }}
                  />
                  {newChatId && newChatId.length < 9 && (
                    <p className="text-[#F97316] text-xs mt-2">
                      ⚠️ Chat ID בדרך כלל 9-10 ספרות. ודא שהעתקת נכון!
                    </p>
                  )}
                  {newChatId && newChatId.length >= 9 && (
                    <p className="text-[#10B981] text-xs mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>נראה טוב! ✓</span>
                    </p>
                  )}
                </div>
                <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-lg p-3">
                  <p className="text-[#06B6D4] text-sm font-medium mb-1">
                    💡 טיפ:
                  </p>
                  <p className="text-[#94A3B8] text-xs">
                    ה-Chat ID שלך הוא <strong className="text-[#F1F5F9]">לא</strong> מספר הטלפון שלך!
                    זה מספר ייחודי שטלגרם נותן לכל משתמש.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-[#334155] text-[#F1F5F9] rounded-xl py-3 hover:bg-[#475569] transition-colors"
                >
                  חזור
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!newChatId || newChatId.length < 9}
                  className="flex-1 bg-[#F97316] text-white rounded-xl py-3 hover:bg-[#EA580C] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>המשך ✓</span>
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Save and Test */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-[#F1F5F9] text-lg font-medium">
                שלב 4: שמור ובדוק!
              </h3>
              <div className="bg-[#0F172A] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[#334155]">
                  <span className="text-[#94A3B8] text-sm">Chat ID הישן:</span>
                  <span className="text-red-500 font-mono line-through">{currentChatId}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#94A3B8] text-sm">Chat ID החדש:</span>
                  <span className="text-[#10B981] font-mono font-medium">{newChatId}</span>
                </div>
              </div>
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                <h4 className="text-[#10B981] font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>מעולה! עכשיו:</span>
                </h4>
                <ol className="space-y-2 text-[#94A3B8] text-sm mr-4">
                  <li>1. לחץ "שמור Chat ID"</li>
                  <li>2. חזור לעמוד ההתראות</li>
                  <li>3. לחץ "בדוק התראת טלגרם"</li>
                  <li>4. הפעם זה יעבוד! 🎉</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#334155] text-[#F1F5F9] rounded-xl py-3 hover:bg-[#475569] transition-colors"
                >
                  תקן Chat ID
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl py-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>שמור Chat ID ✓</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}