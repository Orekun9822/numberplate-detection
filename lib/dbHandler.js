// lib/dbHandler.js (SQLite対応版)
const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

// DBファイルパスを設定（例：プロジェクトルートにplate.dbを作成）
const DB_PATH = config.db.databasePath || './plate_system.db'; 

// データベース接続オブジェクトを生成 (ファイルがなければ作成される)
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[DB ERROR] Could not connect to database', err.message);
  } else {
    console.log('[INFO] Connected to the SQLite database.');
  }
});

async function checkDatabase(plateNumber) {
  const sql = 'SELECT COUNT(*) AS count FROM plate_numbers WHERE number = ?';

  return new Promise((resolve, reject) => {
    db.get(sql, [plateNumber], (err, row) => {
      if (err) {
        console.error('[DB ERROR]', err);
        return resolve(false); // エラー時は不一致として扱う
      }
      // row.count > 0 であれば一致 (true)
      resolve(row.count > 0); 
    });
  });
}

module.exports = { checkDatabase };
// db.close() はシステム終了時に行うのが理想ですが、ここでは省略