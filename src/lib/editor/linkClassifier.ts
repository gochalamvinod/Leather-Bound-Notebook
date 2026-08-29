/**
 * URL Classification and Embed Utilities for Leatherbound Notebook.
 *
 * Handles parsing, classification, and embed source resolution for:
 * - YouTube (watch, shorts, embed, youtu.be, nocookie, mobile)
 * - Vimeo (direct ID, channels, groups, player)
 * - Cloud Docs (Google Drive preview, Google Docs/Sheets/Slides preview, Dropbox raw=1)
 * - TradingView interactive widget charts
 * - Direct video, audio & image file streams
 * - Generic web URLs routing through streaming proxy (/api/proxy?url=...)
 */

export const BARE_URL_RE = /^https?:\/\/\S+$/i;
export const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|avif)(\?[^\s]*)?(#.*)?$/i;
export const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?[^\s]*)?(#.*)?$/i;
export const AUDIO_EXT_RE = /\.(mp3|wav|ogg|oga|flac|aac|m4a)(\?[^\s]*)?(#.*)?$/i;

export interface CloudDocDetails {
  type: 'gdrive' | 'gdocs' | 'dropbox';
  id: string;
  embedUrl: string;
}

export type UrlClassificationType =
  | 'image'
  | 'video'
  | 'audio'
  | 'youtube'
  | 'vimeo'
  | 'cloud'
  | 'tradingview'
  | 'link';

export interface ClassifiedUrl {
  type: UrlClassificationType;
  id?: string;
  details?: CloudDocDetails | any;
}

export interface LinkCardMetadata {
  title?: string;
  description?: string;
  image?: string | null;
  domain?: string;
  url?: string;
}

/**
 * Escapes special HTML characters for safe innerHTML injection.
 */
export function escapeHtml(s: string | null | undefined): string {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
}

/**
 * Escapes special attribute characters for safe HTML attributes.
 */
export function escapeAttr(s: string | null | undefined): string {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Extracts YouTube video ID from various YouTube URL formats.
 */
export function parseYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./i, '').replace(/^m\./i, '');
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0].split('?')[0];
      if (id && /^[\w-]{6,}$/.test(id)) return id;
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v');
      if (v && /^[\w-]{6,}$/.test(v)) return v;
      const matchV = trimmed.match(/[?&]v=([\w-]{6,})/i);
      if (matchV) return matchV[1];
      const m = u.pathname.match(/^\/(?:shorts|embed|v)\/([\w-]{6,})/i);
      if (m) return m[1];
    }
  } catch (e) {
    // Fallback regex for non-standard / relative URLs
  }
  const m = trimmed.match(
    /(?:youtube\.com\/(?:.*[?&]v=|shorts\/|embed\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{6,})/i
  );
  return m ? m[1] : null;
}

/**
 * Extracts Vimeo video ID from various Vimeo URL patterns.
 */
export function parseVimeoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(
    /(?:vimeo\.com\/(?:video\/|channels\/(?:\w+\/)?|groups\/[^/]+\/videos\/)?|player\.vimeo\.com\/video\/)(\d+)/i
  );
  return m ? m[1] : null;
}

/**
 * Parses Google Drive, Google Docs/Sheets/Slides, or Dropbox URLs into embed formats.
 */
