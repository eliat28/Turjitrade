import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, always show the button with instructions
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (ios && !standalone) {
      setShowButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowButton(false);
      }
    } else {
      // For iOS or browsers that don't support the API
      alert('להתקנה: לחץ על כפתור השיתוף (📤) ובחר "הוסף למסך הבית"');
    }
  };

  // Don't show if already installed
  if (isStandalone) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <Download className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-300">
            האפליקציה מותקנת
          </p>
          <p className="text-xs text-gray-400">
            אתה משתמש בגרסת PWA
          </p>
        </div>
      </div>
    );
  }

  // Don't show if not available
  if (!showButton) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      className="w-full border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500"
    >
      <Download className="w-4 h-4 ml-2" />
      התקן אפליקציה
    </Button>
  );
}
