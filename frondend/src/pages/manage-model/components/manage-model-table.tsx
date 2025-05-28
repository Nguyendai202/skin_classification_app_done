import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Col, Pagination, Row, Table } from "antd";
import { ColumnsType } from "antd/es/table";

interface ReportModelHistory {
  key: React.Key;
  model_type: string;
  model: string;
}
interface ListModelReport {
  data: ReportModelHistory[];
  setIdModel: any;
  setIsModalAlertOpen: any;
  setIsModalOpenEdit: any;
  form: any;
}

const ManageModelTable: React.FC<ListModelReport> = ({ data, setIdModel, setIsModalAlertOpen, setIsModalOpenEdit, form }) => {
  const columModel: ColumnsType<ReportModelHistory> = [
    {
      title: "STT",
      align: "center",
      render: (_value, _record, index) => {
        return index + 1;
      },
    },
    {
      title: "Model type",
      align: "center",
      dataIndex: "model_type",
    },
    {
      title: "Model",
      align: "center",
      dataIndex: "model",
    },
    {
      title: "Chức năng",
      align: "center",
      render: (_, data: any) => {
        return (
          <>
            <EditOutlined className="history-button" onClick={()=> handleEditModel(data)}/>
            <DeleteOutlined
              className="delete-button"
              onClick={() => handleDeleteSegment(data)}
            />
          </>
        );
        function handleDeleteSegment(data: any) {
          setIdModel(data.id);
          setIsModalAlertOpen(true);
        }
        function handleEditModel(data: any) {
          setIdModel(data.id);
          setIsModalOpenEdit(true);
          form.setFieldsValue({ model_type: data.model_type, model: data.model, id: data.id });
        }
      },
    },
  ];

  return (
    <>
      <Col span={24}>
        <Table columns={columModel} dataSource={data} pagination={false} />
        <Row justify={"end"} style={{ marginTop: "20px" }}>
          <Pagination
            defaultCurrent={1}
            total={50}
          />
        </Row>
      </Col>
    </>
  );
};

export default ManageModelTable;
