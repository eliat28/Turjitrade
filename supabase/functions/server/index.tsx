import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import Groq from "npm:groq-sdk";
import * as kv from "./kv_store.tsx";
const api = new Hono();

// Health check endpoint
api.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// ===========================
// MARKET STATUS & HOURS
// Check if US stock market is open
// ===========================

/**
 * US Stock Market Holidays for 2024-2026
 * NYSE and NASDAQ are closed on these days
 */
const marketHolidays2024 = [
  '2024-01-01', // New Year's Day
  '2024-01-15', // MLK Day
  '2024-02-19', // Presidents Day
  '2024-03-29', // Good Friday
  '2024-05-27', // Memorial Day
  '2024-06-19', // Juneteenth
  '2024-07-04', // Independence Day
  '2024-09-02', // Labor Day
  '2024-11-28', // Thanksgiving
  '2024-12-25', // Christmas
];

const marketHolidays2025 = [
  '2025-01-01', // New Year's Day
  '2025-01-20', // MLK Day
  '2025-02-17', // Presidents Day
  '2025-04-18', // Good Friday
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-11-27', // Thanksgiving
  '2025-12-25', // Christmas
];

const marketHolidays2026 = [
  '2026-01-01', // New Year's Day
  '2026-01-19', // MLK Day
  '2026-02-16', // Presidents Day
  '2026-04-03', // Good Friday
  '2026-05-25', // Memorial Day
  '2026-06-19', // Juneteenth
  '2026-07-03', // Independence Day (observed)
  '2026-09-07', // Labor Day
  '2026-11-26', // Thanksgiving
  '2026-12-25', // Christmas
];

const allMarketHolidays = [
  ...marketHolidays2024,
  ...marketHolidays2025,
  ...marketHolidays2026
];

/**
 * Check if the US stock market is currently open
 * Market hours: 9:30 AM - 4:00 PM EST (Mon-Fri)
 * Excludes holidays
 */
function isMarketOpen(): {
  isOpen: boolean;
  status: string;
  statusHebrew: string;
  nextOpen?: string;
  nextClose?: string;
  reason?: string;
  currentTime: string;
  marketTimeEST: string;
} {
  // Get current time in EST/EDT (New York timezone)
  const now = new Date();
  const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  // Format for display
  const currentTimeStr = now.toLocaleString('he-IL', { 
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const marketTimeStr = estTime.toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = estTime.getDay();
  
  // Check if it's a weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      isOpen: false,
      status: 'Weekend - Market Closed',
      statusHebrew: 'סוף שבוע - השוק סגור',
      reason: dayOfWeek === 0 ? 'Sunday' : 'Saturday',
      currentTime: currentTimeStr,
      marketTimeEST: marketTimeStr,
      nextOpen: 'Monday 9:30 AM EST'
    };
  }

  // Check if it's a holiday
  const dateStr = estTime.toISOString().split('T')[0]; // YYYY-MM-DD format
  if (allMarketHolidays.includes(dateStr)) {
    let holidayName = 'Market Holiday';
    if (dateStr.includes('-12-25')) holidayName = 'Christmas';
    else if (dateStr.includes('-01-01')) holidayName = 'New Year\'s Day';
    else if (dateStr.includes('-07-04') || dateStr.includes('-07-03')) holidayName = 'Independence Day';
    else if (dateStr.includes('-11-2')) holidayName = 'Thanksgiving';
    
    return {
      isOpen: false,
      status: `Holiday - Market Closed (${holidayName})`,
      statusHebrew: `חג - השוק סגור (${holidayName})`,
      reason: holidayName,
      currentTime: currentTimeStr,
      marketTimeEST: marketTimeStr,
      nextOpen: 'Next business day 9:30 AM EST'
    };
  }

  // Get current hour and minute in EST
  const hours = estTime.getHours();
  const minutes = estTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes)
  const marketOpen = 9 * 60 + 30; // 9:30 AM = 570 minutes
  const marketClose = 16 * 60; // 4:00 PM = 960 minutes

  if (timeInMinutes < marketOpen) {
    // Pre-market
    const minutesUntilOpen = marketOpen - timeInMinutes;
    const hoursUntil = Math.floor(minutesUntilOpen / 60);
    const minsUntil = minutesUntilOpen % 60;
    
    return {
      isOpen: false,
      status: `Pre-Market - Opens in ${hoursUntil}h ${minsUntil}m`,
      statusHebrew: `לפני פתיחה - נפתח בעוד ${hoursUntil} שעות ו-${minsUntil} דקות`,
      reason: 'Pre-Market Hours',
      currentTime: currentTimeStr,
      marketTimeEST: marketTimeStr,
      nextOpen: 'Today 9:30 AM EST'
    };
  } else if (timeInMinutes >= marketOpen && timeInMinutes < marketClose) {
    // Market is open!
    const minutesUntilClose = marketClose - timeInMinutes;
    const hoursUntil = Math.floor(minutesUntilClose / 60);
    const minsUntil = minutesUntilClose % 60;
    
    return {
      isOpen: true,
      status: `Market Open - Closes in ${hoursUntil}h ${minsUntil}m`,
      statusHebrew: `השוק פתוח - נסגר בעוד ${hoursUntil} שעות ו-${minsUntil} דקות`,
      currentTime: currentTimeStr,
      marketTimeEST: marketTimeStr,
      nextClose: 'Today 4:00 PM EST'
    };
  } else {
    // After-market
    return {
      isOpen: false,
      status: 'After-Hours - Market Closed',
      statusHebrew: 'אחרי שעות המסחר - השוק סגור',
      reason: 'After-Market Hours',
      currentTime: currentTimeStr,
      marketTimeEST: marketTimeStr,
      nextOpen: 'Tomorrow 9:30 AM EST'
    };
  }
}

// GET market status endpoint
api.get("/market-status", (c) => {
  const status = isMarketOpen();
  
  console.log(`🕐 Market Status: ${status.status}`);
  
  return c.json({
    success: true,
    ...status
  });
});

// ===========================
// STOCK PRICE ENDPOINTS
// Real-time stock prices from multiple sources
// ===========================

/**
 * Fetch stock price from Yahoo Finance (Primary Source)
 */
