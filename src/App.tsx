import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import CatalogPage from '@/pages/CatalogPage';
import WardrobePage from '@/pages/WardrobePage';
import CollectionPage from '@/pages/CollectionPage';
import ProfilePage from '@/pages/ProfilePage';
import OffersPage from '@/pages/OffersPage';
import NotificationsPage from '@/pages/NotificationsPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CreatorDashboard from '@/pages/CreatorDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
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
    </BrowserRouter>
  );
}

export default App;
