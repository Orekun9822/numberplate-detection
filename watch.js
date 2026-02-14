// watch.js
const chokidar = require('chokidar');
const config = require('./config');
const { enhanceImage } = require('./lib/imageprocessor');
const { recognizePlate } = require('./lib/anpr');
const { checkDatabase } = require('./lib/dbHandler');

console.log(`[INFO] Watching for new files in: ${config.watchDir}`);

const watcher = chokidar.watch(config.watchDir, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

// メインの処理フロー
async function processImage(filePath) {
  console.log(`[NEW FILE] Detected: ${filePath}`);
  try {
    // 1. 高画質化
    const processedImagePath = await enhanceImage(filePath);
    
    // 2. ナンバープレート認識
    const plateNumber = await recognizePlate(processedImagePath);
    
    if (plateNumber) {
      console.log(`[RECOGNIZED] Plate: ${plateNumber}`);
      
      // 3. データベース照合
      const isMatch = await checkDatabase(plateNumber);
      console.log(`[RESULT] Plate: ${plateNumber}, DB Match: ${isMatch}`);
      
      // TODO: 一致した場合/しなかった場合の追加処理 (アラート送信など)
      
    } else {
      console.log(`[WARN] No plate number recognized for ${filePath}`);
    }

  } catch (error) {
    console.error(`[ERROR] Failed to process ${filePath}:`, error.message);
  }
}

// ファイル追加イベントを監視
watcher.on('add', processImage);