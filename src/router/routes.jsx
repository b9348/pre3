// src/router/routes.jsx
import Login from "../views/admin/Login";
import Layout from "../components/Layout";
import { lazy, Suspense } from "react";
import { Spin } from "antd";
import { Navigate } from "react-router-dom"; // 从 react-router-dom 导入 Navigate
import RouteGuard from "../components/RouteGuard";
import { isAuthenticated } from '../services/authService';

const Homepage = lazy(() => import('../views/admin/Homepage'));
const GaseousPhase = lazy(() => import('../views/admin/GaseousPhase'));
const LiquidPhase = lazy(() => import('../views/admin/LiquidPhase'))
const ComboPhase = lazy(() => import('../views/admin/ComboPhase'));

const routes = [
  {
    path: '/',
    index: true,
    element: isAuthenticated() ? <Navigate to="/m/homepage" replace /> : <Login />
  },
  {
    path: '/m',
    element: isAuthenticated() ? <Layout /> : <Navigate to="/" replace />,
    children: [
      {
        index: true,
        path: 'homepage',
        element: (
          <RouteGuard>
            <Suspense fallback={<Spin size="large" />}>
              <Homepage />
            </Suspense>
          </RouteGuard>
        )
      },
      {
        path: 'gaseousPhase',
        element: (
          <RouteGuard>
            <Suspense fallback={<Spin size="large" />}>
              <GaseousPhase />
            </Suspense>
          </RouteGuard>
        )
      },
      {
        path: 'liquidPhase',
        element: (
          <RouteGuard>
            <Suspense fallback={<Spin size="large" />}>
              <LiquidPhase />
            </Suspense>
          </RouteGuard>
        )
      },
      {
        path: 'comboPhase',
        element: (
          <RouteGuard>
            <Suspense fallback={<Spin size="large" />}>
              <ComboPhase />
            </Suspense>
          </RouteGuard>
        )
      }
    ]
  }
];

export default routes;