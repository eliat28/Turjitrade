import { Building2, Globe, Users, MapPin, Info, ExternalLink, Briefcase, Calendar, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface CompanyTabContentProps {
  symbol: string;
  stockExchange: string;
}

interface CompanyProfile {
  name: string;
  description: string;
  industry: string;
  sector: string;
  website: string;
  country: string;
  marketCap: string;
  employees: string;
  founded: string;
  ceo: string;
  logo: string;
  source: string;
}

export default function CompanyTabContent({ symbol, stockExchange }: CompanyTabContentProps) {
  const [companyData, setCompanyData] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'static'>('static');

  useEffect(() => {
    fetchCompanyProfile();
  }, [symbol]);

  const fetchCompanyProfile = async () => {
    setIsLoading(true);
    try {
      const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90`;
      const response = await fetch(`${SERVER_URL}/company/${symbol}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setCompanyData(data.profile);
          setSource('api');
          console.log(`✅ Using LIVE company data from ${data.source} for ${symbol}`);
          
          // Expose clearCache function to window for console access
          (window as any).clearCacheFor = (sym: string) => {
            fetch(`${SERVER_URL}/company/${sym.toUpperCase()}/cache`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            }).then(() => {
              console.log(`✅ Cache cleared for ${sym}`);
              window.location.reload();
            });
          };
          
          console.log(`💡 To clear cache and get fresh translation, run: clearCacheFor('${symbol}')`);
        } else {
          setSource('static');
          console.log(`📚 Using static company data for ${symbol}`);
        }
      } else {
        setSource('static');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch company profile for ${symbol}:`, error);
      setSource('static');
    } finally {
      setIsLoading(false);
    }
  };

  // Static fallback data for popular companies
  const getStaticCompanyInfo = () => {
    const companyDB: Record<string, Partial<CompanyProfile>> = {
      'AAPL': {
        name: 'Apple Inc.',
        description: 'אפל היא חברת טכנולוגיה אמריקאית המתמחה בפיתוח, עיצוב ומכירה של מוצרי אלקטרוניקה צרכנית, תוכנות מחשב ושירותים מקוונים. החברה ידועה במוצרים כמו iPhone, iPad, Mac, Apple Watch ושירותים כמו App Store, Apple Music ו-iCloud. אפל היא אחת מחברות הטכנולוגיה המובילות בעולם עם מיליארדי משתמשים ברחבי העולם.',
        industry: 'טכנולוגיה - מוצרי צריכה',
        sector: 'Technology',
        employees: '~161,000',
        founded: '1976',
        ceo: 'Tim Cook',
        website: 'www.apple.com',
        country: 'ארצות הברית'
      },
      'MSFT': {
        name: 'Microsoft Corporation',
        description: 'מיקרוסופט היא חברת טכנולוגיה אמריקאית שמפתחת, מייצרת, מעניקה רישיונות ותומכת במגוון רחב של תוכנות, מכשירים ושירותים. החברה ידועה ב-Windows, Office 365, Azure Cloud, Xbox ו-LinkedIn. מיקרוסופט היא מובילה עולמית בתחום המחשוב הענן והבינה מלאכותית.',
        industry: 'תוכנה וענן',
        sector: 'Technology',
        employees: '~221,000',
        founded: '1975',
        ceo: 'Satya Nadella',
        website: 'www.microsoft.com',
        country: 'ארצות הברית'
      },
      'GOOGL': {
        name: 'Alphabet Inc. (Google)',
        description: 'אלפבית (Alphabet) היא חברת האחזקות של גוגל, המתמחה בשירותי אינטרנט וטכנולוגיה. גוגל היא מנוע החיפוש הגדול בעולם, ומפעילה גם את YouTube, Android, Gmail, Google Cloud ועוד. החברה מובילה בתחומי הפרסום הדיגיטלי, בינה מלאכותית ומחשוב ענן.',
        industry: 'אינטרנט וטכנולוגיה',
        sector: 'Technology',
        employees: '~182,000',
        founded: '1998',
        ceo: 'Sundar Pichai',
        website: 'www.google.com',
        country: 'ארצות הברית'
      },
      'TSLA': {
        name: 'Tesla Inc.',
        description: 'טסלה היא חברה אמריקאית המתמחה בכלי רכב חשמליים, אגירת אנרגיה ופתרונות אנרגיה מתחדשת. החברה מובילה את המהפכה החשמלית בתעשיית הרכב עם דגמים כמו Model 3, Model Y, Model S ו-Model X. טסלה גם מפתחת טכנולוגיית נהיגה אוטונומית מתקדמת.',
        industry: 'רכב חשמלי ואנרגיה',
        sector: 'Automotive',
        employees: '~140,000',
        founded: '2003',
        ceo: 'Elon Musk',
        website: 'www.tesla.com',
        country: 'ארצות הברית'
      },
      'NVDA': {
        name: 'NVIDIA Corporation',
        description: 'NVIDIA היא מובילה עולמית בתחום יחידות עיבוד גרפיות (GPU) ומחשוב AI. החברה מספקת פתרונות לגיימינג, מרכזי נתונים, בינה מלאכותית, למידת מכונה ורכבים אוטונומיים. כרטיסי הגרפיקה של NVIDIA משמשים גם למיינינג קריפטו ומחשוב מדעי.',
        industry: 'מוליכים למחצה ו-AI',
        sector: 'Technology',
        employees: '~29,600',
        founded: '1993',
        ceo: 'Jensen Huang',
        website: 'www.nvidia.com',
        country: 'ארצות הברית'
      },
      'AMZN': {
        name: 'Amazon.com Inc.',
        description: 'אמזון היא חברת מסחר אלקטרוני וענן מובילה בעולם. החברה החלה כחנות ספרים מקוונת והיום מוכרת כמעט הכל. אמזון מפעילה גם את Amazon Web Services (AWS) - פלטפורמת ענן מובילה, Prime Video, Kindle, Alexa ועוד. היא אחת מחברות הטכנולוגיה הגדולות בעולם.',
        industry: 'מסחר אלקטרוני וענן',
        sector: 'Consumer Cyclical',
        employees: '~1,540,000',
        founded: '1994',
        ceo: 'Andy Jassy',
        website: 'www.amazon.com',
        country: 'ארצות הברית'
      },
      'META': {
        name: 'Meta Platforms Inc.',
        description: 'מטא (לשעבר פייסבוק) היא חברת רשתות חברתיות וטכנולוגיה. החברה מפעילה את Facebook, Instagram, WhatsApp ו-Threads. מטא משקיעה מאות מיליוני דולרים בפיתוח המטהוורס (Metaverse) ומציאות רבודה/מדומה (VR/AR) דרך Quest VR.',
        industry: 'רשתות חברתיות',
        sector: 'Technology',
        employees: '~86,000',
        founded: '2004',
        ceo: 'Mark Zuckerberg',
        website: 'www.meta.com',
        country: 'ארצות הברית'
      },
      'NFLX': {
        name: 'Netflix Inc.',
        description: 'נטפליקס היא שירות סטרימינג מוביל בעולם המציע סרטים, סדרות טלוויזיה ותוכן מקורי. החברה פועלת ביותר מ-190 מדינות עם מעל 240 מיליון מנויים. נטפליקס ידועה בתכנים מקוריים כמו Stranger Things, The Crown, Wednesday ועוד.',
        industry: 'בידור ומדיה',
        sector: 'Communication Services',
        employees: '~13,000',
        founded: '1997',
        ceo: 'Ted Sarandos & Greg Peters',
        website: 'www.netflix.com',
        country: 'ארצות הברית'
      }
    };

    return companyDB[symbol] || {
      name: `${symbol} Corporation`,
      description: `${symbol} היא חברה אמריקאית הנסחרת בבורסה. המידע המפורט על החברה יעודכן בקרוב.`,
      industry: 'N/A',
      sector: 'N/A',
      employees: 'N/A',
      founded: 'N/A',
      ceo: 'N/A',
      website: 'N/A',
      country: 'ארצות הברית'
    };
  };

  const displayData = companyData || getStaticCompanyInfo();

  return (
    <div className="space-y-4">
      {/* Company Header */}
      <div className="bg-gradient-to-r from-[#F97316]/10 to-[#EA580C]/10 rounded-xl p-4 border border-[#F97316]/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[#F1F5F9] text-lg font-bold">{displayData.name}</h3>
              <p className="text-[#94A3B8] text-sm">
                {isLoading ? 'טוען נתונים...' : 
                 source === 'api' && companyData ? `מקור: ${companyData.source?.toUpperCase()} API` :
                 'מסד נתונים מקומי'}
              </p>
            </div>
          </div>
          {isLoading && (
            <div className="w-5 h-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </div>

      {/* Company Description */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-[#F97316]" />
          <h3 className="text-[#F97316] text-base">אודות החברה</h3>
        </div>
        <p className="text-[#E2E8F0] text-sm leading-relaxed">
          {displayData.description}
        </p>
      </div>

      {/* Stock Exchange Badge */}
      <div className="bg-gradient-to-r from-[#06B6D4]/10 to-[#0891B2]/10 rounded-xl p-4 border border-[#06B6D4]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[#94A3B8] text-xs mb-1">נסחרת במדד</div>
              <div className="text-[#06B6D4] text-xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                {stockExchange}
              </div>
            </div>
          </div>
          <div className="text-[#94A3B8] text-xs text-right">
            {stockExchange === 'NASDAQ' ? 'בורסת טכנולוגיה' : 'בורסת ניו יורק'}
          </div>
        </div>
      </div>

      {/* Company Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs">תעשייה</span>
          </div>
          <div className="text-[#F1F5F9] text-sm">
            {displayData.industry}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Info className="w-4 h-4" />
            <span className="text-xs">סקטור</span>
          </div>
          <div className="text-[#F1F5F9] text-sm">
            {displayData.sector}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs">עובדים</span>
          </div>
          <div className="text-[#F97316] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {displayData.employees || 'N/A'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">נוסדה</span>
          </div>
          <div className="text-[#F97316] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {displayData.founded || 'N/A'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">מדינה</span>
          </div>
          <div className="text-[#F1F5F9] text-sm">
            {displayData.country || 'N/A'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs">מנכ״ל</span>
          </div>
          <div className="text-[#F1F5F9] text-sm">
            {displayData.ceo || 'N/A'}
          </div>
        </div>

        {displayData.website && displayData.website !== 'N/A' && (
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155] col-span-2">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs">אתר החברה</span>
            </div>
            <a 
              href={displayData.website.startsWith('http') ? displayData.website : `https://${displayData.website}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#06B6D4] hover:text-[#0EA5E9] text-sm transition-colors flex items-center gap-1"
            >
              {displayData.website.replace('https://', '').replace('http://', '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Market Cap (if from API) */}
      {companyData?.marketCap && (
        <div className="bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 rounded-xl p-4 border border-[#10B981]/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[#94A3B8] text-xs mb-1">שווי שוק</div>
              <div className="text-[#10B981] text-2xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                {companyData.marketCap}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-[#10B981]/50" />
          </div>
        </div>
      )}
    </div>
  );
}