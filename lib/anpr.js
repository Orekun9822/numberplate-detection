// lib/anpr.js

const { spawn } = require('child_process');
const config = require('../config');
const path = require('path'); // pathモジュールを追加

const PYTHON_EXE = '/home/user/ドキュメント/numberplate-detection/python/venv/bin/python3';
const SCRIPT_PATH = '/home/user/ドキュメント/numberplate-detection/python/venv/anpr.py';

// --- Python実行ファイルの絶対パス ---
// 仮想環境の実行ファイルも絶対パス化すると安全性が高まります
const pythonExecutable = path.join(__dirname, '..', 'python', 'venv', 'bin', 'python3'); 

// --- anpr.py スクリプトの絶対パス ---
// __dirname は lib フォルダのパスを指すので、'..' でプロジェクトルートに戻り、'python', 'anpr.py' へ進む
const pythonScriptPath = path.join(__dirname, '..', 'python', 'venv', 'anpr.py');


async function recognizePlate(imagePath) {
    return new Promise((resolve, reject) => {
        // 仮想環境のPythonを直接指定して起動
        const py = spawn(PYTHON_EXE, [SCRIPT_PATH, imagePath]);

        let result = '';
        let errorMsg = '';

        py.stdout.on('data', (data) => {
            result += data.toString();
        });

        // 🚨 Python側のエラー（DEBUGログやエラー）を全てキャッチする
        py.stderr.on('data', (data) => {
            errorMsg += data.toString();
            // リアルタイムでPython側のログを表示させる（デバッグ用）
            console.log(`[PYTHON DEBUG] ${data.toString().trim()}`);
        });

        py.on('close', (code) => {
            if (code !== 0) {
                console.error(`[ERROR] Python exited with code ${code}`);
                return resolve(null);
            }
            resolve(result.trim());
        });
    });
}

module.exports = { recognizePlate };