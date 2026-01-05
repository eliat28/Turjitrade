import { useState } from 'react';
import { Loader2, CheckCircle2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

interface UpdatePasswordScreenProps {
  onSuccess: () => void;
}

export default function UpdatePasswordScreen({ onSuccess }: UpdatePasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        toast.success('הסיסמה עודכנה בהצלחה!');
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('אירעה שגיאה בעדכון הסיסמה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-6 py-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-[#F1F5F9] text-3xl font-bold mb-2 text-center">יצירת סיסמה חדשה</h1>
        <p className="text-[#94A3B8] text-center mb-8">
          אנא בחר סיסמה חדשה לחשבון שלך
        </p>

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
              <label className="block text-[#F1F5F9] mb-2">סיסמה חדשה</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full bg-[#1E293B] border pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#F97316]'
                  } text-[#F1F5F9]`}
                  placeholder="לפחות 6 תווים"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#F1F5F9] mb-2">אימות סיסמה</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full bg-[#1E293B] border pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#F97316]'
                  } text-[#F1F5F9]`}
                  placeholder="הקלד שוב את הסיסמה"
                  required
                />
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
                  <span>מעדכן...</span>
                </>
              ) : (
                'עדכן סיסמה והתחבר'
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}