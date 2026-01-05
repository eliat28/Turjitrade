import { useState, useEffect } from 'react';
import { User, Settings, Shield, Database, Info, ChevronLeft, LogOut, Fingerprint, X, Mail, Lock, CircleAlert } from 'lucide-react';
import { 
  isBiometricAvailable, 
  hasBiometricCredential, 
  registerBiometric, 
  removeBiometricCredential 
} from '../../services/biometricAuth';
import TradingStyleModal from '../TradingStyleModal';
import { InstallButton } from '../InstallButton';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface ProfileTabProps {
  user: {
    name: string;
    email: string;
    tradingStyle: 'day' | 'long';
  };
  onLogout: () => void;
  onTradingStyleChange: (style: 'day' | 'long') => void;
  onPriceRangeChange?: (minPrice: string, maxPrice: string) => void;
}

export default function ProfileTab({ user, onLogout, onTradingStyleChange, onPriceRangeChange }: ProfileTabProps) {
  const [showDataModal, setShowDataModal] = useState(false);
  const [showTradingStyleModal, setShowTradingStyleModal] = useState(false);
  const [showPriceRangeModal, setShowPriceRangeModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSignOutAllModal, setShowSignOutAllModal] = useState(false);
  const [showDeleteAnalysisModal, setShowDeleteAnalysisModal] = useState(false);
  const [showDeleteWatchlistModal, setShowDeleteWatchlistModal] = useState(false);
  const [showDataSourceModal, setShowDataSourceModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasCredential, setHasCredential] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Password change states
  const [passwordStep, setPasswordStep] = useState<'email' | 'verify' | 'newPassword'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentVerificationCode, setSentVerificationCode] = useState(''); // Store the actual code sent
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Sign out all states
  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    const checkBiometricAvailability = () => {
      const available = isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        const hasCred = hasBiometricCredential();
        setHasCredential(hasCred);
      }
    };

    checkBiometricAvailability();
    
    // Load saved price range from localStorage
    const savedPriceRange = localStorage.getItem('turjiTrade_priceRange');
    if (savedPriceRange) {
      const range = JSON.parse(savedPriceRange);
      setMinPrice(range.min || '');
      setMaxPrice(range.max || '');
    }
  }, []);

  const handleResetData = () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים? פעולה זו תמחק את כל רשימת המעקב, הניתוחים וההגדרות שלך.')) {
      // Clear all app data and save empty arrays
      localStorage.setItem('turjiTrade_watchlist', JSON.stringify([]));
      localStorage.setItem('turjiTrade_watchlist_initialized', 'true');
      localStorage.setItem('turjiTrade_analyses', JSON.stringify([]));
      localStorage.setItem('turjiTrade_analyses_initialized', 'true');
      localStorage.removeItem('turjiTrade_alertSettings');
      
      alert('✅ כל הנתונים נמחקו בהצלחה! רענן את הדף כדי לראות את השינויים.');
      setShowDataModal(false);
    }
  };

  const handleRegisterBiometric = async () => {
    if (biometricAvailable) {
      const success = await registerBiometric(user.email);
      if (success) {
        setHasCredential(true);
        alert('✅ אימות ביומטרי הוגדר בהצלחה!');
      } else {
        alert('❌ הגדרת אימות ביומטרי נכשלה. אולי המכשיר שלך לא תומך בתכונה זו.');
      }
    }
  };

  const handleRemoveBiometricCredential = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את האימות ביומטרי?')) {
      const success = removeBiometricCredential();
      if (success) {
        setHasCredential(false);
        alert('✅ אימות ביומטרי נמחק בהצלחה!');
      } else {
        alert('❌ מחיקת האימות ביומטרי נכשלה.');
      }
    }
  };

  const handlePriceRangeChange = () => {
    if (onPriceRangeChange) {
      onPriceRangeChange(minPrice, maxPrice);
    }
    // Save the new price range to localStorage
    localStorage.setItem('turjiTrade_priceRange', JSON.stringify({ min: minPrice, max: maxPrice }));
    setShowPriceRangeModal(false);
  };

  // Change Password Functions
  const handleSendVerificationEmail = async () => {
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    
    try {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentVerificationCode(code);
      
      // Send the code via email using Supabase
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: user.email,
          code: code
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'שגיאה בשליחת המייל');
      }
      
      setPasswordSuccess(`✅ נשלח קוד אימות לכתובת ${user.email}`);
      setPasswordStep('verify');
    } catch (error: any) {
      setPasswordError(`❌ שגיאה בשליחת המייל: ${error.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyCode = () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (verificationCode.trim() === '') {
      setPasswordError('❌ אנא הזן את קוד האימות');
      return;
    }
    
    if (verificationCode.trim() === sentVerificationCode) {
      setPasswordSuccess('✅ קוד אומת בהצלחה!');
      setTimeout(() => {
        setPasswordStep('newPassword');
        setPasswordSuccess('');
      }, 1000);
    } else {
      setPasswordError('❌ קוד האימות שגוי. אנא נסה שוב.');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation
    if (newPassword.length < 6) {
      setPasswordError('❌ הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('❌ הסיסמאות אינן תואמות');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setPasswordSuccess('✅ הסיסמה שונתה בהצלחה!');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        resetPasswordModal();
      }, 2000);
    } catch (error: any) {
      setPasswordError(`❌ שגיאה בשינוי הסיסמה: ${error.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  const resetPasswordModal = () => {
    setPasswordStep('email');
    setVerificationCode('');
    setSentVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Sign Out All Devices Function
  const handleSignOutAllDevices = async () => {
    setSignOutLoading(true);
    
    try {
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      alert('✅ יצאת מכל המכשירים בהצלחה!');
      setShowSignOutAllModal(false);
      onLogout();
    } catch (error: any) {
      alert(`❌ שגיאה ביציאה: ${error.message}`);
    } finally {
      setSignOutLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 pb-24">
      {/* User Info */}
      <div className="bg-[#1E293B] rounded-xl p-5 sm:p-6 mb-4 sm:mb-6 border border-[#334155]">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center shrink-0">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl truncate">{user.name}</h2>
            <p className="text-[#94A3B8] text-sm sm:text-base truncate">{user.email}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8]">סגנון מסחר:</span>
            <span className="text-[#F1F5F9]">
              {user.tradingStyle === 'day' ? 'מסחר יומי' : 'מסחר ארוך טווח'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8]">טווח מחיר:</span>
            <span className="text-[#F1F5F9]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              {minPrice || maxPrice 
                ? `$${maxPrice || '∞'}-$${minPrice || '0'}` 
                : 'לא מוגדר'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-3 sm:space-y-4">
        {/* Trading Preferences */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 text-[#F1F5F9]">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-[#F97316] shrink-0" />
            <span className="text-sm sm:text-base">העדפות מסחר</span>
          </div>
          <div className="border-t border-[#334155]">
            <button
              onClick={() => setShowTradingStyleModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">שנה סגנון מסחר</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
            <div className="border-t border-[#334155]"></div>
            <button
              onClick={() => setShowPriceRangeModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">שנה טווח מחיר</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 text-[#F1F5F9]">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#06B6D4] shrink-0" />
            <span className="text-sm sm:text-base">אבטחה</span>
          </div>
          <div className="border-t border-[#334155]">
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">שנה סיסמה</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
            <div className="border-t border-[#334155]"></div>
            <button
              onClick={() => setShowSignOutAllModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">יציאה מכל המכשירים</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
            <div className="border-t border-[#334155]"></div>
            <button
              onClick={hasCredential ? handleRemoveBiometricCredential : handleRegisterBiometric}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">
                {hasCredential ? 'מחק אימות ביומטרי' : 'הוסף אימות ביומטרי'}
              </span>
              <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 text-[#F1F5F9]">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6] shrink-0" />
            <span className="text-sm sm:text-base">נתונים</span>
          </div>
          <div className="border-t border-[#334155]">
            <button
              onClick={() => setShowDeleteAnalysisModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">מחק היסטוריית ניתוחים</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
            <div className="border-t border-[#334155]"></div>
            <button
              onClick={() => setShowDeleteWatchlistModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">מחק רשימת מעקב</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
            <div className="border-t border-[#334155]"></div>
            <button
              onClick={() => setShowDataModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#EF4444] text-sm sm:text-base">איפוס כל הנתונים</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#EF4444]" />
            </button>
          </div>
        </div>

        {/* Information */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 text-[#F1F5F9]">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981] shrink-0" />
            <span className="text-sm sm:text-base">מידע</span>
          </div>
          <div className="border-t border-[#334155]">
            <button
              onClick={() => setShowDataSourceModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">מאיפה הנתונים?</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
            <div className="border-t border-[#334155]"></div>
            <button
              onClick={() => setShowTermsModal(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#0F172A] active:bg-[#0F172A] transition-colors"
            >
              <span className="text-[#94A3B8] text-sm sm:text-base">תנאי שימוש</span>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
            </button>
            <div className="border-t border-[#334155]"></div>
            <div className="flex items-center justify-between p-3.5 sm:p-4">
              <span className="text-[#94A3B8] text-sm sm:text-base">גרסה</span>
              <span className="text-[#F1F5F9] text-sm sm:text-base" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                1.0.0
              </span>
            </div>
          </div>
        </div>

        {/* PWA Install Button */}
        <div className="px-1">
          <InstallButton />
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full bg-[#EF4444] hover:bg-[#DC2626] active:bg-[#DC2626] text-white py-3.5 sm:py-4 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">התנתק מהחשבון</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 sm:mt-8 text-[#94A3B8] text-xs sm:text-sm">
        Design by EliaTurjeman
      </div>

      {/* Reset Data Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDataModal(false)}>
          <div
            className="bg-[#1E293B] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#334155]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl mb-4">איפוס כל הנתונים</h2>
            <p className="text-[#94A3B8] mb-6 text-sm sm:text-base leading-relaxed">
              פעולה זו תמחק את כל הנתונים שלך לרבות ניתוחים, רשימת מעקב והיסטוריה. האם אתה בטוח?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDataModal(false)}
                className="flex-1 bg-[#334155] text-[#F1F5F9] py-3 rounded-xl hover:bg-[#475569] active:bg-[#475569] transition-colors text-sm sm:text-base"
              >
                ביטול
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 bg-[#EF4444] text-white py-3 rounded-xl hover:bg-[#DC2626] active:bg-[#DC2626] transition-colors text-sm sm:text-base"
              >
                מחק הכל
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trading Style Modal */}
      <TradingStyleModal
        isOpen={showTradingStyleModal}
        currentStyle={user.tradingStyle}
        onClose={() => setShowTradingStyleModal(false)}
        onSelectStyle={onTradingStyleChange}
      />

      {/* Price Range Modal */}
      {showPriceRangeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowPriceRangeModal(false)}>
          <div
            className="bg-[#1E293B] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#334155]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl mb-4">שנה טווח מחיר</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[#94A3B8] text-sm sm:text-base">מחיר מינימלי:</span>
                <input
                  type="text"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-[#334155] text-[#F1F5F9] py-2 px-3 rounded-xl w-full"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#94A3B8] text-sm sm:text-base">מחיר מקסימלי:</span>
                <input
                  type="text"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-[#334155] text-[#F1F5F9] py-2 px-3 rounded-xl w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPriceRangeModal(false)}
                className="flex-1 bg-[#334155] text-[#F1F5F9] py-3 rounded-xl hover:bg-[#475569] active:bg-[#475569] transition-colors text-sm sm:text-base"
              >
                ביטול
              </button>
              <button
                onClick={handlePriceRangeChange}
                className="flex-1 bg-[#F97316] text-white py-3 rounded-xl hover:bg-[#EA580C] active:bg-[#EA580C] transition-colors text-sm sm:text-base"
              >
                שמור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowChangePasswordModal(false)}>
          <div
            className="bg-[#1E293B] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#334155]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl mb-4">שנה סיסמה</h2>
            <div className="space-y-4">
              {passwordStep === 'email' && (
                <div className="flex items-center gap-3">
                  <span className="text-[#94A3B8] text-sm sm:text-base">כתובת מייל:</span>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="bg-[#334155] text-[#F1F5F9] py-2 px-3 rounded-xl w-full"
                  />
                </div>
              )}
              {passwordStep === 'verify' && (
                <div className="flex items-center gap-3">
                  <span className="text-[#94A3B8] text-sm sm:text-base">קוד אימות:</span>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-[#334155] text-[#F1F5F9] py-2 px-3 rounded-xl w-full"
                  />
                </div>
              )}
              {passwordStep === 'newPassword' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[#94A3B8] text-sm sm:text-base">סיסמה חדשה:</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#334155] text-[#F1F5F9] py-2 px-3 rounded-xl w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#94A3B8] text-sm sm:text-base">אימות סיסמה:</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#334155] text-[#F1F5F9] py-2 px-3 rounded-xl w-full"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="flex-1 bg-[#334155] text-[#F1F5F9] py-3 rounded-xl hover:bg-[#475569] active:bg-[#475569] transition-colors text-sm sm:text-base"
              >
                ביטול
              </button>
              {passwordStep === 'email' && (
                <button
                  onClick={handleSendVerificationEmail}
                  className="flex-1 bg-[#F97316] text-white py-3 rounded-xl hover:bg-[#EA580C] active:bg-[#EA580C] transition-colors text-sm sm:text-base"
                >
                  שלח מייל אימות
                </button>
              )}
              {passwordStep === 'verify' && (
                <button
                  onClick={handleVerifyCode}
                  className="flex-1 bg-[#F97316] text-white py-3 rounded-xl hover:bg-[#EA580C] active:bg-[#EA580C] transition-colors text-sm sm:text-base"
                >
                  אמת קוד
                </button>
              )}
              {passwordStep === 'newPassword' && (
                <button
                  onClick={handleChangePassword}
                  className="flex-1 bg-[#F97316] text-white py-3 rounded-xl hover:bg-[#EA580C] active:bg-[#EA580C] transition-colors text-sm sm:text-base"
                >
                  שנה סיסמה
                </button>
              )}
            </div>
            {passwordError && (
              <p className="text-[#EF4444] text-sm sm:text-base mt-3">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-[#10B981] text-sm sm:text-base mt-3">{passwordSuccess}</p>
            )}
          </div>
        </div>
      )}

      {/* Sign Out All Devices Modal */}
      {showSignOutAllModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowSignOutAllModal(false)}>
          <div
            className="bg-[#1E293B] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#334155]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl mb-4">יציאה מכל המכשירים</h2>
            <p className="text-[#94A3B8] mb-6 text-sm sm:text-base leading-relaxed">
              פעולה זו תמחק את כל ההגדרות שלך מכל המכשירים. האם אתה בטוח?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutAllModal(false)}
                className="flex-1 bg-[#334155] text-[#F1F5F9] py-3 rounded-xl hover:bg-[#475569] active:bg-[#475569] transition-colors text-sm sm:text-base"
              >
                ביטול
              </button>
              <button
                onClick={handleSignOutAllDevices}
                className="flex-1 bg-[#EF4444] text-white py-3 rounded-xl hover:bg-[#DC2626] active:bg-[#DC2626] transition-colors text-sm sm:text-base"
              >
                יציאה מכל המכשירים
              </button>
            </div>
            {signOutLoading && (
              <p className="text-[#F1F5F9] text-sm sm:text-base mt-3">מתבצע...</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Analysis Modal */}
      {showDeleteAnalysisModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteAnalysisModal(false)}>
          <div
            className="bg-[#1E293B] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#334155]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl mb-4">מחק היסטוריית ניתוחים</h2>
            <p className="text-[#94A3B8] mb-6 text-sm sm:text-base leading-relaxed">
              פעולה זו תמחק את כל הניתוחים שלך. האם אתה בטוח?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAnalysisModal(false)}
                className="flex-1 bg-[#334155] text-[#F1F5F9] py-3 rounded-xl hover:bg-[#475569] active:bg-[#475569] transition-colors text-sm sm:text-base"
              >
                ביטול
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('turjiTrade_analyses', JSON.stringify([]));
                  localStorage.setItem('turjiTrade_analyses_initialized', 'true');
                  alert('✅ כל הניתוחים נמחקו בהצלחה! רענן את הדף כדי לראות את השינויים.');
                  setShowDeleteAnalysisModal(false);
                }}
                className="flex-1 bg-[#EF4444] text-white py-3 rounded-xl hover:bg-[#DC2626] active:bg-[#DC2626] transition-colors text-sm sm:text-base"
              >
                מחק הכל
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Watchlist Modal */}
      {showDeleteWatchlistModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteWatchlistModal(false)}>
          <div
            className="bg-[#1E293B] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#334155]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl mb-4">מחק רשימת מעקב</h2>
            <p className="text-[#94A3B8] mb-6 text-sm sm:text-base leading-relaxed">
              פעוה זו תמחק את כל רשימת המעקב שלך. האם אתה בטוח?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteWatchlistModal(false)}
                className="flex-1 bg-[#334155] text-[#F1F5F9] py-3 rounded-xl hover:bg-[#475569] active:bg-[#475569] transition-colors text-sm sm:text-base"
              >
                ביטול
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('turjiTrade_watchlist');
                  localStorage.removeItem('turjiTrade_watchlist_initialized');
                  alert('✅ כל רשימת המעקב נמחקה בהצלחה! רענן את הדף כדי לראות את השינויים.');
                  setShowDeleteWatchlistModal(false);
                }}
                className="flex-1 bg-[#EF4444] text-white py-3 rounded-xl hover:bg-[#DC2626] active:bg-[#DC2626] transition-colors text-sm sm:text-base"
              >
                מחק רשימת מעקב
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Source Modal */}
      {showDataSourceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDataSourceModal(false)}>
          <div
            className="bg-[#1E293B] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#334155] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#10B981]" />
              מאיפה הנתונים?
            </h2>
            <div className="space-y-4 text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">📊 מקור הנתונים</h3>
                <p>
                  TurjiTrade משתמשת ב-<span className="text-[#06B6D4] font-medium">Finnhub Stock API</span> לקבלת נתוני שוק בזמן אמת. 
                  זהו ספק מידע פיננסי מוביל המספק מחירי מניות, נתוני חברות, וניתוחים כלכליים עבור אלפי מניות בבורסות העולמיות.
                </p>
              </div>

              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">🔒 אבטחת מידע</h3>
                <p>
                  כל הנתונים האישיים שלך (רשימת מעקב, ניתוחים, העדפות) נשמרים <span className="text-[#F97316] font-medium">באופן מקומי במכשיר שלך</span> בלבד. 
                  אנחנו לא שומרים ולא משתמשים בנתונים האישיים שלך מחוץ לאפליקציה.
                </p>
              </div>

              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">⚡ עדכונים בזמן אמת</h3>
                <p>
                  מחירי המניות מתעדכנים בזמן אמת במהלך שעות המסחר של הבורסות האמריקאיות (NYSE, NASDAQ). 
                  הנתונים כוללים מחירים, נפח מסחר, ושינויים יומיים.
                </p>
              </div>

              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">🤖 ניתוח AI</h3>
                <p>
                  TurjiBot מונע על ידי מודל בינה מלאכותית מתקדם (Llama 3.3 70B) של Groq, המספק המלצות מסחר מבוססות ניתוח טכני ופונדמנטלי של הנתונים.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDataSourceModal(false)}
                className="flex-1 bg-[#10B981] text-white py-3 rounded-xl hover:bg-[#059669] active:bg-[#059669] transition-colors text-sm sm:text-base"
              >
                הבנתי
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowTermsModal(false)}>
          <div
            className="bg-[#1E293B] rounded-xl p-5 sm:p-6 w-full max-w-md border border-[#334155] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#F1F5F9] text-lg sm:text-xl mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#10B981]" />
              תנאי שימוש
            </h2>
            <div className="space-y-4 text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">1. הסכמה לתנאים</h3>
                <p>
                  על ידי שימוש באפליקציית TurjiTrade, אתה מסכים לתנאי שימוש אלו ומתחייב לפעול בהתאם אליהם.
                </p>
              </div>

              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">2. שימוש באפליקציה</h3>
                <p>
                  TurjiTrade מספקת מידע וכלים למסחר במניות <span className="text-[#F97316] font-medium">למטרות חינוכיות ומידעיות בלבד</span>. 
                  ההמלצות והניתוחים אינם מהווים ייעוץ פיננסי או השקעות.
                </p>
              </div>

              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">3. אחריות משתמש</h3>
                <p>
                  כל החלטת השקעה היא באחריותך הבלעדית. אנו ממליצים להתייעץ עם יועץ פיננסי מוסמך לפני ביצוע השקעות.
                </p>
              </div>

              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">4. אבטחת מידע</h3>
                <p>
                  אנו מחויבים להגן על המידע האישי שלך. כל הנתונים נשמרים באופן מקומי ומוצפנים.
                </p>
              </div>

              <div>
                <h3 className="text-[#F1F5F9] font-medium mb-2">5. שינויים בתנאים</h3>
                <p>
                  אנו שומרים את הזכות לשנות את תנאי השימוש בכל עת. המשך השימוש באפליקציה מהווה הסכמה לתנאים המעודכנים.
                </p>
              </div>

              <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg p-3 mt-4">
                <p className="text-[#F97316] font-medium text-center">
                  ⚠️ השקעות במניות כרוכות בסיכון. השקע רק כסף שאתה יכול להרשות לעצמך להפסיד.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 bg-[#10B981] text-white py-3 rounded-xl hover:bg-[#059669] active:bg-[#059669] transition-colors text-sm sm:text-base"
              >
                הבנתי
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}