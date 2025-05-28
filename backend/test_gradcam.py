import cv2
from gradcam import GradCAM
from backend.predictions.classifications_skincancer import ClassificationModel
from definitions import model_path

def test_gradcam():
    # Initialize model and GradCAM
    model = ClassificationModel(model_path)
    gradcam = GradCAM(model)

    # Test with a sample image
    test_image_path = "image_test/5.jpg"  # Replace with your test image path
    image = cv2.imread(test_image_path)
    
    # Generate Grad-CAM
    result = gradcam.generate_gradcam(image, "test_image.jpg")
    
    if result:
        print("Grad-CAM generation successful!")
        print(f"Label Index: {result['label_index']}")
        print(f"Saved to: {result['file_path']}")
    else:
        print("Grad-CAM generation failed!")

if __name__ == "__main__":
    test_gradcam()