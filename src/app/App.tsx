import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'motion/react';
import appIcon from "figma:asset/fe8743abf824d7cb06ba270506a6c3bba93e1970.png";
import PageTransition from './components/PageTransition';
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import SignupScreen from './components/SignupScreen';
import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import UpdatePasswordScreen from './components/UpdatePasswordScreen';
import IntroAnimation from './components/IntroAnimation';
import MainApp from './components/MainApp';
import BiometricSetupModal from './components/BiometricSetupModal';
import { InstallPrompt } from './components/InstallPrompt';
import { hasBiometricCredential } from './services/biometricAuth';
import { supabase } from './services/supabaseClient';

type Screen = 'intro-initial' | 'welcome' | 'signup' | 'login' | 'forgot-password' | 'update-password' | 'intro' | 'intro-logout' | 'app';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro-initial');
  const [user, setUser] = useState<{ name: string; email: string; tradingStyle: 'day' | 'long' } | null>(null);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<{ name: string; email: string; tradingStyle: 'day' | 'long' } | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  // Load trading style and price range from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedStyle = localStorage.getItem('turjiTrade_tradingStyle') as 'day' | 'long' | null;
      if (savedStyle && savedStyle !== user.tradingStyle) {
        setUser({ ...user, tradingStyle: savedStyle });
      }
    }
    
    // Load saved price range
    const savedPriceRange = localStorage.getItem('turjiTrade_priceRange');
    if (savedPriceRange) {
      setPriceRange(JSON.parse(savedPriceRange));
    }
  }, [user]);

  // Update App Icons (Favicon, Apple Touch Icon, Manifest)
  useEffect(() => {
    // 1. Update Favicon
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = appIcon;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = appIcon;
      document.head.appendChild(newFavicon);
    }

    // 2. Update Apple Touch Icon
    const appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (appleIcon) {
      appleIcon.href = appIcon;
    } else {
      const newAppleIcon = document.createElement('link');
      newAppleIcon.rel = 'apple-touch-icon';
      newAppleIcon.href = appIcon;
      document.head.appendChild(newAppleIcon);
    }

    // 3. Dynamic Manifest for Android "Add to Home Screen"
    const manifestContent = {
      name: "TurjiTrade",
      short_name: "TurjiTrade",
      start_url: "/",
      display: "standalone",
      background_color: "#1e293b",
      theme_color: "#1e293b",
      icons: [
        {
          src: appIcon,
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: appIcon,
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };

    const stringManifest = JSON.stringify(manifestContent);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    
    const manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
    if (manifestLink) {
      manifestLink.href = manifestURL;
    } else {
      const newManifest = document.createElement('link');
      newManifest.rel = 'manifest';
      newManifest.href = manifestURL;
      document.head.appendChild(newManifest);
    }
  }, []);

  // Check Supabase session on mount to detect "Remember Me" state & Password Recovery
  useEffect(() => {
    // Listen for Auth changes (like Password Recovery link clicked)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentScreen('update-password');
      }
    });

    const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session) {
         // Session exists logic handled in handleInitialIntroComplete
       }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Idle Timer Logic (Auto Logout based on device type)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (user && currentScreen === 'app') {
        // Set timeout to 10 minutes (600,000 ms) for all devices as requested
        const timeoutDuration = 600000;

        idleTimer = setTimeout(() => {
          handleLogout();
          toast.info('נותקת עקב חוסר פעילות', {
            description: 'חלפו 10 דקות ללא שימוש'
          }); 
        }, timeoutDuration);
      }
    };

    // Only attach listeners if user is logged in and in the main app
    if (user && currentScreen === 'app') {
      const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
      
      // Attach listeners
      events.forEach(event => {
        window.addEventListener(event, resetIdleTimer);
      });

      // Initialize timer
      resetIdleTimer();

      // Cleanup
      return () => {
        if (idleTimer) clearTimeout(idleTimer);
        events.forEach(event => {
          window.removeEventListener(event, resetIdleTimer);
        });
      };
    }
  }, [user, currentScreen]);

  const handleInitialIntroComplete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // If we have a session, go to Login screen directly (to Unlock or Re-auth)
      // This satisfies "Must type password or connect if biometric" on entry.
      setCurrentScreen('login');
    } else {
      setCurrentScreen('welcome');
    }
  };

  const handleSignup = (userData: { name: string; email: string; tradingStyle: 'day' | 'long' }) => {
    setPendingUserData(userData);
    
    // Save trading style to localStorage
    localStorage.setItem('turjiTrade_tradingStyle', userData.tradingStyle);
    
    // Check if biometric is already registered
    if (!hasBiometricCredential()) {
      setShowBiometricSetup(true);
    } else {
      setUser(userData);
      setCurrentScreen('intro');
    }
  };

  const handleLogin = async (userData: { email: string }) => {
    // Fetch full user profile from Supabase
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      const savedStyle = localStorage.getItem('turjiTrade_tradingStyle') as 'day' | 'long' | null;
      
      // Get name and trading style from metadata if available
      const name = authUser?.user_metadata?.name || 'משתמש';
      const metaTradingStyle = authUser?.user_metadata?.tradingStyle;
      
      const fullUserData = {
        name: name,
        email: userData.email,
        tradingStyle: metaTradingStyle || savedStyle || ('day' as const)
      };
      
      setPendingUserData(fullUserData);
      
      // Check if biometric is already registered
      if (!hasBiometricCredential()) {
        setShowBiometricSetup(true);
      } else {
        setUser(fullUserData);
        setCurrentScreen('intro');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback
      setUser({
        name: 'משתמש',
        email: userData.email,
        tradingStyle: 'day'
      });
      setCurrentScreen('intro');
    }
  };

  const handleBiometricSetupComplete = () => {
    setShowBiometricSetup(false);
    if (pendingUserData) {
      setUser(pendingUserData);
      setPendingUserData(null);
      setCurrentScreen('intro');
    }
  };

  const handleBiometricSetupSkip = () => {
    setShowBiometricSetup(false);
    if (pendingUserData) {
      setUser(pendingUserData);
      setPendingUserData(null);
      setCurrentScreen('intro');
    }
  };

  const handleIntroComplete = () => {
    setCurrentScreen('app');
  };

  const handleLogoutIntroComplete = () => {
    setCurrentScreen('welcome');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentScreen('intro-logout');
  };

  const handleTradingStyleChange = (style: 'day' | 'long') => {
    if (user) {
      setUser({ ...user, tradingStyle: style });
      localStorage.setItem('turjiTrade_tradingStyle', style);
    }
  };

  const handlePriceRangeChange = (min: string, max: string) => {
    const newRange = { min, max };
    setPriceRange(newRange);
    localStorage.setItem('turjiTrade_priceRange', JSON.stringify(newRange));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B]" style={{ fontFamily: 'Heebo, sans-serif' }} dir="rtl">
      <Toaster 
        position="bottom-center"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontFamily: 'Heebo, sans-serif',
            fontSize: '16px',
          },
          classNames: {
            toast: 'shadow-lg shadow-black/20',
            success: 'border-[#10B981]/50 text-[#10B981]',
            error: 'border-red-500/50 text-red-500',
            info: 'border-[#06B6D4]/50 text-[#06B6D4]',
          }
        }}
      />
      <AnimatePresence mode="wait">
        {currentScreen === 'intro-initial' && (
          <PageTransition key="intro-initial">
            <IntroAnimation onComplete={handleInitialIntroComplete} />
          </PageTransition>
        )}
        {currentScreen === 'welcome' && (
          <PageTransition key="welcome">
            <WelcomeScreen onSignup={() => setCurrentScreen('signup')} onLogin={() => setCurrentScreen('login')} />
          </PageTransition>
        )}
        {currentScreen === 'signup' && (
          <PageTransition key="signup">
            <SignupScreen onSignup={handleSignup} onBack={() => setCurrentScreen('welcome')} onLoginClick={() => setCurrentScreen('login')} />
          </PageTransition>
        )}
        {currentScreen === 'login' && (
          <PageTransition key="login">
            <LoginScreen onLogin={handleLogin} onBack={() => setCurrentScreen('welcome')} onSignupClick={() => setCurrentScreen('signup')} onForgotPasswordClick={() => setCurrentScreen('forgot-password')} />
          </PageTransition>
        )}
        {currentScreen === 'forgot-password' && (
          <PageTransition key="forgot-password">
            <ForgotPasswordScreen onBack={() => setCurrentScreen('login')} />
          </PageTransition>
        )}
        {currentScreen === 'update-password' && (
          <PageTransition key="update-password">
            <UpdatePasswordScreen onSuccess={() => setCurrentScreen('intro')} />
          </PageTransition>
        )}
        {currentScreen === 'intro' && (
          <PageTransition key="intro">
            <IntroAnimation onComplete={handleIntroComplete} />
          </PageTransition>
        )}
        {currentScreen === 'intro-logout' && (
          <PageTransition key="intro-logout">
            <IntroAnimation onComplete={handleLogoutIntroComplete} />
          </PageTransition>
        )}
        {currentScreen === 'app' && user && (
          <PageTransition key="app">
            <MainApp 
              user={user} 
              onLogout={handleLogout} 
              onTradingStyleChange={handleTradingStyleChange}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
            />
          </PageTransition>
        )}
      </AnimatePresence>
      {showBiometricSetup && pendingUserData && (
        <BiometricSetupModal 
          email={pendingUserData.email} 
          onComplete={handleBiometricSetupComplete} 
          onSkip={handleBiometricSetupSkip} 
        />
      )}
      <InstallPrompt />
    </div>
  );
}