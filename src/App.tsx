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
import Navigation from './components/Navigation';

/**
 * AppContent handles the global theme class and the main routing table.
 */
function AppContent() {
  const { user, loading } = useAuth();
  const { resolvedTheme } = useTheme();

  // Prevent UI flashing while checking authentication
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
        
        {/* Dashboard Hub */}
        <Route 
          path="/" 
          element={user ? <Home /> : <Navigate to="/login" />} 
        />
        
        {/* Item Catalog & Search */}
        <Route 
          path="/catalog" 
          element={user ? <CatalogPage /> : <Navigate to="/login" />} 
        />

        {/* Perfect Matches Calculation */}
        <Route 
          path="/trades" 
          element={user ? <TradesPage /> : <Navigate to="/login" />} 
        />
        
        {/* Trade Inbox (Proposals & Status) */}
        <Route 
          path="/inbox" 
          element={user ? <TradeInboxPage /> : <Navigate to="/login" />} 
        />

        {/* Active Trade Proposal Flow */}
        <Route 
          path="/propose-trade/:partnerId" 
          element={user ? <TradeProposalPage /> : <Navigate to="/login" />} 
        />
        
        {/* Personal Wishlist */}
        <Route 
          path="/wishlist" 
          element={user ? <WishlistPage /> : <Navigate to="/login" />} 
        />
        
        {/* Personal Profile & Stats */}
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/login" />} 
        />

        {/* Public Profile View for Partners */}
        <Route 
          path="/profile/:id" 
          element={user ? <PublicProfilePage /> : <Navigate to="/login" />} 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global Navigation - Only visible when logged in */}
      {user && <Navigation />}
    </div>
  );
}

/**
 * Root Application Wrapper
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
