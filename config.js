module.exports = {
  // ラズパイが画像をアップロードするSamba上のディレクトリ
  watchDir: '/home/share/新規/', 
  
  // 高画質化（前処理）した画像を保存するディレクトリ
  processedDir: './processed_images/', 
  
  // データベース接続情報
// config.js の db セクションを修正
db: {
    databasePath: './plate_system.db' // DB Browserで作成したファイル名に合わせてください
    // host, user, password はもう不要です
},
  
  // Pythonスクリプトのパス
  python: {
    scriptPath: './python/anpr.py', 
  }
};