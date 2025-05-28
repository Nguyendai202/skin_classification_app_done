import { Outlet } from "react-router-dom";
import FooterComponent from "../footer/footer";
import HeaderComponent from "../header/header";
const DefaultLayout = () => {
  return (
    <>
      <div>
        <HeaderComponent />
      </div>
      <div>
        <Outlet />
      </div>
      <div>
        <FooterComponent />
      </div>
    </>
  );
};

export default DefaultLayout;
