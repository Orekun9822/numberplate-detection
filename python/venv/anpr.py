# python/anpr.py
import sys
import cv2
import pytesseract
import re

# Haar Cascade分類器のXMLファイルパス (anpr.py と同じ場所にある前提)
CASCADE_PATH = './python/haarcascade_russian_plate_number.xml' 

# Tesseractの設定 (日本語+英語、PSM 6は「単一の均一なテキストブロック」として扱うモード)
TESS_CONFIG = '-l jpn+eng --psm 6'

def recognize_plate(image_path):
    try:
        image = cv2.imread(image_path)
        if image is None:
            print("ERROR: Image not found.", file=sys.stderr)
            return None
            
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # ナンバープレート検出
        plate_cascade = cv2.CascadeClassifier(CASCADE_PATH)
        plates = plate_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(25, 25))

        if len(plates) == 0:
            return None # 検出できず

        # 検出した最初の領域を切り出す
        (x, y, w, h) = plates[0]
        roi = gray[y:y+h, x:x+w]
        
        # OCRのための前処理 (二値化)
        _, roi_thresh = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # TesseractでOCR実行
        text = pytesseract.image_to_string(roi_thresh, config=TESS_CONFIG)
        
        # 不要な文字（空白、記号）を削除
        clean_text = re.sub(r'[\s\.\-\/\:]', '', text).strip()
        
        return clean_text

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python anpr.py <image_path>", file=sys.stderr)
        sys.exit(1)
        
    image_path = sys.argv[1]
    plate_number = recognize_plate(image_path)
    
    if plate_number:
        # 成功した場合、認識した文字列を標準出力に出力
        # (Node.js側はこれを受け取る)
        print(plate_number)