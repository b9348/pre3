// src/services/authService.js
const AUTH_KEY = 'token';

export const isAuthenticated = () => {
  return !!localStorage.getItem(AUTH_KEY);
};

export const login = (token) => {
  localStorage.setItem(AUTH_KEY, token);
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};