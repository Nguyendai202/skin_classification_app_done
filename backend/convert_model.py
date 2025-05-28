import tensorflow as tf
import os
import subprocess
from definitions import model_path_skincancer, AUTISM_MODEL_PATH
import logging
import shutil

logging.basicConfig(
    filename='conversion.log',
    level=logging.INFO,
    format='%(asctime)s|%(name)s|%(levelname)s|%(message)s'
)

def convert_keras_to_openvino(model_path):
    """Convert Keras model to OpenVINO IR format using model optimizer"""
    try:
        print(f"Converting model: {model_path}")
        # Load the keras model
        model = tf.keras.models.load_model(model_path)
        
        # Save as SavedModel format
        base_path = os.path.splitext(model_path)[0]
        saved_model_dir = f"{base_path}_saved_model"
        print(f"Saving model to SavedModel format in {saved_model_dir}...")
        tf.saved_model.save(model, saved_model_dir)
        
        # Use OpenVINO Model Optimizer to convert
        print("Converting to OpenVINO IR using model optimizer...")
        output_path = f"{base_path}_openvino"
        
        # Prepare mo command with optimizations
        mo_command = [
            "mo",
            "--saved_model_dir", saved_model_dir,
            "--output_dir", output_path,
            "--input_shape", "[1,224,224,3]",
            "--static_shape",  # Optimize for fixed input shape
            "--transform_type_FP16",  # Use FP16 precision
            "--mean_values", "[123.675,116.28,103.53]",  # ImageNet mean values
            "--scale_values", "[58.395,57.12,57.375]"   # ImageNet scale values
        ]
        
        print("Running model optimizer command:")
        print(" ".join(mo_command))
        
        result = subprocess.run(mo_command, 
                              capture_output=True,
                              text=True)
        
        if result.returncode != 0:
            print(f"Error during conversion: {result.stderr}")
            raise Exception(result.stderr)
            
        print(f"Model converted successfully. Saved to: {output_path}")
        logging.info(f"Model converted successfully: {model_path} -> {output_path}")
        
        # Clean up SavedModel directory
        if os.path.exists(saved_model_dir):
            shutil.rmtree(saved_model_dir)
        
        return f"{output_path}/saved_model.xml"
        
    except Exception as e:
        print(f"Error converting model: {str(e)}")
        logging.error(f"Error converting model {model_path}: {str(e)}")
        return None

def main():
    # Convert skin cancer model
    print("Converting skin cancer model...")
    convert_keras_to_openvino(model_path_skincancer)
    
    # Convert autism model
    print("\nConverting autism model...")
    convert_keras_to_openvino(AUTISM_MODEL_PATH)

if __name__ == "__main__":
    main()