export function parseCloudDoc(url: string | null | undefined): CloudDocDetails | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, '');

    // Google Drive files
    if (host === 'drive.google.com') {
      const fileMatch = u.pathname.match(/\/file\/d\/([\w-]+)/i);
      if (fileMatch) {
        return {
          type: 'gdrive',
          id: fileMatch[1],
          embedUrl: `https://drive.google.com/file/d/${fileMatch[1]}/preview`,
        };
      }
      const idParam = u.searchParams.get('id');
      if (idParam) {
        return {
          type: 'gdrive',
          id: idParam,
          embedUrl: `https://drive.google.com/file/d/${idParam}/preview`,
        };
      }
    }

    // Google Docs / Sheets / Slides
    if (host === 'docs.google.com') {
      const docMatch = u.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([\w-]+)/i);
      if (docMatch) {
        const docType = docMatch[1];
        const docId = docMatch[2];
        return {
          type: 'gdocs',
          id: docId,
          embedUrl: `https://docs.google.com/${docType}/d/${docId}/preview`,
        };
      }
    }

    // Dropbox
    if (host === 'dropbox.com') {
      const isDropboxPath = /^\/(s|scl\/fi|sh)\//i.test(u.pathname);
      if (isDropboxPath) {
        const uClone = new URL(url);
        uClone.searchParams.delete('dl');
        uClone.searchParams.set('raw', '1');
        return {
          type: 'dropbox',
          id: u.pathname,
          embedUrl: uClone.toString(),
        };
      }
    }
  } catch (e) {
    // Non-standard URL
  }
  return null;
}

/**
 * Parses TradingView charts and returns official widget embed URL.
 */
export function parseTradingViewUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    if (host.includes('tradingview.com') || host.includes('tradingview-widget.com')) {
      let symbol = u.searchParams.get('symbol');
      if (!symbol) {
        const symMatch = u.pathname.match(/\/symbols\/([^/]+)/i);
        if (symMatch) {
          symbol = symMatch[1].replace('-', ':');
        }
      }
      if (!symbol) symbol = 'AAPL';
      const interval = u.searchParams.get('interval') || 'D';
      const theme = u.searchParams.get('theme') || 'dark';
      return `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
        symbol
      )}&interval=${encodeURIComponent(
        interval
      )}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=1f2b23&studies=[]&theme=${theme}&style=1&timezone=exchange`;
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

/**
 * Classifies a URL into a recognized content type.
 */
export function classifyUrl(url: string | null | undefined): ClassifiedUrl {
  if (!url || typeof url !== 'string') return { type: 'link' };
  if (IMAGE_EXT_RE.test(url)) return { type: 'image' };
  if (VIDEO_EXT_RE.test(url)) return { type: 'video' };
  if (AUDIO_EXT_RE.test(url)) return { type: 'audio' };
  const ytId = parseYouTubeId(url);
  if (ytId) return { type: 'youtube', id: ytId };
  const cloudDoc = parseCloudDoc(url);
  if (cloudDoc) return { type: 'cloud', details: cloudDoc };
  const vimeoId = parseVimeoId(url);
  if (vimeoId) return { type: 'vimeo', id: vimeoId };
  return { type: 'link' };
}

/**
 * Returns the destination iframe `src` for a given URL, transforming YouTube,
 * Vimeo, Cloud Docs, TradingView, or routing through streaming proxy.
 */
export function getIframeSrcForUrl(url: string | null | undefined): string {
  if (!url) return '/api/proxy?url=about:blank';
  const trimmed = url.trim();
  if (!trimmed) return '/api/proxy?url=about:blank';

  // YouTube embed (using standard www.youtube.com so user's Google/YouTube account session works)
  const ytId = parseYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`;
  }

  // Cloud Docs (Google Drive, GDocs, Dropbox)
  const cloudDoc = parseCloudDoc(trimmed);
  if (cloudDoc && cloudDoc.embedUrl) {
    return cloudDoc.embedUrl;
  }

  // TradingView interactive charts widget
  const tvEmbed = parseTradingViewUrl(trimmed);
  if (tvEmbed) {
    return tvEmbed;
  }

  // Root YouTube portal
  if (/^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/?$/i.test(trimmed)) {
    return '/api/portal/youtube';
  }

  // Google Search portal
  if (/^(?:https?:\/\/)?(?:www\.)?google\.com\/?$/i.test(trimmed)) {
    return '/api/portal/search';
  }
  const googleSearchMatch = trimmed.match(/(?:google\.com\/search\?(?:.*&)?q=)([^&]+)/i);
  if (googleSearchMatch) {
    return '/api/portal/search?q=' + encodeURIComponent(googleSearchMatch[1]);
  }

  // Vimeo player
  const vimeoId = parseVimeoId(trimmed);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }

  // Generic website streaming proxy
  return '/api/proxy?url=' + encodeURIComponent(trimmed);
}

/**
 * Generates live embed container HTML string with mini-browser controls and iframe.
 */
export function buildLiveEmbedHTML(
  url: string,
  title?: string,
  domain?: string,
  icon: string = '🌐'
): string {
  const safeUrl = escapeAttr(url);
  const safeTitle = escapeHtml((title || url).slice(0, 120));
  const safeDomain = escapeHtml(domain || '');
  const iframeSrc = getIframeSrcForUrl(url);

  return (
    `<div class="nb-live-embed" contenteditable="false" data-url="${safeUrl}">` +
      `<div class="nb-live-embed__bar">` +
        `<div class="nb-live-embed__nav-group">` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--back" title="Back">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>` +
          `</button>` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--forward" title="Forward">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>` +
          `</button>` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--reload" title="Reload">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>` +
          `</button>` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--home" title="Original Page">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` +
          `</button>` +
        `</div>` +
        `<div class="nb-live-embed__omnibox">` +
          `<span class="nb-live-embed__icon">${icon}</span>` +
          `<input type="text" class="nb-live-embed__address-input" value="${safeUrl}" title="Type a URL or search query and press Enter" placeholder="Enter URL or search..." />` +
        `</div>` +
        (domain ? `<span class="nb-live-embed__title" style="display:none;">${safeTitle}</span><span class="nb-live-embed__domain" style="display:none;">${safeDomain}</span>` : '') +
        `<div class="nb-live-embed__action-group">` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--expand" title="Expand / Fullscreen">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>` +
          `</button>` +
          `<a class="nb-live-embed__btn nb-live-embed__btn--open" href="${safeUrl}" target="_blank" rel="noopener noreferrer" title="Open in new tab">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>` +
          `</a>` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--remove" title="Remove embed">` +
            `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` +
          `</button>` +
        `</div>` +
      `</div>` +
      `<div class="nb-live-embed__frame-wrap">` +
        `<iframe class="nb-live-embed__iframe" src="${escapeAttr(iframeSrc)}" loading="eager" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; display-capture; fullscreen; geolocation" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` +
      `</div>` +
      `<div class="nb-live-embed__resize-handle" title="Drag to resize height"></div>` +
    `</div><br>`
  );
}

