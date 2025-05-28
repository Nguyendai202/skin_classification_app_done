# import requests
# import cv2
# import numpy as np
# import base64

# file_path = 'path/to/your/image.jpg'
# url = 'http://localhost:6879/upload-images'

# with open(file_path, 'rb') as f:
#     files = {'files': (file_path, f)}
#     response = requests.post(url, files=files)

# if response.status_code == 200:
#     data = response.json()
#     results = data['results']
    
#     for filename, result in results.items():
#         label = result['label']
#         image_base64 = result['image']
        
#         # Decode base64 thành ảnh
#         image_data = base64.b64decode(image_base64)
#         image_array = np.frombuffer(image_data, np.uint8)
#         img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
#         # Thêm nhãn lên ảnh
#         cv2.putText(img, f'Label: {label}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
#         cv2.imshow(filename, img)
#         cv2.waitKey(0)
#         cv2.destroyAllWindows()
# else:
#     print(f"Lỗi: {response.status_code} - {response.text}")
import os

# Đường dẫn đến file mô hình
model_path = "D:/TL_DH/khoaluantotnghip/skin_classification_app/backend/weight/densenet201.keras"

# Kiểm tra file tồn tại
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found at {model_path}")
else:
    print(f"Model file found at {model_path}")