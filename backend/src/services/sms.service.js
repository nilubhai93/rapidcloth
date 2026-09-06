import twilio from 'twilio';

let twilioClient;

// Initialize Twilio client only if credentials are provided in the environment
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Sends an SMS message to a specific phone number using Twilio.
 * Includes a fallback to console logging if Twilio is not configured or fails.
 * 
 * @param {string} to - The recipient's phone number (e.g., '+1234567890')
 * @param {string} message - The text message body to send
 */
export const sendSms = async (to, message) => {
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      console.log(`[SMS DEBUG] Sent SMS to ${to} via Twilio`);
    } catch (smsError) {
      console.error('[SMS ERROR] Failed to send via Twilio:', smsError.message);
      // Fallback if the API call fails (e.g., unverified number on trial account)
      console.log(`[SMS DEBUG FALLBACK] Message to ${to}: ${message}`);
    }
  } else {
    // Mock delivery if credentials are not set in .env
    console.log(`[SMS DEBUG MOCK] (Twilio not configured) Message to ${to}: ${message}`);
  }
};
