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
