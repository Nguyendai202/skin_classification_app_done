# Docker Setup Guide for Skin Classification and Autism Detection

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed
- Git (optional)
- At least 8GB RAM available
- At least 20GB free disk space

## Setup Steps

1. Navigate to project directory:
```powershell
cd D:\TL_DH\khoaluantotnghip\skin_classification_app
```

2. Check model files:
Ensure these files exist:
```
backend/weight/
├── convenetiny_full.keras          # Skin cancer model
└── convenetiny_1_2_balanced.keras  # Autism detection model
```

3. Build services:
```powershell
# Build all containers
docker-compose build
```

4. Start services:
```powershell
# Start all services in detached mode
docker-compose up -d
```

## Accessing Services

- Frontend UI: http://localhost:80
- Backend API Documentation: http://localhost:6879/docs
- TF Serving REST API: http://localhost:8501

## Monitoring

### View Logs
```powershell
# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f tf-serving

# View all logs
docker-compose logs -f
```

### Check Status
```powershell
# List running containers
docker-compose ps

# Monitor resource usage
docker stats
```

## Testing

1. Test TF Serving:
```powershell
$uri = "http://localhost:8501/v1/models/skin_cancer:predict"
$headers = @{ "Content-Type" = "application/json" }
$body = '{"instances": [[...your_test_data...]]}' # Replace with actual data
Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
```

1.1 Test tf serving riêng
```
docker run -t --rm -p 8501:8501 --mount type=bind,source=D:/TL_DH/khoaluantotnghip/skin_classification_app/backend/weight,target=/models --mount type=bind,source=D:/TL_DH/khoaluantotnghip/skin_classification_app/backend/model.config,target=/models/model.config tensorflow/serving --model_config_file=/models/model.config
```
```
$imagePath = "D:/TL_DH/khoaluantotnghip/skin_classification_app/backend/image_test/1.jpg"

# Read image as base64
$imageBytes = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($imagePath))
$floatArray = New-Object float[] (224*224*3); for($y = 0; $y -lt 224; $y++) { for($x = 0; $x -lt 224; $x++) { $pixel = $resized.GetPixel($x, $y); $i = ($y * 224 + $x) * 3; $floatArray[$i] = $pixel.R / 255.0; $floatArray[$i+1] = $pixel.G / 255.0; $floatArray[$i+2] = $pixel.B / 255.0 } }
$payload = @{ "signature_name" = "serving_default"; "instances" = @(@($floatArray)) } | ConvertTo-Json -Depth 10 -Compress
[System.IO.File]::WriteAllText("payload.json", $payload);
curl.exe -X POST -H "Content-Type: application/json" --data-binary "@payload.json" http://localhost:8501/v1/models/autism:predict
```
2. Test Backend API:
```powershell
$uri = "http://localhost:6879/predict-skin"
$filePath = "D:/TL_DH/khoaluantotnghip/skin_classification_app/backend/image_test/1.jpg"
curl -F "files=@$filePath" http://localhost:6879/predict-skin
```

## Troubleshooting

1. If services fail to start:
```powershell
# Stop all services
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

2. If models don't load:
- Check model files exist in backend/weight/
- Verify file permissions
- Check TF Serving logs

3. If frontend can't connect:
- Check nginx.conf configuration
- Verify all services are running
- Check network between containers

## Stopping Services

```powershell
# Stop all services
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove everything including images
docker-compose down --rmi all
```

## Notes

- Services communicate over Docker network
- Frontend served by Nginx
- Backend uses FastAPI
- Models served by TF Serving
- Data persisted in Docker volumes
- Logs available for all services
