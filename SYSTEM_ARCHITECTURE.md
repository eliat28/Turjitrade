# 🏗️ TurjiTrade - System Architecture

## 📋 סקירה כללית

TurjiTrade היא אפליקציה מקצועית למסחר מניות מבוססת AI עם מערכת התראות חכמה.

---

## 🎯 תכונות עיקריות

### 1️⃣ **ניהול רשימת מעקב (Watchlist)**
- מעקב אחרי מניות מרובות
- עדכון מחירים בזמן אמת (כל 30 שניות)
- חישוב P&L לפוזיציות פתוחות
- הערות ותיוג למניות

### 2️⃣ **התראות קנייה חכמות (Smart Buy Alerts)**
- הגדרת טווח מחיר לקנייה (Min-Max)
- בדיקה אוטומטית כל 30 שניות
- שליחת התראות דרך מייל וטלגרם
- התראה נשלחת פעם אחת בלבד למניה

### 3️⃣ **ניתוח מניות מבוסס AI**
- המלצות קנייה/מכירה
- חוזק סיגנל (Signal Strength)
- מחירי יעד ו-Stop Loss
- היסטוריית ניתוחים

### 4️⃣ **אינטגרציות חיצוניות**
- **Finnhub API** - נתוני מניות בזמן אמת
- **EmailJS** - שליחת מיילים (200/חודש חינם)
- **Telegram Bot API** - התראות טלגרם (ללא הגבלה)

---

## 🔧 ארכיטקטורה טכנית

### **Frontend Stack:**
```
React + TypeScript
├── Tailwind CSS (v4) - עיצוב
├── Lucide React - אייקונים
├── LocalStorage - אחסון מקומי
└── RTL Support - תמיכה בעברית
```

### **Backend/Services:**
```
External APIs
├── Finnhub API - Stock data
├── EmailJS - Email alerts
├── Telegram Bot API - Telegram alerts
└── (Optional) Supabase - For future features
```

### **Data Flow:**
```
User Input
    ↓
React State (watchlist)
    ↓
LocalStorage (persistence)
    ↓
Price Updates (every 30s)
    ↓
Alert Checker (useEffect)
    ↓
Notification Component
    ↓
Email/Telegram Services
    ↓
User receives alert!
```

---

## 📂 מבנה הקבצים

```
/src/app
├── App.tsx                          # Main app component
├── components/
│   ├── tabs/
│   │   ├── WatchlistTab.tsx         # רשימת מעקב + בדיקת התראות
│   │   ├── AlertsTab.tsx            # הגדרות התראות (מייל/טלגרם)
│   │   ├── AnalysisTab.tsx          # ניתוח מניות AI
│   │   └── ProfileTab.tsx           # פרופיל משתמש
│   ├── BuyAlertNotification.tsx     # Notification component (שולח התראות!)
│   ├── TelegramLoginButton.tsx      # חיבור פשוט לטלגרם
│   ├── ContactSetupModal.tsx        # מודל הגדרת מייל/טלגרם
│   └── AddToWatchlistModal.tsx      # הוספת מניה לרשימה
├── services/
│   ├── stockApi.ts                  # Finnhub integration
│   ├── emailService.ts              # EmailJS integration
│   └── telegramService.ts           # Telegram Bot API
└── config/
    └── apiConfig.ts                 # מפתחות API מרכזיים
```

---

## 🔄 זרימת התראות (Alert Flow)

### **שלב 1: הגדרה ראשונית (One-time Setup)**

```typescript
// User goes to AlertsTab
const userEmail = 'user@example.com';
const userTelegramId = '123456789';

// Save to localStorage
localStorage.setItem('turjiTrade_user_email', userEmail);
localStorage.setItem('turjiTrade_user_telegram_id', userTelegramId);
```

### **שלב 2: הוספת מניה עם התראה**

```typescript
// User adds stock in WatchlistTab
const newStock = {
  symbol: 'AAPL',
  buyAlert: true,
  buyPriceMin: 150,
  buyPriceMax: 180,
  alertChannels: {
    email: true,
    telegram: true,
    whatsapp: false
  },
  buyAlertTriggered: false
};

// Save to watchlist
setWatchlist([...watchlist, newStock]);
```

### **שלב 3: בדיקת מחירים (Every 30 seconds)**

```typescript
// WatchlistTab.tsx
useEffect(() => {
  const interval = setInterval(() => {
    updateWatchlistPrices(); // Fetch from Finnhub API
  }, 30000);
  
  return () => clearInterval(interval);
}, [watchlist]);
```

