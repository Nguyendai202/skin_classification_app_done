# Skin Classification and Autism Detection Application

This project combines multiple deep learning models for skin cancer classification and autism detection, using TensorFlow Serving for model deployment and a React frontend.

## System Requirements

- Docker and Docker Compose
- Git
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- 8GB RAM minimum, 16GB recommended
- 20GB free disk space

## Project Structure

```
skin_classification_app/
├── backend/                 # FastAPI backend service
│   ├── weight/             # Model files
│   ├── predictions/        # Model prediction classes
│   └── main_serving.py     # TF Serving integration
├── frontend/               # React frontend
└── docker-compose.yml      # Docker services configuration
```

## Download Models

Before running the application, you need to download the model files and place them in the `backend/weight/` directory.

Download models from:
[Download Models (Google Drive)](https://drive.google.com/file/d/1C1LGArkXkxAk3yoHawaJPSKvB8uRlQiN/view?usp=sharing)

After downloading:
1. Extract the contents of the downloaded file
2. Place all model files in the `backend/weight/` directory

## Quick Start

- Python 3.8+
- Node.js 14+
- npm 6+

## Backend Setup (FastAPI)

1. Navigate to the backend directory:
    ```sh
    cd backend
    ```

2. Create a virtual environment:
    ```sh
    python -m venv venv
    ```

3. Activate the virtual environment:
    - On Windows:
        ```sh
        venv\Scripts\activate
        ```
    - On macOS/Linux:
        ```sh
        source venv/bin/activate
        ```

4. Install the required dependencies:
    ```sh
    pip install -r requirements.txt
    ```

5. Run the FastAPI server:
    ```sh
    uvicorn main:app --reload
    ```

    The backend server will start at `http://127.0.0.1:8000`.

## Frontend Setup (ReactJS)

1. **Create base project by react + vite**

```bash
npm create vite@latest my-react-app -- --template react
```

2. **Install dependencies**

```bash
npm install
```

3. **Run project**

```bash
npm run dev
```
```bash
Chạy xong thêm /upload vào url. Ví dụ: http://localhost:3039/upload
```

4. **Build project**

```bash
npm run build
```
```bash
npx serve -s dist
```

5. **Environment variables to configure the app at runtime**

| Tên biến môi trường      | Giá trị               | Mô tả                               |
| ------------------------ | --------------------- | ----------------------------------- |
| VITE_BASE_URL_BACKEND    | http://192.168.100.29:6879 | Url API backend                     |
| VITE_BASE_URL_BACKEND_DEEPFAKE    | http://192.168.100.29:6879 | Url API backend 
Skin Lesions Classification                    |


This project is licensed under the MIT License."# skin_classification_app_done"
