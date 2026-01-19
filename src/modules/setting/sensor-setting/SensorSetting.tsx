import React, { useEffect, useRef, useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button
} from '@mui/material';
import { getUrls } from '../../../config/runtimeConfig';

// Components
import TextBox from '../../../components/text-box/TextBox';
import Image from '../../../components/image/Image';
import DrawingCanvas from '../../../components/drawing-canvas/DrawingCanvas'

// i18n
import { useTranslation } from 'react-i18next';

// Types
import { Camera } from "../../../features/types";

// Icons
import { X } from "lucide-react";

interface SensorSettingProps {
  open: boolean;
  onClose: () => void;
  selectedRow: Camera | null;
}

const SensorSetting: React.FC<SensorSettingProps> = ({open, onClose, selectedRow}) => {
  const { CENTER_FILE_URL } = getUrls();

  // i18n
  const { t } = useTranslation();

  // State
  const [imageLoaded, setImageLoaded] = useState(false);

  // Data
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (open) {
      setImageLoaded(false);
    }
  }, [open])

  const handleCancelClick = () => {
    onClose();
  };

  return (
    <Dialog 
      id='sensor-setting' 
      open={open} 
      maxWidth={false} 
      slotProps={{
        paper: {
          sx: {
            maxWidth: '940px',
            width: '100%'
          },
        }
      }}
    >
      <DialogTitle className='flex items-center justify-between bg-black'>
        {/* Header */}
        <div>
          <Typography variant="h5" color="white" className="font-bold">{t('screen.sensor-setting.title')}</Typography>
        </div>
        <button
          onClick={onClose}
        >
          <X size={30} color="white" />
        </button>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <div className='flex flex-col gap-5'>
          <div className='grid grid-cols-2 gap-[50px]'>
            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="camera-id"
              label={t('component.camera-id')}
              value={selectedRow?.camera_name}
              disabled={true}
            />
          </div>

          <div className='p-5 border-[#2B9BED] border-[1px]'>
            <div className='relative'>
              <Image 
                imageSrc={`${CENTER_FILE_URL}${selectedRow?.sample_image_url}`}
                imageAlt='Vehicle Detect'
                className='w-full h-[450px]'
                ref={imgRef}
                onLoad={() => setImageLoaded(true)}
              />
              { (!selectedRow?.sample_image_url || selectedRow?.sample_image_url === "") && (
                <label className='absolute inset-0 flex items-center justify-center text-black bg-white'>{t('text.camera-not-working')}</label>
              ) }
              { imageLoaded && imgRef.current && (
                <DrawingCanvas
                  imgRef={imgRef.current}
                  selectedRow={selectedRow}
                />
              )}
            </div>
          </div>

          <div className='flex justify-end w-full mt-5 gap-3'>
            <Button
              variant="text"
              className="secondary-checkpoint-search-btn"
              sx={{
                width: "100px",
                height: "40px",
                textTransform: "capitalize",
                '& .MuiSvgIcon-root': { 
                  fontSize: 20
                } 
              }}
              onClick={handleCancelClick}
            >
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SensorSetting;