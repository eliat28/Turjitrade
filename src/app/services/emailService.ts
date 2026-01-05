// EmailJS Service - שליחת התראות מייל מרכזית
import emailjs from '@emailjs/browser';
import { getEmailConfig, isEmailConfigured } from '../config/apiConfig';

export const sendEmailAlert = async (
  toEmail: string,
  symbol: string,
  currentPrice: number,
  priceMin: number,
  priceMax: number,
  alertType: 'buy' | 'sell' = 'buy'
): Promise<boolean> => {
  try {
    // Check if email is configured in central config
    if (!isEmailConfigured()) {
      console.error('EmailJS not configured in apiConfig.ts');
      return false;
    }

    const config = getEmailConfig();

    // Initialize EmailJS with public key
    emailjs.init(config.publicKey);

    // Different messages for buy/sell
    const isBuy = alertType === 'buy';
    const alertTitle = isBuy ? 'התראת קנייה 🎯' : 'התראת מכירה 💰';
    const alertAction = isBuy ? 'לקנות' : 'למכור';
    
    // Prepare template parameters
    // Note: The email recipient should be configured in the EmailJS template itself
    // under "To Email" settings, using the variable {{to_email}}
    const templateParams = {
      to_email: toEmail,           // Primary field
      user_email: toEmail,         // Backup field
      to_name: 'משקיע יקר',       // Recipient name
      symbol: symbol,
      current_price: currentPrice.toFixed(2),
      price_min: priceMin.toFixed(2),
      price_max: priceMax.toFixed(2),
      app_name: 'TurjiTrade',
      from_name: 'TurjiTrade',
      alert_type: alertTitle,
      alert_action: alertAction,
      message: `${alertTitle}: המניה ${symbol} נכנסה לטווח המחיר שהגדרת ($${priceMin.toFixed(2)} - $${priceMax.toFixed(2)}). המחיר הנוכחי: $${currentPrice.toFixed(2)}. זמן מעולה ${alertAction}!`
    };

    console.log(`Sending ${alertType} email with params:`, templateParams);

    // Send email using emailjs.send with recipient email as third parameter
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey  // Public key as 4th parameter
    );

    console.log(`${alertType} email sent successfully:`, response);
    return true;
  } catch (error) {
    console.error(`Failed to send ${alertType} email:`, error);
    return false;
  }
};

export const sendTestEmail = async (toEmail: string): Promise<boolean> => {
  return sendEmailAlert(toEmail, 'AAPL', 150.0, 145.0, 155.0);
};