async function fetchFromYahoo(symbol: string): Promise<any> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) throw new Error(`Yahoo Finance HTTP ${response.status}`);

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result?.meta) throw new Error('No data from Yahoo');

    const meta = result.meta;
    const price = meta.regularMarketPrice || meta.previousClose;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    const change = price - previousClose;
    const changePercent = ((price - previousClose) / previousClose) * 100;

    return {
      success: true,
      source: 'yahoo',
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now()
    };
  } catch (error) {
    console.log(`❌ Yahoo Finance failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch stock price from Finnhub (Backup Source)
 */
async function fetchFromFinnhub(symbol: string): Promise<any> {
  try {
    const apiKey = Deno.env.get('FINNHUB_API_KEY') || 'd53vobhr01qlj849uq60d53vobhr01qlj849uq6g';
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Finnhub HTTP ${response.status}`);

    const data = await response.json();
    if (!data.c) throw new Error('No data from Finnhub');

    const price = data.c;
    const previousClose = data.pc;
    const change = price - previousClose;
    const changePercent = ((price - previousClose) / previousClose) * 100;

    return {
      success: true,
      source: 'finnhub',
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now()
    };
  } catch (error) {
    console.log(`❌ Finnhub failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch stock price from Alpha Vantage (Third Source)
 */
async function fetchFromAlphaVantage(symbol: string): Promise<any> {
  try {
    // Free API key - rate limited to 25 requests per day
    const apiKey = 'demo'; // Using demo key, users can add their own
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Alpha Vantage HTTP ${response.status}`);

    const data = await response.json();
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) throw new Error('No data from Alpha Vantage');

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    return {
      success: true,
      source: 'alphavantage',
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now()
    };
  } catch (error) {
    console.log(`❌ Alpha Vantage failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch stock price from Polygon.io (Fourth Source)
 * Great for Previous Close data reliability
 */
async function fetchFromPolygon(symbol: string): Promise<any> {
  try {
    const apiKey = Deno.env.get('POLYGON_API_KEY');
    if (!apiKey) throw new Error('POLYGON_API_KEY not set');

    // Polygon Free Tier: "Previous Close" is the most reliable endpoint
    // Real-time (v2/last/trade) often requires a paid subscription for stocks
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`;
    
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Polygon HTTP ${response.status}`);

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error('No data from Polygon');
    }

    const result = data.results[0];
    const price = result.c; // Close price
    const open = result.o;
    const change = price - open; // Approx change for the day
    const changePercent = open !== 0 ? ((price - open) / open) * 100 : 0;

    return {
      success: true,
      source: 'polygon',
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now(),
      high: result.h,
      low: result.l,
      volume: result.v
    };
  } catch (error) {
    console.log(`❌ Polygon failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch stock price from Financial Modeling Prep (Backup Source)
 * Good for real-time price and detailed financials
 */
async function fetchFromFMP(symbol: string): Promise<any> {
  try {
    const apiKey = Deno.env.get('FMP_API_KEY');
    if (!apiKey) throw new Error('FMP_API_KEY not set');

    const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`FMP HTTP ${response.status}`);

    const data = await response.json();
    if (!data || data.length === 0) throw new Error('No data from FMP');

    const quote = data[0];
    const price = quote.price;
    const change = quote.changesPercentage; // FMP gives change amount in 'change', percentage in 'changesPercentage'
    const changeAmount = quote.change; 

    return {
      success: true,
      source: 'fmp',
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(changeAmount.toFixed(2)),
      changePercent: parseFloat(change.toFixed(2)),
      name: quote.name,
      marketCap: quote.marketCap,
      pe: quote.pe,
      eps: quote.eps,
      exchange: quote.exchange,
      timestamp: Date.now()
    };
  } catch (error) {
    console.log(`❌ FMP failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch stock price from MarketStack (Backup Source)
 * Note: Free tier is often End-of-Day (EOD) only
 */
async function fetchFromMarketStack(symbol: string): Promise<any> {
  try {
    const apiKey = Deno.env.get('MARKETSTACK_API_KEY');
    if (!apiKey) throw new Error('MARKETSTACK_API_KEY not set');

    // Try Intraday first (if plan allows), fallback to EOD happens naturally if 403/limit hit usually, 
    // but for free tier let's use EOD to be safe or try both. 
    // Let's try EOD as it's most likely to work on free tier.
    const url = `http://api.marketstack.com/v1/eod/latest?access_key=${apiKey}&symbols=${symbol}`;
    
    const response = await fetch(url);

    if (!response.ok) throw new Error(`MarketStack HTTP ${response.status}`);

    const result = await response.json();
    if (result.error) throw new Error(result.error.message);
    
    const data = result.data?.[0];
    if (!data) throw new Error('No data from MarketStack');

    const price = data.close;
    const open = data.open;
    const change = price - open;
    const changePercent = open !== 0 ? ((price - open) / open) * 100 : 0;

    return {
      success: true,
      source: 'marketstack',
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now(), // Note: This might be yesterday's close if EOD
      isEOD: true
    };
  } catch (error) {
    console.log(`❌ MarketStack failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch Stock News from NewsAPI
 */
async function fetchStockNews(symbol: string): Promise<any> {
  try {
    const apiKey = Deno.env.get('NEWS_API_KEY');
    if (!apiKey) throw new Error('NEWS_API_KEY not set');

    // Search for the symbol AND (stock OR finance) to filter relevance
    const query = `${symbol} AND (stock OR market OR finance)`;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`NewsAPI HTTP ${response.status}`);

    const data = await response.json();
    if (data.status !== 'ok') throw new Error(data.message || 'NewsAPI error');

    return {
      success: true,
      articles: data.articles.map((a: any) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source.name,
        publishedAt: a.publishedAt,
        image: a.urlToImage
      }))
    };
  } catch (error) {
    console.log(`❌ NewsAPI failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch real-time stock price from best available source
 * Tries: Yahoo -> Finnhub -> Alpha Vantage -> Polygon -> FMP -> MarketStack
 */
async function fetchRobustStockPrice(symbol: string): Promise<any> {
  // Try Yahoo Finance first (most reliable and free)
  let result = await fetchFromYahoo(symbol);
  
  // If Yahoo fails, try FMP (Strong backup provided by user)
  if (!result.success) {
    console.log(`🔄 Trying FMP for ${symbol}...`);
    result = await fetchFromFMP(symbol);
  }

  // If FMP fails, try Polygon.io
  if (!result.success) {
    console.log(`🔄 Trying Polygon.io for ${symbol}...`);
    result = await fetchFromPolygon(symbol);
  }

  // If Polygon fails, try Finnhub
  if (!result.success) {
    console.log(`🔄 Trying Finnhub for ${symbol}...`);
    result = await fetchFromFinnhub(symbol);
  }

  // If Finnhub fails, try MarketStack
  if (!result.success) {
    console.log(`🔄 Trying MarketStack for ${symbol}...`);
    result = await fetchFromMarketStack(symbol);
  }

  // If all above fail, try Alpha Vantage (Least reliable due to demo key)
  if (!result.success) {
    console.log(`🔄 Trying Alpha Vantage for ${symbol}...`);
    result = await fetchFromAlphaVantage(symbol);
  }
  
  return result;
}

/**
 * Fetch Macroeconomic Data from FRED (Federal Reserve Economic Data)
 * Returns key indicators like Interest Rates, Inflation, VIX equivalent
 */
async function fetchFredMacroData(): Promise<any> {
  try {
    const apiKey = Deno.env.get('FRED_API_KEY');
    if (!apiKey) return { success: false, error: 'FRED_API_KEY not set' };

    // Series IDs: 
    // DGS10 = 10-Year Treasury Constant Maturity Rate
    // FEDFUNDS = Federal Funds Effective Rate
    // T10Y2Y = 10-Year Minus 2-Year Treasury Yield Spread
    
    const series = ['DGS10', 'FEDFUNDS', 'T10Y2Y'];
    const results: any = {};

    await Promise.all(series.map(async (id) => {
      try {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.observations && data.observations.length > 0) {
           results[id] = parseFloat(data.observations[0].value);
        }
      } catch (e) {
        console.error(`FRED fetch failed for ${id}:`, e);
      }
    }));

    return {
      success: true,
      source: 'fred',
      timestamp: Date.now(),
      data: {
        us10Y: results['DGS10'] || null,
        fedRate: results['FEDFUNDS'] || null,
        yieldCurve: results['T10Y2Y'] || null
      }
    };
  } catch (error) {
    console.log('❌ FRED Macro Data failed:', error.message);
    return { success: false, error: error.message };
  }
}

// GET single stock price - tries multiple sources
api.get("/stock/:symbol", async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  
  console.log(`📊 Fetching price for ${symbol}...`);

  const result = await fetchRobustStockPrice(symbol);

  // If all sources fail
  if (!result.success) {
    return c.json({ 
      error: 'All data sources failed', 
      symbol,
      message: 'Unable to fetch real-time data. Please try again.'
    }, 503);
  }

  console.log(`✅ Success: ${symbol} = $${result.price} from ${result.source}`);
  return c.json(result);
});

// GET Macroeconomic Data (FRED)
api.get("/market-macro", async (c) => {
  const data = await fetchFredMacroData();
  return c.json(data);
});

// GET Stock News
api.get("/news/:symbol", async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  const data = await fetchStockNews(symbol);
  return c.json(data);
});

// POST batch stock prices - fetch multiple stocks at once
api.post("/stocks/batch", async (c) => {
  try {
    const body = await c.req.json();
    const symbols = body.symbols || [];

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return c.json({ error: 'Invalid symbols array' }, 400);
    }

    console.log(`📊 Fetching batch prices for ${symbols.length} stocks...`);

    // Fetch all in parallel
    const results = await Promise.all(
      symbols.map(async (symbol: string) => {
        const upperSymbol = symbol.toUpperCase();
        
        // Try Yahoo first
        let result = await fetchFromYahoo(upperSymbol);
        
        // Fallback to Finnhub if Yahoo fails
        if (!result.success) {
          result = await fetchFromFinnhub(upperSymbol);
        }

        return result;
      })
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Batch complete: ${successful.length}/${symbols.length} successful`);

    return c.json({
      success: true,
      total: symbols.length,
      successful: successful.length,
      failed: failed.length,
      data: successful,
      errors: failed.map(f => ({ symbol: f.symbol, error: f.error }))
    });
  } catch (error) {
    console.error('❌ Batch request error:', error);
    return c.json({ error: 'Batch request failed', message: error.message }, 500);
  }
});

// ===========================
// HISTORICAL DATA ENDPOINT
// Fetch historical candles from multiple real sources (NO synthetic data)
// ===========================

/**
 * Fetch historical data from Yahoo Finance (Primary - Free & Reliable)
 */
async function fetchHistoricalFromYahoo(symbol: string, days: number): Promise<any> {
  try {
    // Calculate date range
    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);
    
    // Yahoo Finance API for historical data
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${from}&period2=${to}`;
    console.log(`[Yahoo History] Fetching ${days} days for ${symbol}...`);
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    
    if (!result?.timestamp || !result?.indicators?.quote?.[0]) {
      throw new Error('No historical data from Yahoo');
    }

    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    // Yahoo returns: open, high, low, close, volume arrays
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    // Filter out null values and ensure we have data
    const validDataPoints = timestamps
      .map((t: number, i: number) => ({
        t, o: opens[i], h: highs[i], l: lows[i], c: closes[i], v: volumes[i]
      }))
      .filter((point: any) => 
        point.c !== null && point.c !== undefined && !isNaN(point.c)
      );

    if (validDataPoints.length === 0) {
      throw new Error('No valid data points from Yahoo');
    }

    // Convert to Finnhub format for consistency
    const formattedData = {
      s: 'ok',
      t: validDataPoints.map((p: any) => p.t),
      o: validDataPoints.map((p: any) => Number((p.o || p.c).toFixed(2))),
      h: validDataPoints.map((p: any) => Number((p.h || p.c).toFixed(2))),
      l: validDataPoints.map((p: any) => Number((p.l || p.c).toFixed(2))),
      c: validDataPoints.map((p: any) => Number(p.c.toFixed(2))),
      v: validDataPoints.map((p: any) => Math.floor(p.v || 0)),
      source: 'yahoo',
      symbol
    };

    console.log(`✅ Yahoo History: ${symbol} - ${formattedData.c.length} real candles`);
    return { success: true, data: formattedData };
  } catch (error) {
    console.log(`❌ Yahoo History failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch historical data from Finnhub (Backup)
 */
async function fetchHistoricalFromFinnhub(symbol: string, days: number): Promise<any> {
  try {
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    
    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY not configured');
    }
    
    // Calculate timestamps
    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);
    
    // Fetch from Finnhub
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    console.log(`[Finnhub History] Fetching ${days} days for ${symbol}...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.s === 'ok' && data.c && data.c.length > 0) {
      console.log(`✅ Finnhub History: ${symbol} - ${data.c.length} real candles`);
      data.source = 'finnhub';
      data.symbol = symbol;
      return { success: true, data };
    } else if (data.s === 'no_data') {
      throw new Error('No data available from Finnhub');
    } else {
      throw new Error(`Finnhub returned status: ${data.s || 'undefined'}`);
    }
  } catch (error) {
    console.log(`❌ Finnhub History failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch historical data from Alpha Vantage (Third source)
 */
async function fetchHistoricalFromAlphaVantage(symbol: string, days: number): Promise<any> {
  try {
    // Note: Alpha Vantage free tier is limited to 25 requests/day
    // Users can add their own API key via environment variable
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY') || 'demo';
    
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;
    console.log(`[AlphaVantage History] Fetching data for ${symbol}...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const timeSeries = data['Time Series (Daily)'];
    
    if (!timeSeries) {
      throw new Error('No time series data from Alpha Vantage');
    }
    
    // Convert Alpha Vantage format to our standard format
    const dates = Object.keys(timeSeries).sort().slice(-days);
    
    if (dates.length === 0) {
      throw new Error('No valid dates in Alpha Vantage data');
    }
    
    const formattedData = {
      s: 'ok',
      t: dates.map(date => Math.floor(new Date(date).getTime() / 1000)),
      o: dates.map(date => Number(parseFloat(timeSeries[date]['1. open']).toFixed(2))),
      h: dates.map(date => Number(parseFloat(timeSeries[date]['2. high']).toFixed(2))),
      l: dates.map(date => Number(parseFloat(timeSeries[date]['3. low']).toFixed(2))),
      c: dates.map(date => Number(parseFloat(timeSeries[date]['4. close']).toFixed(2))),
      v: dates.map(date => parseInt(timeSeries[date]['5. volume'])),
      source: 'alphavantage',
      symbol
    };
    
    console.log(`✅ AlphaVantage History: ${symbol} - ${formattedData.c.length} real candles`);
    return { success: true, data: formattedData };
  } catch (error) {
    console.log(`❌ AlphaVantage History failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

// GET historical candle data - tries multiple REAL sources only
api.get("/stock/:symbol/history", async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  const days = parseInt(c.req.query('days') || '30');
  
  console.log(`📈 Fetching ${days} days of REAL historical data for ${symbol}...`);
  
  // Try Yahoo Finance first (free, unlimited, most reliable)
  let result = await fetchHistoricalFromYahoo(symbol, days);
  
  // If Yahoo fails, try Finnhub
  if (!result.success) {
    console.log(`🔄 Trying Finnhub for ${symbol} history...`);
    result = await fetchHistoricalFromFinnhub(symbol, days);
  }
  
  // If both fail, try Alpha Vantage
  if (!result.success) {
    console.log(`🔄 Trying Alpha Vantage for ${symbol} history...`);
    result = await fetchHistoricalFromAlphaVantage(symbol, days);
  }
  
  // If all real sources fail, return clear error (NO SYNTHETIC DATA)
  if (!result.success) {
    console.error(`❌ All real data sources failed for ${symbol} historical data`);
    return c.json({ 
      s: 'error',
      symbol,
      error: 'Unable to fetch real historical data from any source',
      message: 'נתוני היסטוריה לא זמינים כרגע. אנא נסה שוב מאוחר יותר.',
      attempted: ['Yahoo Finance', 'Finnhub', 'Alpha Vantage']
    }, 503);
  }
  
  // Return real data with source attribution
  console.log(`✅ Successfully fetched ${result.data.c.length} real historical candles for ${symbol} from ${result.data.source}`);
  return c.json(result.data);
});

// ===========================
// STOCK RECOMMENDATIONS ENDPOINT
// Yahoo Finance recommendations and analysis
// ===========================

/**
 * Fetch stock recommendations from Yahoo Finance
 */
async function fetchYahooRecommendations(symbol: string): Promise<any> {
  try {
    // Yahoo Finance API endpoint for recommendations
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=recommendationTrend,financialData,defaultKeyStatistics`;
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com'
      }
    });

    if (!response.ok) {
      // Return neutral recommendation as fallback
      console.log(`⚠️ Yahoo Finance returned ${response.status} for ${symbol}, using fallback`);
      return {
        success: true,
        source: 'yahoo',
        symbol,
        signal: 'המתן',
        strength: 50,
        sourceRating: 'Hold',
        analysts: 0,
        targetPrice: null,
        currentPrice: null,
        potentialGrowth: 0,
        breakdown: {
          strongBuy: 0,
          buy: 0,
          hold: 0,
          sell: 0,
          strongSell: 0
        },
        timestamp: Date.now(),
        isFallback: true
      };
    }

    const data = await response.json();
    const result = data?.quoteSummary?.result?.[0];
    
    if (!result) throw new Error('No recommendation data');

    const recommendation = result.recommendationTrend?.trend?.[0];
    const financialData = result.financialData;
    const keyStats = result.defaultKeyStatistics;

    // Calculate recommendation signal
    const strongBuy = recommendation?.strongBuy || 0;
    const buy = recommendation?.buy || 0;
    const hold = recommendation?.hold || 0;
    const sell = recommendation?.sell || 0;
    const strongSell = recommendation?.strongSell || 0;
    
    const totalAnalysts = strongBuy + buy + hold + sell + strongSell;
    const bullishScore = (strongBuy * 5 + buy * 4 + hold * 3 + sell * 2 + strongSell * 1) / totalAnalysts;
    
    // Determine signal in Hebrew
    let signal = 'המתן';
    let strength = Math.round(bullishScore * 20); // Convert to 0-100 scale
    
    if (bullishScore >= 4.2) {
      signal = 'קנייה חזקה';
    } else if (bullishScore >= 3.5) {
      signal = 'קנייה';
    } else if (bullishScore >= 2.5) {
      signal = 'המתן';
    } else {
      signal = 'מכירה';
    }

    // Extract target price and current price
    const targetPrice = financialData?.targetMeanPrice?.raw || null;
    const currentPrice = financialData?.currentPrice?.raw || null;
    
    // Calculate potential growth
    let potentialGrowth = 0;
    if (targetPrice && currentPrice) {
      potentialGrowth = Math.round(((targetPrice - currentPrice) / currentPrice) * 100);
    }

    // Yahoo Finance recommendation rating
    const recommendationKey = financialData?.recommendationKey || 'hold';
    const ratingMap: { [key: string]: string } = {
      'strong_buy': 'Strong Buy',
      'buy': 'Buy',
      'hold': 'Hold',
      'sell': 'Sell',
      'strong_sell': 'Strong Sell'
    };
    const sourceRating = ratingMap[recommendationKey] || 'Hold';

    return {
      success: true,
      source: 'yahoo',
      symbol,
      signal,
      strength,
      sourceRating,
      analysts: totalAnalysts,
      targetPrice: targetPrice ? parseFloat(targetPrice.toFixed(2)) : null,
      currentPrice: currentPrice ? parseFloat(currentPrice.toFixed(2)) : null,
      potentialGrowth,
      breakdown: {
        strongBuy,
        buy,
        hold,
        sell,
        strongSell
      },
      timestamp: Date.now(),
      isFallback: false // This is real Yahoo Finance data
    };
  } catch (error) {
    console.log(`❌ Yahoo recommendations failed for ${symbol}:`, error.message);
    return { success: false, symbol, error: error.message };
  }
}

// GET stock recommendations from Yahoo Finance
api.get("/recommendations/:symbol", async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  
  console.log(`💡 Fetching recommendations for ${symbol}...`);

  const result = await fetchYahooRecommendations(symbol);

  if (!result.success) {
    return c.json({ 
      error: 'Failed to fetch recommendations', 
      symbol,
      message: 'Unable to fetch recommendation data. Please try again.'
    }, 503);
  }

  console.log(`✅ Recommendations: ${symbol} = ${result.signal} (${result.strength}/100)`);
  return c.json(result);
});

// ===========================
// CHART DATA ENDPOINT
// Fetch historical chart data for TurjiTrade Chart
// ===========================

api.get("/chart-data", async (c) => {
  const symbol = c.req.query('symbol')?.toUpperCase();
  const from = parseInt(c.req.query('from') || '0');
  const to = parseInt(c.req.query('to') || '0');
  
  if (!symbol || !from || !to) {
    return c.json({ 
      error: 'Missing required parameters: symbol, from, to' 
    }, 400);
  }
  
  const days = Math.ceil((to - from) / (24 * 60 * 60));
  console.log(`📊 [Chart Data Request] Symbol: ${symbol}, Days: ${days}, From: ${new Date(from * 1000).toISOString()}, To: ${new Date(to * 1000).toISOString()}`);
  
  // Try Yahoo Finance first (free, unlimited, most reliable)
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${from}&period2=${to}`;
    console.log(`[Yahoo Chart] Fetching for ${symbol}...`);
    
    const yahooResponse = await fetch(yahooUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (yahooResponse.ok) {
      const data = await yahooResponse.json();
      const result = data?.chart?.result?.[0];
      
      if (result?.timestamp && result?.indicators?.quote?.[0]) {
        const timestamps = result.timestamp;
        const quote = result.indicators.quote[0];
        const closes = quote.close || [];

        const validDataPoints = timestamps
          .map((t: number, i: number) => ({
            timestamp: t,
            price: closes[i]
          }))
          .filter((point: any) => 
            point.price !== null && point.price !== undefined && !isNaN(point.price)
          );

        if (validDataPoints.length > 0) {
          const chartData = validDataPoints.map((point: any) => {
            const date = new Date(point.timestamp * 1000);
            return {
              timestamp: point.timestamp,
              date: date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
              time: date.toLocaleDateString('he-IL', { day: '2-digit', month: 'short' }),
              price: Number(point.price.toFixed(2)),
            };
          });

          console.log(`✅ Yahoo Chart: ${symbol} - ${chartData.length} real candles retrieved`);
          console.log(`📊 Price range: $${Math.min(...chartData.map(d => d.price)).toFixed(2)} - $${Math.max(...chartData.map(d => d.price)).toFixed(2)}`);
          console.log(`📊 First point: ${chartData[0].time} @ $${chartData[0].price}`);
          console.log(`📊 Last point: ${chartData[chartData.length - 1].time} @ $${chartData[chartData.length - 1].price}`);
          
          return c.json({
            s: 'ok',
            symbol,
            data: chartData,
            source: 'yahoo',
            dataPoints: chartData.length,
            dateRange: {
              from: chartData[0].time,
              to: chartData[chartData.length - 1].time
            }
          });
        }
      }
    }
    
    console.log(`⚠️ Yahoo Finance chart failed for ${symbol}, trying Finnhub...`);
  } catch (error) {
    console.log(`⚠️ Yahoo Finance chart error for ${symbol}:`, error.message);
  }
  
  // Fallback to Finnhub if Yahoo fails
  try {
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    
    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY not configured');
    }
    
    console.log(`[Finnhub Chart] Fetching for ${symbol}...`);
    const finnhubUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    
    const finnhubResponse = await fetch(finnhubUrl);
    
    if (!finnhubResponse.ok) {
      throw new Error(`Finnhub API returned ${finnhubResponse.status}`);
    }
    
    const result = await finnhubResponse.json();
    
    if (result.s === 'no_data' || !result.t || result.t.length === 0) {
      console.log(`⚠️ No data available for ${symbol}`);
      return c.json({ 
        s: 'no_data',
        error: 'No data available for this symbol' 
      });
    }
    
    if (result.s !== 'ok') {
      throw new Error('Invalid response from Finnhub');
    }
    
    const chartData = result.t.map((timestamp: number, index: number) => {
      const date = new Date(timestamp * 1000);
      return {
        timestamp,
        date: date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
        time: date.toLocaleDateString('he-IL', { day: '2-digit', month: 'short' }),
        price: Number(result.c[index].toFixed(2)),
      };
    });
    
    console.log(`✅ Finnhub Chart: ${symbol} - ${chartData.length} real candles retrieved`);
    console.log(`📊 Price range: $${Math.min(...chartData.map(d => d.price)).toFixed(2)} - $${Math.max(...chartData.map(d => d.price)).toFixed(2)}`);
    console.log(`📊 First point: ${chartData[0].time} @ $${chartData[0].price}`);
    console.log(`📊 Last point: ${chartData[chartData.length - 1].time} @ $${chartData[chartData.length - 1].price}`);
    
    return c.json({
      s: 'ok',
      symbol,
      data: chartData,
      source: 'finnhub',
      dataPoints: chartData.length,
      dateRange: {
        from: chartData[0].time,
        to: chartData[chartData.length - 1].time
      }
    });
  } catch (error) {
    console.error(`❌ All chart sources failed for ${symbol}:`, error.message);
    return c.json({ 
      error: 'Failed to fetch chart data from all sources',
      message: error.message 
    }, 500);
  }
});

// POST batch recommendations - fetch multiple stocks at once
api.post("/recommendations/batch", async (c) => {
  try {
    const body = await c.req.json();
    const symbols = body.symbols || [];

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return c.json({ error: 'Invalid symbols array' }, 400);
    }

    console.log(`💡 Fetching batch recommendations for ${symbols.length} stocks...`);

    // Fetch all in parallel
    const results = await Promise.all(
      symbols.map(async (symbol: string) => {
        const upperSymbol = symbol.toUpperCase();
        return await fetchYahooRecommendations(upperSymbol);
      })
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    // Count fallbacks separately
    const fallbacks = successful.filter(r => r.isFallback);
    const realData = successful.filter(r => !r.isFallback);

    if (failed.length > 0) {
      console.log(`⚠️ ${failed.length} recommendations failed:`, failed.map(f => ({ symbol: f.symbol, error: f.error })));
    }
    
    if (fallbacks.length > 0) {
      console.log(`⚠️ ${fallbacks.length} using fallback data:`, fallbacks.map(f => f.symbol));
    }

    console.log(`✅ Batch recommendations complete: ${realData.length} real, ${fallbacks.length} fallback, ${failed.length} failed`);

    return c.json({
      success: true,
      total: symbols.length,
      successful: successful.length,
      failed: failed.length,
      data: successful,
      errors: failed.map(f => ({ symbol: f.symbol, error: f.error }))
    });
  } catch (error) {
    console.error('❌ Batch recommendations error:', error);
    return c.json({ error: 'Batch recommendations failed', message: error.message }, 500);
  }
});

// ===========================
// TURJIBOT AI CHAT ENDPOINT
// Handles AI chat with function calling for real-time stock data
// ===========================

/**
 * Fetch stock data for TurjiBot (combines price + basic info)
 */
async function getStockDataForBot(symbol: string): Promise<any> {
  try {
    const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
    
    if (!finnhubKey) {
      return {
        symbol: symbol.toUpperCase(),
        error: 'Finnhub API Key not configured on server'
      };
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${finnhubKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Finnhub API fields:
    // c = current price
    // d = change (dollar amount)
    // dp = change percent
    // h = high price of the day
    // l = low price of the day
    // o = open price of the day
    // pc = previous close price
    // t = timestamp
    
    const currentPrice = data.c || 0;
    const previousClose = data.pc || 0;
    const change = data.d || 0;
    const changePercent = data.dp || 0;
    
    // Validate data
    if (currentPrice === 0 || previousClose === 0) {
      return {
        symbol: symbol.toUpperCase(),
        error: 'No data available for this symbol. Please check the ticker symbol.'
      };
    }
    
    return {
      symbol: symbol.toUpperCase(),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((data.h || 0).toFixed(2)),
      low: parseFloat((data.l || 0).toFixed(2)),
      open: parseFloat((data.o || 0).toFixed(2)),
      timestamp: new Date().toLocaleString('he-IL', { 
        timeZone: 'Asia/Jerusalem',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      dataSource: 'Finnhub (Real-time US Market Data)'
    };
  } catch (error: any) {
    console.error(`❌ Stock Data Error for ${symbol}:`, error);
    return {
      symbol: symbol.toUpperCase(),
      error: `Failed to fetch data: ${error.message}`
    };
  }
}

/**
 * Fetch comprehensive financial data for TurjiBot
 * Includes company profile, metrics, financials, and earnings
 */
async function getCompanyFinancials(symbol: string): Promise<any> {
  try {
    const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
    
    if (!finnhubKey) {
      return {
        symbol: symbol.toUpperCase(),
        error: 'Finnhub API Key not configured on server'
      };
    }

    const upperSymbol = symbol.toUpperCase();
    
    // Fetch multiple endpoints in parallel
    const [profileRes, metricsRes, financialsRes, earningsRes] = await Promise.all([
      // Company Profile (name, industry, market cap, etc.)
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${upperSymbol}&token=${finnhubKey}`),
      
      // Basic Financials & Metrics (P/E, ROE, profit margins, etc.)
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${upperSymbol}&metric=all&token=${finnhubKey}`),
      
      // Financial Statements (annual/quarterly)
      fetch(`https://finnhub.io/api/v1/stock/financials-reported?symbol=${upperSymbol}&token=${finnhubKey}`),
      
      // Earnings (quarterly earnings)
      fetch(`https://finnhub.io/api/v1/stock/earnings?symbol=${upperSymbol}&token=${finnhubKey}`)
    ]);

    // Parse all responses
    const profile = profileRes.ok ? await profileRes.json() : {};
    const metricsData = metricsRes.ok ? await metricsRes.json() : {};
    const financials = financialsRes.ok ? await financialsRes.json() : {};
    const earnings = earningsRes.ok ? await earningsRes.json() : [];

    // Check if we got valid data
    if (!profile.name && !metricsData.metric) {
      return {
        symbol: upperSymbol,
        error: 'No financial data available for this symbol. The company may not be publicly traded or data is unavailable.'
      };
    }

    // Extract key metrics
    const metrics = metricsData.metric || {};
    
    // Company Profile
    const companyInfo = {
      name: profile.name || 'N/A',
      industry: profile.finnhubIndustry || profile.industry || 'N/A',
      sector: profile.sector || 'N/A',
      country: profile.country || 'US',
      marketCap: profile.marketCapitalization ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B` : 'N/A',
      employees: profile.shareOutstanding ? Math.round(profile.shareOutstanding * 1000000) : null,
      website: profile.weburl || 'N/A',
      exchange: profile.exchange || 'N/A',
      ipo: profile.ipo || 'N/A'
    };

    // Key Financial Metrics
    const keyMetrics = {
      peRatio: metrics['peBasicExclExtraTTM'] || metrics['peNormalizedAnnual'] || 'N/A',
      pbRatio: metrics['pbAnnual'] || metrics['pbQuarterly'] || 'N/A',
      psRatio: metrics['psTTM'] || 'N/A',
      profitMargin: metrics['netProfitMarginTTM'] ? `${(metrics['netProfitMarginTTM'] * 100).toFixed(2)}%` : 'N/A',
      operatingMargin: metrics['operatingMarginTTM'] ? `${(metrics['operatingMarginTTM'] * 100).toFixed(2)}%` : 'N/A',
      roe: metrics['roeTTM'] ? `${(metrics['roeTTM'] * 100).toFixed(2)}%` : 'N/A',
      roa: metrics['roaTTM'] ? `${(metrics['roaTTM'] * 100).toFixed(2)}%` : 'N/A',
      debtToEquity: metrics['totalDebt/totalEquityQuarterly'] || 'N/A',
      currentRatio: metrics['currentRatioQuarterly'] || 'N/A',
      quickRatio: metrics['quickRatioQuarterly'] || 'N/A'
    };

    // Revenue & Earnings Growth
    const growth = {
      revenueGrowth: metrics['revenueGrowthTTMYoy'] ? `${(metrics['revenueGrowthTTMYoy'] * 100).toFixed(2)}%` : 'N/A',
      epsGrowth: metrics['epsGrowthTTMYoy'] ? `${(metrics['epsGrowthTTMYoy'] * 100).toFixed(2)}%` : 'N/A',
      revenuePerShare: metrics['revenuePerShareTTM'] ? `$${metrics['revenuePerShareTTM'].toFixed(2)}` : 'N/A',
      bookValuePerShare: metrics['bookValuePerShareQuarterly'] ? `$${metrics['bookValuePerShareQuarterly'].toFixed(2)}` : 'N/A'
    };

    // Earnings Data (last 4 quarters)
    const earningsData = earnings.slice(0, 4).map((e: any) => ({
      period: e.period || 'N/A',
      actual: e.actual || 0,
      estimate: e.estimate || 0,
      surprise: e.surprise || 0,
      surprisePercent: e.surprisePercent ? `${e.surprisePercent.toFixed(2)}%` : 'N/A'
    }));

    // Valuation Summary
    const valuation = {
      '52WeekHigh': metrics['52WeekHigh'] ? `$${metrics['52WeekHigh'].toFixed(2)}` : 'N/A',
      '52WeekLow': metrics['52WeekLow'] ? `$${metrics['52WeekLow'].toFixed(2)}` : 'N/A',
      '52WeekPriceReturnDaily': metrics['52WeekPriceReturnDaily'] ? `${(metrics['52WeekPriceReturnDaily'] * 100).toFixed(2)}%` : 'N/A',
      beta: metrics['beta'] || 'N/A',
      dividendYield: metrics['dividendYieldIndicatedAnnual'] ? `${(metrics['dividendYieldIndicatedAnnual'] * 100).toFixed(2)}%` : 'N/A'
    };

    // Financial Health Score (simple scoring based on key metrics)
    let healthScore = 0;
    let healthFactors = [];

    // Profitability
    if (metrics['netProfitMarginTTM'] && metrics['netProfitMarginTTM'] > 0.1) {
      healthScore += 20;
      healthFactors.push('רווחיות גבוהה (מעל 10%)');
    } else if (metrics['netProfitMarginTTM'] && metrics['netProfitMarginTTM'] < 0) {
      healthFactors.push('⚠️ החברה לא רווחית');
    }

    // Growth
    if (metrics['revenueGrowthTTMYoy'] && metrics['revenueGrowthTTMYoy'] > 0.15) {
      healthScore += 20;
      healthFactors.push('צמיחה מהירה בהכנסות (מעל 15%)');
    }

    // Valuation
    if (metrics['peBasicExclExtraTTM'] && metrics['peBasicExclExtraTTM'] < 25 && metrics['peBasicExclExtraTTM'] > 0) {
      healthScore += 20;
      healthFactors.push('מכפיל P/E סביר (מתחת ל-25)');
    } else if (metrics['peBasicExclExtraTTM'] && metrics['peBasicExclExtraTTM'] > 50) {
      healthFactors.push('⚠️ מכפיל P/E גבוה (מעל 50)');
    }

    // Financial Strength
    if (metrics['currentRatioQuarterly'] && metrics['currentRatioQuarterly'] > 1.5) {
      healthScore += 20;
      healthFactors.push('نزילות טובה');
    } else if (metrics['currentRatioQuarterly'] && metrics['currentRatioQuarterly'] < 1) {
      healthFactors.push('⚠️ נזילות נמוכה');
    }

    // ROE
    if (metrics['roeTTM'] && metrics['roeTTM'] > 0.15) {
      healthScore += 20;
      healthFactors.push('ROE גבוה (מעל 15%)');
    }

    return {
      symbol: upperSymbol,
      companyInfo,
      keyMetrics,
      growth,
      valuation,
      earnings: earningsData,
      healthScore: Math.min(healthScore, 100),
      healthFactors,
      timestamp: new Date().toLocaleString('he-IL', { 
        timeZone: 'Asia/Jerusalem',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      dataSource: 'Finnhub (Comprehensive Financial Data)'
    };
  } catch (error: any) {
    console.error(`❌ Financial Data Error for ${symbol}:`, error);
    return {
      symbol: symbol.toUpperCase(),
      error: `Failed to fetch financial data: ${error.message}`
    };
  }
}

/**
 * Calculate trading strategy and entry/exit points
 * Combines technical and fundamental analysis
 */
async function calculateTradingStrategy(symbol: string, tradingStyle: string): Promise<any> {
  try {
    const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
    
    if (!finnhubKey) {
      return {
        symbol: symbol.toUpperCase(),
        error: 'Finnhub API Key not configured on server'
      };
    }

    const upperSymbol = symbol.toUpperCase();
    
    // Fetch current quote and metrics in parallel
    const [quoteRes, metricsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${upperSymbol}&token=${finnhubKey}`),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${upperSymbol}&metric=all&token=${finnhubKey}`)
    ]);

    if (!quoteRes.ok) {
      throw new Error(`Failed to fetch quote data: ${quoteRes.status}`);
    }

    const quote = await quoteRes.json();
    const metricsData = metricsRes.ok ? await metricsRes.json() : {};
    const metrics = metricsData.metric || {};

    // Current price data
    const currentPrice = quote.c || 0;
    const high = quote.h || currentPrice;
    const low = quote.l || currentPrice;
    const open = quote.o || currentPrice;
    const previousClose = quote.pc || currentPrice;
    const changePercent = quote.dp || 0;

    if (currentPrice === 0) {
      return {
        symbol: upperSymbol,
        error: 'No price data available for this symbol.'
      };
    }

    // Technical levels
    const week52High = metrics['52WeekHigh'] || currentPrice * 1.3;
    const week52Low = metrics['52WeekLow'] || currentPrice * 0.7;
    const beta = metrics['beta'] || 1.0;

    // Calculate support and resistance levels
    // Support: Recent low, 52-week low, psychological levels
    const supportLevel1 = Math.min(low, previousClose * 0.98);
    const supportLevel2 = week52Low;
    const strongSupport = Math.min(supportLevel1, supportLevel2);

    // Resistance: Recent high, 52-week high, psychological levels
    const resistanceLevel1 = Math.max(high, previousClose * 1.02);
    const resistanceLevel2 = week52High;
    const strongResistance = Math.max(resistanceLevel1, resistanceLevel2);

    // Calculate entry and exit points based on trading style
    let recommendation = 'המתן'; // Hold
    let confidence = 50;
    let entryPoint = currentPrice;
    let exitPoint = currentPrice * 1.1;
    let stopLoss = currentPrice * 0.95;
    let reasoning = [];

    // Fundamental analysis factors
    const peRatio = metrics['peBasicExclExtraTTM'] || 0;
    const profitMargin = metrics['netProfitMarginTTM'] || 0;
    const revenueGrowth = metrics['revenueGrowthTTMYoy'] || 0;
    const roe = metrics['roeTTM'] || 0;

    // Calculate scores
    let technicalScore = 0;
    let fundamentalScore = 0;

    // Technical Analysis
    // 1. Price position relative to 52-week range
    const pricePosition = (currentPrice - week52Low) / (week52High - week52Low);
    if (pricePosition < 0.3) {
      technicalScore += 20;
      reasoning.push('המחיר קרוב לשפל שנתי - הזדמנות קנייה טכנית');
    } else if (pricePosition > 0.8) {
      technicalScore -= 20;
      reasoning.push('המחיר קרוב לשיא שנתי - סיכון טכני גבוה');
    }

    // 2. Daily momentum
    if (changePercent > 2) {
      technicalScore += 10;
      reasoning.push('מומנטום חיובי חזק (+' + changePercent.toFixed(1) + '%)');
    } else if (changePercent < -2) {
      technicalScore -= 10;
      reasoning.push('מומנטום שלילי (-' + Math.abs(changePercent).toFixed(1) + '%)');
    }

    // 3. Volatility (beta)
    if (tradingStyle === 'day' && beta > 1.2) {
      technicalScore += 10;
      reasoning.push('תנודתיות גבוהה - מתאים למסחר יומי');
    } else if (tradingStyle === 'long' && beta < 0.8) {
      technicalScore += 10;
      reasoning.push('תנודתיות נמוכה - מתאים להשקעה לטווח ארוך');
    }

    // Fundamental Analysis
    // 1. Profitability
    if (profitMargin > 0.15) {
      fundamentalScore += 25;
      reasoning.push('רווחיות מעולה (' + (profitMargin * 100).toFixed(1) + '%)');
    } else if (profitMargin < 0) {
      fundamentalScore -= 25;
      reasoning.push('⚠️ החברה מפסידה כסף');
    }

    // 2. Growth
    if (revenueGrowth > 0.2) {
      fundamentalScore += 25;
      reasoning.push('צמיחה מהירה בהכנסות (+' + (revenueGrowth * 100).toFixed(1) + '%)');
    } else if (revenueGrowth < 0) {
      fundamentalScore -= 15;
      reasoning.push('⚠️ ירידה בהכנסות');
    }

    // 3. Valuation
    if (peRatio > 0 && peRatio < 20) {
      fundamentalScore += 20;
      reasoning.push('מכפיל P/E אטרקטיבי (' + peRatio.toFixed(1) + ')');
    } else if (peRatio > 50) {
      fundamentalScore -= 15;
      reasoning.push('⚠️ מכפיל P/E גבוה מאוד (' + peRatio.toFixed(1) + ')');
    }

    // 4. ROE
    if (roe > 0.2) {
      fundamentalScore += 15;
      reasoning.push('ROE מצוין (' + (roe * 100).toFixed(1) + '%)');
    }

    // Calculate final recommendation based on trading style
    if (tradingStyle === 'day') {
      // Day trading - focus more on technical (60% technical, 40% fundamental)
      const totalScore = (technicalScore * 0.6) + (fundamentalScore * 0.4);
      confidence = Math.min(Math.max(50 + totalScore, 0), 100);

      if (totalScore > 25) {
        recommendation = 'קנה';
        entryPoint = currentPrice;
        exitPoint = currentPrice * 1.05; // 5% target for day trading
        stopLoss = currentPrice * 0.98; // 2% stop loss
      } else if (totalScore < -25) {
        recommendation = 'מכור';
        entryPoint = currentPrice;
        exitPoint = currentPrice * 0.95;
        stopLoss = currentPrice * 1.02;
      } else {
        recommendation = 'המתן';
        entryPoint = supportLevel1;
        exitPoint = resistanceLevel1;
        stopLoss = strongSupport;
      }
    } else {
      // Long-term investing - focus more on fundamentals (70% fundamental, 30% technical)
      const totalScore = (technicalScore * 0.3) + (fundamentalScore * 0.7);
      confidence = Math.min(Math.max(50 + totalScore, 0), 100);

      if (totalScore > 30) {
        recommendation = 'קנה';
        entryPoint = pricePosition < 0.5 ? currentPrice : supportLevel1;
        exitPoint = currentPrice * 1.25; // 25% target for long-term
        stopLoss = currentPrice * 0.90; // 10% stop loss
      } else if (totalScore < -30) {
        recommendation = 'מכור';
        entryPoint = currentPrice;
        exitPoint = currentPrice * 0.85;
        stopLoss = currentPrice * 1.05;
      } else {
        recommendation = 'המתן';
        entryPoint = week52Low * 1.1;
        exitPoint = week52High * 0.9;
        stopLoss = week52Low;
      }
    }

    // Round all prices to 2 decimals
    entryPoint = parseFloat(entryPoint.toFixed(2));
    exitPoint = parseFloat(exitPoint.toFixed(2));
    stopLoss = parseFloat(stopLoss.toFixed(2));

    // Calculate risk/reward ratio
    const risk = Math.abs(entryPoint - stopLoss);
    const reward = Math.abs(exitPoint - entryPoint);
    const riskRewardRatio = risk > 0 ? (reward / risk).toFixed(2) : 'N/A';

    return {
      symbol: upperSymbol,
      tradingStyle: tradingStyle === 'day' ? 'מסחר יומי' : 'השקעה לטווח ארוך',
      recommendation,
      confidence: Math.round(confidence),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      entryPoint,
      exitPoint,
      stopLoss,
      potentialProfit: parseFloat(((exitPoint - entryPoint) / entryPoint * 100).toFixed(2)),
      riskRewardRatio,
      technicalLevels: {
        support: parseFloat(strongSupport.toFixed(2)),
        resistance: parseFloat(strongResistance.toFixed(2)),
        week52High: parseFloat(week52High.toFixed(2)),
        week52Low: parseFloat(week52Low.toFixed(2))
      },
      reasoning,
      timestamp: new Date().toLocaleString('he-IL', { 
        timeZone: 'Asia/Jerusalem',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      dataSource: 'TurjiBot Advanced Strategy Engine'
    };
  } catch (error: any) {
    console.error(`❌ Trading Strategy Error for ${symbol}:`, error);
    return {
      symbol: symbol.toUpperCase(),
      error: `Failed to calculate strategy: ${error.message}`
    };
  }
}

// POST TurjiBot chat - AI assistant with function calling
api.post("/turjibot/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { messages, user } = body;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'Invalid messages array' }, 400);
    }

    const groqKey = Deno.env.get('GROQ_API_KEY');
    
    if (!groqKey) {
      return c.json({ 
        error: 'GROQ_API_KEY not configured',
        message: 'Server configuration error. Please contact administrator.'
      }, 500);
    }

    console.log(`🤖 TurjiBot chat request - ${messages.length} messages`);

    // System prompt
    const systemPrompt = `אתה TurjiBot, יועץ אסטרטגי מקצועי למסחר במניות מבוסס AI ברמה הגבוהה ביותר עם גישה לנתוני שוק בזמן אמת.

