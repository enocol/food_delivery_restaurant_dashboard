import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import OrdersPage from "./pages/OrdersPage";

function AppRoutes() {
  const { token } = useAuth();
  if (!token) return <LoginPage />;
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
