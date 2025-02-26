// src/components/RouteGuard.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

const RouteGuard = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RouteGuard;