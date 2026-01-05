// Stock API Service - Real-time data from TurjiTrade Server
// Server fetches from multiple sources: Yahoo Finance, Finnhub, Alpha Vantage
// NO SIMULATION - 100% REAL DATA ONLY!

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-91e99f90`;

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
  source?: string;
}

export interface StockRecommendation {
  symbol: string;
  signal: string;          // 'קנייה חזקה', 'קנייה', 'המתן', 'מכירה'
  strength: number;        // 0-100
  sourceRating: string;    // 'Strong Buy', 'Buy', 'Hold', etc.
  analysts: number;        // Number of analysts
  targetPrice: number | null;
  currentPrice: number | null;
  potentialGrowth: number; // Percentage
  breakdown?: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  };
  timestamp: number;
  source: string;
  isFallback?: boolean;    // Whether this is fallback data or real Yahoo Finance data
}

// Cache
const priceCache: Map<string, { data: StockQuote; timestamp: number }> = new Map();
const CACHE_DURATION_MARKET_HOURS = 8000; // 8 seconds during market hours (less than 10 sec refresh)
const CACHE_DURATION_OFF_HOURS = 60000; // 60 seconds outside market hours

/**
 * Get cache duration based on market status
 */
function getCacheDuration(): number {
  return isMarketOpen() ? CACHE_DURATION_MARKET_HOURS : CACHE_DURATION_OFF_HOURS;
}

/**
 * Fetch real-time stock price from TurjiTrade server
 * Server tries multiple sources: Yahoo Finance → Finnhub → Alpha Vantage
 */
export async function fetchStockPrice(symbol: string): Promise<StockQuote | null> {
  // Check cache first
  const cached = priceCache.get(symbol);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < getCacheDuration()) {
    return cached.data;
  }

  try {
    // Call our server endpoint
    const url = `${SERVER_URL}/stock/${symbol}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.price) {
      throw new Error(`No data for ${symbol}`);
    }

    const quote: StockQuote = {
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      timestamp: data.timestamp,
      source: data.source
    };

    priceCache.set(symbol, { data: quote, timestamp: now });

    console.log(`✅ ${data.source.toUpperCase()}: ${symbol} = $${quote.price} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent}%)`);

    return quote;
  } catch (error) {
    console.error(`❌ Failed to fetch ${symbol}:`, error);
    
    // Return cached data if available (even if expired)
    if (cached) {
      console.log(`📦 Using cached data for ${symbol}`);
      return cached.data;
    }
    
    return null;
  }
}

/**
 * Fetch multiple stock prices in batch (faster!)
 */
