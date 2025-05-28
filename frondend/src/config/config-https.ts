import axios from "axios";
import { BASE_URL_API_BACKEND, BASE_URL_BACKEND, BASE_URL_BACKEND_DEEPFAKE } from "../utils/api";

export const configAxios = axios.create({
  baseURL: BASE_URL_BACKEND,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "ngrok-skip-browser-warning": "true",
  },
});

export const configAxios2 = axios.create({
  baseURL: BASE_URL_BACKEND_DEEPFAKE,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "ngrok-skip-browser-warning": "true",
  },
});


export const configAxios3 = axios.create({
  baseURL: BASE_URL_API_BACKEND,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "ngrok-skip-browser-warning": "true",
  },
});

configAxios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("jwtToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

configAxios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("jwtToken");
        setTimeout(() => {
          window.location.href = "/login";
        }, 300);
      }
    }
    return Promise.reject(error);
  }
);