הקונטקסט שלך:
- אתה עובד באפליקציית TurjiTrade, אפליקציה עברית מובילה למסחר מניות
- המשתמש הנוכחי: ${user?.name || 'משתמש'} (${user?.email || ''}))
- סגנון המסחר שלו: ${user?.tradingStyle === 'day' ? 'מסחר יומי (Day Trading)' : 'השקעה לטווח ארוך (Long-term)'}

✨ יש לך גישה ל-3 כלים רבי עוצמה:
1️⃣ get_stock_data - מחירים בזמן אמת ונתוני מסחר יומיים
2️⃣ get_company_financials - ניתוח פיננסי מעמיק של החברה
3️⃣ get_trading_strategy - אסטרטגיית מסחר עם נקודות כניסה/יציאה והמלצות קנה/מכור/המתן

📋 אסטרטגיית העבודה שלך - תלוי בסוג השאלה:

🎯 כשמשתמש שואל "מה המחיר?" או "איך המנייה היום?":
→ השתמש רק ב-get_stock_data
→ תן תשובה קצרה עם המחיר והשינוי היומי

💼 כשמשתמש שואל "מה דעתך על המנייה?" או מזכיר שיש לו מניות:
→ השתמש ב-get_stock_data + get_company_financials
→ תן ניתוח מקיף של המצב הפיננסי

