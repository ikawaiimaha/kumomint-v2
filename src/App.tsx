import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import WardrobePage from './pages/WardrobePage';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import CreatorDashboard from './pages/CreatorDashboard';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Components
import BottomNav from './components/BottomNav';
import { Sparkles } from 'lucide-react';

// --- THE BOUNCER (Protected Route Alternative) ---
// This handles the "Is logged in?" check for the whole app in one place.
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <Sparkles className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 pb-24">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/catalog" element={<CatalogPage />} />

              {/* Private "Orbit" Routes (Bouncer Protected) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/wardrobe" element={<WardrobePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/creator" element={<CreatorDashboard />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Routes>

            {/* Global Navigation */}
            <BottomNav />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
