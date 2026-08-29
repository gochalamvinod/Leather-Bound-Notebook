import { parseSpreadsheetBuffer, parseDocxBuffer, parsePptxBuffer, parsePdfBuffer, detectLanguageFromExt, tokenizeLine } from '../../components/media/DocumentRenderers';
import { uploadLargeMediaFile, uploadImageFile, extractVideoPoster } from './imageResizer';
import { getHlsPlaylistUrl } from '../media/hlsHelper';

export function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildCodeEmbedHTML(filename: string, code: string, fileUrl?: string): string {
  const lang = detectLanguageFromExt(filename);
  const lines = (code || '').split(/\r?\n/);
  const totalLines = lines.length;
  const maxDisplay = Math.min(300, totalLines);

  const linesHtml = lines.slice(0, maxDisplay).map((line, idx) => {
    const tokens = tokenizeLine(line, lang);
    const tokHtml = tokens.map((t) => `<span class="tok-${t.type}">${escapeHtml(t.text)}</span>`).join('');
    return `<tr class="nb-code-line"><td class="nb-code-gutter">${idx + 1}</td><td class="nb-code-content">${tokHtml || '<br>'}</td></tr>`;
  }).join('');

  return `<div class="nb-document-viewer nb-code-container" data-filename="${escapeHtml(filename)}" data-lang="${lang}" data-code="${escapeHtml(code)}" ${fileUrl ? `data-url="${fileUrl}"` : ''} contenteditable="false">
    <div class="nb-code-header">
      <div class="nb-code-title">
        <span class="nb-code-icon">💻</span>
        <span class="nb-code-filename">${escapeHtml(filename)}</span>
        <span class="nb-code-lang-badge">${lang.toUpperCase()}</span>
        <span class="nb-code-lines-badge">${totalLines.toLocaleString()} lines</span>
      </div>
      <div class="nb-code-actions">
        ${fileUrl ? `<a href="${fileUrl}" download="${escapeHtml(filename)}" class="nb-code-btn" title="Download">⬇️</a>` : ''}
      </div>
    </div>
    <div class="nb-code-body">
      <div class="nb-code-scroll-content">
        <table class="nb-code-table">
          <tbody>${linesHtml}</tbody>
        </table>
      </div>
    </div>
  </div><p><br></p>`;
}

export function buildPdfEmbedHTML(filename: string, fileUrl: string, pageCount: number = 1): string {
  return `<div class="nb-document-viewer nb-pdf-container" data-filename="${escapeHtml(filename)}" data-url="${fileUrl}" data-page-count="${pageCount}" data-current-page="1" contenteditable="false">
    <div class="nb-pdf-header">
      <div class="nb-pdf-title">
        <span class="nb-doc-icon">📕</span>
        <span class="nb-doc-filename">${escapeHtml(filename)}</span>
      </div>
      <div class="nb-pdf-nav-group">
        <button type="button" class="nb-pdf-nav-btn nb-pdf-prev" title="Previous Page" ${pageCount <= 1 ? 'disabled' : ''}>◀</button>
        <span class="nb-pdf-count-badge">Page 1 of ${pageCount}</span>
        <button type="button" class="nb-pdf-nav-btn nb-pdf-next" title="Next Page" ${pageCount <= 1 ? 'disabled' : ''}>▶</button>
      </div>
      <div class="nb-pdf-actions">
        <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="nb-code-btn" title="Open in New Tab">↗ Open</a>
        <a href="${fileUrl}" download="${escapeHtml(filename)}" class="nb-code-btn" title="Download PDF">⬇️ Download</a>
      </div>
    </div>
    <div class="nb-pdf-stage">
      <div class="nb-pdf-frame-wrapper" style="width: 100%;">
        <object data="${fileUrl}#page=1&zoom=100" type="application/pdf" class="nb-pdf-object" title="${escapeHtml(filename)}">
          <iframe src="${fileUrl}#page=1&zoom=100" class="nb-pdf-frame" title="${escapeHtml(filename)}">
            <div class="nb-pdf-fallback">
              <p>PDF Document (${pageCount} pages)</p>
              <a href="${fileUrl}" download="${escapeHtml(filename)}" class="nb-code-btn">Download ${escapeHtml(filename)}</a>
            </div>
          </iframe>
        </object>
      </div>
    </div>
  </div><p><br></p>`;
}

