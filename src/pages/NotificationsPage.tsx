import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  ArrowLeftRight, 
  Star, 
  Clock, 
  Trash2, 
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'trade_offer' | 'trade_completed' | 'tier_up' | 'item_unlock';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'trade_offer': return <ArrowLeftRight className="text-blue-400" size={20} />;
      case 'trade_completed': return <CheckCircle2 className="text-[#7ED7C1]" size={20} />;
      case 'tier_up': return <Star className="text-yellow-400 fill-yellow-400" size={20} />;
      case 'item_unlock': return <Clock className="text-purple-400" size={20} />;
      default: return <Bell className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F7] pb-24">
      <div className="p-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black text-[#2E2A28]">Notifications</h1>
      </div>

      <main className="px-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20"><Bell className="animate-bounce text-gray-200" /></div>
        ) : (
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div 
                layout
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "p-4 rounded-[28px] border transition-all cursor-pointer flex gap-4 items-start",
                  n.is_read ? "bg-white/50 border-[#F0E6E4]" : "bg-white border-[#7ED7C1] shadow-sm"
                )}
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#2E2A28] mb-1">{n.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{n.message}</p>
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  className="p-2 text-gray-200 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <Bell size={48} className="mx-auto mb-4" />
            <p className="font-bold">No new alerts</p>
          </div>
        )}
      </main>
    </div>
  );
}
