# ✅ PWA Setup Checklist - TurjiTrade

## 📋 רשימת משימות

### שלב 1: יצירת אייקונים
- [ ] פתחתי את `create-pwa-icons-simple.html` בדפדפן
- [ ] האייקונים נוצרו אוטומטית (8 קבצים)
- [ ] הורדתי את כל האייקונים
- [ ] העתקתי את הקבצים לתיקיית `/public/`

### שלב 2: בדיקת קבצים
```bash
ls public/icon-*.png
```
- [ ] `icon-72x72.png` קיים
- [ ] `icon-96x96.png` קיים
- [ ] `icon-128x128.png` קיים
- [ ] `icon-144x144.png` קיים
- [ ] `icon-152x152.png` קיים
- [ ] `icon-192x192.png` קיים
- [ ] `icon-384x384.png` קיים
- [ ] `icon-512x512.png` קיים

### שלב 3: הפעלת השרת
```bash
npm run dev
```
- [ ] השרת עלה ללא שגיאות
- [ ] האפליקציה נפתחת בדפדפן

### שלב 4: בדיקה ב-DevTools
**F12 → Application → Manifest**
- [ ] Manifest URL נטען בהצלחה
- [ ] שם האפליקציה: "TurjiTrade"
- [ ] Theme color: #10b981 (ירוק)
- [ ] כל 8 האייקונים מופיעים
- [ ] אין שגיאות 404

**Application → Service Workers**
- [ ] `/sw.js` רשום
- [ ] Status: Activated and running
- [ ] אין שגיאות

**Console**
- [ ] יש הודעה: `[PWA] Service Worker registered successfully`
- [ ] יש הודעה: `[Service Worker] Installed successfully`
- [ ] אין שגיאות אדומות

### שלב 5: בדיקת התקנה (Desktop)
**Chrome/Edge:**
- [ ] סמל התקנה (⊕) מופיע בשורת הכתובת
- [ ] לחיצה על הסמל פותחת דיאלוג התקנה
- [ ] לאחר התקנה - האפליקציה נפתחת בחלון נפרד
- [ ] האייקון נכון (לוגו TurjiTrade)

### שלב 6: בדיקת התקנה (Mobile)

#### iOS (Safari)
- [ ] פתחתי את האפליקציה ב-Safari
- [ ] לחצתי על כפתור השיתוף (📤)
- [ ] ראיתי "הוסף למסך הבית"
- [ ] האייקון במסך הבית הוא לוגו TurjiTrade
- [ ] פתיחת האפליקציה: fullscreen ללא שורת כתובת

#### Android (Chrome)
- [ ] פתחתי את האפליקציה ב-Chrome
- [ ] לאחר 3 שניות הופיעה הודעת התקנה
- [ ] או: ראיתי "Install app" בתפריט
- [ ] האייקון במסך הבית עגול עם הלוגו
- [ ] פתיחת האפליקציה: fullscreen

### שלב 7: בדיקת InstallPrompt
- [ ] לאחר 3 שניות מופיע banner ירוק בתחתית
- [ ] הכיתוב: "התקן את TurjiTrade"
- [ ] יש כפתור X לסגירה
- [ ] יש כפתור "התקן עכשיו" (Android/Desktop)
- [ ] או הוראות להתקנה (iOS)

### שלב 8: בדיקת InstallButton (פרופיל)
- [ ] יש כפתור "התקן אפליקציה" בפרופיל
- [ ] לחיצה עליו פותחת את ה-prompt
- [ ] אחרי התקנה מופיע "האפליקציה מותקנת"

---

## 🎯 תוצאה מצופה

### אחרי התקנה מוצלחת:

✅ **אייקון**
- לוגו TurjiTrade עם רקע כהה
- אות T ירוק + גרף מניות
- כוכב AI

✅ **חוויית שימוש**
- פתיחה מהירה מהמסך הבית
- fullscreen (ללא שורת כתובת)
- נראה כמו אפליקציה native

✅ **Offline**
- Service Worker פעיל
- קבצים בסיסיים ב-cache
- עובד גם ללא אינטרנט (חלקית)

---

## 🐛 בעיות? סמן כאן

### אייקונים לא נטענים
- [ ] ניקיתי cache: `rm -rf .vite dist`
- [ ] הפעלתי מחדש: `npm run dev`
- [ ] בדקתי שהקבצים ב-`/public/` ולא ב-`/src/`

### Service Worker לא עובד
- [ ] DevTools → Application → Service Workers → Unregister
- [ ] DevTools → Application → Clear storage → Clear site data
- [ ] רעננתי עם Ctrl+Shift+R (Mac: Cmd+Shift+R)

### beforeinstallprompt לא נורה
- [ ] בדקתי ש-Manifest תקין
- [ ] בדקתי ש-Service Worker פעיל
- [ ] הסרתי התקנה קודמת אם הייתה
- [ ] ניקיתי localStorage

### אייקון לא נכון ב-iOS
- [ ] הסרתי אפליקציה מהמסך הבית
- [ ] Settings → Safari → Clear History
- [ ] התקנתי מחדש

---

## 📊 ציונים

### Lighthouse PWA Audit

הרץ:
```bash
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

בדוק שהציון PWA > 90:
- [ ] Installable
- [ ] PWA optimized
- [ ] Service Worker
- [ ] Offline support
- [ ] Manifest

---

## 📞 עזרה נוספת

אם סימנת את כל הבדיקות ועדיין יש בעיה:

1. **Console Logs**:
   ```
   F12 → Console
   חפש הודעות [PWA] או [Service Worker]
   ```

2. **Network Tab**:
   ```
   F12 → Network
   רענן ובדוק שאין 404 על manifest.json או sw.js
   ```

3. **קרא מדריכים**:
   - `START_HERE_PWA.md` - התחלה
   - `PWA_QUICK_FIX.md` - תיקון מהיר
   - `PWA_COMPLETE_GUIDE.md` - מדריך מלא

---

## ✨ סטטוס כללי

סמן כשהכל עובד:

- [ ] ✅ כל האייקונים נוצרו
- [ ] ✅ Manifest תקין
- [ ] ✅ Service Worker פעיל
- [ ] ✅ התקנה עובדת על Desktop
- [ ] ✅ התקנה עובדת על iOS
- [ ] ✅ התקנה עובדת על Android
- [ ] ✅ InstallPrompt מופיע
- [ ] ✅ InstallButton עובד
- [ ] ✅ האייקונים נראים נכון

**אם סימנת הכל - PWA שלך מוכן! 🎉**

---

**TurjiTrade PWA Setup**  
נוצר: December 31, 2024  
גרסה: 2.0
