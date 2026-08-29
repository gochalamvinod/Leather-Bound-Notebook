/**
 * YouTube-Style Lightweight HLS Streaming Helper
 *
 * Configures HLS.js with minimal memory and CPU footprints:
 * - Offloads demuxing and decoding to background Web Worker.
 * - Slashing buffer size to 25MB max to prevent RAM saturation.
 * - Only buffers 8-15 seconds ahead of current playback.
 * - Flushes expired backwards buffers to keep memory flat throughout multi-hour videos.
 */

import Hls from 'hls.js';

export interface HlsAttachResult {
  hls: Hls | null;
  destroy: () => void;
}

const activeHlsInstances = new WeakMap<HTMLVideoElement, Hls>();

/**
 * Converts a raw media URL (e.g. /images/abc.mp4 or /media/abc.mp4) to its HLS playlist URL.
 */
export function getHlsPlaylistUrl(mediaUrl: string): string {
  if (!mediaUrl) return '';
  if (mediaUrl.includes('.m3u8') || mediaUrl.includes('/hls/')) return mediaUrl;
  return '';
}

/**
 * Attaches HLS.js stream controller only for true HLS (.m3u8) streams,
 * and configures native hardware-accelerated byte-range streaming for MP4/WebM/Audio files.
 */
export function attachHlsToVideo(
  videoEl: HTMLVideoElement,
  sourceUrl: string
): HlsAttachResult {
  if (!videoEl || !sourceUrl) {
    return { hls: null, destroy: () => {} };
  }

  // Cleanup any previous Hls instance on this video element
  const existingHls = activeHlsInstances.get(videoEl);
  if (existingHls) {
    try {
      existingHls.destroy();
    } catch {}
    activeHlsInstances.delete(videoEl);
  }

  const isHlsStream = Boolean(
    sourceUrl.includes('.m3u8') ||
    sourceUrl.includes('/hls/') ||
    (videoEl.dataset && videoEl.dataset.hlsUrl && videoEl.dataset.hlsUrl.includes('.m3u8'))
  );

  // 1. For MP4, WebM, MOV, and direct media files: Use Native HTML5 Video Range Streaming
  if (!isHlsStream) {
    const currentSrc = videoEl.getAttribute('src') || videoEl.src || '';
    if (!currentSrc || (!currentSrc.includes(sourceUrl) && currentSrc !== sourceUrl)) {
      videoEl.src = sourceUrl;
    }
    videoEl.preload = 'metadata';
    videoEl.playsInline = true;
    videoEl.crossOrigin = 'anonymous';

    return {
      hls: null,
      destroy: () => {
        // No-op for native stream
      },
    };
  }

  const hlsUrl = sourceUrl;

  // 2. HLS.js supported (Chrome, Firefox, Edge, Android, etc. for .m3u8 streams)
  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 8, // Buffers only 8 seconds ahead of playhead
      maxMaxBufferLength: 16, // Strict ceiling of 16 seconds
      maxBufferSize: 25 * 1024 * 1024, // 25MB max memory limit
      backBufferLength: 8, // Flushes expired past segments to keep RAM strictly constant
      maxBufferHole: 0.5, // Leaps across timeline gaps instantly when seeking across multi-hour videos
      highBufferWatchdogPeriod: 2,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 3,
      fragLoadingTimeOut: 15000,
      manifestLoadingTimeOut: 15000,
      startFragPrefetch: true, // Prefetches only the destination fragment on seek
      testBandwidth: false, // Prevents downloading unneeded test chunks
      progressive: true,
      autoStartLoad: true,
      xhrSetup: (xhr) => {
        xhr.withCredentials = true;
      },
    });

    hls.loadSource(hlsUrl);
    hls.attachMedia(videoEl);
    activeHlsInstances.set(videoEl, hls);

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.warn('[HLS] Network error encountered, recovering...', data);
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn('[HLS] Media error encountered, recovering...', data);
            hls.recoverMediaError();
            break;
          default:
            console.warn('[HLS] Fatal error, falling back to native stream...', data);
            hls.destroy();
            activeHlsInstances.delete(videoEl);
            videoEl.src = sourceUrl;
            break;
        }
      }
    });

    const destroy = () => {
      try {
        hls.destroy();
      } catch {}
      activeHlsInstances.delete(videoEl);
    };

    return { hls, destroy };
  }

  // 3. Native Apple HLS support (Safari on macOS / iOS)
  if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.src = hlsUrl;
    return {
      hls: null,
      destroy: () => {
        videoEl.removeAttribute('src');
      },
    };
  }

  // Fallback: direct src assignment
  videoEl.src = sourceUrl;
  return {
    hls: null,
    destroy: () => {
      videoEl.removeAttribute('src');
    },
  };
}
