import os
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# ========================
# 🔴 הגדרות - עדכן כאן!
# ========================
BOT_TOKEN = "8264340445:AAHvwQQAHwfnnDQdGhOxGv9uB2pDEG3cPpU"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """מטפל בפקודת /start - מציג את ה-Chat ID"""
    user = update.effective_user
    chat_id = update.effective_chat.id
    
    print(f"👤 User: {user.first_name} (@{user.username})")
    print(f"💬 Chat ID: {chat_id}")
    
    # שלח הודעה עם ה-Chat ID
    await update.message.reply_text(
        f"👋 **שלום {user.first_name}!**\n\n"
        f"🤖 אני הבוט של **TurjiTrade**\n\n"
        f"📱 **ה-Chat ID שלך:**\n"
        f"`{chat_id}`\n\n"
        f"📋 **איך להשתמש:**\n"
        f"1️⃣ לחץ ארוכות על המספר למעלה ☝️\n"
        f"2️⃣ בחר \"העתק\" (Copy)\n"
        f"3️⃣ חזור לאפליקציה והדבק את המספר\n"
        f"4️⃣ לחץ \"שמור Chat ID\"\n\n"
        f"✅ **זהו!** עכשיו תקבל התראות כאן! 🚀",
        parse_mode="Markdown"
    )

def main():
    """הפעל את הבוט"""
    print("=" * 50)
    print("🤖 Starting TurjiTrade Bot...")
    print("=" * 50)
    print(f"🔑 Bot Token: {BOT_TOKEN[:20]}...")
    print("=" * 50)
    
    # צור את האפליקציה
    application = Application.builder().token(BOT_TOKEN).build()
    
    # הוסף handlers
    application.add_handler(CommandHandler("start", start))
    
    # הפעל את הבוט
    print("✅ Bot is running and listening for /start commands!")
    print("💡 Users can now get their Chat ID")
    print("🔄 Press Ctrl+C to stop")
    print("=" * 50)
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
