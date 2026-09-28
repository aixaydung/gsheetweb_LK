import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { formatDateTime } from '../../lib/format';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { notifications, markNotificationRead } = useApp();

  const handleNotificationClick = (notifId: string, link?: string) => {
    markNotificationRead(notifId);
    if (link) {
      onClose();
      onNavigate(link);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông báo hệ thống"
      subtitle="Cập nhật hoạt động chứng từ, kho và thanh toán mới nhất"
      icon="notifications"
      width="md"
    >
      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-[#9CA3AF] text-[13.5px]">
            Không có thông báo nào
          </div>
        ) : (
          notifications.map(n => {
            const iconMap = {
              success: { name: 'check_circle', color: 'text-[#059669]', bg: 'bg-[#ECFDF5]' },
              danger: { name: 'error', color: 'text-[#E11D48]', bg: 'bg-[#FFF1F2]' },
              warning: { name: 'warning', color: 'text-[#B45309]', bg: 'bg-[#FFFBEB]' },
              info: { name: 'info', color: 'text-[#0E7490]', bg: 'bg-[#ECFEFF]' },
            };
            const theme = iconMap[n.type] || iconMap.info;

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n.id, n.link)}
                className={`p-3.5 rounded-[14px] border border-[#F1F2F5] hover:border-[#E5E7EB] transition-colors flex items-start gap-3.5 cursor-pointer ${
                  n.read ? 'bg-white opacity-85' : 'bg-[#F9FAFB] shadow-xs'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-[10px] ${theme.bg} ${theme.color} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon name={theme.name} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-[13.5px] truncate leading-tight ${
                        n.read ? 'font-medium text-[#374151]' : 'font-bold text-[#111827]'
                      }`}
                    >
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-[#9CA3AF] shrink-0">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#6B7280] mt-1 leading-normal">
                    {n.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
