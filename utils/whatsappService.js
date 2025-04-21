const twilio = require('twilio');
const env = require('../config/env');
const { logger } = require('./logger');

// const client = twilio(env.twilioAccountSid, env.twilioAuthToken);

/**
 * Send WhatsApp message using Twilio
 * @param {string} to - Recipient's WhatsApp number with country code
 * @param {string} message - Message text to send
 * @returns {Promise} - Promise with message status
 */
const sendWhatsAppMessage = async (to, message) => {
  // try {
  //   // Format the destination number if needed
  //   const formattedNumber = to.startsWith('+') ? to : `+${to}`;
    
  //   const response = await client.messages.create({
  //     from: `whatsapp:${env.twilioWhatsappNumber}`,
  //     to: `whatsapp:${formattedNumber}`,
  //     body: message
  //   });
    
  //   logger.info(`WhatsApp message sent to ${to}, SID: ${response.sid}`);
  //   return {
  //     success: true,
  //     sid: response.sid,
  //     status: response.status
  //   };
  // } catch (error) {
  //   logger.error(`WhatsApp message failed: ${error.message}`);
  //   return {
  //     success: false,
  //     error: error.message
  //   };
  // }
};

module.exports = {
  sendWhatsAppMessage
};