export async function fetchMultipleStockPrices(symbols: string[]): Promise<Map<string, StockQuote>> {
  const results = new Map<string, StockQuote>();

  console.log(`🔄 Fetching REAL prices for ${symbols.length} stocks from server...`);

  try {
    // Call batch endpoint
    const url = `${SERVER_URL}/stocks/batch`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols })
    });

    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      result.data.forEach((quote: any) => {
        const stockQuote: StockQuote = {
          symbol: quote.symbol,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          timestamp: quote.timestamp,
          source: quote.source
        };
        
        priceCache.set(quote.symbol, { data: stockQuote, timestamp: Date.now() });
        results.set(quote.symbol, stockQuote);
      });

      console.log(`✅ Successfully fetched ${result.successful}/${symbols.length} REAL stock prices`);
      
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} stocks failed:`, result.errors);
      }
    }

  } catch (error) {
    console.error('❌ Batch fetch failed:', error);
    
    // Try individual fetches as fallback
    console.log('🔄 Falling back to individual fetches...');
    const promises = symbols.map(symbol => fetchStockPrice(symbol));
    const quotes = await Promise.all(promises);
    
    quotes.forEach(quote => {
      if (quote) {
        results.set(quote.symbol, quote);
      }
    });
  }

  return results;
}

/**
 * Clear price cache
 */
export function clearPriceCache(): void {
  priceCache.clear();
  console.log('🗑️ Price cache cleared');
}

/**
 * Get cached price if available
 */
export function getCachedPrice(symbol: string): StockQuote | null {
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < getCacheDuration()) {
    return cached.data;
  }
  return null;
}

/**
 * Check if using real API
 */
export function isUsingRealAPI(): boolean {
  // We ALWAYS use real API - no simulation mode!
  return true;
}

/**
 * Check if market is open (US market hours)
 * NYSE/NASDAQ: 9:30 AM - 4:00 PM ET = 16:30 - 23:00 Israel Time
 * For simplicity: 16:00 - 23:00 Israel Time, Monday-Friday
 */
export function isMarketOpen(): boolean {
  const now = new Date();
  
  // Convert to Israel timezone (Asia/Jerusalem handles DST automatically)
  const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  
  const day = israelTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = israelTime.getHours();
  const minutes = israelTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // Check if it's a weekday (Sunday-Thursday in Israel, but US market is Monday-Friday)
  // Sunday in Israel = Monday morning in US (market closed)
  // So we check: Monday(1) - Friday(5)
  if (day === 0 || day === 6) {
    return false; // Weekend (Saturday/Sunday in Israel)
  }

  // Check for US Market Holidays (Fixed Dates)
  const month = israelTime.getMonth(); // 0-11
  const date = israelTime.getDate();   // 1-31

  // New Year's Day (Jan 1)
  if (month === 0 && date === 1) {
    console.log(`🔴 שוק סגור - חג השנה החדשה (${israelTime.toLocaleDateString('he-IL')})`);
    return false;
  }
  // Independence Day (July 4)
  if (month === 6 && date === 4) {
    console.log(`🔴 שוק סגור - יום העצמאות ארה"ב (${israelTime.toLocaleDateString('he-IL')})`);
    return false;
  }
  // Christmas Day (Dec 25)
  if (month === 11 && date === 25) {
    console.log(`🔴 שוק סגור - חג המולד (${israelTime.toLocaleDateString('he-IL')})`);
    return false;
  }
  
  // Market hours in Israel time: 16:00 - 23:00
  const marketOpen = 16 * 60;      // 16:00 = 960 minutes
  const marketClose = 23 * 60;     // 23:00 = 1380 minutes
  
  const isOpen = totalMinutes >= marketOpen && totalMinutes < marketClose;
  
  if (isOpen) {
    console.log(`🟢 שוק פתוח - עדכון כל 10 שניות (${israelTime.toLocaleTimeString('he-IL')})`);
  }
  
  return isOpen;
}

/**
 * Alias for fetchStockPrice
 */
export const fetchStockQuote = fetchStockPrice;

// ===========================
// STOCK RECOMMENDATIONS API
// ===========================

// Recommendations cache
const recommendationsCache: Map<string, { data: StockRecommendation; timestamp: number }> = new Map();
const RECOMMENDATIONS_CACHE_DURATION = 300000; // 5 minutes (recommendations change slowly)

/**
 * Fetch stock recommendation from Yahoo Finance via TurjiTrade server
 */
