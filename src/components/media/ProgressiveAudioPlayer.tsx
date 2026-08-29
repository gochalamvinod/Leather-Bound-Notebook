import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  getOrCreateStreamController,
  releaseStreamController,
  StreamStats,
  TimeRange,
} from '../../lib/media/streamingEngine';

export interface ProgressiveAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  src: string;
  title?: string;
  artist?: string;
  controls?: boolean;
  preload?: string;
  className?: string;
  containerClassName?: string;
  encryptionKey?: Uint8Array;
}

export const ProgressiveAudioPlayer: React.FC<ProgressiveAudioProps> = ({
  src,
  title,
  artist,
  controls = true,
  preload = 'metadata',
  className = '',
  containerClassName = '',
  encryptionKey,
  autoPlay = false,
  loop = false,
  ...props
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(loop);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [bufferedRanges, setBufferedRanges] = useState<TimeRange[]>([]);
  const [stats, setStats] = useState<StreamStats>({
    totalBytes: 0,
    loadedBytes: 0,
    totalChunks: 1,
    loadedChunks: 0,
    bufferedPercent: 0,
    startupTimeMs: 0,
    currentBitrateKbps: 0,
    is206Partial: true,
    isEncrypted: false,
    activeRequests: 0,
    cacheHits: 0,
  });

  const streamController = useMemo(() => {
    return src ? getOrCreateStreamController(src, encryptionKey) : null;
  }, [src, encryptionKey]);

  // Initialize progressive stream controller
  useEffect(() => {
    if (!streamController) return;

    streamController.init().catch(() => {});
    const unsubscribe = streamController.onProgress((s) => {
      setStats(s);
    });

    return () => {
      unsubscribe();
    };
  }, [streamController]);

  // Clean up on unmount if source changes
  useEffect(() => {
    return () => {
      if (src) releaseStreamController(src);
    };
  }, [src]);

  // Update HTML5 audio buffered ranges
  const updateBufferedRanges = useCallback(() => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const ranges: TimeRange[] = [];
    for (let i = 0; i < a.buffered.length; i++) {
      ranges.push({
        start: a.buffered.start(i),
        end: a.buffered.end(i),
      });
    }
    // Also include byte-range cache converted to time ranges
    if (streamController && a.duration > 0) {
      const cacheRanges = streamController.getCache().getBufferedTimeRanges(a.duration);
      for (const cr of cacheRanges) {
        ranges.push(cr);
      }
    }
    setBufferedRanges(ranges);
  }, [streamController]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      updateBufferedRanges();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      updateBufferedRanges();
      // Prefetch next chunk progressively
      if (streamController && audio.duration > 0) {
        const offset = Math.floor((audio.currentTime / audio.duration) * (stats.totalBytes || 1));
        streamController.prefetchAhead(offset, 1).catch(() => {});
      }
    };

    const handleProgress = () => {
      updateBufferedRanges();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [streamController, updateBufferedRanges, isLooping, stats.totalBytes]);

  // Waveform canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 32;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let height = 4;
        if (isPlaying) {
          const wave = Math.sin(phase + i * 0.3) * Math.cos(phase * 0.7 + i * 0.2);
          height = Math.max(4, Math.abs(wave) * (canvas.height - 8));
        }
        const x = i * (barWidth + 2) + 1;
        const y = (canvas.height - height) / 2;

        ctx.fillStyle = isPlaying ? '#d4b378' : '#6b573a';
        ctx.fillRect(x, y, barWidth, height);
      }

      if (isPlaying) {
        phase += 0.08;
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Controls Handlers
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      if (streamController && duration > 0) {
        streamController.handleSeek(target, duration).catch(() => {});
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, (audioRef.current.currentTime || 0) + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (streamController && duration > 0) {
      streamController.handleSeek(newTime, duration).catch(() => {});
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) {
      audioRef.current.loop = next;
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

  return (
    <div
      className={`nb-progressive-audio-player vintage-audio-container ${containerClassName}`}
      contentEditable={false}
      data-testid="progressive-audio-player"
    >
      {/* Hidden Native Audio Element with HTTP 206 Range Stream */}
      <audio
        ref={audioRef}
        src={src}
        preload={preload}
        autoPlay={autoPlay}
        loop={isLooping}
        className={`vintage-audio-hidden ${className}`}
        {...props}
      />

      {/* Main Vintage Brass Audio Card */}
      <div className="nb-audio-card">
        {/* Top Title & Streaming Status Header */}
        <div className="nb-audio-header">
          <div className="nb-audio-meta">
            <span className="nb-audio-icon">{isPlaying ? '📻' : '🎵'}</span>
            <div className="nb-audio-title-group">
              <span className="nb-audio-title">{title || src.split('/').pop()?.split('?')[0] || 'Encrypted Audio Stream'}</span>
              {artist && <span className="nb-audio-artist">{artist}</span>}
            </div>
          </div>
          <div className="nb-audio-header-actions">
            <span
              className="nb-audio-badge nb-audio-badge--stream"
              title="HTTP 206 Progressive Byte-Range Streaming with Chunk Cache"
              onClick={() => setShowStats(!showStats)}
            >
              {stats.is206Partial ? '⚡ HTTP 206' : '📦 Stream'} • {stats.startupTimeMs > 0 ? `<${Math.max(1, Math.round(stats.startupTimeMs / 100) / 10)}s` : 'Ready'}
            </span>
          </div>
        </div>

        {/* Waveform Visualizer Canvas */}
        <div className="nb-audio-visualizer-wrap">
          <canvas
            ref={canvasRef}
            className="nb-audio-visualizer-canvas"
            width={280}
            height={32}
          />
        </div>

        {/* Custom Progress Scrubber with Multi-Range Chunk Buffer */}
        <div className="nb-audio-scrubber-container">
          <div className="nb-audio-timeline">
            {/* Background Track */}
            <div className="nb-audio-track" />

            {/* Render Cached / Buffered Chunk Segments */}
            {duration > 0 &&
              bufferedRanges.map((r, i) => {
                const left = Math.min(100, Math.max(0, (r.start / duration) * 100));
                const width = Math.min(100 - left, Math.max(0, ((r.end - r.start) / duration) * 100));
                return (
                  <div
                    key={i}
                    className="nb-audio-buffer-segment"
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`Buffered chunk: ${formatTime(r.start)} - ${formatTime(r.end)}`}
                  />
                );
              })}

            {/* Active Playback Progress Fill */}
            <div
              className="nb-audio-progress-fill"
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
              className="nb-audio-range-slider"
              title="Seek playback"
              aria-label="Seek audio"
            />
          </div>

          {/* Time Counter: Current / Total */}
          <div className="nb-audio-time-row">
            <span className="nb-audio-time-current">{formatTime(currentTime)}</span>
            {isBuffering && <span className="nb-audio-buffering-label">Buffering chunk...</span>}
            <span className="nb-audio-time-duration">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Vintage Controls Bar */}
        <div className="nb-audio-controls-row">
          {/* Skip -10s */}
          <button
            type="button"
            className="nb-audio-btn nb-audio-btn--skip"
            onClick={() => skipTime(-10)}
            title="Rewind 10 seconds"
            aria-label="Rewind 10s"
          >
            ⏪ 10s
          </button>

          {/* Big Play/Pause Toggle */}
          <button
            type="button"
            className={`nb-audio-btn nb-audio-btn--play ${isPlaying ? 'nb-audio-btn--playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Skip +10s */}
          <button
            type="button"
            className="nb-audio-btn nb-audio-btn--skip"
            onClick={() => skipTime(10)}
            title="Forward 10 seconds"
            aria-label="Forward 10s"
          >
            10s ⏩
          </button>

          {/* Loop Toggle */}
          <button
            type="button"
            className={`nb-audio-btn nb-audio-btn--loop ${isLooping ? 'nb-audio-btn--active' : ''}`}
            onClick={toggleLoop}
            title={isLooping ? 'Loop: ON' : 'Loop: OFF'}
            aria-label="Toggle loop"
          >
            🔁
          </button>

          {/* Volume Group */}
          <div className="nb-audio-volume-group">
            <button
              type="button"
              className="nb-audio-btn nb-audio-btn--mute"
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
              className="nb-audio-volume-slider"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              aria-label="Volume slider"
            />
          </div>

          {/* Speed Selector */}
          <div className="nb-audio-speed-selector">
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                className={`nb-audio-speed-btn ${playbackRate === rate ? 'nb-audio-speed-btn--active' : ''}`}
                onClick={() => changeRate(rate)}
                title={`${rate}x speed`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Stream Stats Panel */}
        {showStats && (
          <div className="nb-audio-stats-panel" data-testid="audio-stream-stats">
            <div className="nb-audio-stats-grid">
              <div><strong>Protocol:</strong> {stats.is206Partial ? 'HTTP 206 Partial Content' : 'HTTP 200'}</div>
              <div><strong>Startup Time:</strong> {stats.startupTimeMs} ms</div>
              <div><strong>Cached Chunks:</strong> {stats.loadedChunks} / {stats.totalChunks} ({formatBytes(stats.loadedBytes)} / {formatBytes(stats.totalBytes)})</div>
              <div><strong>Cache Hits:</strong> {stats.cacheHits} (0s seek latency)</div>
              <div><strong>Encryption:</strong> {stats.isEncrypted ? 'AES-256-GCM (Client-Decrypted)' : 'Session-Gated'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressiveAudioPlayer;
