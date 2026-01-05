import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import appIcon from "figma:asset/fe8743abf824d7cb06ba270506a6c3bba93e1970.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log('[PWA Install] Initializing install prompt...');
    
    // Check if running in standalone mode (already installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    
    if (standalone) {
      console.log('[PWA Install] App is already running in standalone mode');
    }

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    
    if (ios) {
      console.log('[PWA Install] iOS device detected');
    }

    // Listen for the beforeinstallprompt event (Android/Desktop)
    const handler = (e: Event) => {
      console.log('[PWA Install] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 1 second
      const dismissed = sessionStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        console.log('[PWA Install] Showing install prompt in 1 second...');
        setTimeout(() => setShowPrompt(true), 1000);
      } else {
        console.log('[PWA Install] Install prompt was previously dismissed in this session');
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show prompt if not standalone and not dismissed
    if (ios && !standalone) {
      const dismissed = sessionStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        console.log('[PWA Install] Showing iOS install instructions in 1 second...');
        setTimeout(() => setShowPrompt(true), 1000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      console.log('[PWA Install] Triggering install prompt...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA Install] User choice:', outcome);
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    console.log('[PWA Install] User dismissed install prompt');
    setShowPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // Don't show if user dismissed
  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#1E293B] border border-[#F97316]/50 rounded-xl shadow-2xl p-4 text-[#F1F5F9] relative overflow-hidden">
        {/* Background Gradient Effect */}
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[#F97316] to-[#06B6D4]"></div>
        
        <button
          onClick={handleDismiss}
          className="absolute top-2 left-2 p-1 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="סגור"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mt-2">
          <div className="flex-shrink-0">
             <img src={appIcon} alt="TurjiTrade Logo" className="w-14 h-14 rounded-xl shadow-md" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 text-white">התקן את TurjiTrade</h3>
            
            {isIOS ? (
              <div className="text-sm space-y-3 text-[#94A3B8]">
                <p>להתקנת האפליקציה למסך הבית:</p>
                <ol className="list-decimal list-inside space-y-1 text-white/90 text-xs">
                  <li>לחץ על כפתור השיתוף <span className="inline-block mx-1">📤</span> למטה</li>
                  <li>גלול ובחר "הוסף למסך הבית" <span className="inline-block mx-1">➕</span></li>
                  <li>לחץ על "הוסף" בצד שמאל למעלה</li>
                </ol>
              </div>
            ) : (
              <>
                <p className="text-sm mb-4 text-[#94A3B8] leading-relaxed">
                  הורד את האפליקציה למסך הבית לקבלת חווית שימוש מלאה ונוחה יותר 🚀
                </p>
                <Button
                  onClick={handleInstallClick}
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-2 rounded-lg shadow-lg shadow-orange-900/20 transition-all active:scale-95"
                  size="sm"
                >
                  <Download className="w-4 h-4 ml-2" />
                  התקן עכשיו
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}