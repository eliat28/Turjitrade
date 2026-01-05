import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface MarketStatusBannerProps {
  className?: string;
}

interface MarketStatus {
  isOpen: boolean;
  statusHebrew: string;
  marketTimeEST: string;
  nextOpen?: string;
  nextClose?: string;
  reason?: string;
}

export default function MarketStatusBanner({ className = '' }: MarketStatusBannerProps) {
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90/market-status`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMarketStatus(data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch market status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketStatus();

    // Update every minute
    const interval = setInterval(fetchMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !marketStatus) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div
        className={`rounded-xl p-3.5 sm:p-4 border-2 ${
          marketStatus.isOpen
            ? 'bg-[#10B981]/10 border-[#10B981]'
            : 'bg-[#F59E0B]/10 border-[#F59E0B]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              marketStatus.isOpen
                ? 'bg-[#10B981] text-white'
                : 'bg-[#F59E0B] text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  marketStatus.isOpen
                    ? 'bg-[#10B981] animate-pulse'
                    : 'bg-[#F59E0B]'
                }`}
              ></div>
              <h3
                className={`font-bold text-sm sm:text-base ${
                  marketStatus.isOpen ? 'text-[#10B981]' : 'text-[#F59E0B]'
                }`}
              >
                {marketStatus.statusHebrew}
              </h3>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[#94A3B8] text-xs sm:text-sm">
                שעון ניו יורק: {marketStatus.marketTimeEST}
              </p>
              {marketStatus.reason && (
                <p className="text-[#94A3B8] text-xs">
                  סיבה: {marketStatus.reason}
                </p>
              )}
              {marketStatus.nextOpen && !marketStatus.isOpen && (
                <p className="text-[#F59E0B] text-xs font-medium">
                  נפתח: {marketStatus.nextOpen}
                </p>
              )}
              {marketStatus.nextClose && marketStatus.isOpen && (
                <p className="text-[#10B981] text-xs font-medium">
                  נסגר: {marketStatus.nextClose}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}