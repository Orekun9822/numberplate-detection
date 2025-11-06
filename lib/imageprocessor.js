// lib/imageProcessor.js
const sharp = require('sharp');
const path = require('path');
const config = require('../config');

async function enhanceImage(filePath) {
  const outputPath = path.join(config.processedDir, path.basename(filePath));

  await sharp(filePath)
    .grayscale()
    .normalize()
    .sharpen()
    .toFile(outputPath);
  
  console.log(`[INFO] Image enhanced: ${outputPath}`);
  return outputPath;
}

module.exports = { enhanceImage };