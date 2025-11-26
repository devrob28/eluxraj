const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

console.log('Database URL exists:', !!connectionString);

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
