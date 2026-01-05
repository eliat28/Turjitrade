# ⚡ Developer Quick Start - TurjiTrade

## 🚀 Get Running in 5 Minutes

### 1️⃣ **Install Dependencies**
```bash
npm install
```

### 2️⃣ **Configure API Keys**

Edit `/src/app/config/apiConfig.ts`:

```typescript
export const API_CONFIG = {
  emailjs: {
    serviceId: 'YOUR_SERVICE_ID',      // From emailjs.com
    templateId: 'YOUR_TEMPLATE_ID',    // From emailjs.com
    publicKey: 'YOUR_PUBLIC_KEY',      // From emailjs.com
  },
  telegram: {
    botToken: 'YOUR_BOT_TOKEN',        // From @BotFather
  }
};
```

### 3️⃣ **Run the App**
```bash
npm run dev
```

### 4️⃣ **Run Telegram Bot** (Optional)
```bash
pip install python-telegram-bot --upgrade
python telegram_bot.py
```

**Done!** App running on `http://localhost:5173` 🎉

---

## 📂 Project Structure (What to Edit)

```
/src/app/
├── App.tsx                        # ✏️ Main app - start here
├── components/
│   ├── tabs/
│   │   ├── WatchlistTab.tsx       # ✏️ Watchlist + alert logic
│   │   ├── AlertsTab.tsx          # ✏️ Alert settings UI
│   │   └── AnalysisTab.tsx        # ✏️ AI analysis
│   ├── BuyAlertNotification.tsx   # ✏️ Sends alerts!
│   └── TelegramLoginButton.tsx    # ✏️ Telegram connection UI
├── services/
│   ├── emailService.ts            # ✏️ Email sending
│   ├── telegramService.ts         # ✏️ Telegram sending
│   └── stockApi.ts                # ✏️ Finnhub API calls
└── config/
    └── apiConfig.ts               # ⚙️ API keys - configure first!
```

---

## 🔑 API Keys You Need

### **1. Finnhub (Stock Data)** - FREE
1. Go to https://finnhub.io/register
2. Get your API key
3. Add in app: Profile Tab → API Key → Paste
4. **Stored in:** `localStorage.turjiTrade_finnhub_api_key`

### **2. EmailJS (Email Alerts)** - FREE (200/month)
1. Go to https://emailjs.com/
2. Create account
3. Add Email Service (Gmail/Outlook)
4. Create Email Template
5. Get: Service ID, Template ID, Public Key
6. **Configure in:** `/src/app/config/apiConfig.ts`

### **3. Telegram Bot** - FREE (unlimited)
1. Open Telegram → Search `@BotFather`
2. Send `/newbot`
3. Follow instructions
4. Get Bot Token
5. **Configure in:** `/src/app/config/apiConfig.ts`

---

## 🔄 How Alerts Work (Quick Flow)

```
User adds stock with buy alert
    ↓
App checks prices every 30s
    ↓
Price enters range?
    ↓
Trigger BuyAlertNotification
    ↓
Send email (EmailJS)
    ↓
Send telegram (Bot API)
    ↓
Show green notification
    ↓
Mark as triggered (once only)
```

**Key Files:**
- **Check logic:** `WatchlistTab.tsx` (line 152-177)
- **Send alerts:** `BuyAlertNotification.tsx` (line 36-81)

---

## 📝 Common Tasks

### **Add a New Alert Channel (e.g., WhatsApp)**

1. **Update interface:**
```typescript
// WatchlistTab.tsx
interface WatchlistItem {
  alertChannels?: {
    email: boolean;
    telegram: boolean;
    whatsapp: boolean;  // ← Add this
  };
}
```

2. **Create service:**
```typescript
// whatsappService.ts
export const sendWhatsAppAlert = async (
  phoneNumber: string,
  message: string
): Promise<boolean> => {
  // Implement using Twilio or WhatsApp Business API
};
```

3. **Update notification:**
```typescript
// BuyAlertNotification.tsx
if (channels.whatsapp && userWhatsApp) {
  await sendWhatsAppAlert(userWhatsApp, message);
}
```

---

### **Change Update Interval (Default: 30s)**

```typescript
// WatchlistTab.tsx (line 143-150)
useEffect(() => {
  const interval = setInterval(() => {
    updateWatchlistPrices();
  }, 30000); // ← Change this (in milliseconds)
  
  return () => clearInterval(interval);
}, [watchlist]);
```

**Examples:**
- `10000` = 10 seconds
- `60000` = 1 minute
- `300000` = 5 minutes

---

### **Customize Email Template**

1. Go to EmailJS.com → Email Templates
2. Edit your template
3. Available variables:
```
{{to_email}}        - Recipient email
{{symbol}}          - Stock symbol
{{current_price}}   - Current price
{{price_min}}       - Min price
{{price_max}}       - Max price
{{app_name}}        - "TurjiTrade"
```

