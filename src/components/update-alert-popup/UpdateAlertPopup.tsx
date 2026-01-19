import React from 'react';
import { ToastContentProps } from 'react-toastify';
import cx from 'clsx';
import { useLocation } from 'react-router-dom';

// Icons
import { Siren } from "lucide-react"

// i18n
import { useTranslation } from 'react-i18next';

type NotificationData = {
  title: string;
  content: string;
  onUpdate?: () => void;
  updateVisible?: boolean;
};

interface UpdateAlertPopupProps extends ToastContentProps<NotificationData> {
  type?: 'success' | 'error' | 'info' | 'warning';
}

const UpdateAlertPopup: React.FC<UpdateAlertPopupProps> = ({
  closeToast,
  data,
  toastProps,
}) => {
  // i18n
  const { t } = useTranslation();

  const location = useLocation();
  const isColored = toastProps?.theme === 'dark';
  const isUpdatePage = location.pathname.includes('/setting') || location.pathname.includes('/real-time-monitor') || location.pathname.includes('/search-plate-with-condition');

  const handleUpdate = () => {
    if (data.onUpdate) {
      data.onUpdate();
    }
    closeToast();
  };

  return (
    <div
      className={cx(
        'flex flex-col w-full space-y-2 overflow-y-auto max-h-[80vh]',
      )}
    >
      <h3
        className={cx(
          'text-md font-semibold',
          isColored ? 'text-white' : 'text-zinc-800'
        )}
      >
        <div className='flex gap-2'>
          <Siren color='#FF0000' size={20} />
          {data?.title}
        </div>
      </h3>
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm">{data?.content}</p>
        {
          isUpdatePage && data.updateVisible && (
            <button
              type="button"
              onClick={handleUpdate}
              className={cx(
                'ml-4 text-xs border rounded-md px-3 py-1.5 transition-all active:scale-[.95]',
                isColored ? 'text-white bg-[#2B9BED]' : 'text-white bg-zinc-900'
              )}
            >
              {t('button.update')}
            </button>
          )
        }
      </div>
    </div>
  );
};

export default UpdateAlertPopup;
