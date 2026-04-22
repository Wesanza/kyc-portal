import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, Loader2, InboxIcon } from "lucide-react";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/api/notifications";
import type { Notification } from "@/types/notification";

/* ─── helpers ─────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── component ───────────────────────────────────────────────── */
export default function NotificationPopover() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(false);
  const [markingAll, setMarkingAll]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const popoverRef                        = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /* fetch on open */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotifications();
      setNotifications(data.results ?? data);
    } catch {
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* mark single read */
  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch {
      // revert optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      );
    }
  };

  /* mark all read */
  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      fetchNotifications(); // revert by re-fetching
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>

      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`
          relative w-9 h-9 rounded-lg flex items-center justify-center
          transition-colors duration-250
          ${open
            ? "bg-mint-surface text-forest"
            : "text-medium-gray hover:bg-mint-surface hover:text-forest"
          }
        `}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="
            absolute -top-0.5 -right-0.5
            min-w-[16px] h-4 px-1 rounded-full
            bg-lime text-forest text-[10px] font-display font-bold
            flex items-center justify-center leading-none
          ">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Popover ── */}
      {open && (
        <div className="
          absolute right-0 top-full mt-2 z-50
          w-80 bg-white rounded-xl shadow-dropdown
          border border-light-gray
          animate-slide-down overflow-hidden
        ">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-light-gray">
            <div className="flex items-center gap-2">
              <span className="text-sm font-display font-semibold text-charcoal">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-forest text-lime text-[10px] font-bold font-display">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-xs font-body text-forest-mid hover:text-forest
                           disabled:opacity-50 transition-colors duration-250"
              >
                {markingAll
                  ? <Loader2 size={12} className="animate-spin" />
                  : <CheckCheck size={12} />
                }
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[360px] overflow-y-auto">

            {loading && (
              <div className="flex items-center justify-center py-10 text-medium-gray">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <p className="text-sm font-body text-error">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="text-xs font-body text-forest hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-medium-gray">
                <InboxIcon size={24} strokeWidth={1.5} />
                <p className="text-sm font-body">You're all caught up</p>
              </div>
            )}

            {!loading && !error && notifications.map((n) => (
              <div
                key={n.id}
                className={`
                  flex items-start gap-3 px-4 py-3
                  border-b border-light-gray last:border-0
                  transition-colors duration-250 group
                  ${n.is_read ? "bg-white" : "bg-mint-surface"}
                `}
              >
                {/* Unread dot */}
                <div className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full
                                transition-colors duration-250
                                ${n.is_read ? 'bg-transparent' : 'bg-lime'}">
                  <span className={`
                    block w-2 h-2 rounded-full transition-colors duration-250
                    ${n.is_read ? "bg-light-gray" : "bg-lime"}
                  `} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-body leading-snug line-clamp-2
                    ${n.is_read ? "text-medium-gray" : "text-charcoal font-medium"}`}>
                    {n.message ?? (n as any).title ?? "New notification"}
                  </p>
                  <p className="mt-0.5 text-[10px] font-body text-medium-gray/70">
                    {timeAgo(n.created_at)}
                  </p>
                </div>

                {/* Mark read button */}
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    title="Mark as read"
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100
                               w-6 h-6 rounded-md flex items-center justify-center
                               text-medium-gray hover:text-forest hover:bg-light-gray
                               transition-all duration-250"
                  >
                    <Check size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-light-gray bg-off-white">
              <button
                onClick={() => setOpen(false)}
                className="w-full text-xs font-body text-center text-medium-gray
                           hover:text-forest transition-colors duration-250"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}