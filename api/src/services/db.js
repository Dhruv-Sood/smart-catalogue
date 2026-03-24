import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'catalog_user',
  password: process.env.DB_PASSWORD || 'catalog_pass',
  database: process.env.DB_NAME || 'smart_catalog',
  waitForConnections: true,
  connectionLimit: 10
});

export async function initDB() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS catalog_entries (
      id VARCHAR(36) PRIMARY KEY,
      title TEXT,
      short_description TEXT,
      full_description TEXT,
      category JSON,
      attributes JSON,
      tags JSON,
      specifications JSON,
      target_audience TEXT,
      suggested_keywords JSON,
      price_positioning VARCHAR(50),
      confidence FLOAT,
      data_source JSON,
      source_type VARCHAR(50),
      original_filename TEXT,
      original_description TEXT,
      status VARCHAR(20) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('Database initialized');
}

export default pool;
