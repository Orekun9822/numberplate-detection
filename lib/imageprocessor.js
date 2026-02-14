/*// lib/imageProcessor.js
const sharp = require('sharp');
const path = require('path');
const config = require('../config');
const PROCESSED_DIR = path.join(__dirname, '..', 'processed_images'); // '..' は lib からプロジェクトルートに戻る意味

async function enhanceImage(filePath) {
  const baseName = path.basename(filePath);
    // 出力パスがプロジェクト内の安全な場所になる
    const outputPath = path.join(PROCESSED_DIR, baseName);

  await sharp(filePath)
    .grayscale()
    .normalize()
    .sharpen()
    .toFile(outputPath);
  
  console.log(`[INFO] Image enhanced: ${outputPath}`);
  return outputPath;
}

module.exports = { enhanceImage };*/

// lib/imageProcessor.js (デバッグ用：処理をスキップ)

const sharp = require('sharp');
const path = require('path');

// 処理済み画像を保存するディレクトリ
const PROCESSED_DIR = path.join(__dirname, '..', 'processed_images'); 

async function enhanceImage(inputPath) {

    const baseName = path.basename(inputPath);
    const outputPath = path.join(PROCESSED_DIR, baseName); 

    // 🚨 前処理をスキップし、そのままコピーする
    await sharp(inputPath).toFile(outputPath); 

    console.log(`[DEBUG] Skiping enhancement, copied to: ${outputPath}`);

    return outputPath; 
}

module.exports = { enhanceImage };