import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
} from "antd";
import { useState } from "react";
import ManageModelTable from "./components/manage-model-table";
import "./manage-model.css";
import {
  useAddModel,
  useDeleteModel,
  useGetModels,
  useGetModelType,
  useUpdateModel,
} from "../../app/loader";
const ManageModel = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState(null);
  const [isModalAlertOpen, setIsModalAlertOpen] = useState(false);
  const [idModel, setIdModel] = useState("");
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalOpenEdit(false);
  };
  const { data: dataModelModelAi } = useGetModels({ model_type: "" });

  const { data: dataModelTypes } = useGetModelType();

  const { mutate: mutateAddModel, isLoading: isLoadingAddModel } =
    useAddModel();
  const { mutate:mutateUpdateModel, isLoading: isLoadingUpdateModel } =
    useUpdateModel();
  const handleOkAddModel = async () => {
    form
      .validateFields()
      .then((values) => {
        const formData = new FormData();
        formData.append("model_type", selectedModelType || ""),
          formData.append("model", values?.model || ""),
          mutateAddModel(formData);
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  const handleModelTypeChange = (value: any) => {
    setSelectedModelType(value);
  };
  const { mutate: mutateDeleteModel, isLoading: isLoadingDeleteModel } =
    useDeleteModel();

  const handleOkDeleteModel = () => {
    mutateDeleteModel(idModel);
    setIsModalAlertOpen(false);
  };

  const handleOkEditModel = async () => {
    form
      .validateFields()
      .then((values) => {
        const formData = new FormData();
          formData.append("model_type", selectedModelType || ""),
          formData.append("model", values?.model || ""),
          formData.append("model_id ", idModel);
        mutateUpdateModel(formData);
        setIsModalOpenEdit(false);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <>
      <Row style={{ padding: "20px" }}>
        <Col span={24} xxl={24} xl={24}>
          <Row justify={"space-between"}>
            <Col>
              <span className="titleCamera">LIST MODEL DEEPFAKE DETECTION</span>{" "}
            </Col>
            <Col>
              <Row gutter={[10, 0]}>
                {/* <Col>
                  <DatePicker
                    onChange={onChangeDate}
                    needConfirm
                    defaultValue={currentTime}
                  />
                </Col> */}
                <Col>
                  <Button type="primary" onClick={showModal}>
                    Add model
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            justify={"space-between"}
            style={{
              marginTop: "30px",
            }}
            gutter={[0, 30]}
          >
            <Col xl={24} xs={24} style={{ backgroundColor: "#fff" }}>
              <Row
                justify={"space-between"}
                gutter={[0, 40]}
                style={{ padding: "20px" }}
              >
                <ManageModelTable
                  data={dataModelModelAi}
                  setIdModel={setIdModel}
                  setIsModalAlertOpen={setIsModalAlertOpen}
                  setIsModalOpenEdit={setIsModalOpenEdit}
                  form={form}
                />
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
      <Modal
        title="Add model"
        open={isModalOpen}
        onOk={handleOkAddModel}
        onCancel={handleCancel}
        okText="Thêm"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="model_type"
            label="Model type"
            rules={[{ required: true, message: "Vui lòng chọn loại model" }]}
          >
            <Select
              placeholder="Chọn loại model"
              onChange={handleModelTypeChange}
            >
              {dataModelTypes?.map((model: any) => (
                <Select.Option key={model.id} value={model.name}>
                  {model.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="model"
            label="Model name"
            rules={[{ required: true, message: "Vui lòng nhập tên model" }]}
          >
            <Input placeholder="Nhập tên model" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Sửa model"
        open={isModalOpenEdit}
        onOk={handleOkEditModel}
        onCancel={handleCancel}
        okText="Sửa"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="model_type"
            label="Model type"
            rules={[{ required: true, message: "Vui lòng chọn loại model" }]}
          >
            <Select
              placeholder="Chọn loại model"
              onChange={handleModelTypeChange}
            >
              {dataModelTypes?.map((model: any) => (
                <Select.Option key={model.id} value={model.name}>
                  {model.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="model"
            label="Model name"
            rules={[{ required: true, message: "Vui lòng nhập tên model" }]}
          >
            <Input placeholder="Nhập tên model" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isLoadingAddModel || isLoadingDeleteModel || isLoadingUpdateModel}
        footer={false}
        closable={false}
        centered={true}
      >
        <Col span={24}>
          <Row justify={"center"}>
            <h1>Vui lòng chờ...</h1>
          </Row>
          <Row justify={"center"}>
            <Spin />
          </Row>
        </Col>
      </Modal>

      <Modal
        title="Thay đổi trạng thái camera"
        open={isModalAlertOpen}
        onOk={handleOkDeleteModel}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Huỷ"
      >
        <Alert
          message={<p>Bạn có chắc chắn muốn xoá model?</p>}
          type="error"
          showIcon
        />
      </Modal>
    </>
  );
};

export default ManageModel;
