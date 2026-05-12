import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Page Imports
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import LoginPage from './pages/LoginPage';
import TradesPage from './pages/TradesPage';
import TradeInboxPage from './pages/TradeInboxPage';
import TradeProposalPage from './pages/TradeProposalPage';
import NotificationsPage from './pages/NotificationsPage'; // New Import
import Navigation from './components/Navigation';

function AppContent() {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();

  if (loading) return null;

  return (
    <div className={`min-h-screen ${resolvedTheme} transition-colors duration-1000`}>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/catalog" element={user ? <CatalogPage /> : <Navigate to="/login" />} />
        <Route path="/trades" element={user ? <TradesPage /> : <Navigate to="/login" />} />
        <Route path="/inbox" element={user ? <TradeInboxPage /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={user ? <NotificationsPage /> : <Navigate to="/login" />} />
        <Route path="/wishlist" element={user ? <WishlistPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/propose-trade/:partnerId" element={user ? <TradeProposalPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={user ? <PublicProfilePage /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {user && <Navigation />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