🚀 כשמשתמש שואל "האם לקנות/למכור?" או "מה ההמלצה שלך?":
→ השתמש בכל 3 הכלים!
→ get_stock_data (מ��יר נוכחי)
→ get_company_financials (בריאות פיננסית)
→ get_trading_strategy (אסטרטגיה + נקודות כניסה/יציאה)
→ תן המלצה ברורה עם נקודות פעולה!

דוגמה מושלמת לשאלת אסטרטגיה:
משתמש: "יש לי 50 מניות של NVDA, האם להמשיך להחזיק?"
→ get_stock_data("NVDA") → מחיר: $500, +3.2%
→ get_company_financials("NVDA") → P/E: 65, רווחיות: 48%, ציון בריאות: 85
→ get_trading_strategy("NVDA", "long") → המלצה: קנה, ביטחון: 78%, נקודת כניסה: $485, יעד: $625, stop loss: $450

תשובה אסטרטגית:
\"🎯 NVIDIA (NVDA) - אסטרטגיית מסחר

📊 מצב נוכחי:
• מחיר: $500.00 (+3.2% היום)
• השקעתך: 50 מניות = $25,000

📈 ניתוח פיננסי:
• ציון בריאות פיננסית: 85/100 (מצוין!)
• רווחיות: 48% (יוצא מן הכלל!)
• צמיחה: 126% (פנומנלית!)

