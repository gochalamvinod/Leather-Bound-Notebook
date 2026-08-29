import React from 'react';
import ProgressiveVideoPlayer from './ProgressiveVideoPlayer';
import { HlsManifest } from '../../lib/media/streamingEngine';

export interface VintageVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  preload?: string;
  className?: string;
  containerClassName?: string;
  caption?: string;
  encryptionKey?: Uint8Array;
  hlsPlaylistUrl?: string;
  selectedQuality?: string;
  onQualityChange?: (quality: string) => void;
  onHlsManifestLoaded?: (manifest: HlsManifest) => void;
}

export const VintageVideo: React.FC<VintageVideoProps> = ({
  src,
  poster,
  autoPlay = false,
  controls = true,
  playsInline = true,
  preload = 'metadata',
  className = '',
  containerClassName = '',
  caption,
  encryptionKey,
  hlsPlaylistUrl,
  selectedQuality,
  onQualityChange,
  onHlsManifestLoaded,
  ...props
}) => {
  return (
    <div
      className={`media-container video-container vintage-video ${containerClassName}`}
      contentEditable={false}
    >
      <ProgressiveVideoPlayer
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        controls={controls}
        playsInline={playsInline}
        preload={preload}
        className={className}
        containerClassName=""
        caption={caption}
        encryptionKey={encryptionKey}
        hlsPlaylistUrl={hlsPlaylistUrl}
        selectedQuality={selectedQuality}
        onQualityChange={onQualityChange}
        onHlsManifestLoaded={onHlsManifestLoaded}
        {...props}
      />
    </div>
  );
};

export default VintageVideo;
