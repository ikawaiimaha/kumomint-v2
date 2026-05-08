import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();

  const alerts = [
    { id: 1, title: 'Welcome to Kumomint!', body: 'Start your collection by visiting the catalog.', time: 'Just now' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F7] dark:bg-[#1A0B2E] pb-32 transition-colors">
      <header className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-[#2D1B4E] rounded-full shadow-sm text-gray-400">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-[#2E2A28] dark:text-[#FFF9E3]">Notifications</h1>
      </header>

      <main className="px-6 space-y-4">
        {alerts.map(a => (
          <div key={a.id} className="bg-white dark:bg-[#2D1B4E] p-5 rounded-[32px] border border-[#F0E6E4] dark:border-[#483475] flex gap-4 transition-colors">
            <div className="w-10 h-10 bg-[#F0F7F6] dark:bg-[#1A0B2E] rounded-2xl flex items-center justify-center text-[#7ED7C1] dark:text-[#A389F4]">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-[#2E2A28] dark:text-[#E0D7FF]">{a.title}</h3>
              <p className="text-[11px] font-bold text-gray-400 dark:text-[#A389F4] mt-1">{a.body}</p>
              <p className="text-[9px] font-bold text-gray-300 mt-2 uppercase">{a.time}</p>
            </div>
          </div>
        ))}
        <div className="text-center py-10 opacity-20 dark:text-[#A389F4]">
          <Sparkles size={40} className="mx-auto mb-2" />
          <p className="text-[10px] font-black uppercase">All caught up</p>
        </div>
      </main>
    </div>
  );
}
