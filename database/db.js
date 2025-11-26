// database/db.js - PostgreSQL Connection
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not set!');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✓ Database connected');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = {
  query: async (text, params) => {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  },
  pool
};
