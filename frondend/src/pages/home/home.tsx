import { Button, Image, Modal, Row, Select } from "antd";
import "./home.css";
import {
  useGetHistory,
  useGetModels,
  useGetModelType,
  usePredict,
  usePredictImage,
  useSavePrediction,
} from "../../app/loader";
import { useEffect, useState } from "react";
import HomeTable from "./components/home-table";

const HomePage = () => {
  const { Option } = Select;
  const [fileImage, setFileImage] = useState<File | null>(null);
  const [typeModel, setTypeModel] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const {
    mutate: mutatePredict,
    data: dataPredict,
    isLoading: isLoadingPredict,
  } = usePredictImage();
  const {
    mutate: mutatePredictold,
    data: dataPredictold,
    isLoading: isLoadingPredictold,
  } = usePredict();
  const { mutate: mutateSavePrediction } = useSavePrediction();
  useEffect(() => {
    if (dataPredict || dataPredictold) {
      let predictionData = null;
      if (selectedModel === "Autoencoder" && dataPredictold) {
        predictionData = {
          image_url: dataPredictold.image_url,
          prediction: dataPredictold.prediction,
          model_name: dataPredictold.model_name,
          timestamp: new Date().toISOString(),
        };
      }
      else if (dataPredict) {
        predictionData = {
          image_url: dataPredict.image_url,
          prediction: dataPredict.prediction,
          model_name: dataPredict.model_name,
          timestamp: new Date().toISOString(),
        };
      }
      if (predictionData) {
        mutateSavePrediction([predictionData]);
      }
    }
  }, [dataPredict, dataPredictold, mutateSavePrediction, selectedModel]);
  const { data: dataModelTypes } = useGetModelType();
  const { data: dataModelModelAi } = useGetModels({ model_type: typeModel });
  const [openModal, setOpenModal] = useState(false);
  const defaultImage =
    "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg";
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setFileImage(file);
      setImagePath(URL.createObjectURL(file));
    }
  };

  const { data: dataHistory } = useGetHistory();
  const handlePrediction = () => {
    if (fileImage) {
      const formData = new FormData();
      formData.append("file", fileImage);
      if (selectedModel !== "Autoencoder") {
        formData.append("model_name", selectedModel as string);
        mutatePredict(formData);
      } else {
        mutatePredictold(formData);
      }
      setOpenModal(true);
    } else {
      console.error("No file uploaded");
    }
  };
  
  const handleChangeTypeModel = (value: string) => {
    setTypeModel(value);
  };
  const handleChangeModel = (value: string) => {
    setSelectedModel(value);
  };

  const imagePathResponse = dataPredict?.image_url || dataPredictold?.image_url;

  const title = (() => {
    if (dataPredict) {
      return dataPredict?.prediction === 0
        ? "Ảnh đã qua chỉnh sửa"
        : "Ảnh thật chưa qua chỉnh sửa";
    }

    if (dataPredictold) {
      return dataPredictold?.prediction === 0
        ? "Ảnh đã qua chỉnh sửa"
        : "Ảnh thật chưa qua chỉnh sửa";
    }
    return "Lỗi model";
  })();
  
  const modalContent = title;
  return (
    <div className="container">
      <div style={{ marginTop: "30px", display: "flex" }}>
        <div>
          <Image
            width="400px"
            height={"400px"}
            src={imagePath ? imagePath : defaultImage}
          />
          <div className="upload">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>
        <div className="action">
          <div className="select">
            <Select
              placeholder="Select model type"
              style={{ width: 200 }}
              onChange={handleChangeTypeModel}
              value={typeModel}
            >
              {dataModelTypes?.map((option: any) => (
                <Option key={option.id} value={option.name}>
                  {option.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Select model"
              style={{ width: 200 }}
              onChange={handleChangeModel}
              value={selectedModel}
            >
              {dataModelModelAi?.map((option: any) => (
                <Option key={option.id} value={option.model}>
                  {option.model}
                </Option>
              ))}
            </Select>
          </div>
          <div className="button">
            <Button type="primary" onClick={handlePrediction}>
              Detection
            </Button>
          </div>
        </div>
        <div>
          <Image
            width="400px"
            height={"400px"}
            src={imagePathResponse ? imagePathResponse : defaultImage}
          />
        </div>
      </div>

      <Row style={{ marginTop: "30px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          History Detection
        </h2>
        <HomeTable data={dataHistory} />
      </Row>
      <Modal
        title="Deepfake Detection Result"
        open={openModal}
        onOk={() => setOpenModal(false)}
        loading={isLoadingPredict || isLoadingPredictold}
        cancelButtonProps={{ style: { display: "none" } }}
        onCancel={() => setOpenModal(false)}
      >
        <p>{modalContent}</p>
      </Modal>
    </div>
  );
};
export default HomePage;
