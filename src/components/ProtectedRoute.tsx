import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // No unused icons or complex loaders here to keep it safe
  if (loading) return null; 

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
