import { useState, useEffect } from 'react';
import { ArrowRight, Fingerprint, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  isBiometricAvailable, 
  authenticateWithBiometric, 
  hasBiometricCredential,
  getBiometricEmail 
} from '../services/biometricAuth';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: (data: { email: string }) => void;
  onBack: () => void;
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
}

export default function LoginScreen({ onLogin, onBack, onSignupClick, onForgotPasswordClick }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        setSessionEmail(session.user.email);
        
        // If we have a session AND biometric is registered for this email
        const storedBioEmail = getBiometricEmail();
        if (isBiometricAvailable() && hasBiometricCredential() && storedBioEmail === session.user.email) {
          setShowBiometric(true);
          setBiometricEmail(storedBioEmail);
          // Auto-fill email
          setEmail(session.user.email);
        }
      } else {
        // No session, check if we have a stored email from previous biometric setup to pre-fill
        const storedBioEmail = getBiometricEmail();
        if (storedBioEmail) {
           setEmail(storedBioEmail);
        }
      }
    };
    
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLoading) return;

    // Client-side validation: Password length
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    if (email && password) {
      setIsLoading(true);
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          // Server-side validation failed (Auth)
          setError('אימייל או סיסמה שגויים');
          return;
        }

        if (data.session) {
          toast.success('התחברת בהצלחה!', {
            style: { direction: 'rtl' }
          });
          onLogin({ email: data.session.user.email! });
        }
      } catch (err) {
        console.error(err);
        setError('שגיאה לא צפויה בחיבור לשרת');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBiometricLogin = async () => {
    setError(null);
    
    if (!sessionEmail && !password) {
      setError('נדרשת כניסה ראשונית עם סיסמה כדי להפעיל כניסה ביומטרית');
      return;
    }

    const result = await authenticateWithBiometric();
    if (result) {
      if (sessionEmail && result.email === sessionEmail) {
         onLogin({ email: result.email });
      } else {
         setError('המושב פג תוקף. נא להתחבר עם סיסמה מחדש.');
         setShowBiometric(false);
      }
    } else {
      setError('אימות ביומטרי נכשל. נא נסה שוב או השתמש בסיסמה.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-6 py-8">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="text-[#F97316] mb-8 flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <h1 className="text-[#F1F5F9] text-3xl mb-8">כניסה ל-TurjiTrade</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-6"
          >
            {/* Error Alert Box */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3"
                >
                  <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />
                  <span className="text-red-200 text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[#F1F5F9] mb-2">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full bg-[#1E293B] border text-[#F1F5F9] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  error && error !== 'הסיסמה חייבת להכיל לפחות 6 תווים' ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#F97316]'
                }`}
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-[#F1F5F9] mb-2">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full bg-[#1E293B] border text-[#F1F5F9] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#F97316]'
                }`}
                placeholder="הזן סיסמה"
                required
              />
              <button type="button" onClick={onForgotPasswordClick} className="text-[#06B6D4] text-sm mt-2 hover:underline">
                שכחתי סיסמה?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>מתחבר...</span>
                </>
              ) : (
                'כניסה'
              )}
            </button>
          </motion.div>
        </form>
        
        {showBiometric && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#334155]"></div>
              <span className="text-[#94A3B8] text-sm">או</span>
              <div className="flex-1 h-px bg-[#334155]"></div>
            </div>
            
            <button
              onClick={handleBiometricLogin}
              className="w-full bg-[#1E293B] border-2 border-[#F97316] text-[#F97316] py-4 rounded-xl hover:bg-[#F97316]/10 transition-all flex items-center justify-center gap-2"
            >
              <Fingerprint className="w-5 h-5" />
              <span>כניסה באמצעות {biometricEmail}</span>
            </button>
          </>
        )}
        
        <button
          onClick={onSignupClick}
          className="w-full text-center mt-6 text-[#94A3B8]"
        >
          עדיין אין לך חשבון? <span className="text-[#06B6D4] hover:underline">הרשמה</span>
        </button>
      </div>
    </div>
  );
}