// src/views/admin/Login.jsx
import { useNavigate } from "react-router-dom";
import { Button, message } from 'antd';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('token', '1');
    message.success('登录成功');
    navigate('/m/homepage', { replace: true });
    window.location.reload();
  };

  return (
    <div className="loginContainer">
      <Button 
        type="primary" 
        className="mainActionBtn" 
        onClick={handleLogin}
      >
        登录
      </Button>
    </div>
  );
};

export default Login;