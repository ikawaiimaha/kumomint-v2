import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sparkles } from 'lucide-react';

// Pages
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import WardrobePage from './pages/WardrobePage';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import CreatorDashboard from './pages/CreatorDashboard';
import TradeInboxPage from './pages/TradeInboxPage';
import TradeProposalPage from './pages/TradeProposalPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Components
import BottomNav from './components/BottomNav';
import StarField from './components/StarField';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] transition-colors duration-500">
        <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
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
          {/* Main App Container with dynamic theme variables */}
          <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500 pb-24 relative">
            
            {/* High-Performance Animated Star Background */}
            <StarField />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/catalog" element={<CatalogPage />} />

              {/* Private "Orbit" Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/wardrobe" element={<WardrobePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/creator" element={<CreatorDashboard />} />
                
                {/* New Trading Routes */}
                <Route path="/inbox" element={<TradeInboxPage />} />
                <Route path="/propose" element={<TradeProposalPage />} />
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
