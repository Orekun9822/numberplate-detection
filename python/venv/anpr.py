import sys
import cv2
import pytesseract
import re
import numpy as np
from ultralytics import YOLO
import torch
import os

# --- 設定 ---
MODEL_PATH = '/home/user/ドキュメント/numberplate-detection/python/venv/best.pt'
# 🚨 ナンバープレートは「1行のテキスト」なので --psm 7 が最も安定します
TESS_CONFIG = '--psm 6 -c tessedit_char_whitelist=0123456789'
pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'

# モデルのロード
try:
    DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
    YOLO_MODEL = YOLO(MODEL_PATH)
    print(f"INFO: YOLOv8 model loaded successfully on {DEVICE}.", file=sys.stderr)
except Exception as e:
    print(f"FATAL ERROR: Failed to load YOLO model: {e}", file=sys.stderr)
    YOLO_MODEL = None

def deskew_image(image):
    """画像の傾きを検出し、水平に補正する関数"""
    try:
        # 白い画素（文字部分）の座標を取得
        coords = np.column_stack(np.where(image > 0))
        if len(coords) == 0: return image
        
        # 最小外接矩形を計算
        angle = cv2.minAreaRect(coords)[-1]
        
        # 角度の正規化
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
            
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated
    except:
        return image

def recognize_plate(image_path):
    if not YOLO_MODEL:
        return None
    
    try:
        # 1. 画像読み込み
        image = cv2.imread(image_path)
        if image is None:
            return None
        
        # 2. YOLOv8でナンバープレートを検出
        results = YOLO_MODEL.predict(source=image, conf=0.2, imgsz=640, iou=0.7, verbose=False, device=DEVICE)

        if not (results and len(results[0].boxes) > 0):
            print("DEBUG: YOLOv8 found no bounding boxes.", file=sys.stderr)
            return None

        # 最も自信度の高いボックスを使用
        box = results[0].boxes[0].xyxy[0].cpu().numpy().astype(int)
        x1, y1, x2, y2 = box

        # 3. 切り出し（余白を追加）
        padding = 20
        h_img, w_img, _ = image.shape
        x1, y1 = max(0, x1 - padding), max(0, y1 - padding)
        x2, y2 = min(w_img, x2 + padding), min(h_img, y2 + padding)
        roi = image[y1:y2, x1:x2]
        
        # --- 4. OCRのための前処理 ---
        # 4-1. グレースケール化
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        cv2.imwrite("/home/user/ドキュメント/numberplate-detection/debug_1_gray.jpg", gray)
        
        # 4-2. リサイズ（拡大）
        resized = cv2.resize(gray, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)
        
        # 4-3. ノイズ除去
        blurred = cv2.GaussianBlur(resized, (5, 5), 0)
        
        # 4-4. 二値化 (OTSU)
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        cv2.imwrite("/home/user/ドキュメント/numberplate-detection/debug_2_thresh.jpg", thresh)

        # 4-5. 傾き補正
        final_image = deskew_image(thresh)
        cv2.imwrite("/home/user/ドキュメント/numberplate-detection/debug_3_final.jpg", final_image)
        
        # --- 5. TesseractでOCR実行 ---
        text = pytesseract.image_to_string(final_image, config=TESS_CONFIG)
        
        # --- 6. 最後の4桁数字のみを抽出 ---
        numbers_only = re.findall(r'\d+', text)
        clean_text = numbers_only[-1][-4:] if numbers_only else ""
            
        print(f"DEBUG: Raw OCR Text: {text.strip()}", file=sys.stderr)
        print(f"DEBUG: Extracted Number: {clean_text}", file=sys.stderr)
        
        return clean_text

    except Exception as e:
        print(f"RUNTIME ERROR: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)
    
    plate_number = recognize_plate(sys.argv[1])
    if plate_number:
        print(plate_number)