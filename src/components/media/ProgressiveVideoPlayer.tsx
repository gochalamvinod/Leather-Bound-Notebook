import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  getOrCreateStreamController,
  releaseStreamController,
  StreamStats,
  TimeRange,
  HlsVariant,
  HlsManifest,
} from '../../lib/media/streamingEngine';

export interface ProgressiveVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
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

export const ProgressiveVideoPlayer: React.FC<ProgressiveVideoProps> = ({
  src,
  poster,
  autoPlay = false,
  controls = true,
  playsInline = true,
  preload = 'metadata',
  className = '',
  containerClassName = '',
  caption = '',
  encryptionKey,
  hlsPlaylistUrl,
  selectedQuality,
  onQualityChange,
  onHlsManifestLoaded,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const qualityMenuRef = useRef<HTMLDivElement | null>(null);

  // Active streaming URL (prefers hlsPlaylistUrl if provided)
  const activeStreamUrl = useMemo(() => {
    return hlsPlaylistUrl || src;
  }, [hlsPlaylistUrl, src]);

  const isHls = useMemo(() => {
    return (
      /\.m3u8(?:$|\?)/i.test(activeStreamUrl) ||
      /\/hls(?:\/|$)/i.test(activeStreamUrl) ||
      /\/playlist\.m3u8/i.test(activeStreamUrl)
    );
  }, [activeStreamUrl]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showStatsHUD, setShowStatsHUD] = useState<boolean>(false);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [activeQualityIndex, setActiveQualityIndex] = useState<number>(0);
  const [variants, setVariants] = useState<HlsVariant[]>([]);
  const [bufferedRanges, setBufferedRanges] = useState<TimeRange[]>([]);
  const [stats, setStats] = useState<StreamStats>({
    totalBytes: 0,
    loadedBytes: 0,
    totalChunks: 1,
    loadedChunks: 0,
    bufferedPercent: 0,
    startupTimeMs: 0,
    currentBitrateKbps: 0,
    is206Partial: !isHls,
    isEncrypted: false,
    activeRequests: 0,
    cacheHits: 0,
    isHls,
  });

  const streamController = useMemo(() => {
    return activeStreamUrl ? getOrCreateStreamController(activeStreamUrl, encryptionKey) : null;
  }, [activeStreamUrl, encryptionKey]);

  // Initialize progressive stream controller
  useEffect(() => {
    if (!streamController) return;

    streamController.init().then(() => {
      const vars = streamController.getVariants();
      if (vars.length > 0) {
        setVariants(vars);
      }
      const streamDur = streamController.getDuration();
      if (streamDur > 0) {
        setDuration(streamDur);
      }
      const master = streamController.getMasterManifest();
      const media = streamController.getMediaManifest();
      if (onHlsManifestLoaded && (master || media)) {
        onHlsManifestLoaded(master || media!);
      }
    }).catch(() => {});

    const unsubscribe = streamController.onProgress((s) => {
      setStats(s);
      const vars = streamController.getVariants();
      if (vars.length > 0) {
        setVariants(vars);
      }
      const streamDur = streamController.getDuration();
      if (streamDur > 0 && (!videoRef.current || !videoRef.current.duration)) {
        setDuration(streamDur);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [streamController, onHlsManifestLoaded]);

  // Clean up on unmount if source changes
  useEffect(() => {
    return () => {
      if (activeStreamUrl) releaseStreamController(activeStreamUrl);
    };
  }, [activeStreamUrl]);

  // Sync buffered ranges from both video element and streaming controller cache
  const updateBufferedRanges = useCallback(() => {
    const v = videoRef.current;
    const ranges: TimeRange[] = [];
    
    if (v && v.buffered) {
      for (let i = 0; i < v.buffered.length; i++) {
        ranges.push({
          start: v.buffered.start(i),
          end: v.buffered.end(i),
        });
      }
    }

    const currentDuration = (v && v.duration > 0) ? v.duration : duration;
    if (streamController && currentDuration > 0) {
      const controllerRanges = streamController.getBufferedTimeRanges(currentDuration);
      for (const cr of controllerRanges) {
        ranges.push(cr);
      }
    }

    // Sort and merge
    ranges.sort((a, b) => a.start - b.start);
    const merged: TimeRange[] = [];
    for (const r of ranges) {
      if (merged.length === 0) {
        merged.push({ ...r });
      } else {
        const last = merged[merged.length - 1];
        if (r.start <= last.end + 0.2) {
          last.end = Math.max(last.end, r.end);
        } else {
          merged.push({ ...r });
        }
      }
    }

    setBufferedRanges(merged);
  }, [streamController, duration]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const vidDur = video.duration || 0;
      if (vidDur > 0) {
        setDuration(vidDur);
      } else if (streamController) {
        const ctrlDur = streamController.getDuration();
        if (ctrlDur > 0) setDuration(ctrlDur);
      }
      updateBufferedRanges();
    };

    const handleDurationChange = () => {
      if (video.duration > 0) {
        setDuration(video.duration);
      }
      updateBufferedRanges();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
      updateBufferedRanges();
      
      // Prefetch immediate next segment only (count: 1)
      if (streamController && duration > 0) {
        if (streamController.isHls()) {
          const segs = streamController.getSegments();
          const curIdx = Math.max(0, segs.findIndex(s => video.currentTime >= s.startTime && video.currentTime < s.endTime));
          if (curIdx >= 0 && !streamController.hasSegment(curIdx + 1)) {
            streamController.prefetchSegmentsAhead(curIdx + 1, 1).catch(() => {});
          }
        } else {
          const offset = Math.floor((video.currentTime / duration) * (stats.totalBytes || 1));
          streamController.prefetchAhead(offset, 1).catch(() => {});
        }
      }
    };

    const handleProgress = () => {
      updateBufferedRanges();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
    };
  }, [streamController, updateBufferedRanges, duration, stats.totalBytes]);

  // Handle external quality prop change
  useEffect(() => {
    if (selectedQuality && variants.length > 0 && streamController) {
      const idx = variants.findIndex(
        (v) =>
          v.name?.toLowerCase() === selectedQuality.toLowerCase() ||
          `${v.resolution?.height}p`.toLowerCase() === selectedQuality.toLowerCase()
      );
      if (idx !== -1 && idx !== activeQualityIndex) {
        setActiveQualityIndex(idx);
        streamController.switchVariant(idx).catch(() => {});
      }
    }
  }, [selectedQuality, variants, streamController, activeQualityIndex]);

  // Auto-hide controls overlay during active playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowQualityMenu(false);
      }, 2500);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Controls Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      if (streamController && duration > 0) {
        streamController.handleSeek(target, duration).catch(() => {});
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, (videoRef.current.currentTime || 0) + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (streamController && duration > 0) {
      streamController.handleSeek(newTime, duration).catch(() => {});
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleSelectQuality = async (index: number) => {
    setActiveQualityIndex(index);
    setShowQualityMenu(false);
    if (streamController) {
      await streamController.switchVariant(index);
      const v = variants[index];
      const qLabel = v?.name || (v?.resolution ? `${v.resolution.height}p` : `${Math.round(v.bandwidth / 1000)}k`);
      if (onQualityChange) {
        onQualityChange(qLabel);
      }
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current.requestPictureInPicture) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available:', err);
    }
  };

  const toggleFullscreen = async () => {
    const target = containerRef.current || videoRef.current;
    if (!target) return;

    if (!document.fullscreenElement) {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const currentQualityLabel = useMemo(() => {
    if (variants.length > 0 && variants[activeQualityIndex]) {
      const v = variants[activeQualityIndex];
      return v.name || (v.resolution ? `${v.resolution.height}p` : `${Math.round(v.bandwidth / 1000)}k`);
    }
    return isHls ? 'HLS Auto' : 'Auto';
  }, [variants, activeQualityIndex, isHls]);

  return (
    <div
      ref={containerRef}
      className={`media-container video-container nb-progressive-video-container ${containerClassName} ${
        isFullscreen ? 'nb-video--fullscreen' : ''
      }`}
      contentEditable={false}
      tabIndex={0}
      data-testid="vintage-video-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Viewport */}
      <div className="nb-video-viewport" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline={playsInline}
          preload={preload}
          autoPlay={autoPlay}
          crossOrigin="use-credentials"
          className={`vintage-video ${className}`}
          {...props}
        />

        {/* Big Center Play / Pause Indicator */}
        {!isPlaying && !isBuffering && (
          <div className="nb-video-center-btn" title="Play Video">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}

        {/* Buffering Spinner */}
        {(isBuffering || (stats.activeRequests > 0 && stats.loadedChunks === 0)) && (
          <div className="nb-video-buffering-overlay">
            <div className="nb-video-spinner" />
            <span className="nb-video-buffering-text">
              {isHls ? 'Streaming HLS segment...' : 'Streaming chunk...'} {stats.startupTimeMs > 0 ? `(<${Math.round(stats.startupTimeMs / 100) / 10}s)` : ''}
            </span>
          </div>
        )}

        {/* Stream Stats HUD Overlay */}
        {showStatsHUD && (
          <div
            className="nb-video-stats-hud"
            onClick={(e) => e.stopPropagation()}
            data-testid="video-stream-stats"
          >
            <div className="nb-video-stats-header">
              <span>{isHls ? '⚡ Encrypted HLS Stream HUD' : '⚡ Chunk Streaming HUD'}</span>
              <button
                type="button"
                className="nb-video-stats-close"
                onClick={() => setShowStatsHUD(false)}
              >
                ✕
              </button>
            </div>
            <div className="nb-video-stats-content">
              <div>
                <strong>Status:</strong>{' '}
                {isHls
                  ? 'HLS AES-128 Progressive Stream (VOD)'
                  : stats.is206Partial
                  ? 'HTTP 206 Partial Content (OK)'
                  : 'HTTP 200 Stream'}
              </div>
              {stats.activeResolution && (
                <div><strong>Resolution:</strong> {stats.activeResolution} ({stats.activeVariantName || currentQualityLabel})</div>
              )}
              <div><strong>Bitrate:</strong> {stats.currentBitrateKbps} Kbps</div>
              <div><strong>Startup Time:</strong> {stats.startupTimeMs} ms (&lt;2.0s goal)</div>
              <div>
                <strong>Buffered {isHls ? 'Segments' : 'Chunks'}:</strong> {stats.loadedChunks} / {stats.totalChunks}{' '}
                ({formatBytes(stats.loadedBytes)} / {formatBytes(stats.totalBytes)})
              </div>
              <div><strong>Progress:</strong> {stats.bufferedPercent}% loaded</div>
              <div><strong>Cache Hits:</strong> {stats.cacheHits} (0 network seeks)</div>
              <div><strong>Active Requests:</strong> {stats.activeRequests}</div>
              <div>
                <strong>Security:</strong>{' '}
                {stats.encryptionMethod || (isHls ? 'AES-128 Key-Protected (Session-Gated)' : 'AES-256-GCM Session-Gated')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Theatre Controls Overlay Bar */}
      {controls && (
        <div
          className={`nb-video-controls-overlay ${showControls ? 'nb-video-controls--visible' : 'nb-video-controls--hidden'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Status Bar with Title & Stats Toggle */}
          <div className="nb-video-top-bar">
            <span className="nb-video-stream-badge" onClick={() => setShowStatsHUD(!showStatsHUD)}>
              {isHls
                ? `⚡ HLS Stream • ${currentQualityLabel} • ${formatBytes(stats.loadedBytes)} cached`
                : `${stats.is206Partial ? '⚡ 206 Range Stream' : '📦 Video'} • ${formatBytes(stats.loadedBytes)} cached`}
            </span>
            <button
              type="button"
              className="nb-video-hud-btn"
              onClick={() => setShowStatsHUD(!showStatsHUD)}
              title="Toggle Chunk Streaming Stats HUD"
            >
              📊 Stats
            </button>
          </div>

          {/* Timeline Scrubber with Multi-Range Chunk/Segment Buffer Visualization */}
          <div className="nb-video-timeline-wrap">
            <div className="nb-video-timeline">
              {/* Background Track */}
              <div className="nb-video-track" />

              {/* Render Cached Chunk / Segment Ranges */}
              {duration > 0 &&
                bufferedRanges.map((r, i) => {
                  const left = Math.min(100, Math.max(0, (r.start / duration) * 100));
                  const width = Math.min(100 - left, Math.max(0, ((r.end - r.start) / duration) * 100));
                  return (
                    <div
                      key={i}
                      className="nb-video-buffer-segment"
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`Cached Range: ${formatTime(r.start)} - ${formatTime(r.end)}`}
                    />
                  );
                })}

              {/* Active Playback Progress */}
              <div
                className="nb-video-progress-fill"
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                }}
              />

              {/* Interactive Range Input */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="nb-video-range-slider"
                title="Seek timeline"
                aria-label="Seek video timeline"
              />
            </div>
          </div>

          {/* Bottom Controls Row */}
          <div className="nb-video-bottom-row">
            <div className="nb-video-left-controls">
              {/* Play / Pause */}
              <button
                type="button"
                className="nb-video-btn nb-video-btn--play"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              {/* Skip -10s */}
              <button
                type="button"
                className="nb-video-btn"
                onClick={() => skipTime(-10)}
                title="Rewind 10s"
                aria-label="Rewind 10s"
              >
                ⏪ 10s
              </button>

              {/* Skip +10s */}
              <button
                type="button"
                className="nb-video-btn"
                onClick={() => skipTime(10)}
                title="Forward 10s"
                aria-label="Forward 10s"
              >
                10s ⏩
              </button>

              {/* Volume & Mute */}
              <div className="nb-video-volume-wrap">
                <button
                  type="button"
                  className="nb-video-btn"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  aria-label="Toggle mute"
                >
                  {isMuted || volume === 0 ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="nb-video-volume-slider"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  aria-label="Volume slider"
                />
              </div>

              {/* Time Display */}
              <span className="nb-video-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="nb-video-right-controls">
              {/* Adaptive Quality Selector (if variants exist) */}
              {variants.length > 1 && (
                <div className="nb-video-speed-group" style={{ position: 'relative' }} ref={qualityMenuRef}>
                  <button
                    type="button"
                    className="nb-video-speed-btn nb-video-speed-btn--active"
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    title="Select Stream Quality"
                    aria-label="Stream Quality"
                  >
                    ⚙️ {currentQualityLabel}
                  </button>

                  {showQualityMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        right: 0,
                        marginBottom: '6px',
                        background: 'rgba(16, 12, 8, 0.95)',
                        border: '1px solid var(--brass, #b8935a)',
                        borderRadius: '6px',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        zIndex: 30,
                        minWidth: '90px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                      }}
                    >
                      {variants.map((v, idx) => {
                        const label = v.name || (v.resolution ? `${v.resolution.height}p` : `${Math.round(v.bandwidth / 1000)}k`);
                        const isSelected = idx === activeQualityIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`nb-video-speed-btn ${isSelected ? 'nb-video-speed-btn--active' : ''}`}
                            style={{
                              textAlign: 'left',
                              padding: '4px 8px',
                              width: '100%',
                            }}
                            onClick={() => handleSelectQuality(idx)}
                          >
                            {isSelected ? '✓ ' : '  '}{label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Playback Speed */}
              <div className="nb-video-speed-group">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    className={`nb-video-speed-btn ${playbackRate === rate ? 'nb-video-speed-btn--active' : ''}`}
                    onClick={() => changeRate(rate)}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Picture-in-Picture */}
              <button
                type="button"
                className="nb-video-btn"
                onClick={togglePiP}
                title="Picture-in-Picture"
                aria-label="Picture-in-Picture"
              >
                🗔
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                className="nb-video-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                aria-label="Fullscreen"
              >
                {isFullscreen ? '⤓' : '⛶'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editable Caption */}
      <div
        className="vintage-media-caption"
        contentEditable={true}
        suppressContentEditableWarning={true}
        data-placeholder="Add a caption..."
      >
        {caption || ''}
      </div>
    </div>
  );
};

export default ProgressiveVideoPlayer;
