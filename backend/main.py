from fastapi import FastAPI, File, UploadFile, Response, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import cv2
import numpy as np
import base64
import logging
from starlette.responses import RedirectResponse
import concurrent.futures
from typing import List, Optional
from predictions.classifications_skincancer import ClassificationModel
from gradcam import GradCAM
import uvicorn
import time
import zipfile
from definitions import model_path_skincancer, AUTISM_MODEL_PATH
import requests

# Thiết lập logging chi tiết hơn
logging.basicConfig(
    filename='error.log', 
    level=logging.DEBUG,  # Đổi từ ERROR sang DEBUG để có thêm thông tin
    format='%(asctime)s|%(name)s|%(levelname)s|%(message)s'
)

# Thêm logger console
console = logging.StreamHandler()
console.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s|%(name)s|%(levelname)s|%(message)s')
console.setFormatter(formatter)
logging.getLogger('').addHandler(console)

RESULTS_DIR = "gradcam_results"
AUTISM_RESULTS_DIR = "autism_gradcam_results"
if not os.path.exists(AUTISM_RESULTS_DIR):
    os.makedirs(AUTISM_RESULTS_DIR)
if not os.path.exists(RESULTS_DIR):
    os.makedirs(RESULTS_DIR)


app_desc = """<h2>HUS-VNU</h2>"""
app = FastAPI(title="Nguyễn Đài", description=app_desc)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo các mô hình 
model_skicancer = None
gradcam_generator_skincancer = None
autism_model = None
gradcam_generator_autitics = None
unique_dx = ['bkl', 'nv', 'df', 'mel', 'vasc', 'bcc', 'akiec']
unique_autism_classes = ['Non-Autistic', 'Autistic']

try:
    # Khởi tạo mô hình da liễu
    logging.info("Loading skin cancer model...")
    model_skicancer = ClassificationModel(model_path_skincancer).model
    gradcam_generator_skincancer = GradCAM(model_skicancer)
    
    # Khởi tạo mô hình tự kỷ
    logging.info("Loading autism model...")
    autism_model = ClassificationModel(AUTISM_MODEL_PATH).model
    gradcam_generator_autitics = GradCAM(autism_model)
    
    logging.info("Models loaded successfully")
except Exception as e:
    logging.error(f"Error loading models: {str(e)}")

# Khởi tạo mô hình phát hiện khuôn mặt
try:
    face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    logging.info(f"Loading face cascade from: {face_cascade_path}")
    face_cascade = cv2.CascadeClassifier(face_cascade_path)
    if face_cascade.empty():
        logging.error("Face cascade is empty - check the path")
except Exception as e:
    logging.error(f"Error loading face cascade: {str(e)}")
    face_cascade = None

@app.get("/", include_in_schema=False)
async def index():
    return RedirectResponse(url="/docs")

@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)

@app.post("/upload-images")
async def upload_images(files: List[UploadFile] = File(...)):
    if model_skicancer is None:
        return {"error": "Skin cancer model not loaded", "results": {}, "times": [], "count_file": 0}
    
    results = {}
    times = []
    count_file = 0
    start_time_1 = time.time()

    try:
        for file in files:
            file_extension = os.path.splitext(file.filename)[1]
            if file_extension == '.zip':
                with tempfile.TemporaryDirectory() as temp_dir:
                    zip_path = os.path.join(temp_dir, file.filename)
                    with open(zip_path, "wb") as buffer:
                        buffer.write(await file.read())
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(temp_dir)
                    for root, _, files in os.walk(temp_dir):
                        for filename in files:
                            count_file += 1
                            start_time = time.time()
                            image_path = os.path.join(root, filename)
                            image_array = cv2.imread(image_path)
                            with concurrent.futures.ThreadPoolExecutor() as executor:
                                future = executor.submit(perform_prediction_with_gradcam, 
                                                         gradcam_generator_skincancer, 
                                                         image_array, 
                                                         filename)
                                result = future.result()
                                if result is not None:
                                    label_index, gradcam_data = result
                                    label = unique_dx[label_index]
                                    class_probabilities = {
                                        unique_dx[i]: prob 
                                        for i, prob in gradcam_data["probabilities"].items()
                                    }
                                    results[filename] = {
                                        "label": label,
                                        "probabilities": class_probabilities,
                                        "gradcam_path": gradcam_data["file_path"],
                                        "gradcam_image": gradcam_data["base64"]
                                    }
                            elapsed_time = time.time() - start_time
                            times.append(elapsed_time)
            else:
                image_bytes = await file.read()
                image_array = np.frombuffer(image_bytes, dtype=np.uint8)
                img_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
                result = perform_prediction_with_gradcam(gradcam_generator_skincancer, img_bgr, file.filename)
                if result is not None:
                    label_index, gradcam_data = result
                    label = unique_dx[label_index]
                    class_probabilities = {
                        unique_dx[i]: prob 
                        for i, prob in gradcam_data["probabilities"].items()
                    }
                    results["image"] = {
                        "label": label,
                        "probabilities": class_probabilities,
                        "gradcam_path": gradcam_data["file_path"],
                        "gradcam_image": gradcam_data["base64"]
                    }
                elapsed_time = time.time() - start_time_1
                count_file += 1
                times.append(elapsed_time)

    except Exception as e:
        logging.error(f'Error uploading images from api: {str(e)}')
        return {"error": str(e), "results": {}, "times": [], "count_file": 0}

    return {
        "results": results,
        "times": times,
        "count_file": count_file,
    }

