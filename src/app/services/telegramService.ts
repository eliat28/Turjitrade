// Telegram Bot API Service - שליחת התראות טלגרם מרכזית
import { getTelegramConfig, isTelegramConfigured } from '../config/apiConfig';

export interface TelegramResult {
  success: boolean;
  error?: 'not_configured' | 'chat_not_found' | 'network_error' | 'unknown';
  errorMessage?: string;
}

export interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

// Get bot information using Telegram's getMe API
export const getBotInfo = async (): Promise<{ success: boolean; botInfo?: BotInfo; error?: string }> => {
  try {
    if (!isTelegramConfigured()) {
      return { 
        success: false, 
        error: 'Bot token not configured in apiConfig.ts'
      };
    }

    const config = getTelegramConfig();
    const url = `https://api.telegram.org/bot${config.botToken}/getMe`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Failed to get bot info:', data);
      return { 
        success: false, 
        error: data.description || 'Failed to get bot info'
      };
    }

    console.log('Bot info retrieved:', data.result);
    return { 
      success: true, 
      botInfo: data.result 
    };
  } catch (error) {
    console.error('Error getting bot info:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

export const sendTelegramAlert = async (
  phoneNumber: string,
  message: string
): Promise<TelegramResult> => {
  try {
    // Check if telegram is configured in central config
    if (!isTelegramConfigured()) {
      console.error('Telegram bot token not configured in apiConfig.ts');
      return { 
        success: false, 
        error: 'not_configured',
        errorMessage: 'Bot token not configured'
      };
    }

    const config = getTelegramConfig();
    
    // Note: Telegram API requires chat_id, not phone number
    // phoneNumber parameter should actually be the Chat ID from @userinfobot
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: phoneNumber,  // This should be Chat ID, not phone number
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API error:', data);
      if (data.error_code === 400 && data.description.includes('chat not found')) {
        console.error('Chat not found - Make sure to:');
        console.error('1. Start a conversation with @TurjiTrade_Bot first (send /start)');
        console.error('2. Then get your Chat ID from @userinfobot');
        console.error('3. Use the correct Chat ID (numbers only)');
        return { 
          success: false, 
          error: 'chat_not_found',
          errorMessage: data.description
        };
      }
      return { 
        success: false, 
        error: 'unknown',
        errorMessage: data.description || 'Unknown error'
      };
    }

    console.log('Telegram message sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return { 
      success: false, 
      error: 'network_error',
      errorMessage: error instanceof Error ? error.message : 'Network error'
    };
  }
};

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

export const formatTelegramSellAlert = (
  symbol: string,
  currentPrice: number,
  priceMin: number,
  priceMax: number
): string => {
  return `💰 <b>התראת מכירה - TurjiTrade</b>

📊 <b>מניה:</b> ${symbol}
💵 <b>מחיר נוכחי:</b> $${currentPrice.toFixed(2)}
📈 <b>טווח מחיר:</b> $${priceMin.toFixed(2)} - $${priceMax.toFixed(2)}

✅ המניה הגיעה לטווח המכירה שהגדרת!
זה הזמן לשקול מכירה ולקחת רווחים.

🤖 TurjiTrade - מסחר חכם עם AI`;
};