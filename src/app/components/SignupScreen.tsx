import { useState } from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

interface SignupScreenProps {
  onSignup: (data: { name: string; email: string; tradingStyle: 'day' | 'long' }) => void;
  onBack: () => void;
  onLoginClick: () => void;
}

export default function SignupScreen({ onSignup, onBack, onLoginClick }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tradingStyle, setTradingStyle] = useState<'day' | 'long'>('long');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLoading) return;

    // Client-side Validation: Length check
    if (password.length < 6) {
       setError('הסיסמה חייבת להכיל לפחות 6 תווים');
       return;
    }

    if (email && name) {
      setIsLoading(true);
      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              tradingStyle
            }
          }
        });

        if (authError) {
          setError(authError.message); // Usually returns generic or specific message
          return;
        }

        if (data.user) {
          toast.success('ההרשמה בוצעה בהצלחה!');
          onSignup({ name, email, tradingStyle });
        }
      } catch (err) {
        console.error(err);
        setError('אירעה שגיאה בהרשמה. נסה שוב מאוחר יותר.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="text-[#F97316] mb-8 p-2 hover:bg-[#F97316]/10 rounded-lg transition-all"
          aria-label="חזור"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        
        {/* Title */}
        <h1 className="text-[#F1F5F9] text-3xl mb-8 text-center">צור חשבון</h1>
        
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

          {/* Email Input */}
          <div>
            <label className="block text-[#F1F5F9] mb-2">אימייל (חובה)*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full bg-[#1E293B] border text-[#F1F5F9] placeholder:text-[#F1F5F9]/50 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                error && error !== 'הסיסמה חייבת להכיל לפחות 6 תווים' ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#F97316]'
              }`}
              placeholder="xxxxx@gmail.com"
              required
            />
          </div>
          
          {/* Password Input */}
          <div>
            <label className="block text-[#F1F5F9] mb-2">סיסמה (חובה)*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full bg-[#1E293B] border text-[#F1F5F9] placeholder:text-[#F1F5F9]/50 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:ring-[#F97316]'
              }`}
              placeholder="לפחות 6 תווים"
              // Remove HTML5 minLength to allow our custom validation logic to run and show the error animation
              required
            />
          </div>
          
          {/* Name Input */}
          <div>
            <label className="block text-[#F1F5F9] mb-2">שם פרטי</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1E293B] border border-[#334155] text-[#F1F5F9] placeholder:text-[#F1F5F9]/50 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              placeholder="שם מלא"
              required
            />
          </div>
          
          {/* Trading Style Selection */}
          <div>
            <label className="block text-[#F1F5F9] text-2xl mb-4">סגנון מסחר</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTradingStyle('long')}
                className={`flex-1 py-4 rounded-2xl transition-all ${
                  tradingStyle === 'long'
                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg'
                    : 'bg-[#1E293B] text-[#F97316] border-2 border-[#F97316]'
                }`}
              >
                מסחר ארוך טווח
              </button>
              
              <button
                type="button"
                onClick={() => setTradingStyle('day')}
                className={`flex-1 py-4 rounded-2xl transition-all ${
                  tradingStyle === 'day'
                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg'
                    : 'bg-[#1E293B] text-[#F97316] border-2 border-[#F97316]'
                }`}
              >
                מסחר יומי
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'צור חשבון'
            )}
          </button>
          </motion.div>
        </form>
        
        {/* Login Link Button */}
        <button
          onClick={onLoginClick}
          className="w-full bg-transparent border-2 border-[#F97316] text-[#F97316] py-4 rounded-2xl hover:bg-[#F97316]/10 transition-all mt-4"
        >
          כבר יש לי חשבון
        </button>
        
        <p className="text-[#94A3B8] text-sm text-center mt-8">Design by EliaTurjeman</p>
      </div>
    </div>
  );
}