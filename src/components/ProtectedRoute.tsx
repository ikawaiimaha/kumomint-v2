import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a simple <div>Loading...</div>

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
