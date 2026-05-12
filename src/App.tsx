import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import TradesPage from './pages/TradesPage';
import TradeInboxPage from './pages/TradeInboxPage';
import NotificationsPage from './pages/NotificationsPage';
import Navigation from './components/Navigation';

function AppContent() {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();

  if (loading) return null;

  // IMPORTANT: The className below applies the 'dark' or 'light' class
  return (
    <div className={`${resolvedTheme} min-h-screen transition-colors duration-700`}>
      <div className="bg-[var(--bg-app)] min-h-screen text-[var(--text-main)]">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/catalog" element={user ? <CatalogPage /> : <Navigate to="/login" />} />
          <Route path="/trades" element={user ? <TradesPage /> : <Navigate to="/login" />} />
          <Route path="/inbox" element={user ? <TradeInboxPage /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <NotificationsPage /> : <Navigate to="/login" />} />
          <Route path="/wishlist" element={user ? <WishlistPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
        {user && <Navigation />}
      </div>
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
