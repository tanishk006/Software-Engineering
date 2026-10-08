const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const { DB_HOST, DB_USER, DB_NAME } = process.env;
if (!DB_HOST || !DB_USER || !DB_NAME) {
  throw new Error(
    'FATAL CONFIGURATION ERROR: Missing required database credentials in environment variables (DB_HOST, DB_USER, or DB_NAME).'
  );
}

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true
};

if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };
}

const pool = mysql.createPool(dbConfig);

const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  withTransaction
};