### **שלב 4: זיהוי התראה (Alert Detection)**

```typescript
// WatchlistTab.tsx
useEffect(() => {
  watchlist.forEach(item => {
    if (item.buyAlert && !item.buyAlertTriggered) {
      // Check if price is in range
      if (item.currentPrice >= item.buyPriceMin && 
          item.currentPrice <= item.buyPriceMax) {
        
        // Trigger notification
        setBuyAlertNotifications(prev => [...prev, {
          id: item.id,
          symbol: item.symbol,
          price: item.currentPrice,
          channels: item.alertChannels
        }]);
        
        // Mark as triggered (won't trigger again)
        setWatchlist(prev => prev.map(i => 
          i.id === item.id ? { ...i, buyAlertTriggered: true } : i
        ));
      }
    }
  });
}, [watchlist]);
```

### **שלב 5: שליחת התראות (Send Alerts)**

```typescript
// BuyAlertNotification.tsx
useEffect(() => {
  const sendAlerts = async () => {
    const userEmail = localStorage.getItem('turjiTrade_user_email');
    const userTelegramId = localStorage.getItem('turjiTrade_user_telegram_id');

    // Send Email
    if (channels.email && userEmail) {
      await sendEmailAlert(userEmail, symbol, price, priceMin, priceMax);
    }
    
    // Send Telegram
    if (channels.telegram && userTelegramId) {
      const message = formatTelegramBuyAlert(symbol, price, priceMin, priceMax);
      await sendTelegramAlert(userTelegramId, message);
    }
  };

  sendAlerts();
}, []);
```

---

## 🔌 External Services Integration

### **1. Finnhub API (Stock Data)**

```typescript
// stockApi.ts
const FINNHUB_API_KEY = localStorage.getItem('turjiTrade_finnhub_api_key');

export const fetchStockPrice = async (symbol: string) => {
  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
  );
  const data = await response.json();
  return {
    price: data.c,
    changePercent: data.dp
  };
};
```

### **2. EmailJS (Email Alerts)**

```typescript
// emailService.ts
import emailjs from '@emailjs/browser';

export const sendEmailAlert = async (
  toEmail: string,
  symbol: string,
  currentPrice: number,
  priceMin: number,
  priceMax: number
): Promise<boolean> => {
  const config = getEmailConfig(); // From apiConfig.ts
  
  emailjs.init(config.publicKey);
  
  const response = await emailjs.send(
    config.serviceId,
    config.templateId,
    {
      to_email: toEmail,
      symbol: symbol,
      current_price: currentPrice.toFixed(2),
      price_min: priceMin.toFixed(2),
      price_max: priceMax.toFixed(2)
    }
  );
  
  return response.status === 200;
};
```

### **3. Telegram Bot API (Telegram Alerts)**

```typescript
// telegramService.ts
export const sendTelegramAlert = async (
  chatId: string,
  message: string
): Promise<TelegramResult> => {
  const config = getTelegramConfig(); // From apiConfig.ts
  
  const response = await fetch(
    `https://api.telegram.org/bot${config.botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    }
  );
  
  const data = await response.json();
  return { success: data.ok };
};
```

---

## 🤖 Telegram Bot Setup

### **Bot Script (Python):**

```python
# telegram_bot.py
from telegram import Update
from telegram.ext import Application, CommandHandler

BOT_TOKEN = "8264340445:AAHvwQQAHwfnnDQdGhOxGv9uB2pDEG3cPpU"

async def start(update: Update, context):
    chat_id = update.effective_chat.id
    
    await update.message.reply_text(
        f"👋 שלום!\n\n"
        f"📱 ה-Chat ID שלך:\n"
        f"`{chat_id}`\n\n"
        f"📋 העתק את המספר למעלה והדבק באפליקציה!",
        parse_mode="Markdown"
    )

def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.run_polling()

if __name__ == "__main__":
    main()
```

### **Running the Bot:**

```bash
# Install dependencies
pip install python-telegram-bot --upgrade