🚀 המ��צה אסטרטגית (ביטחון: 78%):
✅ **קנה / המשך להחזיק**

📌 תכנית פעולה:
• נקודת כניסה: $485 (אם יורד)
• יעד רווח: $625 (+25%)
• Stop Loss: $450 (-10% הגנה)
• יחס סיכון/תגמול: 2.5:1

💡 נימוק:
החברה במצב פיננסי מעולה עם צמיחה מטורפת. למרות המכפיל הגבוה, הרווחיות והמומנטום מצדיקים את המשך ההחזקה. מתאים לסגנון השקעה שלך (טווח ארוך).

⚠️ שים Stop Loss ב-$450 להגנה!\"

🔍 הנתונים מ-get_stock_data:
- currentPrice: מחיר נוכחי
- changePercent: שינוי אחוזי (השתמש בזה בלבד!)
- high/low: טווח יומי

📊 הנתונים מ-get_company_financials:
- companyInfo: שם, תעשייה, שווי שוק
- keyMetrics: P/E, רווחיות, ROE, ROA
- growth: צמיחה בהכנסות, EPS
- healthScore: ציון 0-100

🎯 הנתונים מ-get_trading_strategy:
- recommendation: קנה/מכור/המתן
- confidence: רמת ביטחון 0-100
- entryPoint: נקודת כניסה מומלצת
- exitPoint: יעד רווח
- stopLoss: נקודת הגנה
- potentialProfit: רווח פוטנציאלי באחוזים
- riskRewardRatio: יחס סיכון/תגמול
- reasoning: נימוקים מפורטים

⚠️ חשוב: אל תחשב בעצמך את אחוז השינוי! תמיד השתמש ב-changePercent שמגיע מהנתונים!

🔢 הבנת מספרים בעברית:
- פסיק (,) = אלפים: 1,407 = אלף ו-407
- נקודה (.) = עשרוניות: 1.4007 = אחת ועוד קצת
- אם מישהו כותב "1,407 מניות" של מנייה יקרה → כנראה התכוון ל-1.4 מניות!

🚨 זיהוי מצבים לא הגיוניים:
- שווי > $100,000 → שאל הבהרה!
- כמות > 1,000 + מחיר > $50 → שאל הבהרה!

סמלי מניות פופולריים:
- Apple = AAPL, Tesla = TSLA, Microsoft = MSFT, Google = GOOGL
- Amazon = AMZN, Meta = META, Nvidia = NVDA, Netflix = NFLX

עקרונות התשובה שלך:
✅ תמיד בחר את הכלים הנכונים בהתאם לשאלה!
✅ כשנשאלת על קנייה/מכירה - השתמש ב-get_trading_strategy!
✅ תן המלצות ברורות עם נקודות פעולה ספציפיות!
✅ התייחס לסגנון המסחר של המשתמש (יומי vs טווח ארוך)!
✅ תמיד כלול Stop Loss להגנה!
✅ הסבר את הנימוקים מאחורי ההמלצה!
✅ השתמש באימוג'ים לה��הרה (🎯📊📈⚠️✅❌)!

❌ אל תמציא נתונים - תמיד השתמש בכלים!
❌ אל תבטיח רווחים מובטחים!
❌ אל תיתן ייעוץ פיננסי אישי (זה לא חוקי)!

זכור: אתה כלי עזר למסחר, לא מחליף ליועץ פיננסי מורשה.`;

    // Define tools for function calling
    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_stock_data',
          description: 'Gets real-time stock market data for US stocks. Use this whenever a user asks about a specific stock, mentions a company name, or wants current prices. Examples: "What is AAPL price?", "Tell me about Tesla", "How is Microsoft doing?"',
          parameters: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'The stock ticker symbol in uppercase (e.g., AAPL for Apple, TSLA for Tesla, MSFT for Microsoft, GOOGL for Google, AMZN for Amazon)'
              }
            },
            required: ['symbol']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_company_financials',
          description: 'Gets comprehensive financial data for a company, including profile, metrics, financials, and earnings. Use this to provide a deep financial analysis. Examples: "Analyze NVDA", "Tell me about Apple\'s financials", "What is the health score of TSLA?"',
          parameters: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'The stock ticker symbol in uppercase (e.g., AAPL for Apple, TSLA for Tesla, MSFT for Microsoft, GOOGL for Google, AMZN for Amazon)'
              }
            },
            required: ['symbol']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_trading_strategy',
          description: 'Calculates a trading strategy with entry/exit points and buy/sell/hold recommendations. Use this for detailed investment advice. Examples: "What is the strategy for NVDA?", "Should I buy AAPL?", "How to trade TSLA?"',
          parameters: {
            type: 'object',
            properties: {
              symbol: {
                type: 'string',
                description: 'The stock ticker symbol in uppercase (e.g., AAPL for Apple, TSLA for Tesla, MSFT for Microsoft, GOOGL for Google, AMZN for Amazon)'
              },
              tradingStyle: {
                type: 'string',
                description: 'The trading style: "day" for day trading or "long" for long-term investing'
              }
            },
            required: ['symbol', 'tradingStyle']
          }
        }
      }
    ];

    // Prepare conversation messages
    const conversationMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ];

    // First API call to Groq with tools
    const firstResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: conversationMessages,
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9
      })
    });

    if (!firstResponse.ok) {
      const errorData = await firstResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq API Error: ${firstResponse.status}`);
    }

    const firstData = await firstResponse.json();
    const assistantMessage = firstData.choices[0]?.message;

    // Check if the model wants to call a function
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🔧 Function calls requested: ${assistantMessage.tool_calls.length}`);
      
      // Add assistant's tool call to conversation
      conversationMessages.push(assistantMessage);

      // Execute all tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.function.name === 'get_stock_data') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`📊 Fetching stock data for: ${args.symbol}`);
          
          const stockData = await getStockDataForBot(args.symbol);
          
          // Add tool response to conversation
          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(stockData, null, 2)
          });
        } else if (toolCall.function.name === 'get_company_financials') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`📊 Fetching company financials for: ${args.symbol}`);
          
          const financialData = await getCompanyFinancials(args.symbol);
          
          // Add tool response to conversation
          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(financialData, null, 2)
          });
        } else if (toolCall.function.name === 'get_trading_strategy') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`📊 Fetching trading strategy for: ${args.symbol} (${args.tradingStyle})`);
          
          const strategyData = await calculateTradingStrategy(args.symbol, args.tradingStyle);
          
          // Add tool response to conversation
          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(strategyData, null, 2)
          });
        }
      }

      // Second API call with tool results
      const secondResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: conversationMessages,
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 0.9
        })
      });

      if (!secondResponse.ok) {
        const errorData = await secondResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API Error: ${secondResponse.status}`);
      }

      const secondData = await secondResponse.json();
      const finalResponse = secondData.choices[0]?.message?.content || 'מצטער, לא הצלחתי לעבד את השאלה. נסה שוב.';

      console.log(`✅ TurjiBot response with function calling complete`);
      return c.json({
        success: true,
        response: finalResponse,
        usedFunctions: true
      });
    } else {
      // No tool call needed, use direct response
      const response = assistantMessage.content || 'מצטער, לא הצלחתי לעבד את השאלה. נסה שוב.';
      
      console.log(`✅ TurjiBot direct response complete`);
      return c.json({
        success: true,
        response: response,
        usedFunctions: false
      });
    }
  } catch (error: any) {
    console.error('❌ TurjiBot chat error:', error);
    return c.json({ 
      error: 'Chat request failed', 
      message: error.message 
    }, 500);
  }
});

