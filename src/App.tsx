import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import CatalogPage from '@/pages/CatalogPage';
import WardrobePage from '@/pages/WardrobePage';
import WishlistPage from '@/pages/WishlistPage';
import CollectionPage from '@/pages/CollectionPage';
import ProfilePage from '@/pages/ProfilePage';
import OffersPage from '@/pages/OffersPage';
import NotificationsPage from '@/pages/NotificationsPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CreatorDashboard from '@/pages/CreatorDashboard';
import BottomNav from '@/components/BottomNav';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDF8F7]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/:id" element={<CollectionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/trader/:id" element={<ProfilePage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/creator" element={<CreatorDashboard />} />
        </Routes>
        <BottomNav /> 
      </div>
    </Router>
  );
}

export default App;
