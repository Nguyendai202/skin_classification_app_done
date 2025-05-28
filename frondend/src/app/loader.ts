import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  addModel,
  deleteModel,
  getHistory,
  getModels,
  loginPage,
  modelTypes,
  predict,
  predictImage,
  savePrediction,
  updateModel,
  uploadAuthism,
  uploadImage,
} from "./index.service";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const CACHE_KEYS = {
  detection: "INFOR_DATA_DETECTION",
  predictions: "INFOR_DATA_PREDICTIONS",
  model: "INFOR_DATA_MODEL",
  modelType: "INFOR_DATA_MODEL_TYPE",
  upload: "INFOR_DATA_UPLOAD",
  login: "INFOR_DATA_LOGIN",
};

export const usePredict = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: FormData) => {
      return predict(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.detection);
      },
    }
  );
};

export const usePredictImage = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: FormData) => {
      return predictImage(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.detection);
      },
    }
  );
};

export const useGetHistory = () => {
  return useQuery(CACHE_KEYS.predictions, getHistory);
};

export const useGetModels = (data: any) => {
  return useQuery([CACHE_KEYS.model, data], () => getModels(data));
};

export const useGetModelType = () => {
  return useQuery(CACHE_KEYS.modelType, modelTypes);
};

export const useSavePrediction = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: any) => {
      return savePrediction(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.predictions);
      },
    }
  );
};

export const useAddModel = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: any) => {
      return addModel(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.model);
        message.success("Thêm model thành công!");
      },
      onError: () => {
        message.error("Thêm model thất bại!");
      },
    }
  );
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: any) => {
      return deleteModel(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.model);
        message.success("Xoá model thành công!");
      },
      onError: () => {
        message.error("Xoá model thất bại!");
      }
    }
  );
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: any) => {
      return updateModel(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.model);
        message.success("Cập nhật model thành công!");
      },
      onError: () => {
        message.error("Cập nhật model thất bại!");
      },
    }
  );
};

export const useUploadImages = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: any) => {
      return uploadImage(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.upload);
        message.success("tải hình ảnh thành công!");
      },
      onError: () => {
        message.error("tải hình ảnh chưa đc cậu ơi!!!");
      },
    }
  );
}

export const useUploadAutism = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: any) => {
      return uploadAuthism(data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.upload);
        message.success("Upload hình anh thành cong!");
      },
      onError: () => {
        message.error("Upload hình anh thất bại!");
      },
    }
  );
}

export const useLoginPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation(
    (data: any) => {
      return loginPage(data);
    },
    {
      onSuccess: (data) => {
        if (data.access_token) {
          localStorage.setItem("jwtToken", data.access_token);
          localStorage.setItem("isLoginToken", "true");
          localStorage.setItem("username", data.username);
          localStorage.setItem("email", data.email);
          localStorage.setItem("token_type", data.token_type);
        }
        queryClient.invalidateQueries(CACHE_KEYS.login);
        message.success("Đăng nhập thành công!");
        navigate("/");
      },
      onError: () => {
        message.error("Đăng nhập thất bại!");
      },
    }
  );
};


