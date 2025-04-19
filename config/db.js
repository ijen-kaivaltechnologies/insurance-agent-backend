const { Pool } = require('pg');
const { logger } = require('../utils/logger');
const env = require('./env');

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword
});

// Test database connection
const testDbConnection = async () => {
  try {
    const client = await pool.connect();
    logger.info('Database connection successful');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection failed', error.stack);
    return false;
  }
};

module.exports = { 
  pool,
  testDbConnection,
  query: (text, params) => pool.query(text, params)
};