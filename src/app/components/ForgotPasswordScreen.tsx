import { useState } from 'react';
import { ArrowRight, Loader2, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export default function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
        setError('נא להזין כתובת אימייל');
        return;
    }

    setIsLoading(true);
    try {
      // Send reset password email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redirect back to the app after clicking the link
      });

      if (error) {
        // For security reasons, Supabase might not return an error if the email doesn't exist,
        // but if it's a format error or rate limit, catch it here.
        setError(error.message);
        return;
      }

      setIsSent(true);
      toast.success('קישור לאיפוס סיסמה נשלח לאימייל שלך');
      
    } catch (err) {
      console.error(err);
      setError('אירעה שגיאה בשליחת המייל. נסה שוב מאוחר יותר.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-6 py-8">
      <div className="max-w-md mx-auto">
        <button 
            onClick={onBack} 
            className="text-[#F97316] mb-8 flex items-center gap-2 hover:bg-[#F97316]/10 p-2 rounded-lg transition-all w-fit"
        >
          <ArrowRight className="w-5 h-5" />
          <span>חזרה לכניסה</span>
        </button>
        
        <div className="space-y-2 mb-8">
            <h1 className="text-[#F1F5F9] text-3xl font-bold">שחזור סיסמה</h1>
            <p className="text-[#94A3B8]">
                {isSent 
                    ? 'הוראות לאיפוס הסיסמה נשלחו לכתובת האימייל שהזנת.'
                    : 'הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.'
                }
            </p>
        </div>
        
        {isSent ? (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8 text-center space-y-6"
             >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                    <h3 className="text-[#F1F5F9] text-xl font-medium mb-2">המייל נשלח בהצלחה!</h3>
                    <p className="text-[#94A3B8] text-sm">
                        בדוק את תיבת הדואר הנכנס (וגם את תיקיית הספאם) עבור כתובת 
                        <span className="block text-[#F97316] mt-1 font-medium">{email}</span>
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="w-full bg-[#334155] hover:bg-[#475569] text-white py-3 rounded-xl transition-all"
                >
                    חזור למסך הכניסה
                </button>
             </motion.div>
        ) : (
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
                <div className="relative">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                        }}
                        className={`w-full bg-[#1E293B] border pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#F97316]'
                        } text-[#F1F5F9]`}
                        placeholder="email@example.com"
                        required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5 pointer-events-none" />
                </div>
                </div>
                
                <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                {isLoading ? (
                    <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>שולח...</span>
                    </>
                ) : (
                    'שלח קישור לאיפוס'
                )}
                </button>
            </motion.div>
            </form>
        )}
      </div>
    </div>
  );
}