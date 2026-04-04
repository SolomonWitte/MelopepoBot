const mysql = require('mysql2/promise');

require('dotenv/config')

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 's9_discord_bot_db',
});

// Function to initialize the database table
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS levels (
        userId VARCHAR(255) NOT NULL,
        guildId VARCHAR(255) NOT NULL,
        messages INT DEFAULT 0,
        voiceTime INT DEFAULT 0,
        xp INT DEFAULT 0,
        level INT DEFAULT 0,
        PRIMARY KEY (userId, guildId)
      );
    `;
    await connection.query(createTableQuery);
    connection.release(); // Release the connection back to the pool
    console.log('Levels table ensured to exist.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = {
  pool,
  initializeDatabase
};
