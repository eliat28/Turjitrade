# ⚡ TurjiTrade PWA - תיקון מהיר

> **PWA לא עובד? תקן ב-3 דקות! ⏱️**

---

## 🎯 הבעיה

האייקונים הם **SVG** במקום **PNG** ← דפדפנים לא תומכים!

---

## ✅ הפתרון (3 שלבים)

### 1. פתח את זה בדפדפן:
```
create-pwa-icons-simple.html
```
גרור את הקובץ לחלון הדפדפן

### 2. הורד את כל האייקונים
לחץ "הורד" מתחת לכל אייקון (8 קבצים)

### 3. העתק לפרויקט
```bash
# Mac/Linux
mv ~/Downloads/icon-*.png ./public/

# Windows
move %USERPROFILE%\Downloads\icon-*.png .\public\
```

---

## ✅ בדוק שעובד

```bash
# וודא שיש 8 קבצים
ls public/icon-*.png

# הפעל את האפליקציה
npm run dev

# פתח DevTools (F12) → Application → Manifest
# בדוק שכל האייקונים עם ✅
```

---

## 🎉 זהו! PWA אמור לעבוד

נסה להתקין על:
- 📱 iOS: Safari → Share → "Add to Home Screen"
- 🤖 Android: Chrome → "Install app"
- 💻 Desktop: אייקון בשורת הכתובת

---

## 📚 רוצה יותר פרטים?

| רמה | קובץ | זמן |
|-----|------|-----|
| 🟢 קל | [START_HERE_PWA.md](./START_HERE_PWA.md) | 5 דק' |
| 🟡 בינוני | [PWA_QUICK_FIX.md](./PWA_QUICK_FIX.md) | 10 דק' |
| 🔴 מלא | [PWA_COMPLETE_GUIDE.md](./PWA_COMPLETE_GUIDE.md) | 30 דק' |
| 📋 Checklist | [PWA_CHECKLIST.md](./PWA_CHECKLIST.md) | 15 דק' |
| 🗂️ כל המדריכים | [PWA_DOCS_INDEX.md](./PWA_DOCS_INDEX.md) | - |

---

## 🐛 עדיין לא עובד?

```bash
# נקה cache
rm -rf .vite dist

# הפעל מחדש
npm run dev
```

או קרא: [PWA_COMPLETE_GUIDE.md](./PWA_COMPLETE_GUIDE.md) → Troubleshooting

---

**בהצלחה!** 🚀
