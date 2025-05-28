import "./footer.css"

const FooterComponent = () => {
  return (
    <div className="footer">
      {" "}
      Deepfake Detection ©{new Date().getFullYear()} Created by{" "}
      <a href="https://hiepph.vercel.app">Hoanglp</a>
    </div>
  );
};

export default FooterComponent;
