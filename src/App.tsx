import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import CatalogPage from './pages/CatalogPage';
import WardrobePage from './pages/WardrobePage';
import ProfilePage from './pages/ProfilePage';
import CreatorDashboard from './pages/CreatorDashboard';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] transition-colors duration-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/wardrobe" element={<WardrobePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
          <BottomNav /> 
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
