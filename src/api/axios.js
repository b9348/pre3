// axios.js
import Axios from "axios";
import { message } from 'antd';

const axios = Axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json'
  }
});

axios.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    message.error('请求错误');
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    switch (error.response.status) {
      case 401:
        message.error('用户名或密码错误');
        break;
      default:
        message.error('响应错误');
        break;
    }
    return Promise.reject(error);
  }
);

export default axios;