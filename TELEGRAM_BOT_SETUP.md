# 🤖 מדריך הגדרת בוט טלגרם - TurjiTrade

## 📋 סקירה כללית

הבוט של TurjiTrade מאפשר למשתמשים לקבל התראות קנייה חכמות ישירות לטלגרם.  
**הגרסה הפשוטה:** המשתמש מקבל את ה-Chat ID מהבוט ומדביק אותו באפליקציה.

---

## ✅ מה כבר מוכן?

- ✅ Bot Token: `8264340445:AAHvwQQAHwfnnDQdGhOxGv9uB2pDEG3cPpU`
- ✅ Bot Username: `@turji_trade_bot`
- ✅ קובץ `telegram_bot.py` - הבוט מוכן לשימוש!
- ✅ UI חדש באפליקציה - פשוט ונוח

---

## 🚀 איך זה עובד?

### **במחשב שלך (הרצת הבוט):**

1. **התקן Python** (אם אין לך):
   - הורד מ-https://www.python.org/downloads/

2. **התקן חבילות:**
   ```bash
   pip install python-telegram-bot --upgrade
   ```

3. **הרץ את הבוט:**
   ```bash
   python telegram_bot.py
   ```

4. **זהו!** הבוט רץ עכשיו ומוכן לקבל משתמשים.

---

### **למשתמשים באפליקציה:**

1. **פתח את הבוט:**
   - לחץ על "פתח את הבוט" באפליקציה
   - או חפש `@turji_trade_bot` בטלגרם

2. **שלח `/start`:**
   - הבוט ישלח לך הודעה עם ה-Chat ID שלך
   - למשל: `123456789`

3. **העתק את ה-Chat ID:**
   - לחץ ארוכות על המספר
   - בחר "Copy" (העתק)

4. **הדבק באפליקציה:**
   - חזור לאפליקציה
   - הדבק את המספר בשדה
   - לחץ "שמור Chat ID"

5. **סיימת!** 🎉
   - עכשיו תקבל התראות לטלגרם אוטומטית

---

## 🖥️ הרצת הבוט ב-Railway (24/7 חינם!)

אם אתה רוצה שהבוט ירוץ תמיד (גם כשהמחשב שלך כבוי):

### שלב 1: העלה לגיטהאב
```bash
git init
git add telegram_bot.py requirements.txt
git commit -m "Add Telegram bot"
git push origin main
```

### שלב 2: Deploy ל-Railway
1. לך ל-https://railway.app
2. התחבר עם GitHub
3. לחץ "New Project" → "Deploy from GitHub"
4. בחר את הריפו שלך
5. Railway יזהה אוטומטית את `requirements.txt`
6. לחץ "Deploy"

### שלב 3: סיימת!
- הבוט רץ 24/7 עכשיו
- 500 שעות חינם בחודש (מספיק!)

---

## 🔧 פתרון בעיות

### הבוט לא עונה?
- ✅ בדוק שהטרמינל עם הבוט פתוח ורץ
- ✅ וודא שאין שגיאות בטרמינל
- ✅ נסה לעצור את הבוט (`Ctrl+C`) ולהריץ שוב

### לא מצליח לעתוק את ה-Chat ID?
- ✅ נסה ללחוץ ארוכות על המספר
- ✅ או סמן את המספר ולחץ "Copy"
- ✅ במחשב: סמן עם העכבר ולחץ `Ctrl+C` / `Cmd+C`

### ההתראות לא מגיעות?
- ✅ וודא ש-Chat ID נשמר נכון באפליקציה
- ✅ בדוק שהבוט רץ
- ✅ נסה לשלוח `/start` שוב לבוט

---

## 📝 מידע טכני

### קובץ `telegram_bot.py`:
- שרת פשוט שמאזין לפקודת `/start`
- מציג את ה-Chat ID למשתמש
- אין צורך ב-webhook או polling מורכב

### התקנה:
```bash
# התקן Python מ-https://www.python.org
pip install python-telegram-bot --upgrade

# הרץ את הבוט
python telegram_bot.py
```

### הרצה ב-Background (Linux/Mac):
```bash
nohup python telegram_bot.py &
```

### הרצה ב-Background (Windows):
- השתמש ב-Task Scheduler
- או פשוט השאר את הטרמינל פתוח

---

## 🎯 סיכום

**למפתחים:**
- הרץ `python telegram_bot.py` פעם אחת
- הבוט מוכן לקבל משתמשים

**למשתמשים:**
- פתח בוט → `/start` → העתק Chat ID → הדבק באפליקציה
- **זהו!** 🚀

---

## 🆘 זקוק לעזרה?

אם משהו לא עובד:
1. בדוק שהבוט רץ (טרמינל פתוח)
2. תבדוק שגיאות בטרמינל
3. נסה לעצור ולהריץ שוב
4. פנה לתמיכה טכנית

---

**אופציונלי - Deploy ל-Railway:**  
https://railway.app → Deploy from GitHub → זהו!

**הבוט שלך:** @turji_trade_bot  
**Token שלך:** `8264340445:AAHvwQQAHwfnnDQdGhOxGv9uB2pDEG3cPpU`

🎉 **בהצלחה!**
