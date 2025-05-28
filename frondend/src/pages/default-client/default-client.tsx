import { Layout, Menu, Avatar, theme, Button, Row, Col, Popover } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { MenuDashboard } from "../menu-dashboard/menu-dashoard";
import "./default-client.css";
const { Header, Sider, Content, Footer } = Layout;
const DefaultClient = () => {
  const [collapsed, setCollapsed] = useState(false);
  // const tokenLocal = localStorage.getItem("isLoginToken");

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handClickMenuDashboard = (data: any) => {
    navigate(data.key);
  };
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.setItem("isLoginToken", "false");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("token_type");
    window.location.href = "/login";
  };

  return (
    <>
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            position: "fixed", // Cố định vị trí của Sider
            top: 0,            // Đặt Sider ở vị trí trên cùng
            left: 0,           // Đặt Sider ở cạnh trái
            width: 250,        // Đặt chiều rộng của Sider (có thể tùy chỉnh)
            height: "100vh",    // Chiều cao bằng chiều cao của màn hình
            overflow: "hidden", // Không hiển thị thanh cuộn trong Sider
            zIndex: 100,       // Đảm bảo Sider ở trên các phần tử khác
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <img
              src="https://imgs.search.brave.com/adjv_uuXaNcZO5Nx4CcBntXekQZ08nhG6ny1oxiSNQc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cGluZHJvcC5jb20v/d3AtY29udGVudC91/cGxvYWRzL2hvdy1k/b2VzLWRlZXBmYWtl/LWRldGVjdGlvbi13/b3JrLWJsb2cuanBn"
              alt="Logo"
              style={{ maxWidth: "80%", height: "auto" }}
            />
          </div>
          <hr
            style={{
              border: "1px solid #fff",
              width: "80%",
              margin: "0 auto",
            }}
          />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[currentPath]}
            items={MenuDashboard()}
            onSelect={handClickMenuDashboard}
            style={{ marginTop: "20px" }}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <Row
              align="middle"
              style={{
                flex: 1,
                justifyContent: "flex-end",
                marginRight: "25px",
              }}
            >
              <Col>
                <Popover
                  content={
                    <div>
                      <Button
                        className="pointer"
                        style={{ marginTop: "10px" }}
                        onClick={() => handleLogout()}
                      >
                        Đăng xuất
                      </Button>
                    </div>
                  }
                  title={
                    <div>
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        style={{ marginRight: 10 }}
                      />
                      {localStorage.getItem("email")}
                    </div>
                  }
                >
                  <Avatar
                    size={35}
                    icon={<UserOutlined />}
                    className="pointer"
                  />
                </Popover>
              </Col>
              <Col style={{ marginLeft: "10px" }}>
                {" "}
                <h3>{localStorage.getItem("username")}</h3>
              </Col>
            </Row>
          </Header>

          <Content style={{ marginLeft: "220px", marginTop: "20px", marginRight: "20px", overflow: "initial" }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Deepfake Detection ©{new Date().getFullYear()} Created by{" "}
            <a href="https://hiepph.vercel.app">Hoanglp</a>
          </Footer>
        </Layout>
      </Layout>
    </>
  );
};

export default DefaultClient;
