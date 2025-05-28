import tensorflow as tf
import numpy as np
import cv2
import os
from datetime import datetime
import base64
import logging

class GradCAM:
    global_model = None
    def __init__(self, model, output_dir="gradcam_results"):
        self.model = model
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def get_gradcam(self, img_array, layer_name, class_index):
        """Tính Grad-CAM từ mô hình và ảnh đầu vào"""
        try:
            grad_model = tf.keras.models.Model(
                [self.model.inputs], 
                [self.model.get_layer(layer_name).output, self.model.output]
            )

            with tf.GradientTape() as tape:
                conv_outputs, predictions = grad_model(img_array)
                loss = predictions[:, class_index]

            grads = tape.gradient(loss, conv_outputs)[0]
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

            conv_outputs = conv_outputs[0]
            heatmap = tf.reduce_mean(tf.multiply(conv_outputs, pooled_grads), axis=-1)
            heatmap = np.maximum(heatmap, 0)
            heatmap /= np.max(heatmap) if np.max(heatmap) != 0 else 1

            return heatmap
        except Exception as e:
            logging.error(f"Error in get_gradcam: {str(e)}")
            return None

    def overlay_gradcam(self, img, heatmap, alpha=0.4):
        """Chồng heatmap Grad-CAM lên ảnh gốc"""
        try:
            heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
            heatmap = np.uint8(255 * heatmap)
            heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

            superimposed_img = heatmap * alpha + img
            superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)
            
            return superimposed_img
        except Exception as e:
            logging.error(f"Error in overlay_gradcam: {str(e)}")
            return None

    def generate_gradcam(self, image, filename=None, layer_name='convnext_tiny_stage_3_block_2_identity'):
        """Generate Grad-CAM visualization for an image"""
        try:
            target_size = (224, 224)
            # Chuyển ảnh từ BGR sang RGB
            img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            # Resize ảnh về kích thước mà mô hình yêu cầu
            img = cv2.resize(img, target_size, interpolation=cv2.INTER_AREA)
            # Chuyển ảnh thành numpy array với giá trị pixel [0, 255]
            img = np.array(img, dtype=np.float32)
            # Thêm chiều batch
            img = np.expand_dims(img, axis=0)
            # # Dự đoán với mô hình
            # predictions = self.model.model(img_array)
            predictions  = self.model(img)
            label_index = np.argmax(predictions[0])
            probabilities = tf.nn.softmax(predictions[0]).numpy()  # Chuyển logits thành xác suất

            # Generate Grad-CAM
            heatmap = self.get_gradcam(img, layer_name, label_index)
            if heatmap is None:
                return None

            gradcam_img = self.overlay_gradcam(image, heatmap)
            if gradcam_img is None:
                return None

            gradcam_rgb = cv2.cvtColor(gradcam_img, cv2.COLOR_BGR2RGB)

            # Save results
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            if filename:
                base_filename = os.path.splitext(filename)[0]
                save_filename = f"{base_filename}_gradcam_{timestamp}.jpg"
            else:
                save_filename = f"gradcam_{timestamp}.jpg"

            save_path = os.path.join(self.output_dir, save_filename)
            cv2.imwrite(save_path, gradcam_rgb)

            # Create base64 representation
            _, buffer = cv2.imencode('.jpg', gradcam_rgb)
            image_base64 = base64.b64encode(buffer).decode('utf-8')

            return {
                "label_index": int(label_index),
                "probabilities": {i: round(float(prob * 100), 4) for i, prob in enumerate(probabilities)},
                "file_path": save_path,
                "gradcam_image": image_base64
            }

        except Exception as e:
            logging.error(f"Error generating Grad-CAM: {str(e)}")
            return None