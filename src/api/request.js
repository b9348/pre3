// src/api/request.js
import axios from './axios';

export const registerUser = (username, password) => {
  return axios.post('/register', { username, password });
};

export const loginUser = (username, password) => {
  return axios.post('/login', { username, password });
};

export const uploadCsv = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/uploadCsv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};