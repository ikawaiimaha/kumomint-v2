import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Page Imports
import CatalogPage from './pages/CatalogPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import Navigation from './components/Navigation';

/**
 * AppContent handles the theme class application and the 
 * main routing logic for the platform.
 */
function AppContent() {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();

  // Prevent flicker during initial auth check
  if (loading) return null;

  return (
    <div className={`min-h-screen ${resolvedTheme} transition-colors duration-1000`}>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/" />} 
        />

        {/* Main Orbit Routes */}
        <Route 
          path="/" 
          element={user ? <CatalogPage /> : <Navigate to="/login" />} 
        />
        
        {/* Redirecting Search and Add to Catalog to prevent blank screens */}
        <Route 
          path="/catalog" 
          element={user ? <CatalogPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/add" 
          element={user ? <CatalogPage /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/wishlist" 
          element={user ? <WishlistPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/login" />} 
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global Navigation - Only visible when logged in */}
      {user && <Navigation />}
    </div>
  );
}

/**
 * Root App component providing Context for Auth, Theme, and Routing.
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
