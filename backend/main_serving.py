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
import tensorflow as tf
import requests
import time
import zipfile
from definitions import model_path_skincancer, AUTISM_MODEL_PATH

# Thiết lập logging chi tiết
logging.basicConfig(
    filename='serving.log', 
    level=logging.DEBUG,
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

# Lấy URL của TF Serving từ biến môi trường
TF_SERVING_URL = os.getenv("TF_SERVING_URL", "http://localhost:8501")

# Labels
unique_dx = ['bkl', 'nv', 'df', 'mel', 'vasc', 'bcc', 'akiec']
unique_autism_classes = ['Non-Autistic', 'Autistic']

app_desc = """<h2>HUS-VNU API with TensorFlow Serving</h2>"""
app = FastAPI(title="Nguyễn Đài", description=app_desc)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(image, target_size=(224, 224)):
    """Preprocess image for model input"""
    try:
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        # Resize
        image = cv2.resize(image, target_size)
        # Normalize using ConvNeXt preprocessing
        image = tf.keras.applications.convnext.preprocess_input(image)
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        return image
    except Exception as e:
        logging.error(f"Error preprocessing image: {str(e)}")
        return None

def predict_with_tfserving(image_data, model_name):
    """Make predictions using TF Serving REST API"""
    url = f"{TF_SERVING_URL}/v1/models/{model_name}:predict"
    
    # Convert image to format expected by TF Serving
    data = {
        "signature_name": "serving_default",
        "instances": image_data.tolist()
    }
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        predictions = response.json()['predictions']
        return predictions[0]
    except Exception as e:
        logging.error(f"Error calling TF Serving: {str(e)}")
        return None

@app.get("/", include_in_schema=False)
async def index():
    return RedirectResponse(url="/docs")

@app.post("/predict-skin")
async def predict_skin(files: List[UploadFile] = File(...)):
    results = {}
    times = []
    count_file = 0
    start_time = time.time()

    try:
        for file in files:
            count_file += 1
            file_start_time = time.time()
            
            # Read and preprocess image
            image_bytes = await file.read()
            image_array = np.frombuffer(image_bytes, dtype=np.uint8)
            img_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            
            if img_bgr is None:
                results[file.filename] = {
                    "error": "Could not read image file"
                }
                continue
                
            # Preprocess image
            processed_img = preprocess_image(img_bgr)
            if processed_img is None:
                results[file.filename] = {
                    "error": "Error preprocessing image"
                }
                continue
            
            # Get prediction from TF Serving
            predictions = predict_with_tfserving(processed_img, "skin_cancer")
            if predictions is None:
                results[file.filename] = {
                    "error": "Error getting predictions from model"
                }
                continue
                
            # Post-process predictions
            probabilities = tf.nn.softmax(predictions).numpy()
            class_id = np.argmax(probabilities)
            
            # Format results
            results[file.filename] = {
                "label": unique_dx[class_id],
                "probabilities": {
                    label: float(prob * 100)
                    for label, prob in zip(unique_dx, probabilities)
                }
            }
            
            # Record timing
            elapsed_time = time.time() - file_start_time
            times.append(elapsed_time)
            
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return {"error": str(e), "results": {}, "times": [], "count_file": 0}

    return {
        "results": results,
        "times": times,
        "count_file": count_file,
        "total_time": time.time() - start_time
    }

@app.post("/predict-autism")
async def predict_autism(files: List[UploadFile] = File(...)):
    results = {}
    times = []
    count_file = 0
    start_time = time.time()

    try:
        for file in files:
            count_file += 1
            file_start_time = time.time()
            
            # Read and preprocess image
            image_bytes = await file.read()
            image_array = np.frombuffer(image_bytes, dtype=np.uint8)
            img_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            
            if img_bgr is None:
                results[file.filename] = {
                    "error": "Could not read image file"
                }
                continue
                
            # Preprocess image
            processed_img = preprocess_image(img_bgr)
            if processed_img is None:
                results[file.filename] = {
                    "error": "Error preprocessing image"
                }
                continue
            
            # Get prediction from TF Serving
            predictions = predict_with_tfserving(processed_img, "autism")
            if predictions is None:
                results[file.filename] = {
                    "error": "Error getting predictions from model"
                }
                continue
                
            # Post-process predictions
            probabilities = tf.nn.softmax(predictions).numpy()
            class_id = np.argmax(probabilities)
            
            # Format results
            results[file.filename] = {
                "label": unique_autism_classes[class_id],
                "probabilities": {
                    label: float(prob * 100)
                    for label, prob in zip(unique_autism_classes, probabilities)
                }
            }
            
            # Record timing
            elapsed_time = time.time() - file_start_time
            times.append(elapsed_time)
            
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return {"error": str(e), "results": {}, "times": [], "count_file": 0}

    return {
        "results": results,
        "times": times,
        "count_file": count_file,
        "total_time": time.time() - start_time
    }

if __name__ == "__main__":
    import uvicorn
    logging.info(f"Starting server with TF Serving at {TF_SERVING_URL}")
    uvicorn.run("main_serving:app", host="0.0.0.0", port=6879, reload=True)
