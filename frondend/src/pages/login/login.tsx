import { useState } from "react";
import "./login.css";
import { useLoginPage } from "../../app/loader";
// import loginBg from "./img/bgrDeepfake.jpg";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: mutateLogin } = useLoginPage();
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    mutateLogin({
      username: user,
      password: password,
    });
  };

  return (
    <div className="login">
      {/* <img src={loginBg} alt="login" className="login__img" /> */}
      <form onSubmit={handleSubmit} className="login__form">
        <h1 className="login__title">Login</h1>
        <div className="login__content">
          <div className="login__box">
            <i className="ri-user-3-line login__icon"></i>
            <div className="login__box-input">
              <input
                type="userName"
                required
                className="login__input"
                id="login-user"
                placeholder=" "
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
              <label htmlFor="login-email" className="login__label">
                User name
              </label>
            </div>
          </div>

          <div className="login__box">
            <i className="ri-lock-2-line login__icon"></i>
            <div className="login__box-input">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="login__input"
                id="login-pass"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="login-pass" className="login__label">
                Password
              </label>
              <i
                className={`ri-eye${
                  showPassword ? "-line" : "-off-line"
                } login__eye`}
                id="login-eye"
                onClick={handlePasswordToggle}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
          </div>
        </div>

        <div className="login__check">
          <div className="login__check-group">
            <input
              type="checkbox"
              className="login__check-input"
              id="login-check"
            />
            <label htmlFor="login-check" className="login__check-label">
              Remember me
            </label>
          </div>

          <a href="#" className="login__forgot">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="login__button">
          Login
        </button>

        <p className="login__register">
          Don't have an account? <a href="#">Register</a>
        </p>
      </form>
    </div>
  );
};