@app.post("/upload-autism")
async def detect_autism(
    files: List[UploadFile] = File(...)
):
    if autism_model is None:
        return {"error": "Autism model not loaded", "results": {}, "times": [], "count_file": 0}
    
    results = {}
    times = []
    count_file = 0
    start_time_1 = time.time()
    
    try:
        for file in files:
            # Đọc ảnh từ file
            image_bytes = await file.read()
            start_time = time.time()
            
            # Chuyển đổi bytes thành ảnh
            image_array = np.frombuffer(image_bytes, dtype=np.uint8)
            img_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            
            if img_bgr is None:
                logging.error(f"Failed to decode image: {file.filename}")
                results["image"] = {  # Thay file.filename thành "image"
                    "error": "Không thể đọc ảnh, vui lòng kiểm tra định dạng",
                    "result": None
                }
                continue
            
            # Điều chỉnh kích thước ảnh theo yêu cầu của mô hình
            processed_img = resize_for_model(img_bgr, (224, 224))
            
            # Chẩn đoán tự kỷ với GradCAM
            result = perform_prediction_with_gradcam(gradcam_generator_autitics, processed_img, file.filename)
            
            if result is None:
                results["image"] = {  # Thay file.filename thành "image"
                    "error": "Lỗi khi phân tích ảnh",
                    "result": None
                }
                continue
            
            label_index, gradcam_data = result
            
            # Đảm bảo label_index nằm trong phạm vi của unique_autism_classes
            if label_index < 0 or label_index >= len(unique_autism_classes):
                logging.error(f"Label index {label_index} out of range for classes: {unique_autism_classes}")
                label = f"Unknown-{label_index}"
            else:
                label = unique_autism_classes[label_index]
            
            # Chuyển đổi probabilities sang định dạng phù hợp
            class_probabilities = {}
            for i, class_name in enumerate(unique_autism_classes):
                if str(i) in gradcam_data["probabilities"]:
                    class_probabilities[class_name] = gradcam_data["probabilities"][str(i)]
                elif i in gradcam_data["probabilities"]:
                    class_probabilities[class_name] = gradcam_data["probabilities"][i]
                else:
                    class_probabilities[class_name] = 0.0
            
            results["image"] = {  # Thay file.filename thành "image"
                "label": label,
                "probabilities": class_probabilities,
                "gradcam_path": gradcam_data["file_path"],
                "gradcam_image": gradcam_data["base64"]
            }
            
            elapsed_time = time.time() - start_time
            count_file += 1
            times.append(elapsed_time)
        
        return {
            "results": results,
            "times": times,
            "count_file": count_file
        }
            
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        logging.error(f'Error detecting autism: {str(e)}\n{trace}')
        return {"error": str(e), "results": {}, "times": [], "count_file": 0}
def extract_largest_face(image, faces):
    """Trích xuất khuôn mặt lớn nhất từ ảnh"""
    if len(faces) == 0:
        return None
    
    try:
        # Tìm khuôn mặt lớn nhất
        areas = [w * h for (x, y, w, h) in faces]
        max_index = areas.index(max(areas))
        x, y, w, h = faces[max_index]
        
        # Cắt khuôn mặt từ ảnh gốc, thêm biên để lấy thêm phần đầu và cằm
        top = max(0, y - int(h * 0.2))
        bottom = min(image.shape[0], y + h + int(h * 0.2))
        left = max(0, x - int(w * 0.1))
        right = min(image.shape[1], x + w + int(w * 0.1))
        
        face_img = image[top:bottom, left:right]
        
        # Trả về khuôn mặt đã cắt
        return face_img
    except Exception as e:
        logging.error(f"Error extracting largest face: {str(e)}")
        return None

def resize_for_model(image, target_size=(224, 224)):
    """Điều chỉnh kích thước ảnh cho mô hình"""
    try:
        return cv2.resize(image, target_size)
    except Exception as e:
        logging.error(f"Error resizing image: {str(e)}")
        return image

def perform_prediction_with_gradcam(gradcam_model, image, filename=None, results_dir=RESULTS_DIR):
    """Thực hiện dự đoán và tạo Grad-CAM"""
    try:
        if filename:
            base_filename = os.path.splitext(filename)[0]
            gradcam_filename = f"{base_filename}_gradcam.jpg"
        else:
            timestamp = int(time.time())
            gradcam_filename = f"gradcam_{timestamp}.jpg"
        
        file_path = os.path.join(results_dir, gradcam_filename)
        
        result = gradcam_model.generate_gradcam(image, filename)
        if result:
            return result["label_index"], {
                "base64": result["gradcam_image"],
                "file_path": result["file_path"],
                "probabilities": result["probabilities"]
            }
        return None
    except Exception as e:
        logging.error(f'Error performing Grad-CAM prediction: {str(e)}')
        return None

if __name__ == "__main__":
    port = 8000
    logging.info(f"Starting server on port {port}")
    # uvicorn.run(app, host='127.0.0.1', port=port)
    uvicorn.run("main:app", host="0.0.0.0", port=6879, reload=True)