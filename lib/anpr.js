// lib/anpr.js
const { spawn } = require('child_process');
const config = require('../config');

async function recognizePlate(imagePath) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      config.python.scriptPath, 
      imagePath
    ]);
    
    let plateNumber = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      plateNumber += data.toString().trim();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[PYTHON STDERR] ${errorOutput}`);
        return reject(new Error(`Python script exited with code ${code}`));
      }
      if (errorOutput) {
         // Pythonスクリプト内でprint(..., file=sys.stderr) した場合
        console.warn(`[PYTHON DEBUG] ${errorOutput}`);
      }
      resolve(plateNumber || null); // 認識できなかった場合は null
    });
  });
}

module.exports = { recognizePlate };