/**
 * Generates direct video embed container HTML string with mini-browser bar and video tag.
 */
export function buildDirectVideoEmbedHTML(url: string, title?: string): string {
  const safeUrl = escapeAttr(url);
  const safeTitle = escapeHtml((title || 'Video').slice(0, 120));

  return (
    `<div class="nb-live-embed nb-live-embed--video" contenteditable="false" data-url="${safeUrl}">` +
      `<div class="nb-live-embed__bar">` +
        `<span class="nb-live-embed__icon">🎬</span>` +
        `<span class="nb-live-embed__info">` +
          `<span class="nb-live-embed__title">${safeTitle}</span>` +
          `<span class="nb-live-embed__domain">HTML5 Video</span>` +
        `</span>` +
        `<button class="nb-live-embed__btn nb-live-embed__btn--reload" title="Reload video">` +
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>` +
        `</button>` +
        `<button class="nb-live-embed__btn nb-live-embed__btn--expand" title="Expand / Fullscreen">` +
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>` +
        `</button>` +
        `<a class="nb-live-embed__btn nb-live-embed__btn--open" href="${safeUrl}" target="_blank" rel="noopener noreferrer" title="Open in new tab">` +
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>` +
        `</a>` +
        `<button class="nb-live-embed__btn nb-live-embed__btn--remove" title="Remove embed">` +
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` +
        `</button>` +
      `</div>` +
      `<div class="nb-live-embed__frame-wrap">` +
        `<video class="nb-live-embed__video" src="${safeUrl}" controls preload="metadata" playsinline></video>` +
      `</div>` +
    `</div><br>`
  );
}

