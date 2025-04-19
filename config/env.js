require('dotenv').config();

module.exports = {
  // Server config
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Database config
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  
  // JWT config
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  
  // Twilio (WhatsApp) config
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  
  // Meta config (alternative for WhatsApp)
  metaAppId: process.env.META_APP_ID,
  metaAppSecret: process.env.META_APP_SECRET,
  metaAccessToken: process.env.META_ACCESS_TOKEN
};