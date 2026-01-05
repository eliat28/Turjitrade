# 🚀 TurjiTrade - AI-Powered Stock Trading Platform

<div align="center">

![TurjiTrade Logo](https://img.shields.io/badge/TurjiTrade-AI%20Trading-F97316?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDJMMiAxMmgzdjhoMTR2LThoM0wxMiAyeiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==)

**אפליקציה מקצועית למסחר מניות עם בינה מלאכותית**  
התראות חכמות • ניתוח בזמן אמת • ממשק עברי RTL

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[תכונות](#-תכונות-עיקריות) • [התחלה מהירה](#-התחלה-מהירה) • [תיעוד](#-תיעוד) • [Documentation Index](DOCUMENTATION_INDEX.md) • [Screenshots](#-screenshots)

</div>

---

## ✨ תכונות עיקריות

### 📊 **רשימת מעקב חכמה (Smart Watchlist)**
- מעקב אחרי מניות מרובות בזמן אמת
- עדכון מחירים אוטומטי כל 30 שניות
- חישוב רווח/הפסד (P&L) לפוזיציות פתוחות
- הערות אישיות לכל מניה

### 🔔 **התראות קנייה אוטומטיות**
- הגדרת טווח מחיר לקנייה (Min-Max)
- שליחת התראות דרך **מייל** ו-**טלגרם**
- התראה נשלחת רק פעם אחת למניה
- נוטיפיקיישן ירוק מהבהב באפליקציה

### 🤖 **ניתוח AI מתקדם**
- המלצות קנייה/מכירה מבוססות בינה מלאכותית
- חוזק סיג널 (Signal Strength)
- מחירי יעד ו-Stop Loss
- היסטוריית ניתוחים מלאה

### 🌐 **אינטגרציות חיצוניות**
- **Finnhub API** - נתוני מניות בזמן אמת
- **EmailJS** - 200 מיילים חינם בחודש
- **Telegram Bot** - התראות ללא הגבלה

### 🎨 **עיצוב מקצועי**
- ממשק RTL עברי מלא
- עיצוב כהה (Dark Mode)
- רספונסיבי למובייל וטאבלט
- צבעי המותג: Turji Orange (#F97316), Turji Cyan (#06B6D4)

---

## 🚀 התחלה מהירה

### דרישות מקדימות
- Node.js 18+ 
- Python 3.8+ (לבוט טלגרם)
- npm או yarn

### התקנה

```bash
# Clone the repository
git clone https://github.com/yourusername/turjitrade.git
cd turjitrade

# Install dependencies
npm install

# Configure API keys (see below)
# Edit: /src/app/config/apiConfig.ts

# Run the app
npm run dev
```

האפליקציה תרוץ על `http://localhost:5173` 🎉

---

## 🔑 הגדרת API Keys

### 1️⃣ **Finnhub (חובה!)** - נתוני מניות

1. הירשם ב-[Finnhub.io](https://finnhub.io/register)
2. קבל את ה-API Key שלך
3. באפליקציה: **Profile Tab** → **API Key** → הדבק

### 2️⃣ **EmailJS (אופציונלי)** - התראות מייל

1. הירשם ב-[EmailJS.com](https://emailjs.com)
2. צור Email Service (Gmail/Outlook)
3. צור Email Template
4. העתק: Service ID, Template ID, Public Key
5. ערוך: `/src/app/config/apiConfig.ts`

```typescript
emailjs: {
  serviceId: 'service_abc123',
  templateId: 'template_xyz789',
  publicKey: 'your_public_key',
}
```

### 3️⃣ **Telegram Bot (אופציונלי)** - התראות טלגרם

1. פתח טלגרם → חפש `@BotFather`
2. שלח `/newbot` ועקוב אחרי ההוראות
3. קבל Bot Token
4. ערוך: `/src/app/config/apiConfig.ts`

```typescript
telegram: {
  botToken: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
}
```

5. **הרץ את הבוט:**

```bash
pip install python-telegram-bot --upgrade
python telegram_bot.py
```

**קרא עוד:** [`TELEGRAM_QUICK_START.md`](TELEGRAM_QUICK_START.md)

---

## 📖 תיעוד

### למשתמשים 👥

| מדריך | תיאור | זמן קריאה |
|-------|-------|----------|
| [**HOW_ALERTS_WORK.md**](HOW_ALERTS_WORK.md) | איך מערכת ההתראות עובדת | 5 דקות |
| [**TELEGRAM_USER_GUIDE.md**](TELEGRAM_USER_GUIDE.md) | חיבור פשוט לטלגרם | 3 דקות |
| [**ALERTS_SETUP_GUIDE.md**](ALERTS_SETUP_GUIDE.md) | הגדרת מייל וטלגרם מלאה | 15 דקות |

### למפתחים 💻

| מדריך | תיאור | זמן קריאה |
|-------|-------|----------|
| [**DEVELOPER_QUICKSTART.md**](DEVELOPER_QUICKSTART.md) ⭐ | התחל כאן! הכל ב-5 דקות | 5 דקות |
| [**SYSTEM_ARCHITECTURE.md**](SYSTEM_ARCHITECTURE.md) | ארכיטקטורה מלאה של המערכת | 20 דקות |
| [**TELEGRAM_QUICK_START.md**](TELEGRAM_QUICK_START.md) | הרצת בוט טלגרם | 2 דקות |
| [**TELEGRAM_BOT_SETUP.md**](TELEGRAM_BOT_SETUP.md) | הגדרה מפורטת + Deploy | 10 דקות |
| [**TELEGRAM_README.md**](TELEGRAM_README.md) | סיכום כל מדריכי הטלגרם | 3 דקות |

---

## 📱 איך זה עובד?

### שלב 1: הוסף מניה לרשימת מעקב

```
רשימת מעקב → ➕ → AAPL → התראת קנייה ✅
מחיר מינימום: $150
מחיר מקסימום: $180
ערוצים: ☑️ מייל ☑️ טלגרם
```

### שלב 2: המערכת עובדת בשבילך

```
✅ בודקת מחירים כל 30 שניות
✅ מחיר נכנס לטווח? → שולחת התראה!
✅ מייל נשלח אוטומטית
✅ טלגרם נשלח אוטומטית
✅ נוטיפיקיישן ירוק באפליקציה
```

### שלב 3: קבל התראה וקנה!

```
📧 "AAPL נמצאת ב-$165 - זמןapatkan!"
📱 הודעה בטלגרם
💚 נוטיפיקיישן באפליקציה
```

**פשוט ככה!** 🎉

---

## 🖼️ Screenshots

<div align="center">

### רשימת מעקב (Watchlist)
<img src="docs/images/watchlist.png" alt="Watchlist" width="300"/>

### התראות (Alerts)
<img src="docs/images/alerts.png" alt="Alerts" width="300"/>

### ניתוח AI
<img src="docs/images/analysis.png" alt="AI Analysis" width="300"/>

</div>

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework
- **TypeScript 5** - Type Safety
- **Tailwind CSS 4** - Styling
- **Vite** - Build Tool
- **Lucide React** - Icons

### Services
- **Finnhub API** - Stock Data
- **EmailJS** - Email Alerts
- **Telegram Bot API** - Telegram Alerts

### Storage
- **LocalStorage** - Client-side data

### Deployment
- **Vercel/Netlify** - Frontend
- **Railway/Render** - Telegram Bot

---

## 📂 מבנה הפרויקט

```
turjitrade/
├── src/
│   ├── app/
│   │   ├── App.tsx                      # Main app
│   │   ├── components/
│   │   │   ├── tabs/
│   │   │   │   ├── WatchlistTab.tsx     # רשימת מעקב
│   │   │   │   ├── AlertsTab.tsx        # הגדרות התראות
│   │   │   │   ├── AnalysisTab.tsx      # ניתוח AI
│   │   │   │   └── ProfileTab.tsx       # פרופיל
│   │   │   ├── BuyAlertNotification.tsx # התראות
│   │   │   └── TelegramLoginButton.tsx  # חיבור טלגרם
│   │   ├── services/
│   │   │   ├── stockApi.ts              # Finnhub API
│   │   │   ├── emailService.ts          # EmailJS
│   │   │   └── telegramService.ts       # Telegram Bot
│   │   └── config/
│   │       └── apiConfig.ts             # API Keys
│   └── styles/
│       ├── theme.css                    # Design tokens
│       └── fonts.css                    # Heebo font
├── telegram_bot.py                      # בוט טלגרם
├── requirements.txt                     # Python dependencies
└── package.json                         # npm dependencies
```

---

## 🧪 Testing

### בדוק התראות מייל:
```bash
# באפליקציה
Alert Tab → הגדר מייל → בדוק התראה עכשיו
```

### בדוק התראות טלגרם:
```bash
# הרץ בוט
python telegram_bot.py

# באפליקציה
Alert Tab → הגדר טלגרם → בדוק התראה עכשיו
```

### בדוק התראות Live:
```bash
# הוסף מניה עם טווח מחיר קרוב למחיר הנוכחי
# המתן עד 30 שניות
# התראה אמורה להישלח אוטומטית!
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
npm install -g vercel
vercel
```

### Telegram Bot (Railway)

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Select repo
5. Done! 🎉

**קרא עוד:** [`TELEGRAM_BOT_SETUP.md`](TELEGRAM_BOT_SETUP.md)

---

## 🔒 אבטחה ופרטיות

- ✅ כל הנתונים נשמרים **מקומית** בדפדפן (localStorage)
- ✅ אין שרת מרכזי שאוסף מידע
- ✅ התקשורת ישירה בין הדפדפן שלך לשירותים
- ✅ אנחנו **לא** אוספים או שומרים מידע אישי
- ✅ מפתחות API נשארים בקוד שלך בלבד

---

## 🤝 Contributing

רוצה לתרום? אנחנו נשמח!

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Finnhub** - Stock market data
- **EmailJS** - Email service
- **Telegram** - Messaging platform
- **React Team** - Amazing framework
- **Tailwind CSS** - Beautiful styling
- **Lucide** - Clean icons

---

## 📞 תמיכה

### יש שאלה? יש בעיה?

1. בדוק את ה-[Documentation](#-תיעוד) למעלה
2. חפש ב-[Issues](https://github.com/yourusername/turjitrade/issues)
3. פתח [Issue חדש](https://github.com/yourusername/turjitrade/issues/new)

### מדריכים מהירים:

- **למשתמשים:** [`HOW_ALERTS_WORK.md`](HOW_ALERTS_WORK.md)
- **למפתחים:** [`DEVELOPER_QUICKSTART.md`](DEVELOPER_QUICKSTART.md)
- **טלגרם:** [`TELEGRAM_USER_GUIDE.md`](TELEGRAM_USER_GUIDE.md)

---

## 🎯 Roadmap

### בקרוב:
- [ ] אינטגרציה עם WhatsApp
- [ ] תמיכה בבורסות נוספות
- [ ] גרפים היסטוריים
- [ ] Portfolio analytics

### עתיד:
- [ ] אפליקציית מובייל (React Native)
- [ ] תחזיות AI אמיתיות (ML Model)
- [ ] Social trading
- [ ] תמיכה מולטי-משתמש

---

<div align="center">

**נבנה עם ❤️ על ידי TurjiTrade Team**

[![Star on GitHub](https://img.shields.io/github/stars/yourusername/turjitrade.svg?style=social)](https://github.com/yourusername/turjitrade)
[![Follow on Twitter](https://img.shields.io/twitter/follow/turjitrade?style=social)](https://twitter.com/turjitrade)

[Website](https://turjitrade.com) • [Documentation](DEVELOPER_QUICKSTART.md) • [Demo](https://demo.turjitrade.com)

</div>

---

## 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/turjitrade)
![GitHub language count](https://img.shields.io/github/languages/count/yourusername/turjitrade)
![GitHub top language](https://img.shields.io/github/languages/top/yourusername/turjitrade)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/turjitrade)

---

**Ready to start?** → [`DEVELOPER_QUICKSTART.md`](DEVELOPER_QUICKSTART.md) ⚡

**מסחר חכם עם AI** 🤖 | **התראות אוטומטיות** 🔔 | **ממשק עברי מקצועי** 🇮🇱