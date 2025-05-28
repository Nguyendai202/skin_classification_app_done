import {
  Button,
  Col,
  Flex,
  Image,
  Modal,
  Progress,
  Row,
  Select,
  Spin,
} from "antd";
import { useState } from "react";
import { useUploadAutism, useUploadImages } from "../../app/loader";
import "./upload.css";
const UploadPage = () => {
  const defaultImage =
    "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg";
  const [fileImage, setFileImage] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string>(defaultImage);
  const [taskType, setTaskType] = useState("skin");
  const {
    mutate: mutateUploadImages,
    data: data,
    isLoading,
  } = useUploadImages();

  const {
    mutate: mutateUploadAuthism,
    data: dataAuthism,
    isLoading: isLoadingAuthism,
  } = useUploadAutism();
  const handleUploadImage = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new (window.Image as { new (): HTMLImageElement })();
        img.src = e.target?.result as string;
        img.onload = () => {
          // Tạo canvas để resize ảnh
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          // Đặt kích thước cho canvas
          canvas.width = 400;
          canvas.height = 400;
          // Vẽ lại ảnh trên canvas với kích thước mới
          ctx?.drawImage(img, 0, 0, 400, 400);
          // Lấy blob từ canvas và set lại file đã resize
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
              });
              setFileImage(resizedFile); // Set lại file image sau khi đã resize
              setImagePath(URL.createObjectURL(resizedFile)); // Hiển thị preview của ảnh đã resize
            }
          }, file.type);
        };
      };
      // Đọc file để bắt đầu quá trình resize
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (fileImage) {
      const formData = new FormData();
      formData.append("files", fileImage);
      if (taskType === "skin") {
        mutateUploadImages(formData);
      } else {
        mutateUploadAuthism(formData);
      }
    }
  };
  const handleClickClear = () => {
    setImagePath(defaultImage);
    setFileImage(null);
  };
  const getLabelText = (label: string | undefined) => {
    switch (label) {
      case "akiec":
        return "Actinic keratoses";
      case "bcc":
        return "Basal cell carcinoma";
      case "bkl":
        return "Benign keratosis-like lesions";
      case "df":
        return "Dermatofibroma";
      case "mel":
        return "Melanoma";
      case "nv":
        return "Melanocytic nevi";
      case "vasc":
        return "Vascular lesions";
      case "Autistic":
        return "Autistic";
      default:
        return "Unknown label";
    }
  };
  const skinLabels = [
    { key: "akiec", name: "AKIEC" },
    { key: "bcc", name: "BCC" },
    { key: "bkl", name: "BKL" },
    { key: "df", name: "DF" },
    { key: "mel", name: "MEL" },
    { key: "nv", name: "NV" },
    { key: "vasc", name: "VASC" },
  ];
  const autismLabels = [
    { key: "Non-Autistic", name: "Non-Autistic" },
    { key: "Autistic", name: "Autistic" },
  ];
  const currentLabels = taskType === "skin" ? skinLabels : autismLabels;
  const currentData = taskType === "skin" ? data : dataAuthism;
  return (
    <div className="container mx-auto p-4">
      <h3
        style={{
          color: "white",
          fontFamily: "monospace",
          margin: "10px",
          textAlign: "center",
        }}
      >
        ỨNG DỤNG PHÂN LOẠI TỔN THƯƠNG DA & TỰ KỈ
      </h3>
      <Row
        justify="center"
        gutter={[16, 16]}
        align={"middle"}
        style={{ marginTop: "20px" }}
        className="flex flex-col md:flex-row"
      >
        {/* Cột ảnh và nút điều khiển - Responsive */}
        <Col
          xs={24}
          md={10}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {/* Ảnh chính */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginBottom: "16px",
            }}
          >
            <Image
              width="70%"
              alt="Uploaded image preview"
              style={{
                maxWidth: "200px",
                height: "auto",
                borderRadius: "8px",
                margin: "0 auto",
              }}
              src={imagePath}
            />
          </div>

          {/* Upload và nút điều khiển */}
          <div
            style={{
              width: "100%",
              maxWidth: "300px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              style={{
                width: "100%",
                marginBottom: "16px",
                marginTop: "16px",
                textAlign: "center",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <Select
                value={taskType}
                onChange={(value) => setTaskType(value)}
                style={{ width: "100%", marginBottom: "16px" }}
                options={[
                  { label: "Tổn thương da", value: "skin" },
                  { label: "Tự kỉ", value: "autism" },
                ]}
              />
              <Button
                type="dashed"
                onClick={handleClickClear}
                style={{ marginRight: "0px" }}
              >
                Xóa
              </Button>
              <Button type="primary" onClick={handleClick}>
                Phát Hiện
              </Button>
            </div>
          </div>

          {/* Ảnh gradcam nhỏ */}
          {currentData?.results?.image?.gradcam_image && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "16px",
              }}
            >
              <Image
                width="150px"
                height="150px"
                alt="Uploaded image preview"
                style={{ margin: "0 auto" }}
                src={`data:image/jpeg;base64,${currentData?.results?.image?.gradcam_image}`}
              />
            </div>
          )}
        </Col>

        {/* Cột kết quả - Responsive */}
        <Col xs={24} md={10} className="w-full" style={{ marginTop: "20px" }}>
          <h2 className="text-center text-xl font-bold mb-4">
            Kết quả dự đoán: {getLabelText(currentData?.results?.image?.label)}
          </h2>

          <Flex vertical gap="small" className="w-full">
            {currentLabels.map((label) => (
              <Flex key={label.key} align="center" className="w-full">
                <div className="w-16 mr-2" style={{ width: "110px" }}>
                  {label.name}:
                </div>
                <Progress
                  percent={currentData?.results.image?.probabilities[label.key]}
                  className="flex-1"
                />
              </Flex>
            ))}
          </Flex>
        </Col>
      </Row>

      {/* Modal loading */}
      <Modal
        open={isLoading || isLoadingAuthism}
        footer={null}
        width={200}
        closable={false}
        centered
        bodyStyle={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 100,
        }}
      >
        <Spin />
      </Modal>
    </div>
  );
};
export default UploadPage;
