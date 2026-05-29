import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";

function AppRoutes() {
  const { token } = useAuth();
  return token ? <LandingPage /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  );
}
