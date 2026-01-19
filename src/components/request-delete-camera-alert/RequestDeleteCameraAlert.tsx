import React from 'react';
import { ToastContentProps } from 'react-toastify';
import cx from 'clsx';

// i18n
import { useTranslation } from 'react-i18next';

type NotificationData = {
  content: string;
  onUpdate?: () => void;
  updateVisible?: boolean;
};

interface RequestDeleteCameraAlertProps extends ToastContentProps<NotificationData> {
  type?: 'success' | 'error' | 'info' | 'warning';
}

const RequestDeleteCameraAlert: React.FC<RequestDeleteCameraAlertProps> = ({
  closeToast,
  data,
  toastProps,
}) => {
  // i18n
  const { t } = useTranslation();

  const isColored = toastProps?.theme === 'light';

  const handleUpdate = () => {
    if (data.onUpdate) {
      data.onUpdate();
    }
    closeToast();
  };

  return (
    <div
      className={cx(
        'flex flex-col w-full gap-3 overflow-y-auto max-h-[80vh]',
      )}
    >
      <div className='flex justify-center items-center'>
        <div className='relative'>
          <img src="/svg/bell.svg" alt="Bell" className='w-[70px] h-[70px] bell-shake' />
          <div className='absolute top-0 right-[-5px] rotate-[-15deg]'>
            <img src="/svg/bell-ring.svg" alt="Bell Ring" className='w-[70px] h-[70px] ring-shake' />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <p className="text-[18px] text-[#4A4A4A] font-bold">{data?.content}</p>
        {
          data.updateVisible && (
            <button
              type="button"
              onClick={handleUpdate}
              className={cx(
                'ml-4 text-[12px] rounded-md px-3 py-1.5 transition-all active:scale-[.95]',
                isColored ? 'text-[#071C3B] font-bold bg-[#FFC300]' : 'text-white font-bold bg-[#2B9BED]'
              )}
            >
              {t('button.detail')}
            </button>
          )
        }
      </div>
    </div>
  );
};

export default RequestDeleteCameraAlert;