// ===========================
// VERIFICATION CODE EMAIL ENDPOINT
// Send verification code for password change
// ===========================

// POST send verification code via email
api.post("/send-verification-code", async (c) => {
  try {
    const body = await c.req.json();
    const { email, code } = body;

    if (!email || !code) {
      return c.json({ error: 'Email and code are required' }, 400);
    }

    console.log(`📧 Sending verification code to ${email}`);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      // For development/testing - return success but log the code
      console.log(`🔑 Verification code for ${email}: ${code}`);
      return c.json({ 
        success: true,
        message: 'Email service not configured - check server logs for code',
        devMode: true,
        devCode: code // REMOVE IN PRODUCTION!
      });
    }

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TurjiTrade <onboarding@resend.dev>', // Change to your verified domain
        to: email,
        subject: 'קוד אימות לשינוי סיסמה - TurjiTrade',
        html: `
          <!DOCTYPE html>
          <html dir="rtl" lang="he">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #0F172A; direction: rtl;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1E293B; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 600;">
                          🔐 TurjiTrade
                        </h1>
                        <p style="color: #FFFFFF; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                          קוד אימות לשינוי סיסמה
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px 30px; text-align: center;">
                        <p style="color: #94A3B8; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          קיבלנו בקשה לשינוי הסיסמה שלך. השתמש בקוד הבא כדי להמשיך:
                        </p>
                        
                        <!-- Verification Code Box -->
                        <div style="background-color: #0F172A; border: 2px solid #F97316; border-radius: 12px; padding: 20px; margin: 30px 0; display: inline-block;">
                          <p style="color: #94A3B8; font-size: 14px; margin: 0 0 10px 0;">קוד האימות שלך:</p>
                          <h2 style="color: #F97316; font-size: 42px; font-weight: 700; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${code}
                          </h2>
                        </div>
                        
                        <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                          ⏱️ הקוד תקף ל-<strong style="color: #F1F5F9;">10 דקות</strong>
                        </p>
                        
                        <div style="background-color: #334155; border-radius: 8px; padding: 15px; margin: 30px 0 0 0;">
                          <p style="color: #94A3B8; font-size: 13px; line-height: 1.5; margin: 0;">
                            ⚠️ <strong style="color: #F1F5F9;">לא ביקשת לשנות סיסמה?</strong><br>
                            התעלם ממייל זה והסיסמה שלך תישאר ללא שינוי.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0F172A; padding: 20px 30px; text-align: center; border-top: 1px solid #334155;">
                        <p style="color: #64748B; font-size: 12px; margin: 0; line-height: 1.5;">
                          © 2024 TurjiTrade - אפליקציה מקצופית למסחר מניות<br>
                          Design by EliaTurjeman
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      })
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('❌ Resend API error:', errorData);
      throw new Error(`Resend API error: ${errorData.message || 'Unknown error'}`);
    }

    const resendData = await resendResponse.json();
    console.log(`✅ Email sent successfully to ${email}. Email ID: ${resendData.id}`);
    
    return c.json({ 
      success: true,
      message: 'Verification code sent successfully',
      emailId: resendData.id
    });

  } catch (error: any) {
    console.error('❌ Error sending verification code:', error);
    return c.json({ 
      error: 'Failed to send verification code',
      message: error.message 
    }, 500);
  }
});

// ===========================
// COMPANY FINANCIALS ENDPOINT
// Get financial data for a stock
// ===========================

api.get('/financials/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  
  console.log(`💰 Fetching financials for ${symbol}...`);

  try {
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    // Fetch company profile and metrics from Finnhub
    const [profileResponse, metricsResponse] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`)
    ]);

    if (!profileResponse.ok || !metricsResponse.ok) {
      throw new Error('Finnhub API request failed');
    }

    const profile = await profileResponse.json();
    const metrics = await metricsResponse.json();

    // Format financials data
    const formatNumber = (num: number | null | undefined, prefix = '$', suffix = ''): string => {
      if (num === null || num === undefined || isNaN(num)) return 'N/A';
      
      // Format large numbers
      if (Math.abs(num) >= 1e12) {
        return `${prefix}${(num / 1e12).toFixed(2)}T${suffix}`;
      } else if (Math.abs(num) >= 1e9) {
        return `${prefix}${(num / 1e9).toFixed(2)}B${suffix}`;
      } else if (Math.abs(num) >= 1e6) {
        return `${prefix}${(num / 1e6).toFixed(2)}M${suffix}`;
      }
      return `${prefix}${num.toFixed(2)}${suffix}`;
    };

    const financials = {
      marketCap: formatNumber(profile.marketCapitalization || metrics.metric?.marketCapitalization),
      revenue: formatNumber(metrics.metric?.revenuePerShareTTM ? metrics.metric.revenuePerShareTTM * (profile.shareOutstanding || 1) : null),
      netIncome: formatNumber(metrics.metric?.netIncomePerShareTTM ? metrics.metric.netIncomePerShareTTM * (profile.shareOutstanding || 1) : null),
      peRatio: metrics.metric?.peNormalizedAnnual?.toFixed(2) || metrics.metric?.peBasicExclExtraTTM?.toFixed(2) || 'N/A',
      eps: formatNumber(metrics.metric?.epsBasicExclExtraItemsTTM || metrics.metric?.epsTTM, '$', ''),
      dividend: metrics.metric?.dividendYieldIndicatedAnnual 
        ? `${formatNumber(metrics.metric.dividendPerShareAnnual || 0, '$', '')} (${(metrics.metric.dividendYieldIndicatedAnnual * 100).toFixed(2)}%)`
        : 'אין דיבידנד',
      debtToEquity: metrics.metric?.totalDebtEQTTM?.toFixed(2) || metrics.metric?.debtEquityRatioTTM?.toFixed(2) || 'N/A',
      profitMargin: metrics.metric?.netProfitMarginTTM 
        ? `${(metrics.metric.netProfitMarginTTM * 100).toFixed(1)}%`
        : 'N/A',
      operatingMargin: metrics.metric?.operatingMarginTTM 
        ? `${(metrics.metric.operatingMarginTTM * 100).toFixed(1)}%`
        : 'N/A'
    };

    console.log(`✅ FINNHUB: Financials for ${symbol} fetched successfully`);

    return c.json({
      success: true,
      symbol,
      financials,
      source: 'finnhub',
      timestamp: Date.now()
    });

  } catch (error: any) {
    console.error(`❌ Failed to fetch financials for ${symbol}:`, error.message);
    
    return c.json({
      success: false,
      error: 'Failed to fetch financial data',
      message: error.message,
      symbol
    }, 500);
  }
});

// ===========================
// COMPANY PROFILE ENDPOINT
// Get company information enriched with Google Search
// ===========================

/**
 * Fetch company information from Google Custom Search
 * Provides real, up-to-date information about companies
 */
