import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Clock } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '../../../hooks/useNotifications';
import Button from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Spinner';
import { KYC_SECTIONS } from '../../../utils/constants';
import { cn } from '../../../utils/cn';
import type { Notification } from '../../../types/notification';

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const getSectionLabel = (section?: string): string => {
  if (!section) return '';
  return KYC_SECTIONS.find((s) => s.key === section)?.label ?? section;
};

const getSectionRoute = (section?: string): string | null => {
  if (!section) return null;
  return KYC_SECTIONS.find((s) => s.key === section)?.route ?? null;
};

const NotificationItem: React.FC<{
  notification: Notification;
  onRead: (id: string) => void;
}> = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const sectionLabel = getSectionLabel(notification.section);
  const sectionRoute = getSectionRoute(notification.section);

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    if (sectionRoute) navigate(sectionRoute);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200',
        notification.is_read
          ? 'bg-white border-light-gray opacity-70'
          : 'bg-white border-forest-light shadow-card cursor-pointer hover:shadow-card-hover',
        !notification.is_read && 'border-l-4 border-l-forest'
      )}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-lime" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
          notification.is_read ? 'bg-light-gray' : 'bg-forest/10'
        )}
      >
        <Bell
          className={cn('w-4 h-4', notification.is_read ? 'text-medium-gray' : 'text-forest')}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <p
          className={cn(
            'text-sm font-body leading-snug',
            notification.is_read ? 'text-medium-gray font-normal' : 'text-charcoal font-medium'
          )}
        >
          {notification.message}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          {sectionLabel && (
            <span className="text-xs font-body text-forest bg-mint-surface px-2 py-0.5 rounded-full border border-forest-light/40">
              {sectionLabel}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs font-body text-medium-gray">
            <Clock className="w-3 h-3" />
            {timeAgo(notification.created_at)}
          </div>
        </div>
      </div>

      {/* Navigate icon */}
      {sectionRoute && !notification.is_read && (
        <ExternalLink className="flex-shrink-0 w-4 h-4 text-medium-gray mt-0.5" />
      )}
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const notifications = data?.results ?? [];
  const unreadCount = data?.unread_count ?? 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-forest">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm font-body text-medium-gray mt-0.5">
              {unreadCount} unread{unreadCount === 1 ? '' : 's'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            loading={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-mint-surface border border-light-gray flex items-center justify-center">
            <Bell className="w-7 h-7 text-medium-gray" />
          </div>
          <div className="text-center">
            <p className="text-sm font-body font-medium text-charcoal">No notifications yet</p>
            <p className="text-xs font-body text-medium-gray mt-1">
              You'll be notified when a reviewer takes action on your submissions.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={(id) => markRead.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
