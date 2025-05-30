import tensorflow as tf
import os

def convert_keras_to_saved_model(keras_path, save_path):
    # Get absolute paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    keras_full_path = os.path.join(base_dir, keras_path)
    save_full_path = os.path.join(base_dir, save_path)
    
    # Check if keras model exists
    if not os.path.exists(keras_full_path):
        raise FileNotFoundError(f"Keras model not found at: {keras_full_path}")
    
    # Load the Keras model
    print(f"Loading model from: {keras_full_path}")
    model = tf.keras.models.load_model(keras_full_path)
    
    # Create directory if it doesn't exist
    os.makedirs(save_full_path, exist_ok=True)
    
    # Save as SavedModel format
    print(f"Saving model to: {save_full_path}")
    tf.saved_model.save(model, save_full_path)
    print(f"Model converted and saved successfully")

try:
    # Convert skin cancer model
    print("\nConverting skin cancer model...")
    convert_keras_to_saved_model(
        'weight/convenetiny_full.keras',
        'weight/skin_cancer_saved_model'
    )

    # Convert autism model
    print("\nConverting autism model...")
    convert_keras_to_saved_model(
        'weight/convenetiny_1_2_balanced.keras',
        'weight/autism_saved_model'
    )
except Exception as e:
    print(f"Error during conversion: {str(e)}")
