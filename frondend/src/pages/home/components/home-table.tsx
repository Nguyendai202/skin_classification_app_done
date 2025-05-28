// import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Col, Image, Pagination, Row, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";

interface ReporthomeHistory {
  image_url: string;
  model_name: string;
  timestamp: string;
  prediction: number;
}
interface ListModelReport {
  data: ReporthomeHistory[];
}

const HomeTable: React.FC<ListModelReport> = ({ data }) => {
  const columModel: ColumnsType<ReporthomeHistory> = [
    {
      title: "STT",
      align: "center",
      render: (_value, _record, index) => {
        return index + 1;
      },
    },
    {
      title: "model_name",
      align: "center",
      dataIndex: "model_name",
    },
    {
      title: "Prediction",
      align: "center",
      dataIndex: "prediction",
      render: (prediction: number) => {
        if (prediction === 0) {
          return <Tag color="red">Ảnh đã qua chỉnh sửa</Tag>;
        } else if (prediction === 1) {
          return <Tag color="green">Ảnh thật chưa qua chỉnh sửa</Tag>;
        } else {
          return <Tag color="gray">Unknown prediction</Tag>;
        }
      },
    },
    {
      title: "timestamp",
      align: "center",
      dataIndex: "timestamp",
      render: (text) => {
        const timestamp = new Date(text);
        return timestamp.toLocaleString("en-GB", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      title: "Image",
      align: "center",
      dataIndex: "image_url",
      render: (text: string) => (
        <Image
          src={text}
          alt="Image"
          style={{ width: "100px", height: "100px" }} // Adjust the width and height as needed
        />
      ),
    },
    // {
    //   title: "Chức năng",
    //   align: "center",
    //   render: (_, data: any) => {
    //     return (
    //       <>
    //         <EditOutlined className="history-button" />
    //         <DeleteOutlined
    //           className="delete-button"
    //           onClick={() => handleDeleteSegment(data)}
    //         />
    //       </>
    //     );
    //     function handleDeleteSegment(data: any) {
    //       console.log("Delete", data);
    //     }
    //   },
    // },
  ];

  return (
    <>
      <Col span={24}>
        <Table columns={columModel} dataSource={data} pagination={false} />
        <Row justify={"end"} style={{ marginTop: "20px" }}>
          <Pagination defaultCurrent={1} total={50} />
        </Row>
      </Col>
    </>
  );
};

export default HomeTable;
