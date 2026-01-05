import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, User, LoaderCircle, Database } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface AIAgentTabProps {
  user: {
    name: string;
    email: string;
    tradingStyle: 'day' | 'long';
  };
  context?: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIAgentTab({ user, context }: AIAgentTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '👋 שלום! אני TurjiBot מופעל על ידי Llama 3.3 70B עם גישה לנתוני שוק בזמן אמת!\n\nאני יועץ מקצועי למסחר במניות, מבוסס על מודל AI מתקדם של Meta. אני יכול לעזור לך עם:\n\n📊 ניתוח מניות מעמיק עם נתונים אמיתיים\n💡 המלצות השקעה מבוססות נתונים בזמן אמת\n📈 אסטרטגיות מסחר מתקדמות\n🎯 ניהול סיכונים וכסף\n⚡ תובנות שוק חיות\n\nשאל אותי על כל מנייה (למשל: "מה המחיר של AAPL?") ואני אביא לך נתונים עדכניים!\n\nבמה אוכל לעזור לך היום?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add context message if provided
  useEffect(() => {
    if (context && context.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: context,
        sender: 'user',
        timestamp: new Date()
      }]);
      // Auto-send the context message
      handleSendMessage(context);
    }
  }, [context]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for server
      const conversationMessages = [
        ...messages
          .filter(m => m.sender === 'user' || m.sender === 'ai')
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
        {
          role: 'user',
          content: textToSend
        }
      ];

      // Call server endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-91e99f90/turjibot/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            messages: conversationMessages,
            user: {
              name: user.name,
              email: user.email,
              tradingStyle: user.tradingStyle
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response || 'מצטער, לא הצלחתי לעבד את השאלה. נסה שוב.';

      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('❌ TurjiBot Error:', error);

      let errorMessage = '⚠️ אופס, משהו לא עבד...\n\n';
      
      if (error?.message?.includes('configured')) {
        errorMessage += '🔧 שגיאת הגדרות שרת\n\nהשרת לא מוגדר כראוי. אנא פנה למנהל המערכת.';
      } else if (error?.message?.includes('429')) {
        errorMessage += '⏰ הגעת למכסת הבקשות\n\nנסה שוב בעוד כמה שניות.';
      } else {
        errorMessage += `השגיאה: ${error?.message || 'Unknown error'}\n\nנסה:\n• לנסח את השאלה אחרת\n• לבדוק את החיבור לאינטרנט\n• להמתין רגע ולנסות שוב`;
      }

      const errorAiMessage: Message = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] border-b border-[#334155] p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full border-2 border-[#1E293B]"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[#F1F5F9] text-xl font-bold">TurjiBot</h1>
              <div className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-[10px] text-white font-bold">
                LLAMA 3.3 70B
              </div>
              <div className="px-2 py-0.5 bg-[#10B981] rounded-full text-[10px] text-white font-bold flex items-center gap-1">
                <Database className="w-3 h-3" />
                LIVE DATA
              </div>
            </div>
            <p className="text-[#94A3B8] text-xs sm:text-sm">יועץ מסחר מניות מבוסס AI • נתונים בזמן אמת</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[calc(100vh-22rem)] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
              message.sender === 'ai' 
                ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C]' 
                : 'bg-[#06B6D4]'
            }`}>
              {message.sender === 'ai' ? (
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 max-w-[85%] sm:max-w-[75%] ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}>
              <div className={`inline-block rounded-2xl px-4 py-3 ${
                message.sender === 'ai'
                  ? 'bg-[#1E293B] border border-[#334155]'
                  : 'bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9]'
              }`}>
                <p className={`text-sm sm:text-base whitespace-pre-wrap leading-relaxed ${
                  message.sender === 'ai' ? 'text-[#E2E8F0]' : 'text-white'
                }`}>
                  {message.text}
                </p>
              </div>
              <div className="text-[#64748B] text-[10px] sm:text-xs mt-1 px-2">
                {message.timestamp.toLocaleTimeString('he-IL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] flex items-center justify-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <LoaderCircle className="w-4 h-4 text-[#F97316] animate-spin" />
                <span className="text-[#94A3B8] text-sm">שולף נתונים בזמן אמת ומנתח...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-[10vh] left-0 right-0 border-t border-[#334155] p-4 bg-[#1E293B] z-40">
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='שאל על מניות (למשל: "מה המחיר של AAPL?")...'
            disabled={isLoading}
            className="flex-1 bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#F97316] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] disabled:from-[#334155] disabled:to-[#334155] text-white p-3 sm:p-3.5 rounded-xl transition-all disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <LoaderCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : (
              <Send className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
        <p className="text-[#64748B] text-[10px] sm:text-xs mt-2 text-center">
          <Sparkles className="w-3 h-3 inline mr-1" />
          TurjiBot הוא כלי עזר ולא תחליף ליועץ פיננסי מורשה • נתונים מסופקים על ידי Finnhub
        </p>
      </div>
    </div>
  );
}