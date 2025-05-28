import tensorflow as tf
import openvino as ov
import numpy as np
import os
import logging
import time

logging.basicConfig(
    filename='optimization.log',
    level=logging.INFO,
    format='%(asctime)s|%(name)s|%(levelname)s|%(message)s'
)

class ModelOptimizer:
    @staticmethod
    def convert_to_ir(model_path, output_path=None):
        """Convert TensorFlow model to OpenVINO IR format
        
        Args:
            model_path (str): Path to the original TensorFlow model
            output_path (str, optional): Path to save the optimized model. Defaults to None.
                                      If None, will use original path with _openvino suffix
        
        Returns:
            str: Path to the optimized model
        """
        try:
            # Load the original model
            model = tf.keras.models.load_model(model_path)
            
            # Convert model to OpenVINO IR
            ov_model = ov.convert_model(model)
            
            # Save the converted model
            if output_path is None:
                base_path = os.path.splitext(model_path)[0]
                output_path = f"{base_path}_openvino.xml"
            
            start_time = time.time()
            ov.save_model(ov_model, output_path)
            conversion_time = time.time() - start_time
            
            # Log optimization results
            original_size = os.path.getsize(model_path) / (1024 * 1024) # MB
            optimized_size = (os.path.getsize(output_path) + 
                            os.path.getsize(output_path.replace('.xml', '.bin'))) / (1024 * 1024) # MB
            size_reduction = ((original_size - optimized_size) / original_size) * 100
            
            logging.info(f"""
            Model optimization completed:
            - Original size: {original_size:.2f} MB
            - Optimized size: {optimized_size:.2f} MB 
            - Size reduction: {size_reduction:.2f}%
            - Conversion time: {conversion_time:.2f} seconds
            - Output saved to: {output_path}
            """)
            
            return output_path
            
        except Exception as e:
            logging.error(f"Error optimizing model: {str(e)}")
            raise e
    
    @staticmethod
    def load_optimized_model(model_path):
        """Load an optimized OpenVINO model
        
        Args:
            model_path (str): Path to the OpenVINO IR model (.xml file)
            
        Returns:
            ov.CompiledModel: OpenVINO compiled model
        """
        try:
            core = ov.Core()
            # Auto-detect available devices and select the best one
            devices = core.available_devices
            device = devices[0]  # Usually CPU or GPU if available
            
            model = core.read_model(model_path)
            compiled_model = core.compile_model(model, device)
            logging.info(f"Model loaded and compiled for {device} device")
            
            return compiled_model
            
        except Exception as e:
            logging.error(f"Error loading optimized model: {str(e)}")
            raise e
            
    @staticmethod
    def benchmark_model(model_path, input_shape=(1, 224, 224, 3), num_runs=50):
        """Benchmark model performance
        
        Args:
            model_path (str): Path to the original model file
            input_shape (tuple): Shape of input tensor
            num_runs (int): Number of inference runs for benchmarking
            
        Returns:
            dict: Dictionary containing benchmark results
        """
        try:
            # Create random input data
            input_data = np.random.uniform(0, 1, input_shape).astype(np.float32)
            
            # Benchmark original model
            original_model = tf.keras.models.load_model(model_path)
            start_time = time.time()
            for _ in range(num_runs):
                original_model.predict(input_data)
            original_time = (time.time() - start_time) / num_runs
            
            # Get optimized model path
            base_path = os.path.splitext(model_path)[0]
            optimized_path = f"{base_path}_openvino.xml"
            
            # Benchmark optimized model
            compiled_model = ModelOptimizer.load_optimized_model(optimized_path)
            infer_request = compiled_model.create_infer_request()
            
            start_time = time.time()
            for _ in range(num_runs):
                result = infer_request.infer(inputs=[input_data])[0]
            optimized_time = (time.time() - start_time) / num_runs
            
            speedup = ((original_time - optimized_time) / original_time) * 100
            
            results = {
                'original_inference_time': original_time,
                'optimized_inference_time': optimized_time,
                'speedup_percentage': speedup,
                'device': compiled_model.device
            }
            
            logging.info(f"""
            Benchmark results on {compiled_model.device}:
            - Original inference time: {original_time*1000:.2f} ms
            - Optimized inference time: {optimized_time*1000:.2f} ms
            - Speed improvement: {speedup:.2f}%
            """)
            
            return results
            
        except Exception as e:
            logging.error(f"Error during benchmarking: {str(e)}")
            raise e