async function fetchCompanyFromGoogle(symbol: string, companyName?: string): Promise<any> {
  try {
    const apiKey = 'AIzaSyBkA0-Jd5BTy1gVXKJP0hrG-_emrQfo3n4';
    const searchEngineId = '333cd836d4ceb4f9a';
    
    // Create search query
    const searchQuery = companyName 
      ? `${companyName} company profile information CEO founded` 
      : `${symbol} stock company profile information`;
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=3`;
    
    console.log(`🔍 [Google Search] Searching for: "${searchQuery}"`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('No search results found');
    }
    
    // Combine snippets from top 3 results to create comprehensive description
    const descriptions = data.items
      .slice(0, 3)
      .map((item: any) => item.snippet)
      .join(' ');
    
    console.log(`✅ [Google Search] Found ${data.items.length} results for ${symbol}`);
    
    return {
      success: true,
      description: descriptions,
      searchResults: data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      }))
    };
  } catch (error: any) {
    console.log(`❌ [Google Search] Failed for ${symbol}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Translate English text to Hebrew using GROQ AI
 * Fast and reliable translation using Llama model
 */
async function translateToHebrew(text: string): Promise<string> {
  try {
    // Check if text is already in Hebrew (contains Hebrew characters)
    const hebrewRegex = /[\u0590-\u05FF]/;
    if (hebrewRegex.test(text)) {
      console.log('📝 Text already in Hebrew, skipping translation');
      return text;
    }

    console.log('🔄 Translating to Hebrew using GROQ AI...');
    
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not found');
    }

    // Use GROQ API for translation
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate the following English text to Hebrew. Return ONLY the Hebrew translation, nothing else. Keep the same tone and style.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`GROQ API returned ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content?.trim() || text;
    
    console.log('✅ Translation successful using GROQ AI');
    return translatedText;
  } catch (error: any) {
    console.log(`⚠️ Translation failed: ${error.message}, using original text`);
    return text; // Fallback to original text on error
  }
}

/**
 * Fetch company data from Wikipedia (Hebrew first, then English with translation)
 */
async function fetchFromWikipedia(symbol: string) {
  // Map of common stock symbols to Wikipedia page titles
  const wikiTitleMap: Record<string, { he?: string; en: string }> = {
    'AAPL': { he: 'אפל_(חברה)', en: 'Apple_Inc.' },
    'MSFT': { he: 'מיקרוסופט', en: 'Microsoft' },
    'GOOGL': { he: 'גוגל', en: 'Google' },
    'GOOG': { he: 'גוגל', en: 'Google' },
    'AMZN': { he: 'אמזון_(חברה)', en: 'Amazon_(company)' },
    'TSLA': { he: 'טסלה_(חברה)', en: 'Tesla,_Inc.' },
    'META': { he: 'מטא_(חברה)', en: 'Meta_Platforms' },
    'NVDA': { he: 'אנבידיה', en: 'Nvidia' },
    'NFLX': { en: 'Netflix' },
    'NIO': { en: 'NIO_(company)' },
    'AMD': { en: 'AMD' },
    'INTC': { he: 'אינטל', en: 'Intel' },
    'BABA': { en: 'Alibaba_Group' },
    'DIS': { he: 'וולט_דיסני', en: 'The_Walt_Disney_Company' }
  };
  
  const wikiTitles = wikiTitleMap[symbol] || { en: symbol };
  
  let wikiData = null;
  let wikiLang = 'he';
  
  // Try Hebrew Wikipedia first if available
  if (wikiTitles.he) {
    try {
      console.log(`🇮🇱 Trying Hebrew Wikipedia: ${wikiTitles.he}`);
      const heResponse = await fetch(
        `https://he.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitles.he)}`,
        { 
          headers: { 'User-Agent': 'TurjiTrade/1.0' }
        }
      );
      
      if (heResponse.ok) {
        wikiData = await heResponse.json();
        wikiLang = 'he';
        console.log('✅ Found Hebrew Wikipedia article');
      }
    } catch (error) {
      console.log('⚠️ Hebrew Wikipedia not available, trying English...');
    }
  }
  
  // Fallback to English Wikipedia if Hebrew not found
  if (!wikiData && wikiTitles.en) {
    try {
      console.log(`🇬🇧 Trying English Wikipedia: ${wikiTitles.en}`);
      const enResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitles.en)}`,
        { 
          headers: { 'User-Agent': 'TurjiTrade/1.0' }
        }
      );
      
      if (enResponse.ok) {
        wikiData = await enResponse.json();
        wikiLang = 'en';
        console.log('✅ Found English Wikipedia article');
      }
    } catch (error) {
      console.log('⚠️ English Wikipedia failed');
    }
  }
  
  // If Wikipedia failed, return null
  if (!wikiData || wikiData.type === 'disambiguation') {
    return null;
  }
  
  // Extract data from Wikipedia
  const companyName = wikiData.title || `${symbol} Corporation`;
  let description = wikiData.extract || wikiData.description || '';
  
  // Translate description if it's in English
  if (wikiLang === 'en' && description) {
    console.log('🔄 Translating English Wikipedia to Hebrew...');
    description = await translateToHebrew(description);
  }
  
  // Extract additional data from Wikipedia content
  const fullText = `${wikiData.extract} ${wikiData.description || ''}`;
  
  const ceoMatch = fullText.match(/CEO[:\s]+([A-Z][a-z]+\s[A-Z][a-z]+)|Chief Executive Officer[:\s]+([A-Z][a-z]+\s[A-Z][a-z]+)/i);
  const ceo = ceoMatch ? (ceoMatch[1] || ceoMatch[2]) : 'N/A';
  
  const foundedMatch = fullText.match(/founded\s+(?:in\s+)?(\d{4})|established\s+(\d{4})|נוסדה?\s+(?:ב)?(\d{4})/i);
  const founded = foundedMatch ? (foundedMatch[1] || foundedMatch[2] || foundedMatch[3]) : 'N/A';
  
  const employeesMatch = fullText.match(/(\d{1,3}(?:,\d{3})+)\s+employees|(\d+)\s+thousand\s+employees/i);
  const employees = employeesMatch ? (employeesMatch[1] || `~${employeesMatch[2]}000`) : 'N/A';
  
  // Detect industry from content
  const industryKeywords = ['technology', 'software', 'internet', 'retail', 'automotive', 'finance', 'healthcare', 'energy', 'טכנולוגיה', 'תוכנה', 'רכב'];
  const detectedIndustry = industryKeywords.find(keyword => fullText.toLowerCase().includes(keyword.toLowerCase())) || 'technology';
  
  // Translate industry to Hebrew
  const industryMap: Record<string, string> = {
    'technology': 'טכנולוגיה',
    'software': 'תוכנה',
    'internet': 'אינטרנט',
    'retail': 'קמעונאות',
    'automotive': 'רכב',
    'finance': 'פיננסים',
    'healthcare': 'בריאות',
    'energy': 'אנרגיה',
    'טכנולוגיה': 'טכנולוגיה',
    'תוכנה': 'תוכנה',
    'רכב': 'רכב'
  };
  
  const industry = industryMap[detectedIndustry] || detectedIndustry.charAt(0).toUpperCase() + detectedIndustry.slice(1);
  const sector = industryMap[detectedIndustry] || 'טכנולוגיה';

  return {
    name: companyName,
    description: description.substring(0, 800),
    industry: industry,
    sector: sector,
    website: wikiData.content_urls?.desktop?.page || 'N/A',
    country: 'ארצות הברית',
    marketCap: 'N/A',
    employees: employees,
    founded: founded,
    ceo: ceo,
    logo: wikiData.thumbnail?.source || '',
    source: `wikipedia-${wikiLang}`,
    wikiUrl: wikiData.content_urls?.desktop?.page
  };
}

// Helper function for static fallback data
function getStaticCompanyData(symbol: string) {
  const staticDB: Record<string, any> = {
    'AAPL': {
      name: 'Apple Inc.',
      description: 'אפל היא חברת טכנולוגיה אמריקאית המתמחה בפיתוח, עיצוב ומכירה של מוצרי אלקטרוניקה צרכנית, תוכנות מחשב ושירותי�� מקוונים. החברה ידועה במוצרים כמו iPhone, iPad, Mac, Apple Watch ושירותים כמו App Store, Apple Music ו-iCloud.',
      industry: 'טכנולוגיה - מוצרי צריכה',
      sector: 'טכנולוגיה',
      employees: '~161,000',
      founded: '1976',
      ceo: 'Tim Cook',
      website: 'www.apple.com',
      country: 'ארצות הברית',
      marketCap: 'N/A',
      logo: '',
      source: 'static'
    },
    'TSLA': {
      name: 'Tesla Inc.',
      description: 'טסלה היא חברה אמריקאית המתמחה בכלי רכב חשמליים, אגירת אנרגיה ופתרונות אנרגיה מתחדשת. החברה מובילה את המהפכה החשמלית בתעשיית הרכב עם דגמים כמו Model 3, Model Y, Model S ו-Model X.',
      industry: 'רכב חשמלי ואנרגיה',
      sector: 'רכב',
      employees: '~140,000',
      founded: '2003',
      ceo: 'Elon Musk',
      website: 'www.tesla.com',
      country: 'ארצות הברית',
      marketCap: 'N/A',
      logo: '',
      source: 'static'
    },
    'NIO': {
      name: 'NIO Inc.',
      description: 'NIO היא יצרנית רכבים חשמליים סינית המתמחה ברכבי יוקרה חשמליים. החברה מפתחת טכנולוגיות חדשניות כולל החלפת סוללות אוטומטית ונהיגה אוטונומית. NIO מתחרה ישירות עם טסלה בשוק הרכב החשמלי הפרמיום.',
      industry: 'רכב חשמלי',
      sector: 'רכב',
      employees: '~30,000',
      founded: '2014',
      ceo: 'William Li',
      website: 'www.nio.com',
      country: 'סין',
      marketCap: 'N/A',
      logo: '',
      source: 'static'
    },
    'NVDA': {
      name: 'NVIDIA Corporation',
      description: 'NVIDIA היא מובילה עולמית בתחום יחידות עיבוד גרפיות (GPU) ומחשוב AI. החברה מספקת פתרונות לגיימינג, מרכזי נתונים, בינה מלאכותית, למידת מכונה ורכבים אוטונומיים.',
      industry: 'מוליכים למחצה ו-AI',
      sector: 'טכנולוגיה',
      employees: '~29,600',
      founded: '1993',
      ceo: 'Jensen Huang',
      website: 'www.nvidia.com',
      country: 'ארצות הברית',
      marketCap: 'N/A',
      logo: '',
      source: 'static'
    },
    'MSFT': {
      name: 'Microsoft Corporation',
      description: 'מיקרוסופט היא חברת טכנולוגיה אמריקאית שמפתחת, מייצרת ותומכת במגוון רחב של תוכנות, מכשירים ושירותים. החברה ידועה ב-Windows, Office 365, Azure Cloud ו-LinkedIn.',
      industry: 'תוכנה וענן',
      sector: 'טכנולוגיה',
      employees: '~221,000',
      founded: '1975',
      ceo: 'Satya Nadella',
      website: 'www.microsoft.com',
      country: 'ארצות הברית',
      marketCap: 'N/A',
      logo: '',
      source: 'static'
    }
  };

  return staticDB[symbol] || {
    name: `${symbol} Corporation`,
    description: `${symbol} היא חברה הנסחרת בבורסה. המידע המפ����ט על החברה זמין במסד הנתונים המקומי.`,
    industry: 'N/A',
    sector: 'N/A',
    employees: 'N/A',
    founded: 'N/A',
    ceo: 'N/A',
    website: 'N/A',
    country: 'ארצות הברית',
    marketCap: 'N/A',
    logo: '',
    source: 'static'
  };
}

api.get('/company/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  
  console.log(`🏢 Fetching company profile for ${symbol}...`);

  try {
    // Check cache first (24 hour cache to reduce Wikipedia API calls)
    const cacheKey = `company_profile_${symbol}`;
    const cachedData = await kv.get(cacheKey);
    
    if (cachedData) {
      console.log(`✅ Using cached company data for ${symbol}`);
      return c.json({
        success: true,
        symbol,
        profile: cachedData.profile,
        source: cachedData.source + ' (cached)',
        timestamp: cachedData.timestamp,
        cached: true
      });
    }

    // Fetch company info from Wikipedia
    console.log(`📚 [Wikipedia] Fetching fresh data for ${symbol}...`);
    
    const wikiProfile = await fetchFromWikipedia(symbol);
    
    if (!wikiProfile) {
      console.log(`⚠️ [Wikipedia] No results, using static data for ${symbol}`);
      const staticProfile = getStaticCompanyData(symbol);
      return c.json({
        success: true,
        symbol,
        profile: staticProfile,
        source: 'static',
        timestamp: Date.now(),
        note: 'Wikipedia unavailable - using local database'
      });
    }
    
    // Cache for 24 hours (86400 seconds)
    await kv.set(cacheKey, {
      profile: wikiProfile,
      source: wikiProfile.source,
      timestamp: Date.now()
    }, { expiresIn: 86400 });

    console.log(`✅ Company profile for ${symbol} fetched from ${wikiProfile.source} and cached`);

    return c.json({
      success: true,
      symbol,
      profile: wikiProfile,
      source: wikiProfile.source,
      timestamp: Date.now(),
      wikiUrl: wikiProfile.wikiUrl
    });

  } catch (error: any) {
    console.error(`❌ Failed to fetch company profile for ${symbol}:`, error.message);
    
    // Fallback to static data on any error
    const staticProfile = getStaticCompanyData(symbol);
    
    return c.json({
      success: true,
      symbol,
      profile: staticProfile,
      source: 'static',
      timestamp: Date.now(),
      note: 'Using fallback data due to error: ' + error.message
    });
  }
});

// Clear cache endpoint for testing (DELETE /company/:symbol/cache)
api.delete('/company/:symbol/cache', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  
  try {
    const cacheKey = `company_profile_${symbol}`;
    await kv.del(cacheKey);
    
    console.log(`🗑️ Cache cleared for ${symbol}`);
    
    return c.json({
      success: true,
      message: `Cache cleared for ${symbol}`,
      symbol
    });
  } catch (error: any) {
    console.error(`❌ Failed to clear cache for ${symbol}:`, error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ===========================
// DETAILED STOCK DATA ENDPOINT (FOR CARDS)
// Combines Quotes, Metrics, and AI Analysis
// ===========================

async function fetchDetailedStockData(symbol: string): Promise<any> {
  try {
     const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
     
     // 1. Fetch from Yahoo Finance (Primary)
     const yahooPromise = fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=financialData,defaultKeyStatistics,price,summaryDetail,recommendationTrend`, {
       headers: { 'User-Agent': 'Mozilla/5.0' }
     }).then(res => res.ok ? res.json() : null).catch(err => null);

     // 2. Fetch from Finnhub (Secondary)
     const finnhubQuotePromise = finnhubKey ? fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`).then(res => res.ok ? res.json() : null).catch(err => null) : Promise.resolve(null);
     const finnhubMetricPromise = finnhubKey ? fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${finnhubKey}`).then(res => res.ok ? res.json() : null).catch(err => null) : Promise.resolve(null);

     // 3. Fetch from Alpha Vantage (Tertiary)
     const avKey = 'demo'; // Using demo key as per availability
     const avPromise = fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${avKey}`).then(res => res.ok ? res.json() : null).catch(err => null);

     // 4. Fetch Real-Time Price from Chart API (Same as Home Tab for consistency)
     // Use the new ROBUST fetcher that tries Yahoo -> Finnhub -> Alpha -> Polygon -> FMP -> MarketStack
     const realTimePromise = fetchRobustStockPrice(symbol);

     // Wait for all data
     const [yahooData, finnhubQuote, finnhubMetric, avData, realTimeData] = await Promise.all([yahooPromise, finnhubQuotePromise, finnhubMetricPromise, avPromise, realTimePromise]);

     // Process Yahoo Data
     let yahooResult = null;
     if (yahooData?.quoteSummary?.result?.[0]) {
        yahooResult = yahooData.quoteSummary.result[0];
     }

     // Consolidate Data
     let currentPrice = 0;
     let open = 0;
     let high = 0;
     let low = 0;
     let previousClose = 0;
     let pe = null;
     let dividend = null;
     let exchange = 'N/A';
     let marketCap = 'N/A';
     let sources = [];
     let verified = false;

     // Extract Yahoo Data (QuoteSummary)
     if (yahooResult) {
        sources.push('yahoo');
        const financialData = yahooResult.financialData || {};
        const price = yahooResult.price || {};
        const summaryDetail = yahooResult.summaryDetail || {};
        const defaultKeyStatistics = yahooResult.defaultKeyStatistics || {};

        currentPrice = financialData.currentPrice?.raw || price.regularMarketPrice?.raw || 0;
        open = price.regularMarketOpen?.raw || summaryDetail.open?.raw || 0;
        high = price.regularMarketDayHigh?.raw || summaryDetail.dayHigh?.raw || 0;
        low = price.regularMarketDayLow?.raw || summaryDetail.dayLow?.raw || 0;
        previousClose = price.regularMarketPreviousClose?.raw || summaryDetail.previousClose?.raw || 0;
        
        // PE Ratio (Prioritize Trailing, then Forward)
        pe = summaryDetail.trailingPE?.raw || summaryDetail.forwardPE?.raw || null;
        
        // Dividend Yield (Prioritize Indicated, then Trailing)
        if (summaryDetail.dividendYield?.raw) {
           dividend = (summaryDetail.dividendYield.raw * 100).toFixed(2);
        } else if (summaryDetail.trailingAnnualDividendYield?.raw) {
           dividend = (summaryDetail.trailingAnnualDividendYield.raw * 100).toFixed(2);
        }
        
        exchange = price.exchangeName || 'N/A';
        
        // Market Cap
        if (price.marketCap?.fmt) {
           marketCap = price.marketCap.fmt;
        } else if (price.marketCap?.raw) {
           // Manual formatting if fmt is missing
           const cap = price.marketCap.raw;
           if (cap >= 1e12) marketCap = (cap / 1e12).toFixed(2) + 'T';
           else if (cap >= 1e9) marketCap = (cap / 1e9).toFixed(2) + 'B';
           else if (cap >= 1e6) marketCap = (cap / 1e6).toFixed(2) + 'M';
           else marketCap = cap.toFixed(0);
        } else if (summaryDetail.marketCap?.fmt) {
           marketCap = summaryDetail.marketCap.fmt;
        }
     }

     // OVERWRITE WITH REAL-TIME DATA IF AVAILABLE (To match Home Tab)
     let realTimeChange = 0;
     let realTimeChangePercent = 0;
     let usedRealTime = false;

     if (realTimeData && realTimeData.success && realTimeData.price > 0) {
        // If Yahoo QuoteSummary failed, or if RealTime is available, prefer RealTime for price/change
        currentPrice = realTimeData.price;
        realTimeChange = realTimeData.change;
        realTimeChangePercent = realTimeData.changePercent;
        usedRealTime = true;
        
        // Add source from robust fetcher
        if (!sources.includes(realTimeData.source)) sources.push(realTimeData.source);
        
        // Populate extra fields from FMP if available and missing
        if (realTimeData.source === 'fmp') {
            if ((!marketCap || marketCap === 'N/A') && realTimeData.marketCap) {
                const cap = realTimeData.marketCap;
                if (cap >= 1e12) marketCap = (cap / 1e12).toFixed(2) + 'T';
                else if (cap >= 1e9) marketCap = (cap / 1e9).toFixed(2) + 'B';
                else if (cap >= 1e6) marketCap = (cap / 1e6).toFixed(2) + 'M';
                else marketCap = cap.toFixed(2) + 'M';
            }
            if (!pe && realTimeData.pe) pe = realTimeData.pe;
            if (realTimeData.eps) { /* Optional: Use EPS */ }
            if ((!exchange || exchange === 'N/A') && realTimeData.exchange) exchange = realTimeData.exchange;
        }
     }

     // If Yahoo extraction failed but we have data, double check
     if (sources.length === 0 && currentPrice === 0) {
        // Fallback for safety - if we managed to get data elsewhere but not Yahoo
     }
     
     // Extract Finnhub Data & Verify
     if (finnhubQuote) {
        sources.push('finnhub'); // Honest source name
        
        // If Yahoo/RealTime failed, use Finnhub as primary
        if (currentPrice === 0) {
           currentPrice = finnhubQuote.c || 0;
           open = finnhubQuote.o || 0;
           high = finnhubQuote.h || 0;
           low = finnhubQuote.l || 0;
           previousClose = finnhubQuote.pc || 0;
        } else {
           // Verification logic: If price difference is small (<1%), data is verified
           const diff = Math.abs(currentPrice - finnhubQuote.c);
           if (diff / currentPrice < 0.01) {
              verified = true;
           }
           // Use the more extreme range from both sources to ensure "Low" is lowest and "High" is highest
           if (finnhubQuote.h > high) high = finnhubQuote.h;
           if (finnhubQuote.l < low && finnhubQuote.l > 0) low = finnhubQuote.l;
        }
     }

     if (finnhubMetric?.metric) {
        if (!pe) pe = finnhubMetric.metric.peBasicExclExtraTTM || finnhubMetric.metric.peNormalizedAnnual || null;
        if (!dividend) dividend = finnhubMetric.metric.dividendYieldIndicatedAnnual ? finnhubMetric.metric.dividendYieldIndicatedAnnual.toFixed(2) : null;
        if (exchange === 'N/A' && finnhubMetric.metric.exchange) exchange = finnhubMetric.metric.exchange;
        
        // Fill Market Cap from Finnhub if missing
        if ((marketCap === 'N/A' || !marketCap) && finnhubMetric.metric.marketCapitalization) {
           const cap = finnhubMetric.metric.marketCapitalization; // Finnhub returns in millions
           if (cap >= 1000000) marketCap = (cap / 1000000).toFixed(2) + 'T';
           else if (cap >= 1000) marketCap = (cap / 1000).toFixed(2) + 'B';
           else marketCap = cap.toFixed(2) + 'M';
        }
     }

     // Extract Alpha Vantage Data & Verify
     if (avData && avData['Global Quote'] && avData['Global Quote']['05. price']) {
        sources.push('alphavantage'); // Honest source name
        const avPrice = parseFloat(avData['Global Quote']['05. price']);
        if (currentPrice === 0) currentPrice = avPrice;
        
        // If we have Yahoo/Finnhub price, verify against AV too
        if (currentPrice > 0) {
           const diff = Math.abs(currentPrice - avPrice);
           if (diff / currentPrice < 0.01) verified = true;
        }
     }

     // Calculate Change (If not using real-time values directly)
     let regularMarketChange = 0;
     let regularMarketChangePercent = 0;

     if (usedRealTime) {
        regularMarketChange = realTimeChange;
        regularMarketChangePercent = realTimeChangePercent;
     } else {
        regularMarketChange = parseFloat((currentPrice - previousClose).toFixed(2));
        regularMarketChangePercent = previousClose ? parseFloat((((currentPrice - previousClose) / previousClose) * 100).toFixed(2)) : 0;
     }

     // If we failed to get price from ANY source
     if (currentPrice <= 0) {
        throw new Error(`Unable to fetch real-time data for ${symbol}. Please try again.`);
     }

     // AI Analysis (Groq) with Strict Logic
     let analysis = "ניתוח טכני: המניה מציגה יציבות יחסית עם פוטנציאל לתנודתיות בט��וח הקצר.";
     let targetPrice = parseFloat((currentPrice * 1.05).toFixed(2));
     let signal = "המתן";
     let strength = 50;
     let recommendationGrowth = 5;

     // Attempt to extract Analyst Recommendation from Yahoo Finance if available (Fallback/Baseline)
     if (yahooResult && yahooResult.recommendationTrend && yahooResult.recommendationTrend.trend && yahooResult.recommendationTrend.trend.length > 0) {
        const trend = yahooResult.recommendationTrend.trend[0];
        const strongBuy = trend.strongBuy || 0;
        const buy = trend.buy || 0;
        const hold = trend.hold || 0;
        const sell = trend.sell || 0;
        const strongSell = trend.strongSell || 0;
        
        const totalAnalysts = strongBuy + buy + hold + sell + strongSell;
        
        if (totalAnalysts > 0) {
           const bullishCount = strongBuy + buy;
           const bearishCount = sell + strongSell;
           
           if (bullishCount > bearishCount && bullishCount > hold) {
              signal = strongBuy > buy ? "קנייה חזקה" : "קנייה";
              strength = 75 + Math.round((bullishCount / totalAnalysts) * 25);
              recommendationGrowth = 15;
           } else if (bearishCount > bullishCount && bearishCount > hold) {
              signal = strongSell > sell ? "מכירה חזקה" : "מכירה";
              strength = 75 + Math.round((bearishCount / totalAnalysts) * 25);
              recommendationGrowth = -10;
           } else {
              signal = "המתן";
              strength = 50;
              recommendationGrowth = 5;
           }
           
           // Update target price based on baseline
           if (yahooResult.financialData?.targetMeanPrice?.raw) {
              targetPrice = yahooResult.financialData.targetMeanPrice.raw;
           }
        }
     }
     
     const groqKey = Deno.env.get('GROQ_API_KEY');
     if (groqKey) {
        sources.push('aiturji');
        try {
           const groq = new Groq({ apiKey: groqKey });
           const prompt = `Analyze stock ${symbol}. 
           Current Price: ${currentPrice}
           PE Ratio: ${pe}
           Dividend: ${dividend}%
           Daily Change: ${regularMarketChangePercent}%
           52W High/Low: ${high}/${low}
           
           CRITICAL RULES:
           1. If signal is "קנייה" (Buy), targetPrice MUST be > ${currentPrice}.
           2. If signal is "מכירה" (Sell), targetPrice MUST be < ${currentPrice}.
           3. Provide a logical 3-month target price.
           4. Hebrew analysis max 15 words.
           
           Return JSON ONLY: { "hebrewAnalysis": "string", "targetPrice": number, "signal": "קנייה"|"מכירה"|"המתן"|"קנייה חזקה"|"מכירה חזקה", "strength": 0-100, "growth": number }`;
           
           const completion = await groq.chat.completions.create({
             messages: [{ role: "user", content: prompt }],
             model: "llama-3.3-70b-versatile",
             response_format: { type: "json_object" }
           });
           
           const aiContent = JSON.parse(completion.choices[0]?.message?.content || "{}");
           if (aiContent.hebrewAnalysis) {
              analysis = aiContent.hebrewAnalysis;
              signal = aiContent.signal || signal;
              strength = aiContent.strength || strength;
              recommendationGrowth = aiContent.growth || recommendationGrowth;
              
              // Validate Target Price Logic
              let aiTarget = aiContent.targetPrice;
              if (signal.includes('קנייה') && aiTarget <= currentPrice) {
                 aiTarget = parseFloat((currentPrice * 1.08).toFixed(2)); // Force 8% up
              } else if (signal.includes('מכירה') && aiTarget >= currentPrice) {
                 aiTarget = parseFloat((currentPrice * 0.92).toFixed(2)); // Force 8% down
              }
              targetPrice = aiTarget || targetPrice;
           }
        } catch (e) {
           console.error("Groq Analysis Failed:", e);
           analysis = "ניתוח מבוסס נתונים טכניים בלבד עקב עומס במערכת ה-AI.";
        }
     }

     return {
       symbol,
       name: yahooResult?.price?.shortName || symbol,
       price: currentPrice,
       open,
       high,
       low,
       change: regularMarketChange,
       changePercent: regularMarketChangePercent,
       pe,
       dividend,
       exchange,
       marketCap,
       analysis,
       targetPrice,
       signal,
       strength,
       recommendationGrowth,
       sources: sources
     };

  } catch (error) {
    console.error(`Detailed Fetch Failed for ${symbol}:`, error);
    return { error: error.message };
  }
}

api.get("/stock-details/:symbol", async (c) => {
  const symbol = c.req.param('symbol');
  const data = await fetchDetailedStockData(symbol);
  return c.json(data);
});

const app = new Hono();
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));
app.onError((err, c) => {
  console.error('❌ Global Error:', err);
  return c.json({ error: err.message, stack: err.stack }, 500);
});
app.options("/*", (c) => c.text('', 204));

app.route('/functions/v1/server/make-server-91e99f90', api);
app.route('/make-server-91e99f90', api);
app.route('/', api);

Deno.serve(app.fetch);
