# tạo cấu hình cho tf serving để serve nhiều model
# Use TensorFlow Serving base image
FROM tensorflow/serving:latest

# Copy models from local to the container (/models/<model_name>/<version>/ )
COPY ./weight/convenetiny_full.keras /models/skin_cancer/1/
COPY ./weight/convenetiny_1_2_balanced.keras /models/autism/1/

# Create model.config file for multiple models
COPY ./model.config /models/model.config

# Environment variables (thiết lập biến môi trường cho Tf serving)
ENV MODEL_CONFIG_FILE=/models/model.config
# metrics , logging
ENV MONITORING_CONFIG_FILE=/models/monitoring.config 

# Expose port 8501 for rest api and 8500 for gRPC
EXPOSE 8501
EXPOSE 8500

# Start TensorFlow Serving
CMD ["tensorflow_model_server", \
     "--model_config_file=/models/model.config", \
     "--rest_api_port=8501", \
     "--port=8500"]
# server nhiều models đc cùng lúc 
# có versioning cho từng model 
#  cung cấp cả rest api và grpc 
# dễ scale bằng cách chạy nhiều container 
# monitoring và logging đc cấu hình sẵn 