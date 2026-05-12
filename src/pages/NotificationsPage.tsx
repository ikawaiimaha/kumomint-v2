import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Bell, 
  ArrowLeftRight, 
  Sparkles, 
  Trash2, 
  Circle,
  Clock
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
      setLoading(false);
    }
    fetchNotifications();

    // 📡 Real-time Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
      <Sparkles className="animate-spin text-[var(--accent)]" size={32} />
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 px-6 pt-12 transition-colors duration-1000 ${resolvedTheme} bg-[var(--bg-app)] text-[var(--text-main)]`}>
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Transmissions</h1>
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Signals from the Galaxy</p>
        </div>
        <Bell size={24} className="text-[var(--accent)] opacity-50" />
      </header>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            onClick={() => markAsRead(n.id)}
            className={`glass-panel p-5 transition-all duration-500 border-[#2D1B4E] relative overflow-hidden ${
              n.is_read ? 'bg-[#1A0B2E]/30 opacity-60' : 'bg-[#1A0B2E]/80 border-[var(--accent)]/30 shadow-[0_0_20px_rgba(163,137,244,0.1)]'
            }`}
          >
            {!n.is_read && (
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
            )}

            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'trade_request' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)]'
              }`}>
                {n.type === 'trade_request' ? <ArrowLeftRight size={18} /> : <Sparkles size={18} />}
              </div>

              <div className="flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-1">{n.title}</h3>
                <p className="text-[9px] font-bold text-[var(--text-muted)] leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-1.5 mt-3 opacity-30">
                  <Clock size={10} />
                  <span className="text-[7px] font-black uppercase">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!n.is_read && <Circle size={8} fill="currentColor" className="text-[var(--accent)] animate-pulse" />}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-20 text-center opacity-20">
            <Bell size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">The stars are quiet...</p>
          </div>
        )}
      </div>
    </div>
  );
}
