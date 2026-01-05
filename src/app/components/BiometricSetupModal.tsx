import { useState } from 'react';
import { Fingerprint, X } from 'lucide-react';
import { registerBiometric, isBiometricAvailable } from '../services/biometricAuth';

interface BiometricSetupModalProps {
  email: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function BiometricSetupModal({ email, onComplete, onSkip }: BiometricSetupModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSetupBiometric = async () => {
    setIsRegistering(true);
    
    try {
      const success = await registerBiometric(email);
      
      if (success) {
        alert('✅ אימות ביומטרי הוגדר בהצלחה! בפעם הבאה תוכל להיכנס בקלות.');
        onComplete();
      } else {
        alert('❌ לא הצלחנו להגדיר אימות ביומטרי. אולי המכשיר שלך לא תומך בתכונה זו.');
        onSkip();
      }
    } catch (error) {
      alert('❌ אירעה שגיאה. נסה שוב מאוחר יותר.');
      onSkip();
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isBiometricAvailable()) {
    // If biometric is not available, skip automatically
    setTimeout(onSkip, 0);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-3xl p-8 max-w-md w-full border-2 border-[#F97316]/30 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          aria-label="סגור"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] flex items-center justify-center">
            <Fingerprint className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[#F1F5F9] text-2xl text-center mb-4">
          הגדר כניסה מהירה
        </h2>

        {/* Description */}
        <p className="text-[#94A3B8] text-center mb-8">
          השתמש בטביעת אצבע או זיהוי פנים להתחברות מהירה ובטוחה לאפליקציה בפעם הבאה
        </p>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleSetupBiometric}
            disabled={isRegistering}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRegistering ? (
              <span>מגדיר...</span>
            ) : (
              <>
                <Fingerprint className="w-5 h-5" />
                <span>הפעל אימות ביומטרי</span>
              </>
            )}
          </button>

          <button
            onClick={onSkip}
            className="w-full bg-transparent border-2 border-[#334155] text-[#94A3B8] py-4 rounded-xl hover:bg-[#334155]/30 transition-all"
          >
            אולי אחר כך
          </button>
        </div>

        {/* Security Note */}
        <p className="text-[#64748B] text-xs text-center mt-6">
          🔒 הנתונים הביומטריים שלך נשמרים בצורה מאובטחת במכשיר שלך בלבד
        </p>
      </div>
    </div>
  );
}