/**
 * Generates direct audio embed container HTML string with vintage audio player.
 */
export function buildDirectAudioEmbedHTML(url: string): string {
  const safeUrl = escapeAttr(url);
  return `<div class="media-container audio-container" contenteditable="false"><audio class="vintage-audio" controls src="${safeUrl}"></audio></div><br>`;
}

/**
 * Generates OpenGraph preview card HTML string.
 */
export function buildPreviewCardHTML(url: string, meta?: LinkCardMetadata): string {
  const safeUrl = escapeAttr(url);
  let title = meta?.title || url;
  let desc = meta?.description || '';
  let image = meta?.image || '';
  let domain = meta?.domain || '';

  if (!domain) {
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
      if (!title || title === url) title = domain;
    } catch (e) {
      domain = '';
    }
  }

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(desc);
  const safeDomain = escapeHtml(domain);

  const thumbHtml = image
    ? `<img class="nb-link-card__thumb" src="${escapeAttr(image)}" alt="" />`
    : `<span class="nb-link-card__thumb--placeholder">📰</span>`;
  const descHtml = safeDesc ? `<div class="nb-link-card__desc">${safeDesc}</div>` : '';

  return (
    `<a class="nb-link-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer" contenteditable="false">` +
      thumbHtml +
      `<div class="nb-link-card__body">` +
        `<div class="nb-link-card__title">${safeTitle}</div>` +
        descHtml +
        `<div class="nb-link-card__domain">${safeDomain} <span class="nb-link-card__domain-dot">•</span> Preview Card</div>` +
      `</div>` +
      `<span class="nb-link-card__arrow">↗</span>` +
    `</a><br>`
  );
}

/**
 * High-level HTML insert builder that classifies URL and generates the appropriate
 * HTML snippet (Image, Video, Audio, YouTube, Vimeo, Cloud Doc, or Live Embed).
 */
export async function buildUrlInsertHTML(url: string): Promise<string> {
  const safeUrl = escapeAttr(url);
  const kind = classifyUrl(url);

  if (kind.type === 'image') {
    return `<img src="${safeUrl}" alt="" />`;
  }
  if (kind.type === 'video') {
    const fileName = url.split('/').pop()?.split('?')[0] || 'Video';
    return buildDirectVideoEmbedHTML(url, fileName);
  }
  if (kind.type === 'audio') {
    return buildDirectAudioEmbedHTML(url);
  }
  if (kind.type === 'youtube') {
    return buildLiveEmbedHTML(url, 'YouTube Video', 'youtube.com', '🎥');
  }
  if (kind.type === 'vimeo') {
    return buildLiveEmbedHTML(url, 'Vimeo Video', 'vimeo.com', '🎥');
  }
  if (kind.type === 'cloud') {
    const details = kind.details as CloudDocDetails;
    const docName =
      details?.type === 'gdrive'
        ? 'Google Drive File'
        : details?.type === 'gdocs'
        ? 'Google Document'
        : 'Cloud Document';
    const domain = details?.type === 'dropbox' ? 'dropbox.com' : 'google.com';
    return buildLiveEmbedHTML(url, docName, domain, '📁');
  }

  // Generic website link — try fetching metadata for nice title & domain
  let title = url;
  let domain = '';
  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
    title = domain;
  } catch (e) {
    /* ignore */
  }

  try {
    const res = await fetch('/api/link-preview?url=' + encodeURIComponent(url));
    const data = await res.json();
    if (data && data.ok) {
      title = data.title || title;
      domain = data.domain || domain;
    }
  } catch (err) {
    /* ignore network failure */
  }

  return buildLiveEmbedHTML(url, title, domain, '🌐');
}
