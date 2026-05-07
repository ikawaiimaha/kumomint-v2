import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Award,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Heart,
  Inbox,
  Info,
  Loader2,
  Package,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomSheet from '@/components/BottomSheet';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type NotificationType =
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'trade_completed'
  | 'match_found'
  | 'system'
  | 'verification'
  | 'ghosting_warning'
  | 'badge_earned';

interface NotificationRow {
  id: string;
  trader_id: string;
  type: NotificationType | string;
  title: string;
  message: string | null;
  related_offer_id: string | null;
  related_trade_id: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIF_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string; bg: string; accent: string; label: string }
> = {
  offer_received: {
    icon: Heart,
    color: '#E84393',
    bg: 'bg-pink-50',
    accent: 'ring-pink-200',
    label: 'Trade Offer',
  },
  offer_accepted: {
    icon: Zap,
    color: '#2ECC71',
    bg: 'bg-green-50',
    accent: 'ring-green-200',
    label: 'Accepted',
  },
  offer_declined: {
    icon: Wind,
    color: '#E67E22',
    bg: 'bg-orange-50',
    accent: 'ring-orange-200',
    label: 'Declined',
  },
  trade_completed: {
    icon: Package,
    color: '#7ED7C1',
    bg: 'bg-[#7ED7C1]/10',
    accent: 'ring-[#7ED7C1]',
    label: 'Completed',
  },
  match_found: {
    icon: Search,
    color: '#9B59B6',
    bg: 'bg-purple-50',
    accent: 'ring-purple-200',
    label: 'Match',
  },
  system: {
    icon: Info,
    color: '#3498DB',
    bg: 'bg-blue-50',
    accent: 'ring-blue-200',
    label: 'System',
  },
  verification: {
    icon: ShieldCheck,
    color: '#2ECC71',
    bg: 'bg-green-50',
    accent: 'ring-green-200',
    label: 'Verified',
  },
  ghosting_warning: {
    icon: ShieldAlert,
    color: '#E74C3C',
    bg: 'bg-red-50',
    accent: 'ring-red-200',
    label: 'Reminder',
  },
  badge_earned: {
    icon: Award,
    color: '#D4A017',
    bg: 'bg-amber-50',
    accent: 'ring-amber-200',
    label: 'Badge',
  },
};