export async function fetchStockRecommendation(symbol: string): Promise<StockRecommendation | null> {
  // Check cache first
  const cached = recommendationsCache.get(symbol);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < RECOMMENDATIONS_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const url = `${SERVER_URL}/recommendations/${symbol}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`No recommendations for ${symbol}`);
    }

    const recommendation: StockRecommendation = {
      symbol: data.symbol,
      signal: data.signal,
      strength: data.strength,
      sourceRating: data.sourceRating,
      analysts: data.analysts,
      targetPrice: data.targetPrice,
      currentPrice: data.currentPrice,
      potentialGrowth: data.potentialGrowth,
      breakdown: data.breakdown,
      timestamp: data.timestamp,
      source: data.source,
      isFallback: data.isFallback // Include fallback flag from server
    };

    recommendationsCache.set(symbol, { data: recommendation, timestamp: now });

    console.log(`💡 Yahoo Recommendation: ${symbol} = ${recommendation.signal} (${recommendation.strength}/100) by ${recommendation.analysts} analysts`);

    return recommendation;
  } catch (error) {
    console.error(`❌ Failed to fetch recommendation for ${symbol}:`, error);
    
    // Return cached data if available (even if expired)
    if (cached) {
      console.log(`📦 Using cached recommendation for ${symbol}`);
      return cached.data;
    }
    
    return null;
  }
}

/**
 * Fetch multiple stock recommendations in batch
 */
export async function fetchMultipleStockRecommendations(symbols: string[]): Promise<Map<string, StockRecommendation>> {
  const results = new Map<string, StockRecommendation>();

  console.log(`💡 Fetching Yahoo Finance recommendations for ${symbols.length} stocks...`);

  try {
    const url = `${SERVER_URL}/recommendations/batch`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols })
    });

    if (!response.ok) {
      throw new Error(`Batch recommendations failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      result.data.forEach((rec: any) => {
        const recommendation: StockRecommendation = {
          symbol: rec.symbol,
          signal: rec.signal,
          strength: rec.strength,
          sourceRating: rec.sourceRating,
          analysts: rec.analysts,
          targetPrice: rec.targetPrice,
          currentPrice: rec.currentPrice,
          potentialGrowth: rec.potentialGrowth,
          breakdown: rec.breakdown,
          timestamp: rec.timestamp,
          source: rec.source,
          isFallback: rec.isFallback // Include fallback flag from server
        };
        
        recommendationsCache.set(rec.symbol, { data: recommendation, timestamp: Date.now() });
        results.set(rec.symbol, recommendation);
      });

      console.log(`✅ Successfully fetched ${result.successful}/${symbols.length} recommendations from Yahoo Finance`);
      
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} recommendations failed:`, result.errors);
      }
    }

  } catch (error) {
    console.error('❌ Batch recommendations fetch failed:', error);
    
    // Try individual fetches as fallback
    console.log('🔄 Falling back to individual recommendation fetches...');
    const promises = symbols.map(symbol => fetchStockRecommendation(symbol));
    const recommendations = await Promise.all(promises);
    
    recommendations.forEach(rec => {
      if (rec) {
        results.set(rec.symbol, rec);
      }
    });
  }

  return results;
}

/**
 * Clear recommendations cache
 */
export function clearRecommendationsCache(): void {
  recommendationsCache.clear();
  console.log('🗑️ Recommendations cache cleared');
}

// ===== FINANCIAL DATA API =====

export interface CompanyFinancials {
  symbol: string;
  marketCap: string;
  revenue: string;
  netIncome: string;
  peRatio: string;
  eps: string;
  dividend: string;
  debtToEquity: string;
  profitMargin: string;
  operatingMargin: string;
  source: string;
  timestamp: number;
}

const financialsCache: Map<string, { data: CompanyFinancials; timestamp: number }> = new Map();
const FINANCIALS_CACHE_DURATION = 3600000; // 1 hour cache for financial data

/**
 * Fetch company financial data from TurjiTrade server
 * Server fetches from Finnhub, Yahoo Finance, and Alpha Vantage
 */
export async function fetchCompanyFinancials(symbol: string): Promise<CompanyFinancials | null> {
  // Check cache first
  const cached = financialsCache.get(symbol);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < FINANCIALS_CACHE_DURATION) {
    console.log(`📦 Using cached financials for ${symbol}`);
    return cached.data;
  }

  try {
    // Call our server endpoint
    const url = `${SERVER_URL}/financials/${symbol}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.financials) {
      throw new Error(`No financial data for ${symbol}`);
    }

    const financials: CompanyFinancials = {
      symbol: data.symbol,
      marketCap: data.financials.marketCap || 'N/A',
      revenue: data.financials.revenue || 'N/A',
      netIncome: data.financials.netIncome || 'N/A',
      peRatio: data.financials.peRatio || 'N/A',
      eps: data.financials.eps || 'N/A',
      dividend: data.financials.dividend || 'אין דיבידנד',
      debtToEquity: data.financials.debtToEquity || 'N/A',
      profitMargin: data.financials.profitMargin || 'N/A',
      operatingMargin: data.financials.operatingMargin || 'N/A',
      source: data.source || 'finnhub',
      timestamp: now
    };

    financialsCache.set(symbol, { data: financials, timestamp: now });

    console.log(`💰 ${data.source.toUpperCase()}: Financials for ${symbol} fetched successfully`);

    return financials;
  } catch (error) {
    console.error(`❌ Failed to fetch financials for ${symbol}:`, error);
    
    // Return cached data if available (even if expired)
    if (cached) {
      console.log(`📦 Using expired cached financials for ${symbol}`);
      return cached.data;
    }
    
    return null;
  }
}

/**
 * Clear financials cache
 */
export function clearFinancialsCache(): void {
  financialsCache.clear();
  console.log('🗑️ Financials cache cleared');
}