export function buildSpreadsheetEmbedHTML(filename: string, fileUrl: string, rows: string[][]): string {
  const headerRow = rows[0] || [];
  const bodyRows = rows.slice(1, 100); // Initial 100 rows preview
  const maxCols = Math.max(1, headerRow.length);

  const getColLetter = (index: number): string => {
    let letter = '';
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  const colLettersHtml = Array.from({ length: maxCols })
    .map((_, i) => `<th class="nb-sheet-col-letter">${getColLetter(i)}</th>`)
    .join('');

  const headerHtml = headerRow.length > 0 ? `
    <tr class="nb-spreadsheet-header-row">
      <th class="nb-sheet-row-num">1</th>
      ${headerRow.map((c) => `<th class="nb-sheet-header-cell">${escapeHtml(c || '')}</th>`).join('')}
    </tr>` : '';

  const bodyHtml = bodyRows.map((r, rIdx) => `
    <tr class="nb-spreadsheet-row">
      <td class="nb-sheet-row-num">${rIdx + 2}</td>
      ${Array.from({ length: maxCols }).map((_, cIdx) => `<td class="nb-sheet-cell">${escapeHtml(r[cIdx] || '')}</td>`).join('')}
    </tr>`
  ).join('');

  return `<div class="nb-document-viewer nb-spreadsheet-container" data-filename="${escapeHtml(filename)}" data-url="${fileUrl}" contenteditable="false">
    <div class="nb-spreadsheet-header">
      <div class="nb-spreadsheet-title">
        <span class="nb-doc-icon">📊</span>
        <span class="nb-doc-filename">${escapeHtml(filename)}</span>
        <span class="nb-spreadsheet-rowcount">${rows.length.toLocaleString()} rows • ${maxCols} cols</span>
      </div>
      <div class="nb-spreadsheet-actions">
        <a href="${fileUrl}" download="${escapeHtml(filename)}" class="nb-code-btn" title="Download Excel">⬇️ Download</a>
      </div>
    </div>
    <div class="nb-spreadsheet-viewport">
      <table class="nb-spreadsheet-table">
        <thead>
          <tr class="nb-spreadsheet-col-letters"><th class="nb-sheet-corner"></th>${colLettersHtml}</tr>
          ${headerHtml}
        </thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>
  </div><p><br></p>`;
}

export function buildWordEmbedHTML(filename: string, fileUrl: string, paragraphs: any[]): string {
  const wordCount = paragraphs.reduce((acc, p) => {
    if (p.text) return acc + p.text.trim().split(/\s+/).filter(Boolean).length;
    if (p.tableData) {
      return acc + p.tableData.flat().reduce((cAcc: number, cell: string) => cAcc + cell.trim().split(/\s+/).filter(Boolean).length, 0);
    }
    return acc;
  }, 0);

  const bodyHtml = paragraphs.slice(0, 100).map((p) => {
    if (p.type === 'table' && p.tableData) {
      const rows = p.tableData.map((row: string[], rIdx: number) => {
        const rowTag = rIdx === 0 ? 'th' : 'td';
        return `<tr>${row.map((cell) => `<${rowTag}>${escapeHtml(cell)}</${rowTag}>`).join('')}</tr>`;
      }).join('');
      return `<table class="nb-word-table"><tbody>${rows}</tbody></table>`;
    }

    const styleParts = [
      p.bold || p.type === 'h1' || p.type === 'h2' ? 'font-weight:bold;' : '',
      p.italic ? 'font-style:italic;' : '',
      p.underline ? 'text-decoration:underline;' : '',
      p.strike ? 'text-decoration:line-through;' : '',
      p.align && p.align !== 'left' ? `text-align:${p.align};` : '',
    ].filter(Boolean).join(' ');

    const styleAttr = styleParts ? ` style="${styleParts}"` : '';

    if (p.type === 'h1') return `<h1 class="nb-word-h1"${styleAttr}>${escapeHtml(p.text || '')}</h1>`;
    if (p.type === 'h2') return `<h2 class="nb-word-h2"${styleAttr}>${escapeHtml(p.text || '')}</h2>`;
    if (p.type === 'h3') return `<h3 class="nb-word-h3"${styleAttr}>${escapeHtml(p.text || '')}</h3>`;
    if (p.type === 'h4') return `<h4 class="nb-word-h4"${styleAttr}>${escapeHtml(p.text || '')}</h4>`;
    if (p.type === 'h5') return `<h5 class="nb-word-h5"${styleAttr}>${escapeHtml(p.text || '')}</h5>`;
    if (p.type === 'h6') return `<h6 class="nb-word-h6"${styleAttr}>${escapeHtml(p.text || '')}</h6>`;
    if (p.type === 'numbered') return `<div class="nb-word-numbered-item"${styleAttr}><span class="nb-word-num-bullet">1.</span><span>${escapeHtml(p.text || '')}</span></div>`;
    if (p.type === 'bullet') return `<li class="nb-word-bullet"${styleAttr}>${escapeHtml(p.text || '')}</li>`;
    return `<p class="nb-word-p"${styleAttr}>${escapeHtml(p.text || '')}</p>`;
  }).join('');

  return `<div class="nb-document-viewer nb-word-container" data-filename="${escapeHtml(filename)}" data-url="${fileUrl}" contenteditable="false">
    <div class="nb-word-header">
      <div class="nb-word-title">
        <span class="nb-doc-icon">📝</span>
        <span class="nb-doc-filename">${escapeHtml(filename)}</span>
        <span class="nb-word-count-badge">${wordCount.toLocaleString()} words</span>
      </div>
      <div class="nb-word-actions">
        <a href="${fileUrl}" download="${escapeHtml(filename)}" class="nb-code-btn" title="Download Word Document">⬇️ Download</a>
      </div>
    </div>
    <div class="nb-word-parchment-body">${bodyHtml}</div>
  </div><p><br></p>`;
}

export function buildPresentationEmbedHTML(filename: string, fileUrl: string, slides: any[]): string {
  const safeSlides = Array.isArray(slides) && slides.length > 0 ? slides : [{ slideNumber: 1, title: filename, texts: [] }];
  const firstSlide = safeSlides[0];
  const bulletsHtml = (firstSlide.texts || []).map((t: string) => `
    <div class="nb-slide-bullet-row"><span class="nb-slide-dot">◆</span><span class="nb-slide-bullet-text">${escapeHtml(t)}</span></div>`
  ).join('');

  const thumbsHtml = safeSlides.map((s: any, idx: number) => `
    <div class="nb-slide-thumb-container ${idx === 0 ? 'active' : ''}" data-slide-index="${idx + 1}">
      <div class="nb-slide-thumb ${idx === 0 ? 'active' : ''}" data-slide-index="${idx + 1}">
        <div class="nb-thumb-header"><span class="nb-thumb-num">${idx + 1}</span></div>
        <div class="nb-thumb-preview">${escapeHtml(s.title || `Slide ${idx + 1}`)}</div>
      </div>
    </div>
  `).join('');

  const encodedSlides = encodeURIComponent(JSON.stringify(safeSlides));

  return `<div class="nb-document-viewer nb-presentation-container" data-filename="${escapeHtml(filename)}" data-url="${fileUrl}" data-slides="${encodedSlides}" data-current-slide="1" contenteditable="false">
    <div class="nb-presentation-header">
      <div class="nb-presentation-title">
        <span class="nb-doc-icon">📽</span>
        <span class="nb-doc-filename">${escapeHtml(filename)}</span>
      </div>
      <div class="nb-presentation-nav-group">
        <button type="button" class="nb-presentation-nav-btn nb-presentation-prev" title="Previous Slide" ${safeSlides.length <= 1 ? 'disabled' : ''}>◀</button>
        <span class="nb-presentation-counter">Slide 1 of ${safeSlides.length}</span>
        <button type="button" class="nb-presentation-nav-btn nb-presentation-next" title="Next Slide" ${safeSlides.length <= 1 ? 'disabled' : ''}>▶</button>
      </div>
      <div class="nb-presentation-actions">
        <a href="${fileUrl}" download="${escapeHtml(filename)}" class="nb-code-btn" title="Download PPTX">⬇️ Download</a>
      </div>
    </div>
    <div class="nb-presentation-stage">
      <div class="nb-presentation-slide-card">
        <h2 class="nb-slide-heading">${escapeHtml(firstSlide.title || `Slide 1`)}</h2>
        <div class="nb-slide-body">${bulletsHtml}</div>
      </div>
    </div>
    ${safeSlides.length > 1 ? `<div class="nb-presentation-thumbnails">${thumbsHtml}</div>` : ''}
  </div><p><br></p>`;
}

export function buildVideoEmbedHTML(url: string, caption?: string, poster?: string, hlsPlaylistUrl?: string): string {
  const posterAttr = poster ? ` poster="${poster}"` : '';
  const playlistUrl = hlsPlaylistUrl || getHlsPlaylistUrl(url);
  const hlsAttr = playlistUrl ? ` data-hls-url="${playlistUrl}"` : '';
  return `<div class="media-container video-container" contenteditable="false"><video class="vintage-video" controls playsinline preload="metadata"${posterAttr}${hlsAttr} src="${url}"></video><div class="vintage-media-caption" contenteditable="true" placeholder="Add a caption...">${escapeHtml(caption || '')}</div></div><p><br></p>`;
}

export function buildAudioEmbedHTML(url: string, title?: string): string {
  return `<div class="media-container audio-container" contenteditable="false"><audio class="vintage-audio" controls preload="metadata" src="${url}"></audio><div class="vintage-media-caption" contenteditable="true" placeholder="Add a caption...">${escapeHtml(title || '')}</div></div><p><br></p>`;
}

/**
 * Universal file processor: uploads file to vault, parses structure, and returns rich embed HTML.
 */
export async function processUploadedFileToHTML(
  file: File,
  onProgress?: (percent: number, loadedMB: string, totalMB: string) => void
): Promise<string> {
  const name = file.name || 'document';
  const ext = (name.split('.').pop() || '').toLowerCase();

  // 1. Standard Images
  if (file.type.startsWith('image/')) {
    const isLarge = file.size > 5 * 1024 * 1024 || file.type === 'image/gif' || file.type === 'image/svg+xml';
    let url: string;
    if (isLarge) {
      const data = await uploadLargeMediaFile(file, onProgress);
      url = data.url;
    } else {
      url = await uploadImageFile(file);
    }
    return `<figure class="nb-media-figure" contenteditable="false"><img src="${url}" alt="${escapeHtml(name)}" /><figcaption class="nb-media-caption" contenteditable="true" placeholder="Add a caption..."></figcaption></figure><p><br></p>`;
  }

  // 2. Video / Audio
  if (file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogv)$/i.test(name)) {
    let poster = '';
    try {
      poster = await extractVideoPoster(file);
    } catch {}
    const data = await uploadLargeMediaFile(file, onProgress);
    return buildVideoEmbedHTML(data.url, '', poster, data.hlsPlaylistUrl);
  }

  if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(name)) {
    const data = await uploadLargeMediaFile(file, onProgress);
    return buildAudioEmbedHTML(data.url);
  }

  // 3. Excel, CSV, TSV, ODS Spreadsheets (.xlsx, .xls, .csv, .tsv, .ods, .xlsb)
  if (
    ['xlsx', 'xls', 'csv', 'tsv', 'ods', 'xlsb'].includes(ext) ||
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const sheets = parseSpreadsheetBuffer(buffer, name);
    const data = await uploadLargeMediaFile(file, onProgress);
    const allRows = sheets[0]?.rows || [['No data']];
    return buildSpreadsheetEmbedHTML(name, data.url, allRows);
  }

  // 4. Word Documents (.docx)
  if (ext === 'docx') {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const paragraphs = parseDocxBuffer(buffer);
    const data = await uploadLargeMediaFile(file, onProgress);
    return buildWordEmbedHTML(name, data.url, paragraphs);
  }

  // 5. PowerPoint Presentations (.pptx)
  if (ext === 'pptx') {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const slides = parsePptxBuffer(buffer);
    const data = await uploadLargeMediaFile(file, onProgress);
    return buildPresentationEmbedHTML(name, data.url, slides);
  }

  // 6. PDF Documents (.pdf)
  if (ext === 'pdf' || file.type === 'application/pdf') {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const meta = parsePdfBuffer(buffer);
    const data = await uploadLargeMediaFile(file, onProgress);
    return buildPdfEmbedHTML(name, data.url, meta.pageCount || 1);
  }

  // 7. Code & Text Files
  const textContent = await file.text();
  const data = await uploadLargeMediaFile(file, onProgress);
  return buildCodeEmbedHTML(name, textContent, data.url);
}
