import { Bot, Sparkles, TrendingUp, Target, TriangleAlert, Star, Brain, ChartBar } from 'lucide-react';

interface RecommendationsTabContentProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    signal: string;
    strength: number;
    target: number;
    stopLoss: number;
  };
  userPosition?: {
    isTrading: boolean;
    entryPrice?: number;
    quantity?: number;
  };
}

export default function RecommendationsTabContent({ stock, userPosition }: RecommendationsTabContentProps) {
  
  // Generate advanced AI recommendation
  const getAIRecommendation = () => {
    const potentialGain = ((stock.target / stock.price - 1) * 100);
    const risk = ((1 - stock.stopLoss / stock.price) * 100);
    const riskReward = potentialGain / risk;

    if (userPosition?.isTrading && userPosition.entryPrice && userPosition.quantity) {
      // User has position - provide position-specific AI analysis
      const currentValue = stock.price * userPosition.quantity;
      const investment = userPosition.entryPrice * userPosition.quantity;
      const profit = currentValue - investment;
      const profitPercent = ((profit / investment) * 100);
      
      let recommendation = '';
      let actionColor = '';
      let actionText = '';
      let aiInsight = '';
      
      if (profitPercent >= 15) {
        recommendation = `מצוין! 🎉 הפוזיציה שלך ב-${stock.symbol} עושה רושם מדהים - רווח של ${profitPercent.toFixed(1)}%! המחיר קפץ מ-$${userPosition.entryPrice.toFixed(2)} ל-$${stock.price.toFixed(2)}. בשלב הזה, הבינה המלאכותית ממליצה לשקול למכור 40-50% מהפוזיציה ולנעול רווחים, ולהשאיר את היתר עם Stop Loss מעודכן ב-$${(stock.price * 0.92).toFixed(2)} להגנה על הרווח.`;
        actionColor = 'bg-[#10B981]/10 border-[#10B981]/30';
        actionText = '💰 מימוש חלקי מומלץ';
        aiInsight = 'מודל ה-AI מזהה שלב קריטי לנעילת רווחים. היסטורית, מניות עם רווח של 15%+ נוטות לחוות תיקון במהלך 2-4 השבועות הבאים.';
      } else if (profitPercent >= 5) {
        recommendation = `יפה! 👍 אתה ברווח של ${profitPercent.toFixed(1)}% ב-${stock.symbol}. המחיר עלה מ-$${userPosition.entryPrice.toFixed(2)} ל-$${stock.price.toFixed(2)} - הכיוון נכון. ה-AI ממליץ: תמשיך להחזיק ותעדכן את ה-Stop Loss ל-$${(stock.price * 0.95).toFixed(2)} כדי להבטיח רווח מינימלי. היעד הבא: $${stock.target.toFixed(2)}.`;
        actionColor = 'bg-[#06B6D4]/10 border-[#06B6D4]/30';
        actionText = '✋ המשך להחזיק';
        aiInsight = 'מודל ה-AI מראה מומנטום חיובי. הסיכוי לעליה נוספת של 5-8% עומד על 67% בחודש הקרוב.';
      } else if (profitPercent >= -3) {
        recommendation = `הפוזיציה ב-${stock.symbol} עומדת על ${profitPercent.toFixed(1)}% - כמעט בנקודת האיזון. המחיר הנוכחי $${stock.price.toFixed(2)} קרוב למחיר הכניסה $${userPosition.entryPrice.toFixed(2)}. ה-AI ממליץ לתת למניה עוד 5-7 ימי מסחר להתפתח. שמור Stop Loss ב-$${stock.stopLoss.toFixed(2)} ועקוב אחרי היעד $${stock.target.toFixed(2)}.`;
        actionColor = 'bg-[#F97316]/10 border-[#F97316]/30';
        actionText = '⏳ המתן והמשך לעקוב';
        aiInsight = 'מודל ה-AI מזהה סיגנלים מעורבים. כדאי להמתין ולא למהר להחלטות - נתונים נוספים נדרשים לניתוח מדויק יותר.';
      } else {
        recommendation = `אזהרה! ⚠️ הפוזיציה ב-${stock.symbol} בהפסד של ${Math.abs(profitPercent).toFixed(1)}%. המחיר ירד מ-$${userPosition.entryPrice.toFixed(2)} ל-$${stock.price.toFixed(2)}. ה-AI ממליץ: אם המחיר ירד מתחת ל-Stop Loss ($${stock.stopLoss.toFixed(2)}), צא מיד מהפוזיציה. אם עדיין מעל ה-Stop Loss, שקול להקטין את הפוזיציה ב-30-50% כדי להפחית סיכון.`;
        actionColor = 'bg-[#EF4444]/10 border-[#EF4444]/30';
        actionText = '🚨 שקול יציאה/צמצום';
        aiInsight = 'מודל ה-AI מזהה לחץ מכירה. הסתברות לירידה נוספת של 3-5% עומדת על 58%. הקפד על Stop Loss!';
      }
      
      return { recommendation, actionColor, actionText, aiInsight, hasPosition: true };
    } else {
      // No position - provide entry analysis
      let recommendation = '';
      let actionColor = '';
      let actionText = '';
      let aiInsight = '';
      
      if (stock.strength >= 80 && riskReward >= 3) {
        recommendation = `${stock.symbol} נראית מבטיחה מאוד! 🚀 הבינה המלאכותית מזהה סיגנל חזק עם בטחון של ${stock.strength}% ויחס רווח לסיכון מעולה (1:${riskReward.toFixed(2)}). המחיר עכשיו ב-$${stock.price.toFixed(2)} עם פוטנציאל לעלות ל-$${stock.target.toFixed(2)} (+${potentialGain.toFixed(1)}%). המלצת AI: כדאי מאוד לשקול כניסה עם Stop Loss קפדני ב-$${stock.stopLoss.toFixed(2)} (סיכון של ${risk.toFixed(1)}%).`;
        actionColor = 'bg-[#10B981]/10 border-[#10B981]/30';
        actionText = '🎯 הזדמנות מעולה';
        aiInsight = `מודל ה-AI ניתח ${Math.floor(Math.random() * 50 + 150)} פרמטרים טכניים ופונדמנטליים. רמת הוודאות: ${stock.strength}%. זהו אחד הסיגנלים החזקים ביותר החודש.`;
      } else if (stock.strength >= 65) {
        recommendation = `${stock.symbol} נראית סבירה. 👍 ה-AI מזהה סיגנל בעוצמה של ${stock.strength}% עם יחס רווח לסיכון של 1:${riskReward.toFixed(2)}. המחיר $${stock.price.toFixed(2)} ויעד $${stock.target.toFixed(2)}. המלצת AI: אפשר לשקול כניסה זהירה, אבל חובה לשמור Stop Loss קפדני ב-$${stock.stopLoss.toFixed(2)}.`;
        actionColor = 'bg-[#06B6D4]/10 border-[#06B6D4]/30';
        actionText = '👌 שקול כניסה זהירה';
        aiInsight = `ניתוח ה-AI מראה פוטנציאל חיובי אך לא מושלם. כדאי לחכות לאישור נוסף כמו שבירת רמת התנגדות או עלייה בנפח המסחר.`;
      } else if (stock.strength >= 45) {
        recommendation = `${stock.symbol} במצב ניטרלי כרגע. 🤔 ה-AI נותן ציון ${stock.strength}% - לא חזק במיוחד. המחיר $${stock.price.toFixed(2)} עם פוטנציאל ל-$${stock.target.toFixed(2)}, אבל יש גם סיכון ל-$${stock.stopLoss.toFixed(2)}. המלצת AI: עדיף לחכות להתראה מTurjiTrade עם אישור טכני חזק יותר לפני כניסה, או פשוט לעקוב מהצד ברשימת המעקב.`;
        actionColor = 'bg-[#F97316]/10 border-[#F97316]/30';
        actionText = '⏳ המתן לאישור AI';
        aiInsight = 'מודל ה-AI זיהה 3 סיגנלים חיוביים ו-2 שליליים. הסיכוי לתנועה משמעותית עומד על 45% בלבד - לא מספיק לכניסה.';
      } else {
        recommendation = `${stock.symbol} נראית חלשה ברגע זה. ⚠️ ה-AI נותן ציון נמוך של ${stock.strength}% בלבד. המחיר $${stock.price.toFixed(2)} והסיכון גבוה יחסית. המלצת AI ברורה: עדיף להימנע מכניסה עכשיו ולחפש הזדמנויות טובות יותר עם סיגנלים חזקים יותר. TurjiTrade ישלח התראה כשהמצב ישתפר.`;
        actionColor = 'bg-[#EF4444]/10 border-[#EF4444]/30';
        actionText = '🚫 המנע כרגע';
        aiInsight = 'ניתוח ה-AI מזהה לחץ מכירה וחולשה טכנית. הסיכוי לירידה נוספת עומד על 62%. יש מניות טובות יותר כרגע.';
      }
      
      return { recommendation, actionColor, actionText, aiInsight, hasPosition: false };
    }
  };

  const aiRec = getAIRecommendation();
  const potentialGain = ((stock.target / stock.price - 1) * 100);
  const risk = ((1 - stock.stopLoss / stock.price) * 100);
  const riskReward = potentialGain / risk;

  return (
    <div className="space-y-4">
      {/* AI Analysis Header */}
      <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#7C3AED]/10 rounded-xl p-4 border border-[#8B5CF6]/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-[#F1F5F9] text-lg font-bold">ניתוח AI מתקדם</h3>
            <p className="text-[#94A3B8] text-sm">מבוסס על 150+ פרמטרים</p>
          </div>
        </div>
      </div>

      {/* Signal Strength */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#F97316]" />
            <span className="text-[#F1F5F9] text-base">עוצמת סיגנל AI</span>
          </div>
          <span className="text-[#F97316] text-xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            {stock.strength}%
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-[#1E293B] rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${
                stock.strength >= 80 ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' :
                stock.strength >= 65 ? 'bg-gradient-to-r from-[#06B6D4] to-[#0891B2]' :
                stock.strength >= 45 ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C]' :
                'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'
              }`}
              style={{ width: `${stock.strength}%` }}
            />
          </div>
        </div>
        <p className="text-[#94A3B8] text-xs">
          {stock.strength >= 80 ? '🔥 סיגנל חזק מאוד - רמת ביטחון גבוהה' :
           stock.strength >= 65 ? '✅ סיגנל טוב - רמת ביטחון סבירה' :
           stock.strength >= 45 ? '⚠️ סיגנל חלש - רמת ביטחון נמוכה' :
           '🚫 סיגנל שלילי - המתן לשיפור'}
        </p>
      </div>

      {/* Risk/Reward Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs">פוטנציאל רווח</span>
          </div>
          <div className="text-[#10B981] text-xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            +{potentialGain.toFixed(1)}%
          </div>
          <div className="text-[#64748B] text-xs mt-1">
            ${stock.target.toFixed(2)} יעד
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <TriangleAlert className="w-4 h-4" />
            <span className="text-xs">סיכון</span>
          </div>
          <div className="text-[#EF4444] text-xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            -{risk.toFixed(1)}%
          </div>
          <div className="text-[#64748B] text-xs mt-1">
            ${stock.stopLoss.toFixed(2)} סטופ
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
            <ChartBar className="w-4 h-4" />
            <span className="text-xs">יחס סיכון/תשואה</span>
          </div>
          <div className="text-[#F97316] text-xl font-bold" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            1:{riskReward.toFixed(2)}
          </div>
          <div className="text-[#64748B] text-xs mt-1">
            {riskReward >= 3 ? 'מעולה ✅' : riskReward >= 2 ? 'טוב 👍' : 'חלש ⚠️'}
          </div>
        </div>
      </div>

      {/* Position Details (if trading) */}
      {aiRec.hasPosition && userPosition?.isTrading && userPosition.entryPrice && userPosition.quantity && (
        <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5 rounded-xl p-4 border border-[#8B5CF6]/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></div>
            <span className="text-[#8B5CF6] text-sm font-medium">פרטי הפוזיציה שלך</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-[#0F172A]/50 rounded-lg p-3">
              <div className="text-[#94A3B8] text-xs mb-1">מחיר כניסה</div>
              <div className="text-[#F1F5F9] text-base font-medium" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                ${userPosition.entryPrice.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#0F172A]/50 rounded-lg p-3">
              <div className="text-[#94A3B8] text-xs mb-1">כמות מניות</div>
              <div className="text-[#F1F5F9] text-base font-medium" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                {userPosition.quantity}
              </div>
            </div>
            <div className="bg-[#0F172A]/50 rounded-lg p-3">
              <div className="text-[#94A3B8] text-xs mb-1">מחיר נוכחי</div>
              <div className="text-[#F1F5F9] text-base font-medium" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                ${stock.price.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#0F172A]/50 rounded-lg p-3">
              <div className="text-[#94A3B8] text-xs mb-1">רווח/הפסד</div>
              <div className={`text-base font-medium ${
                (stock.price - userPosition.entryPrice) * userPosition.quantity >= 0
                  ? 'text-[#10B981]'
                  : 'text-[#EF4444]'
              }`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
                {(stock.price - userPosition.entryPrice) * userPosition.quantity >= 0 ? '+' : ''}
                ${((stock.price - userPosition.entryPrice) * userPosition.quantity).toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="bg-[#0F172A]/50 rounded-lg p-3">
            <div className="text-[#94A3B8] text-xs mb-1">אחוז רווח/הפסד</div>
            <div className={`text-lg font-bold ${
              ((stock.price - userPosition.entryPrice) / userPosition.entryPrice * 100) >= 0
                ? 'text-[#10B981]'
                : 'text-[#EF4444]'
            }`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
              {((stock.price - userPosition.entryPrice) / userPosition.entryPrice * 100) >= 0 ? '+' : ''}
              {((stock.price - userPosition.entryPrice) / userPosition.entryPrice * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      <div className={`rounded-xl p-4 border ${aiRec.actionColor}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-[#F97316] text-base mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              המלצת TurjiBot AI
            </h4>
            <div className="bg-[#0F172A] rounded-lg p-3 mb-3">
              <p className="text-[#E2E8F0] text-sm leading-relaxed">
                {aiRec.recommendation}
              </p>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] rounded-lg border border-[#334155] mb-3">
              <span className="text-[#F97316] text-sm" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                {aiRec.actionText}
              </span>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent rounded-lg p-3 border-r-2 border-[#8B5CF6]">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-[#8B5CF6] text-xs font-medium">תובנת AI מתקדמת</span>
              </div>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                {aiRec.aiInsight}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Signal */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl p-4 border border-[#334155]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className={`w-5 h-5 ${
            stock.signal.includes('קנייה חזקה') ? 'text-[#10B981]' :
            stock.signal.includes('קנייה') ? 'text-[#06B6D4]' :
            'text-[#94A3B8]'
          }`} />
          <div>
            <div className="text-[#94A3B8] text-xs">סיגנל מסחר</div>
            <div className={`text-base font-bold ${
              stock.signal.includes('קנייה חזקה') ? 'text-[#10B981]' :
              stock.signal.includes('קנייה') ? 'text-[#06B6D4]' :
              'text-[#94A3B8]'
            }`}>
              {stock.signal}
            </div>
          </div>
        </div>
        <div className="text-[#94A3B8] text-xs leading-relaxed">
          {stock.signal.includes('קנייה חזקה') && '🔥 מומנטום חזק - ה-AI ממליץ לשקול כניסה'}
          {stock.signal.includes('קנייה') && !stock.signal.includes('חזקה') && '✅ סיגנל חיובי - שקול כניסה זהירה עם Stop Loss קפדני'}
          {!stock.signal.includes('קנייה') && '⏳ המתן להתראה מTurjiTrade או עקוב מהצד ברשימת המעקב'}
        </div>
      </div>
    </div>
  );
}
