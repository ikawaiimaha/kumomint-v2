import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import WardrobePage from './pages/WardrobePage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import CreatorDashboard from './pages/CreatorDashboard';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDF8F7]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/creator" element={<CreatorDashboard />} />
        </Routes>
        <BottomNav /> 
      </div>
    </Router>
  );
}

export default App;