# Run bot
python telegram_bot.py
```

---

## 📊 Data Models

### **WatchlistItem:**

```typescript
interface WatchlistItem {
  id: number;                    // Unique ID
  symbol: string;                // Stock symbol (AAPL)
  name: string;                  // Stock name (Apple Inc.)
  currentPrice: number;          // Current price
  change: number;                // Change %
  alert?: number;                // Price alert (legacy)
  notes?: string;                // User notes
  isTrading: boolean;            // Active position?
  entryPrice?: number;           // Entry price
  quantity?: number;             // Quantity owned
  buyAlert?: boolean;            // Buy alert enabled?
  buyPriceMin?: number;          // Min buy price
  buyPriceMax?: number;          // Max buy price
  alertChannels?: {              // Alert channels
    email: boolean;
    whatsapp: boolean;
    telegram: boolean;
  };
  buyAlertTriggered?: boolean;   // Alert sent?
}
```

### **Notification:**

```typescript
interface Notification {
  id: number;                    // Match watchlist item ID
  symbol: string;                // Stock symbol
  price: number;                 // Current price (at trigger)
  channels: {                    // Which channels to send
    email: boolean;
    telegram: boolean;
    whatsapp: boolean;
  };
}
```

---

## 🔒 Security & Privacy

### **Local Storage:**
```
turjiTrade_watchlist          - רשימת המעקב
turjiTrade_user_email         - כתובת המייל
turjiTrade_user_telegram_id   - Telegram Chat ID
turjiTrade_finnhub_api_key    - Finnhub API key
turjiTrade_analyses           - היסטוריית ניתוחים
```

### **Security Notes:**
- ✅ All data stored locally (no server)
- ✅ API keys never shared
- ✅ Direct communication with services
- ✅ No analytics or tracking
- ❌ Don't share localStorage data
- ❌ Don't expose API keys

---

## ⚡ Performance Optimizations

### **1. Batch Price Updates:**
```typescript
// Instead of fetching each stock individually
const symbols = watchlist.map(item => item.symbol);
const quotesMap = await fetchMultipleStockPrices(symbols);
```

### **2. Debounce Alert Checks:**
```typescript
// Alert check runs only when watchlist changes
useEffect(() => {
  watchlist.forEach(item => checkAlert(item));
}, [watchlist]); // Dependency on watchlist
```

### **3. Prevent Duplicate Notifications:**
```typescript
setBuyAlertNotifications(prev => {
  if (prev.some(n => n.id === item.id)) return prev; // Skip
  return [...prev, newNotification];
});
```

---

## 🧪 Testing Guide

### **1. Test Email Alerts:**

1. הגדר EmailJS ב-`apiConfig.ts`
2. לך ל-AlertsTab → הגדר מייל
3. לך ל-WatchlistTab → הוסף מניה עם התראה
4. לחץ "בדוק התראה עכשיו"
5. בדוק את המייל

### **2. Test Telegram Alerts:**

1. הרץ `python telegram_bot.py`
2. שלח `/start` לבוט
3. העתק Chat ID
4. לך ל-AlertsTab → הדבק Chat ID
5. לך ל-WatchlistTab → הוסף מניה
6. לחץ "בדוק התראה עכשיו"
7. בדוק בטלגרם

### **3. Test Live Alerts:**

1. הגדר מניה עם טווח מחיר **קרוב** למחיר הנוכחי
2. המתן עד 30 שניות
3. המחיר אמור להיכנס לטווח
4. התראה אמורה להישלח אוטומטית

---

## 🚀 Deployment

### **Frontend (Vercel/Netlify):**
```bash
npm run build
# Deploy dist/ folder
```

### **Telegram Bot (Railway/Render):**
```bash
# Push to GitHub
git add telegram_bot.py requirements.txt
git commit -m "Add bot"
git push

# Deploy on Railway
# Connect GitHub repo → Auto-deploy
```

---

## 📚 Documentation Files

- `README.md` - מדריך כללי
- `ALERTS_SETUP_GUIDE.md` - הגדרת התראות מלאה
- `HOW_ALERTS_WORK.md` - הסבר איך ההתראות עובדות
- `TELEGRAM_USER_GUIDE.md` - מדריך למשתמשים
- `TELEGRAM_QUICK_START.md` - מדריך מהיר למפתחים
- `TELEGRAM_BOT_SETUP.md` - הגדרת בוט מפורטת
- `TELEGRAM_README.md` - סיכום כל המדריכים
- `SYSTEM_ARCHITECTURE.md` - המסמך הזה

---

## 🎯 Future Enhancements

### **Short-term:**
- [ ] WhatsApp integration (Twilio)
- [ ] More stock exchanges (Nasdaq, NYSE)
- [ ] Portfolio analytics
- [ ] Historical price charts

### **Long-term:**
- [ ] Real AI predictions (ML model)
- [ ] Social trading features
- [ ] Mobile app (React Native)
- [ ] Multi-user support (Supabase)

---

**Built with ❤️ by TurjiTrade Team**  
🤖 Smart Trading with AI
