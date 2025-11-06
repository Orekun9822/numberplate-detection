
const mysql = require('mysql2/promise');
const config = require('../config');

async function checkDatabase(plateNumber) {
  let connection;
  try {
    connection = await mysql.createConnection(config.db);
    
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM plate_numbers WHERE number = ?',
      [plateNumber]
    );
    
    return rows[0].count > 0;

  } catch (error) {
    console.error('[DB ERROR]', error);
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { checkDatabase };