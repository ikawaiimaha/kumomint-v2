import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Page Imports
import CatalogPage from './pages/CatalogPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import Navigation from './components/Navigation';

function AppContent() {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();

  // If the app is still checking who you are, show nothing for a second
  if (loading) return null;

  return (
    <div className={`min-h-screen ${resolvedTheme} transition-colors duration-1000`}>
      <Routes>
        {/* If you aren't logged in, go to the login page */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/" />} 
        />

        {/* If you ARE logged in, you can see these pages */}
        <Route 
          path="/" 
          element={user ? <CatalogPage /> : <Navigate to="/login" />} 
        />
        
        {/* We point Search and Add back to the Catalog so they aren't empty */}
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

        {/* If you get lost, go back to the home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Show the bottom buttons if you are logged in */}
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
