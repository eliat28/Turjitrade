import { useState } from 'react';
import { Home, TrendingUp, Star, Bell, User, Bot, Briefcase } from 'lucide-react';
import AppHeader from './AppHeader';
import HomeTab from './tabs/HomeTab';
import AnalysisTab from './tabs/AnalysisTab';
import WatchlistTab from './tabs/WatchlistTab';
import AlertsTab from './tabs/AlertsTab';
import ProfileTab from './tabs/ProfileTab';
import AIAgentTab from './tabs/AIAgentTab';
import PortfolioTab from './tabs/PortfolioTab';

interface MainAppProps {
  user: {
    name: string;
    email: string;
    tradingStyle: 'day' | 'long';
  };
  onLogout: () => void;
  onTradingStyleChange: (style: 'day' | 'long') => void;
  priceRange?: { min: string; max: string };
  onPriceRangeChange?: (min: string, max: string) => void;
}

type Tab = 'home' | 'analysis' | 'watchlist' | 'alerts' | 'profile' | 'ai-agent' | 'portfolio';

export default function MainApp({ user, onLogout, onTradingStyleChange, priceRange, onPriceRangeChange }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [turjiBotContext, setTurjiBotContext] = useState<string>('');

  const handleOpenTurjiBot = (context: string = '') => {
    setTurjiBotContext(context);
    setActiveTab('ai-agent');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] pb-[10vh]">
      {activeTab !== 'profile' && <AppHeader />}
      {/* Content */}
      <div className="w-full h-full">
        {activeTab === 'home' && <HomeTab user={user} onOpenTurjiBot={handleOpenTurjiBot} priceRange={priceRange} onNavigateToProfile={() => setActiveTab('profile')} />}
        {activeTab === 'analysis' && <AnalysisTab onOpenTurjiBot={handleOpenTurjiBot} tradingStyle={user.tradingStyle} />}
        {activeTab === 'portfolio' && <PortfolioTab onOpenTurjiBot={handleOpenTurjiBot} tradingStyle={user.tradingStyle} />}
        {activeTab === 'watchlist' && <WatchlistTab onOpenTurjiBot={handleOpenTurjiBot} />}
        {activeTab === 'alerts' && <AlertsTab user={user} onOpenTurjiBot={handleOpenTurjiBot} />}
        {activeTab === 'profile' && <ProfileTab user={user} onLogout={onLogout} onTradingStyleChange={onTradingStyleChange} onPriceRangeChange={onPriceRangeChange} />}
        {activeTab === 'ai-agent' && <AIAgentTab user={user} context={turjiBotContext} />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-[#334155] px-[2vw] py-[1.5vh] overflow-x-auto">
        <div className="w-full flex justify-between items-center min-w-[320px]">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-[0.5vh] px-[2vw] py-[1vh] rounded-lg transition-colors ${
              activeTab === 'home' ? 'text-[#F97316]' : 'text-[#94A3B8]'
            }`}
          >
            <Home className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
            <span className="text-[2.5vw] sm:text-xs font-['Heebo']">בית</span>
          </button>
          
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex flex-col items-center gap-[0.5vh] px-[2vw] py-[1vh] rounded-lg transition-colors ${
              activeTab === 'portfolio' ? 'text-[#F97316]' : 'text-[#94A3B8]'
            }`}
          >
            <Briefcase className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
            <span className="text-[2.5vw] sm:text-xs font-['Heebo']">תיק מסחר</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex flex-col items-center gap-[0.5vh] px-[2vw] py-[1vh] rounded-lg transition-colors ${
              activeTab === 'analysis' ? 'text-[#F97316]' : 'text-[#94A3B8]'
            }`}
          >
            <TrendingUp className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
            <span className="text-[2.5vw] sm:text-xs font-['Heebo']">ניתוחים</span>
          </button>
          
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex flex-col items-center gap-[0.5vh] px-[2vw] py-[1vh] rounded-lg transition-colors ${
              activeTab === 'watchlist' ? 'text-[#F97316]' : 'text-[#94A3B8]'
            }`}
          >
            <Star className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
            <span className="text-[2.5vw] sm:text-xs font-['Heebo']">מעקב</span>
          </button>
          
          <button
            onClick={() => setActiveTab('ai-agent')}
            className={`flex flex-col items-center gap-[0.5vh] px-[2vw] py-[1vh] rounded-lg transition-colors ${
              activeTab === 'ai-agent' ? 'text-[#F97316]' : 'text-[#94A3B8]'
            }`}
          >
            <Bot className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
            <span className="text-[2.5vw] sm:text-xs font-['Heebo']">TurjiBot</span>
          </button>
          
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center gap-[0.5vh] px-[2vw] py-[1vh] rounded-lg transition-colors ${
              activeTab === 'alerts' ? 'text-[#F97316]' : 'text-[#94A3B8]'
            }`}
          >
            <Bell className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
            <span className="text-[2.5vw] sm:text-xs font-['Heebo']">התראות</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-[0.5vh] px-[2vw] py-[1vh] rounded-lg transition-colors ${
              activeTab === 'profile' ? 'text-[#F97316]' : 'text-[#94A3B8]'
            }`}
          >
            <User className="w-[5vw] h-[5vw] sm:w-6 sm:h-6" />
            <span className="text-[2.5vw] sm:text-xs font-['Heebo']">פרופיל</span>
          </button>
        </div>
      </nav>
    </div>
  );
}