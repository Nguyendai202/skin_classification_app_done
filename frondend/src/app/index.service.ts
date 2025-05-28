import {
  configAxios,
  configAxios2,
  configAxios3,
} from "../config/config-https";

export const predict = async (data: FormData) => {
  const url = `/predict`;
  const result = await configAxios.post(url, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return result.data;
};

export const getHistory = async () => {
  const url = `/predictions`;
  const result = await configAxios.get(url);
  return result.data;
};

export const getModels = async (data: any) => {
  const url = `/models?model_type=${data?.model_type}`;
  const result = await configAxios.get(url);
  return result.data;
};
export const modelTypes = async () => {
  const url = `/model-types`;
  const result = await configAxios.get(url);
  return result.data;
};

export const predictImage = async (data: FormData) => {
  const url = `/predictnew`;
  const result = await configAxios2.post(url, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return result.data;
};

export const savePrediction = async (data: any) => {
  const url = `/save_prediction`;
  const result = await configAxios.post(url, data);
  return result.data;
};

export const addModel = async (data: any) => {
  const url = `/models`;
  const result = await configAxios.post(url, data);
  return result.data;
};

export const deleteModel = async (data: any) => {
  const url = `/models/${data}`;
  const result = await configAxios.delete(url);
  return result.data;
};

export const updateModel = async (data: any) => {
  const url = `/models`;
  const result = await configAxios.put(url, data);
  return result.data;
};

export const loginPage = async (data: any) => {
  const url = `/login`;
  const result = await configAxios.post(url, data);
  return result.data;
};

export const uploadImage = async (data: any) => {
  const url = `/upload-images`;
  // const url = `/detect-autism`;
  const result = await configAxios3.post(url, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return result.data;
};

export const uploadAuthism = async (data: any) => {
  const url = `/upload-autism`;
  const result = await configAxios3.post(url, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return result.data;
}