function getDateGroup(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours === 0 ? 'Just now' : 'Today';
  }

  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotif, setSelectedNotif] = useState<NotificationRow | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const syncAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      setAuthReady(true);
    };

    void syncAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadNotifications = useCallback(async (currentUserId: string) => {
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('notifications')
      .select(
        'id, trader_id, type, title, message, related_offer_id, related_trade_id, is_read, created_at'
      )
      .eq('trader_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (dbError) {
      setError(dbError.message);
      setNotifications([]);
    } else {
      setNotifications((data ?? []) as NotificationRow[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    void loadNotifications(userId);

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `trader_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationRow, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `trader_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === payload.new.id ? (payload.new as NotificationRow) : item
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `trader_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authReady, loadNotifications, userId]);

  const markAsRead = useCallback(
    async (notifId: string) => {
      if (!userId) return;

      setActionLoading(notifId);
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notifId)
        .eq('trader_id', userId);

      if (!updateError) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === notifId ? { ...item, is_read: true } : item))
        );
      } else {
        setError(updateError.message);
      }

      setActionLoading(null);
    },
    [userId]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId || markAllLoading) return;

    setMarkAllLoading(true);
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('trader_id', userId)
      .eq('is_read', false);

    if (!updateError) {
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } else {
      setError(updateError.message);
    }

    setMarkAllLoading(false);
  }, [markAllLoading, userId]);

  const deleteNotif = useCallback(
    async (notifId: string) => {
      if (!userId) return;

      setActionLoading(notifId);
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notifId)
        .eq('trader_id', userId);

      if (!deleteError) {
        setNotifications((prev) => prev.filter((item) => item.id !== notifId));
        setSelectedNotif((prev) => (prev?.id === notifId ? null : prev));
      } else {
        setError(deleteError.message);
      }

      setActionLoading(null);
    },
    [userId]
  );

  const grouped = useMemo(() => {
    return notifications.reduce<Record<string, NotificationRow[]>>((acc, item) => {
      const group = getDateGroup(item.created_at);
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  }, [notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  if (!loading && !userId) {
    return (
      <Layout title="Notifications" showNav={false}>
        <div className="pt-10">
          <div className="rounded-[28px] border border-[rgba(165,214,200,0.18)] bg-white/[0.78] px-5 py-10 text-center">
            <Inbox size={28} className="mx-auto mb-3 text-[#2E2A2866]" />
            <p className="text-[16px] font-semibold text-[#2E2A28]">
              Sign in to see your notifications.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-5 rounded-2xl bg-[#A5D6C8] px-5 py-3 text-[14px] font-semibold text-[#2E2A28]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Notifications">
      <div className="space-y-5 pt-2">
        <div className="flex items-start justify-between gap-3 rounded-[28px] border border-[rgba(165,214,200,0.18)] bg-white/[0.78] px-4 py-4">
          <div>
            <p className="text-[14px] font-semibold text-[#2E2A28]">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
            <p className="mt-1 text-[12px] text-[#2E2A2899]">
              Offers, matches, trust updates, and system alerts appear here.
            </p>
          </div>

          <button
            onClick={() => void markAllAsRead()}
            disabled={markAllLoading || unreadCount === 0}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-[12px] font-semibold transition-all',
              unreadCount === 0
                ? 'bg-[rgba(46,42,40,0.05)] text-[#2E2A2866]'
                : 'bg-[rgba(165,214,200,0.16)] text-[#4E927E]'
            )}
          >
            {markAllLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCheck size={14} />
            )}
            Mark all read
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#7ED7C1]" />
            <p className="text-sm text-[#2E2A2899]">Loading notifications...</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-[rgba(239,154,154,0.35)] bg-[rgba(255,235,238,0.8)] px-4 py-3 text-[13px] text-[#9A3F52]">
            {error}
          </div>
        ) : null}

        {!loading && !error && notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-[28px] border border-[rgba(165,214,200,0.14)] bg-white/[0.74] px-5 py-16 text-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(46,42,40,0.05)]">
              <Bell className="h-8 w-8 text-[#2E2A2833]" />
            </div>
            <p className="text-[15px] font-semibold text-[#2E2A28]">No notifications yet</p>
            <p className="mt-1 text-[13px] text-[#2E2A2899]">
              Trade offers, matches, and system alerts will appear here.
            </p>
          </motion.div>
        ) : null}

        {!loading && !error && notifications.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2E2A2866]">
                  {group}
                </h3>
                <div className="space-y-2">
                  {items.map((notif) => {
                    const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.system;
                    const Icon = cfg.icon;
                    const isUnread = !notif.is_read;

                    return (
                      <motion.button
                        key={notif.id}
                        type="button"
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          setSelectedNotif(notif);
                          if (isUnread) {
                            void markAsRead(notif.id);
                          }
                        }}
                        className={cn(
                          'group relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left backdrop-blur-sm transition-all',
                          isUnread
                            ? 'border-[rgba(126,215,193,0.25)] bg-white/[0.74] shadow-sm'
                            : 'border-white/30 bg-white/[0.45]'
                        )}
                      >
                        {isUnread ? (
                          <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#7ED7C1]" />
                        ) : null}

                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all',
                            cfg.bg,
                            isUnread ? `ring-2 ${cfg.accent}` : ''
                          )}
                        >
                          <Icon className="h-5 w-5" style={{ color: cfg.color }} />
                        </div>

                        <div className="min-w-0 flex-1 pr-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'text-[11px] font-bold',
                                isUnread ? 'text-[#2E2A28]' : 'text-[#2E2A2899]'
                              )}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-[#2E2A2866]">
                              • {formatTime(notif.created_at)}
                            </span>
                          </div>
                          <h4
                            className={cn(
                              'mt-0.5 text-[14px]',
                              isUnread
                                ? 'font-semibold text-[#2E2A28]'
                                : 'font-medium text-[#2E2A2899]'
                            )}
                          >
                            {notif.title}
                          </h4>
                          {notif.message ? (
                            <p className="mt-0.5 line-clamp-2 text-[12px] text-[#2E2A2899]">
                              {notif.message}
                            </p>
                          ) : null}
                        </div>

                        <ChevronRight className="h-4 w-4 shrink-0 self-center text-[#2E2A2833] opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <BottomSheet isOpen={selectedNotif !== null} onClose={() => setSelectedNotif(null)} title="Notification">
        {selectedNotif ? (
          <div className="space-y-5 pb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = NOTIF_CONFIG[selectedNotif.type] || NOTIF_CONFIG.system;
                  const Icon = cfg.icon;
                  return (
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', cfg.bg)}>
                      <Icon className="h-6 w-6" style={{ color: cfg.color }} />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-[15px] font-semibold text-[#2E2A28]">{selectedNotif.title}</p>
                  <p className="text-[12px] text-[#2E2A2899]">{formatDateTime(selectedNotif.created_at)}</p>
                </div>
              </div>

              <button
                onClick={() => void deleteNotif(selectedNotif.id)}
                disabled={actionLoading === selectedNotif.id}
                className="rounded-full bg-red-50 p-2 text-red-400 transition-all hover:bg-red-100 disabled:opacity-50"
              >
                {actionLoading === selectedNotif.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/50 p-4">
              <p className="text-[14px] leading-relaxed text-[#2E2A2899]">
                {selectedNotif.message || selectedNotif.title}
              </p>
            </div>

            {selectedNotif.related_offer_id ? (
              <button
                onClick={() => {
                  setSelectedNotif(null);
                  navigate('/offers');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7ED7C1] py-3 text-sm font-semibold text-white transition-all hover:bg-[#5BBAA3]"
              >
                <ArrowLeftRight className="h-4 w-4" />
                View in Offers
              </button>
            ) : null}

            {!selectedNotif.is_read ? (
              <button
                onClick={() => void markAsRead(selectedNotif.id)}
                disabled={actionLoading === selectedNotif.id}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 disabled:opacity-50"
              >
                {actionLoading === selectedNotif.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Mark as Read
              </button>
            ) : null}
          </div>
        ) : null}
      </BottomSheet>
    </Layout>
  );
}
