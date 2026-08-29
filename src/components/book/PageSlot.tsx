import React, { useEffect, useRef, useCallback } from 'react';
import { PageData } from '../../types/notebook';
import {
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
  saveSelection,
  linkifyRecentTyping,
  placeCaretFromPoint,
} from '../../lib/editor/richText';
import {
  BARE_URL_RE,
  buildUrlInsertHTML,
  getIframeSrcForUrl,
} from '../../lib/editor/linkClassifier';
import { processUploadedFileToHTML, escapeHtml } from '../../lib/editor/documentEmbeds';
import { attachHlsToVideo } from '../../lib/media/hlsHelper';

export interface PageSlotProps {
  slot: 'left' | 'right';
  pageData: PageData | null;
  underPageData?: PageData | null;
  isActive: boolean;
  onFocus: () => void;
  onContentChange: (html: string) => void;
  onImageClick?: (img: HTMLElement) => void;
  onMediaUploadStart?: (title: string, icon?: string) => void;
  onMediaUploadProgress?: (percent: number, loadedMB: string, totalMB: string) => void;
  onMediaUploadEnd?: () => void;
  className?: string;
}

export const PageSlot: React.FC<PageSlotProps> = ({
  slot,
  pageData,
  underPageData = null,
  isActive,
  onFocus,
  onContentChange,
  onImageClick,
  onMediaUploadStart,
  onMediaUploadProgress,
  onMediaUploadEnd,
  className = '',
}) => {
  const editableRef = useRef<HTMLDivElement | null>(null);
  const lastPageIdRef = useRef<string | null>(null);
  const isTypingRef = useRef<boolean>(false);

  // Synchronize HTML from props into contenteditable DOM when page identity changes
  // or when external HTML updates while user is not actively typing
  useEffect(() => {
    if (!editableRef.current) return;
    const incomingHtml = pageData?.html || '';
    const currentDomHtml = editableRef.current.innerHTML;

    if (pageData?.id !== lastPageIdRef.current) {
      lastPageIdRef.current = pageData?.id || null;
      editableRef.current.innerHTML = incomingHtml;
    } else if (!isTypingRef.current && incomingHtml !== currentDomHtml) {
      editableRef.current.innerHTML = incomingHtml;
    }
  }, [pageData?.id, pageData?.html]);

  // Attach YouTube-style progressive HLS streaming to all video elements on the page
  useEffect(() => {
    if (!editableRef.current) return;
    const videos = editableRef.current.querySelectorAll<HTMLVideoElement>(
      'video.vintage-video:not([data-hls-attached]), video.nb-live-embed__video:not([data-hls-attached]), video[src]:not([data-hls-attached])'
    );
    videos.forEach((video) => {
      video.setAttribute('data-hls-attached', 'true');
      const source = video.dataset.hlsUrl || video.getAttribute('src') || video.src;
      if (source) {
        attachHlsToVideo(video, source);
      }
    });
  }, [pageData?.id, pageData?.html]);

  // Ensure iframe src inside .nb-live-embed elements are set properly and not left blank
  useEffect(() => {
    if (!editableRef.current) return;
    editableRef.current.querySelectorAll('.nb-live-embed').forEach((embedEl) => {
      const embed = embedEl as HTMLElement;
      const iframe = embed.querySelector('.nb-live-embed__iframe') as HTMLIFrameElement | null;
      const url = embed.dataset.url;
      if (iframe && url) {
        const expectedSrc = getIframeSrcForUrl(url);
        const curSrc = iframe.getAttribute('src') || '';
        if (
          !curSrc ||
          curSrc.includes('undefined') ||
          curSrc === 'about:blank' ||
          curSrc.includes('youtube-nocookie.com') ||
          (url.includes('tradingview.com') && curSrc.includes('/api/proxy')) ||
          (curSrc !== expectedSrc && (url.includes('youtu') || url.includes('tradingview.com')))
        ) {
          iframe.src = expectedSrc;
        }
        iframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; display-capture; fullscreen; geolocation'
        );
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('allowfullscreen', 'true');
      }
    });
  }, [pageData?.html]);

  const handleFocus = () => {
    onFocus();
  };

  const handleInput = useCallback(() => {
    if (!editableRef.current) return;
    isTypingRef.current = true;
    const currentHtml = editableRef.current.innerHTML;
    onContentChange(currentHtml);
    linkifyRecentTyping(editableRef.current);
    setTimeout(() => {
      isTypingRef.current = false;
    }, 100);
  }, [onContentChange]);

  const handleMouseUp = () => {
    if (editableRef.current) {
      saveSelection(editableRef.current);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editableRef.current) {
      saveSelection(editableRef.current);
      if (e.key === ' ' || e.key === 'Enter') {
        linkifyRecentTyping(editableRef.current);
      }
    }
  };

  // Delegated click handler for media, documents, and embed controls
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 1. Presentation Slide Thumbnail Click or Prev/Next Click
    const slideThumb = target.closest('.nb-slide-thumb-container, .nb-slide-thumb') as HTMLElement | null;
    const presNavBtn = target.closest('.nb-presentation-nav-btn') as HTMLElement | null;
    const presContainer = target.closest('.nb-presentation-container') as HTMLElement | null;

    if (presContainer && (slideThumb || presNavBtn)) {
      e.preventDefault();
      e.stopPropagation();

      const encodedSlides = presContainer.dataset.slides || '';
      let slides: any[] = [];
      try {
        slides = JSON.parse(decodeURIComponent(encodedSlides));
      } catch (err) {
        slides = [];
      }

      if (slides.length > 0) {
        const currentIdx = parseInt(presContainer.dataset.currentSlide || '1', 10);
        let targetIdx = currentIdx;

        if (slideThumb) {
          const idxStr = slideThumb.dataset.slideIndex || slideThumb.getAttribute('data-slide-index');
          if (idxStr) targetIdx = parseInt(idxStr, 10);
        } else if (presNavBtn) {
          if (presNavBtn.classList.contains('nb-presentation-prev')) {
            targetIdx = Math.max(1, currentIdx - 1);
          } else if (presNavBtn.classList.contains('nb-presentation-next')) {
            targetIdx = Math.min(slides.length, currentIdx + 1);
          }
        }

        if (targetIdx >= 1 && targetIdx <= slides.length) {
          presContainer.dataset.currentSlide = String(targetIdx);
          const targetSlide = slides[targetIdx - 1];

          // Update active thumbnail
          presContainer.querySelectorAll('.nb-slide-thumb-container, .nb-slide-thumb').forEach((el) => {
            const elIdx = (el as HTMLElement).dataset.slideIndex || el.getAttribute('data-slide-index');
            if (elIdx === String(targetIdx)) {
              el.classList.add('active');
            } else {
              el.classList.remove('active');
            }
          });

          // Update counter
          const counterEl = presContainer.querySelector('.nb-presentation-counter');
          if (counterEl) counterEl.textContent = `Slide ${targetIdx} of ${slides.length}`;

          // Update navigation buttons enabled/disabled state
          const prevBtn = presContainer.querySelector('.nb-presentation-prev') as HTMLButtonElement | null;
          const nextBtn = presContainer.querySelector('.nb-presentation-next') as HTMLButtonElement | null;
          if (prevBtn) prevBtn.disabled = targetIdx <= 1;
          if (nextBtn) nextBtn.disabled = targetIdx >= slides.length;

          // Update slide stage heading and bullets
          const headingEl = presContainer.querySelector('.nb-slide-heading');
          if (headingEl) headingEl.textContent = targetSlide.title || `Slide ${targetIdx}`;

          const bodyEl = presContainer.querySelector('.nb-slide-body');
          if (bodyEl) {
            const bullets = targetSlide.texts || [];
            bodyEl.innerHTML = bullets.map((t: string) => `
              <div class="nb-slide-bullet-row"><span class="nb-slide-dot">◆</span><span class="nb-slide-bullet-text">${escapeHtml(t)}</span></div>`
            ).join('');
          }

          handleInput();
        }
      }
      return;
    }

    // 2. PDF Page Navigation Click
    const pdfNavBtn = target.closest('.nb-pdf-nav-btn') as HTMLElement | null;
    const pdfContainer = target.closest('.nb-pdf-container') as HTMLElement | null;

    if (pdfContainer && pdfNavBtn) {
      e.preventDefault();
      e.stopPropagation();

      const pageCount = parseInt(pdfContainer.dataset.pageCount || '1', 10);
      const curPage = parseInt(pdfContainer.dataset.currentPage || '1', 10);
      let targetPage = curPage;

      if (pdfNavBtn.classList.contains('nb-pdf-prev')) {
        targetPage = Math.max(1, curPage - 1);
      } else if (pdfNavBtn.classList.contains('nb-pdf-next')) {
        targetPage = Math.min(pageCount, curPage + 1);
      }

      if (targetPage !== curPage) {
        pdfContainer.dataset.currentPage = String(targetPage);
        const baseUrl = pdfContainer.dataset.url || '';
        const pageUrl = `${baseUrl}#page=${targetPage}&zoom=100`;

        const objEl = pdfContainer.querySelector('.nb-pdf-object') as HTMLObjectElement | null;
        if (objEl) objEl.data = pageUrl;

        const frameEl = pdfContainer.querySelector('.nb-pdf-frame') as HTMLIFrameElement | null;
        if (frameEl) frameEl.src = pageUrl;

        const badgeEl = pdfContainer.querySelector('.nb-pdf-count-badge');
        if (badgeEl) badgeEl.textContent = `Page ${targetPage} of ${pageCount}`;

        const prevBtn = pdfContainer.querySelector('.nb-pdf-prev') as HTMLButtonElement | null;
        const nextBtn = pdfContainer.querySelector('.nb-pdf-next') as HTMLButtonElement | null;
        if (prevBtn) prevBtn.disabled = targetPage <= 1;
        if (nextBtn) nextBtn.disabled = targetPage >= pageCount;

        handleInput();
      }
      return;
    }

    // C. Live embed controls (Handle before general container clicks)
    const backBtn = target.closest('.nb-live-embed__btn--back');
    if (backBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = backBtn.closest('.nb-live-embed');
      const iframe = embed?.querySelector('.nb-live-embed__iframe') as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        try {
          iframe.contentWindow.postMessage({ type: 'nb-embed-cmd', action: 'back' }, '*');
        } catch (err) {}
      }
      return;
    }

    const fwdBtn = target.closest('.nb-live-embed__btn--forward');
    if (fwdBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = fwdBtn.closest('.nb-live-embed');
      const iframe = embed?.querySelector('.nb-live-embed__iframe') as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        try {
          iframe.contentWindow.postMessage({ type: 'nb-embed-cmd', action: 'forward' }, '*');
        } catch (err) {}
      }
      return;
    }

    const reloadBtn = target.closest('.nb-live-embed__btn--reload');
    if (reloadBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = reloadBtn.closest('.nb-live-embed') as HTMLElement | null;
      if (!embed) return;
      const iframe = embed.querySelector('.nb-live-embed__iframe') as HTMLIFrameElement | null;
      const video = embed.querySelector('.nb-live-embed__video') as HTMLVideoElement | null;
      const url = embed.dataset.url;
      if (iframe && url) {
        const src = getIframeSrcForUrl(url);
        iframe.src = src + (src.includes('?') ? '&' : '?') + '_t=' + Date.now();
      } else if (video && url) {
        video.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
        video.load();
      }
      return;
    }

    const homeBtn = target.closest('.nb-live-embed__btn--home');
    if (homeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = homeBtn.closest('.nb-live-embed') as HTMLElement | null;
      if (!embed) return;
      const iframe = embed.querySelector('.nb-live-embed__iframe') as HTMLIFrameElement | null;
      const url = embed.dataset.url;
      if (iframe && url) {
        iframe.src = getIframeSrcForUrl(url);
        const input = embed.querySelector('.nb-live-embed__address-input') as HTMLInputElement | null;
        if (input) input.value = url;
      }
      return;
    }

    const expandBtn = target.closest('.nb-live-embed__btn--expand');
    if (expandBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = expandBtn.closest('.nb-live-embed');
      if (embed) {
        embed.classList.toggle('nb-live-embed--expanded');
      }
      return;
    }

    const removeBtn = target.closest('.nb-live-embed__btn--remove');
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = removeBtn.closest('.nb-live-embed');
      if (embed) {
        embed.remove();
        handleInput();
      }
      return;
    }

    // 3. Prevent selection only if clicking inside editable text fields or interactive inner buttons
    const isInteractiveInnerControl = target.closest(
      'button, a, input, textarea, select, .nb-live-embed__btn, .nb-live-embed__address-input, .nb-live-embed__resize-handle, .nb-sheet-tab, .nb-spreadsheet-actions, .nb-word-actions, .nb-code-actions'
    );

    if (isInteractiveInnerControl) {
      return;
    }

    // 4. Element Selection (for live embeds, videos, images, audio, documents, and media figures)
    const selectableContainer = target.closest(
      '.nb-live-embed, .nb-media-figure, .media-container, .video-container, .audio-container, .nb-progressive-video-container, .nb-progressive-audio-container, .vintage-video, .nb-code-container, .nb-word-container, .nb-spreadsheet-container, .nb-presentation-container, .nb-pdf-container'
    ) as HTMLElement | null;

    const mediaEl = selectableContainer || (target.closest('img, video, audio, table, figure') as HTMLElement | null);

    if (mediaEl && editableRef.current?.contains(mediaEl)) {
      e.preventDefault();
      e.stopPropagation();
      onImageClick?.(mediaEl);
      return;
    }
  };

  // Delegated mousedown / pointerdown handler for live embed height resizing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const targetEl = e.target as HTMLElement;
    const handle = targetEl.closest('.nb-live-embed__resize-handle');
    if (!handle) return;
    e.preventDefault();
    e.stopPropagation();

    const embed = handle.closest('.nb-live-embed') as HTMLElement | null;
    if (!embed) return;
    const wrap = embed.querySelector('.nb-live-embed__frame-wrap') as HTMLElement | null;
    const iframe = embed.querySelector('.nb-live-embed__iframe') as HTMLElement | null;
    if (!wrap) return;

    if (iframe) iframe.style.pointerEvents = 'none';
    const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const startY = clientY;
    const startH = wrap.offsetHeight;

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const currentY = 'touches' in ev && ev.touches[0] ? ev.touches[0].clientY : (ev as MouseEvent).clientY;
      const newH = Math.max(180, Math.min(1200, startH + (currentY - startY)));
      wrap.style.height = newH + 'px';
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      if (iframe) iframe.style.pointerEvents = '';
      handleInput();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  // Delegated keydown for address input in live embeds
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = (e.target as HTMLElement).closest('.nb-live-embed__address-input') as HTMLInputElement | null;
    if (input && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const embed = input.closest('.nb-live-embed') as HTMLElement | null;
      if (!embed) return;
      const iframe = embed.querySelector('.nb-live-embed__iframe') as HTMLIFrameElement | null;
      let val = input.value.trim();
      if (!val) return;
      if (!/^https?:\/\//i.test(val) && !val.includes('.') && !val.includes('/')) {
        val = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(val);
      } else if (!/^https?:\/\//i.test(val)) {
        val = 'https://' + val;
      }
      embed.dataset.url = val;
      input.value = val;
      const openBtn = embed.querySelector('.nb-live-embed__btn--open') as HTMLAnchorElement | null;
      if (openBtn) openBtn.href = val;
      if (iframe) iframe.src = getIframeSrcForUrl(val);
      handleInput();
    }
  };

  // Paste handler: auto-detect plain URLs and files
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboard = e.clipboardData || (window as any).clipboardData;
    if (!clipboard) return;

    // Check for clipboard files
    const file = clipboard.files && clipboard.files[0];
    if (file) {
      e.preventDefault();
      onFocus();
      if (!editableRef.current) return;
      const totalMBStr = (file.size / (1024 * 1024)).toFixed(1);
      onMediaUploadStart?.(`Uploading ${file.name} (${totalMBStr} MB)...`, '📄');
      try {
        const html = await processUploadedFileToHTML(file, (percent, loadedMB, totalMB) => {
          onMediaUploadProgress?.(percent, loadedMB, totalMB);
        });
        editableRef.current.focus();
        document.execCommand('insertHTML', false, html);
        handleInput();
      } catch (err: any) {
        alert('Could not paste file: ' + err.message);
      } finally {
        onMediaUploadEnd?.();
      }
      return;
    }

    const text = clipboard.getData('text/plain');
    const trimmed = text ? text.trim() : '';

    if (trimmed && BARE_URL_RE.test(trimmed)) {
      e.preventDefault();
      onFocus();
      if (editableRef.current) {
        editableRef.current.focus();
        try {
          const html = await buildUrlInsertHTML(trimmed);
          document.execCommand('insertHTML', false, html);
          handleInput();
        } catch (err) {
          const fallback = `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>`;
          document.execCommand('insertHTML', false, fallback);
          handleInput();
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFocus();
    if (!editableRef.current) return;

    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      placeCaretFromPoint(e.clientX, e.clientY, editableRef.current);
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name);
      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name);
      const isImage = file.type.startsWith('image/');
      const icon = isImage ? '🖼' : isVideo ? '🎬' : isAudio ? '🎵' : '📄';
      const totalMBStr = (file.size / (1024 * 1024)).toFixed(1);

      onMediaUploadStart?.(`Uploading ${file.name} (${totalMBStr} MB)...`, icon);

      try {
        const html = await processUploadedFileToHTML(file, (percent, loadedMB, totalMB) => {
          onMediaUploadProgress?.(percent, loadedMB, totalMB);
        });
        editableRef.current.focus();
        document.execCommand('insertHTML', false, html);
        handleInput();
      } catch (err: any) {
        alert('Could not upload file: ' + err.message);
      } finally {
        onMediaUploadEnd?.();
      }
      return;
    }

    const text = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    const trimmed = text ? text.trim() : '';
    if (trimmed && BARE_URL_RE.test(trimmed)) {
      placeCaretFromPoint(e.clientX, e.clientY, editableRef.current);
      try {
        const html = await buildUrlInsertHTML(trimmed);
        editableRef.current.focus();
        document.execCommand('insertHTML', false, html);
        handleInput();
      } catch (err) {
        const linkHtml = `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
        handleInput();
      }
    }
  };

  const slotId = slot === 'left' ? 'slotLeft' : 'slotRight';
  const pageId = slot === 'left' ? 'leftPage' : 'rightPage';
  const underId = slot === 'left' ? 'underLeft' : 'underRight';

  return (
    <div
      id={slotId}
      className={`page-slot slot-${slot} ${isActive ? 'active-slot' : ''} ${className}`}
      data-slot={slot}
    >
      <div
        id={underId}
        className="page under"
        style={{
          fontFamily: underPageData?.font || DEFAULT_FONT,
          fontSize: underPageData?.fontSize || DEFAULT_FONT_SIZE,
        }}
        dangerouslySetInnerHTML={{ __html: underPageData?.html || '' }}
      />

      <div
        id={pageId}
        ref={editableRef}
        className="page current"
        contentEditable={true}
        spellCheck={false}
        data-slot={slot}
        style={{
          fontFamily: pageData?.font || DEFAULT_FONT,
          fontSize: pageData?.fontSize || DEFAULT_FONT_SIZE,
        }}
        onFocus={handleFocus}
        onInput={handleInput}
        onMouseUp={handleMouseUp}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
};

export default PageSlot;
