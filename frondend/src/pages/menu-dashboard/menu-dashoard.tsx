import { CameraOutlined, ProfileOutlined } from "@ant-design/icons";
export const MenuDashboard = () => {
  return [
    {
      key: "/",
      icon: <CameraOutlined />,
      label: "Deepfake Detection",
    },
    {
      key: "/manage-model",
      icon: <ProfileOutlined />,
      label: "Quản lí model",
    },
  ];
};
