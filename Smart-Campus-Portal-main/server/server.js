const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[SERVER] Uncaught Exception:', err);
});

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('[SERVER] Database connection confirmed.');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] API listening on http://localhost:${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`[SERVER] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('[SERVER] HTTP listener closed.');
        try {
          await pool.end();
          console.log('[SERVER] MySQL connection pool closed.');
        } catch (err) {
          console.error('[SERVER] Error closing MySQL pool:', err);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[SERVER] Database connection or startup failed:', err.message || err);
    process.exit(1);
  }
};

module.exports = app;

if (require.main === module) {
  startServer();
}
