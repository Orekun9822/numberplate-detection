module.exports = {
  // ラズパイが画像をアップロードするSamba上のディレクトリ
  watchDir: '/home/share/新規/', 
  
  // 高画質化（前処理）した画像を保存するディレクトリ
  processedDir: '/home/share/新規/', 
  
  // データベース接続情報
  db: {
    host: 'localhost',
    user: 'your_db_user',
    password: 'your_db_password',
    database: 'your_plate_database'
  },
  
  // Pythonスクリプトのパス
  python: {
    scriptPath: './python/anpr.py', 
  }
};