import React from 'react';
import ProgressiveAudioPlayer from './ProgressiveAudioPlayer';

export interface VintageAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  src: string;
  controls?: boolean;
  preload?: string;
  className?: string;
  containerClassName?: string;
  title?: string;
  artist?: string;
  encryptionKey?: Uint8Array;
}

export const VintageAudio: React.FC<VintageAudioProps> = ({
  src,
  controls = true,
  preload = 'metadata',
  className = '',
  containerClassName = '',
  title,
  artist,
  encryptionKey,
  ...props
}) => {
  return (
    <div
      className={`media-container audio-container vintage-audio ${containerClassName}`}
      contentEditable={false}
    >
      <ProgressiveAudioPlayer
        src={src}
        controls={controls}
        preload={preload}
        className={className}
        containerClassName=""
        title={title}
        artist={artist}
        encryptionKey={encryptionKey}
        {...props}
      />
    </div>
  );
};

export default VintageAudio;
