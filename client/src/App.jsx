import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import NotesPage from './pages/NotesPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
      <Route path="/clients" element={<PrivateRoute><AppLayout><ClientsPage /></AppLayout></PrivateRoute>} />
      <Route path="/clients/:id" element={<PrivateRoute><AppLayout><ClientDetailPage /></AppLayout></PrivateRoute>} />
      <Route path="/appointments" element={<PrivateRoute><AppLayout><AppointmentsPage /></AppLayout></PrivateRoute>} />
      <Route path="/notes" element={<PrivateRoute><AppLayout><NotesPage /></AppLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
