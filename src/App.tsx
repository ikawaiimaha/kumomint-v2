import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Page Imports
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import TradesPage from './pages/TradesPage';
import Navigation from './components/Navigation';

/**
 * AppContent handles theme application and protected routing logic.
 */
function AppContent() {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();

  // Prevent UI flicker while checking authentication status
  if (loading) return null;

  return (
    <div className={`min-h-screen ${resolvedTheme} transition-colors duration-1000`}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/" />} 
        />

        {/* Protected Orbit Routes */}
        
        {/* 🏠 Home Hub (Dashboard & Recent Arrivals) */}
        <Route 
          path="/" 
          element={user ? <Home /> : <Navigate to="/login" />} 
        />
        
        {/* 🔍 Search Catalog (Full Item Database) */}
        <Route 
          path="/catalog" 
          element={user ? <CatalogPage /> : <Navigate to="/login" />} 
        />

        {/* ⇆ Trade Matching */}
        <Route 
          path="/trades" 
          element={user ? <TradesPage /> : <Navigate to="/login" />} 
        />
        
        {/* 🛍️ Wishlist */}
        <Route 
          path="/wishlist" 
          element={user ? <WishlistPage /> : <Navigate to="/login" />} 
        />
        
        {/* 👤 Profile */}
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/login" />} 
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global Bottom Navigation - Only visible when logged in */}
      {user && <Navigation />}
    </div>
  );
}

/**
 * Root Component
 */
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
