# Skin Classification and Autism Detection Application

This project integrates deep learning models for skin cancer classification and autism detection. It uses TensorFlow Serving for model deployment, a FastAPI backend, and a React frontend.

---

## System Requirements

- Docker & Docker Compose
- Git
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)
- 8GB RAM minimum (16GB recommended)
- 20GB free disk space

---

## Project Structure

```
skin_classification_app/
├── backend/                 # FastAPI backend service
│   ├── weight/              # Model files
│   ├── predictions/         # Model prediction classes
│   └── main_serving.py      # TF Serving integration
├── frontend/                # React frontend
└── docker-compose.yml       # Docker services configuration
```

---

## Download Pretrained Models

Before running the application, download the model files and place them in `backend/weight/`.

- [Download Models (Google Drive)](https://drive.google.com/drive/folders/1s30j99z5_RCbh42tzGAe6hrItXNq32o7?usp=sharing)

**Instructions:**
1. Download and extract the archive.
2. Copy all extracted model files into `backend/weight/`.

---

## Quick Start

### Backend Setup (FastAPI)

1. Open terminal and navigate to the backend directory:
    ```sh
    cd backend
    ```

2. Create and activate a virtual environment:
    - Windows:
        ```sh
        python -m venv venv
        venv\Scripts\activate
        ```
    - macOS/Linux:
        ```sh
        python3 -m venv venv
        source venv/bin/activate
        ```

3. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```

4. Run the FastAPI server:
    ```sh
    uvicorn main:app --reload
    ```
    The backend will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

### Frontend Setup (React + Vite)

1. Navigate to the frontend directory (or create a new one):
    ```sh
    npm create vite@latest my-react-app -- --template react
    cd my-react-app
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Run the development server:
    ```sh
    npm run dev
    ```
    Access the app at the URL shown in the terminal (e.g., [http://localhost:5173](http://localhost:5173)).  
    Add `/upload` to the URL to access the upload page.

4. Build for production:
    ```sh
    npm run build
    npx serve -s dist
    ```

---

## Environment Variables

Configure these in your `.env` file or as system environment variables:

| Variable Name                | Example Value                      | Description                        |
|------------------------------|------------------------------------|------------------------------------|
| VITE_BASE_URL_BACKEND        | http://192.168.100.29:6879         | Backend API URL                    |
| VITE_BASE_URL_BACKEND_DEEPFAKE | http://192.168.100.29:6879       | Deepfake/skin classification API   |

---

## Docker Deployment

1. Build and start all services:
    ```sh
    docker-compose up -d --build
    docker run -d --name kltn2025_backend -p 6879:6879 nguyendai113/kltn2025_backend:latest
    docker run -d --name kltn2025_frontend -p 80:80 nguyendai113/kltn2025:latest
    ```

2. To stop all services:
    ```sh
    docker-compose down
    ```

---

## Troubleshooting

- **If services fail to start:**
    ```sh
    docker-compose down
    docker-compose down -v
    docker-compose up -d --build
    ```

- **If models don't load:**
    - Ensure model files exist in `backend/weight/`
    - Verify file permissions
    - Check TensorFlow Serving logs

---

## License

This project is licensed under the MIT License.
