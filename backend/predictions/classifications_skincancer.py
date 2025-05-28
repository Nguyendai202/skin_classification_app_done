import cv2
import numpy as np
import tensorflow as tf
import logging
import os 

# Thiết lập logging
logging.basicConfig(
    filename='error.log',
    level=logging.ERROR,
    format='%(asctime)s|%(name)s|%(levelname)s|%(message)s'
)

class ClassificationModel:
    global_model = None
    def __init__(self, model_path):
        self.model_path = model_path
        self.model = self.load_model()

    def load_model(self):
        """Load model từ file .keras"""
        try:
            if ClassificationModel.global_model is None:
                if not os.path.exists(self.model_path):
                    raise FileNotFoundError(f"Model file not found at {self.model_path}")
                model = tf.keras.models.load_model(self.model_path)
                ClassificationModel.global_model = model
            return ClassificationModel.global_model
            
        except Exception as e:
            logging.error(f"Error loading model at {self.model_path}: {str(e)}")
            raise Exception(f"Failed to load model: {str(e)}")   
    def image_convenet_classify(self, img):
        """Phân loại ảnh và trả về nhãn lớp cùng xác suất các lớp"""
        try:
            target_size = (224, 224)
            # Resize ảnh về kích thước model mong đợi
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, target_size, interpolation=cv2.INTER_AREA)
            # Chuẩn hóa ảnh
            img = tf.keras.applications.convnext.preprocess_input(img)
            # Thêm chiều batch
            img = np.expand_dims(img, axis=0)
            # Dự đoán xác suất các lớp
            predictions = self.model(img)
            probabilities = tf.nn.softmax(predictions[0]).numpy()
            class_id = np.argmax(probabilities)
            
            class_probabilities = {
                'class_id': int(class_id),
                'probabilities': {
                    i: round(float(prob * 100), 4) for i, prob in enumerate(probabilities)
                }
            }
            
            return class_probabilities
            
        except Exception as e:
            logging.error(f"Error classifying image: {str(e)}")
            return None