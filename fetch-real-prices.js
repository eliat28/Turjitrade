// Script to fetch real prices from Yahoo Finance and update the code
// Run this with: node fetch-real-prices.js

const https = require('https');

const symbols = [
  'AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA', 'AMZN', 'META', 'AMD',
  'PLTR', 'SOFI', 'NIO', 'RIVN', 'PLUG', 'LCID', 'BB', 'INTC'
];

async function fetchYahooPrice(symbol) {
  return new Promise((resolve, reject) => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const result = json?.chart?.result?.[0];
          const meta = result?.meta;
          
          if (!meta) {
            reject(new Error(`No data for ${symbol}`));
            return;
          }
          
          const price = meta.regularMarketPrice || meta.previousClose;
          const previousClose = meta.chartPreviousClose || meta.previousClose;
          const change = ((price - previousClose) / previousClose) * 100;
          
          resolve({
            symbol,
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(change.toFixed(2))
          });
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function fetchAllPrices() {
  console.log('🔄 Fetching real prices from Yahoo Finance...\n');
  
  const results = {};
  
  for (const symbol of symbols) {
    try {
      const data = await fetchYahooPrice(symbol);
      results[symbol] = data;
      console.log(`✅ ${symbol}: $${data.price} (${data.change >= 0 ? '+' : ''}${data.change}%)`);
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.log(`❌ ${symbol}: Failed - ${err.message}`);
    }
  }
  
  console.log('\n📊 Real Prices (copy these to your code):\n');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

fetchAllPrices().catch(console.error);
