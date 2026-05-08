import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // Import the new hook
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Bell, Moon, Sun, Edit3, Sparkles, 
  Check, X, Camera, Info, Clock, Package 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Use the global theme
  const navigate = useNavigate();
  // ... (keep your existing state and functions like uploadAvatar/handleSave) ...

  return (
    <div className="min-h-screen pb-32 transition-colors bg-[#FDF8F7] dark:bg-[#1A0B2E]">
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-black text-[#2E2A28] dark:text-[#FFF9E3]">My Profile</h1>
        <div className="flex gap-4">
          <button onClick={toggleTheme} className="text-gray-400 active:scale-90 transition-transform">
            {theme === 'dark' ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} />}
          </button>
          <button onClick={() => navigate('/notifications')} className="text-gray-400 relative">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FFB5C5] rounded-full border-2 border-white dark:border-[#1A0B2E]"></span>
          </button>
        </div>
      </div>

      <main className="px-5 space-y-6">
        <div className="bg-white dark:bg-[#2D1B4E] rounded-[40px] p-6 shadow-sm border border-[#F0E6E4] dark:border-[#483475] relative">
          {/* Apply dark:text-[#E0D7FF] etc. to your text and inputs here */}
          {/* ... existing profile card content ... */}
        </div>
        
        {/* Update your stats cards and inventory sections with dark:bg-[#2D1B4E] and dark:border-[#483475] */}
      </main>
    </div>
  );
}