---

### **Customize Telegram Message**

Edit `telegramService.ts`:

```typescript
export const formatTelegramBuyAlert = (
  symbol: string,
  currentPrice: number,
  priceMin: number,
  priceMax: number
): string => {
  return `🎯 <b>התראת קנייה - TurjiTrade</b>

📊 <b>מניה:</b> ${symbol}
💰 <b>מחיר נוכחי:</b> $${currentPrice.toFixed(2)}
📉 <b>טווח מחיר:</b> $${priceMin.toFixed(2)} - $${priceMax.toFixed(2)}

✅ המניה נכנסה לטווח המחיר שהגדרת!
זה הזמן לשקול קנייה.

🤖 TurjiTrade - מסחר חכם עם AI`;
};
```

---

## 🐛 Debugging Tips

### **Email not sending?**

1. Check console for errors
2. Verify EmailJS config in `apiConfig.ts`
3. Check EmailJS dashboard quota (200/month)
4. Test manually:
```typescript
import { sendTestEmail } from './services/emailService';
sendTestEmail('your@email.com');
```

### **Telegram not sending?**

1. Check if bot is running: `python telegram_bot.py`
2. Verify Chat ID is correct (numbers only)
3. Verify Bot Token in `apiConfig.ts`
4. Test manually:
```typescript
import { sendTelegramAlert } from './services/telegramService';
sendTelegramAlert('123456789', 'Test message');
```

### **Prices not updating?**

1. Check Finnhub API key is set
2. Check console for API errors
3. Verify symbol is valid (use UPPERCASE)
4. Check Finnhub API quota

### **Alerts not triggering?**

1. Check price is actually in range
2. Verify `buyAlertTriggered` is `false`
3. Check `alertChannels` are set
4. Look at console logs for debug info

---

## 🧪 Testing Checklist

Before deploying, test:

- [ ] Add stock to watchlist
- [ ] Edit stock in watchlist
- [ ] Delete stock from watchlist
- [ ] Add stock with buy alert
- [ ] Email alert sends
- [ ] Telegram alert sends
- [ ] Price updates every 30s
- [ ] Green notification appears
- [ ] Alert only sends once
- [ ] Settings saved in localStorage
- [ ] Works on mobile
- [ ] Works offline (with cached data)

---

## 📦 Build & Deploy

### **Build for Production:**
```bash
npm run build
```

Output in `/dist` folder.

### **Deploy Options:**

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**GitHub Pages:**
```bash
npm run build
# Push dist/ to gh-pages branch
```

### **Deploy Telegram Bot:**

**Railway (Recommended):**
1. Push code to GitHub
2. Go to https://railway.app
3. New Project → Deploy from GitHub
4. Select repo
5. Add start command: `python telegram_bot.py`
6. Deploy!

**Render:**
Similar to Railway, but free tier sleeps after 15 min inactivity.

---

## 🎨 Customization

### **Change Colors:**

Edit `/src/styles/theme.css`:

```css
:root {
  --color-turji-orange: #F97316;  /* Primary color */
  --color-turji-cyan: #06B6D4;    /* Secondary color */
  /* Add more... */
}
```

### **Change Font:**

Edit `/src/styles/fonts.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Heebo', 'Roboto', sans-serif;
}
```

### **Add Dark/Light Mode:**

```typescript
// App.tsx
const [darkMode, setDarkMode] = useState(true);

<div className={darkMode ? 'dark' : 'light'}>
  {/* App content */}
</div>
```

Then use Tailwind's dark mode classes:
```jsx
<div className="bg-slate-900 dark:bg-white">
```

---

## 📚 Learn More

- **React:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Finnhub API:** https://finnhub.io/docs/api
- **EmailJS:** https://www.emailjs.com/docs
- **Telegram Bot API:** https://core.telegram.org/bots/api

---

## 🆘 Get Help

**Check Documentation:**
1. `ALERTS_SETUP_GUIDE.md` - Alert setup
2. `HOW_ALERTS_WORK.md` - How alerts work
3. `SYSTEM_ARCHITECTURE.md` - Full architecture
4. `TELEGRAM_QUICK_START.md` - Telegram setup

**Debug with Console:**
```typescript
console.log('Debug info:', variable);
```

All services have detailed console logs!

---

## 🎯 Quick Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Telegram Bot
python telegram_bot.py   # Run bot
pip install -r requirements.txt  # Install dependencies

# Git
git add .
git commit -m "message"
git push
```

---

**Happy Coding! 🚀**

Questions? Check `SYSTEM_ARCHITECTURE.md` for detailed info!
