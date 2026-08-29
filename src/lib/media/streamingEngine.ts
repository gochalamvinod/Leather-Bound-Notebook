/**
 * Progressive Encrypted Chunk-Based Media Streaming Engine & HLS Controller
 *
 * Implements:
 * 1. RFC 8216 HLS Manifest Parsing (Master & Media .m3u8 playlists).
 * 2. Session-Authenticated Decryption Key Fetching (#EXT-X-KEY with credentials: 'include').
 * 3. Client-Side AES-128-CBC and AES-256-GCM WebCrypto Segment Decryption.
 * 4. Segment Timeline Seek Mapping (fast non-blocking seek without reloading unneeded chunks).
 * 5. Adaptive Quality / Bitrate Variant Stream Switching.
 * 6. HTTP 206 Byte-Range Progressive Streaming (backward-compatible chunk cache).
 * 7. Multi-Range Buffer Tracking, Diagnostic HUD Stats, and Stream Lifecycle Management.
 */

export interface ByteRange {
  start: number;
  end: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface HlsKeyInfo {
  method: string; // e.g. 'AES-128', 'AES-256-GCM', 'SAMPLE-AES', 'NONE'
  uri: string;
  iv?: Uint8Array;
  rawIvHex?: string;
  keyFormat?: string;
}

export interface HlsSegment {
  index: number;
  mediaSequence: number;
  duration: number; // in seconds
  url: string; // resolved URL
  keyInfo?: HlsKeyInfo;
  title?: string;
  byteRange?: { start: number; length: number };
  startTime: number; // cumulative start time in seconds
  endTime: number; // cumulative end time in seconds
}

export interface HlsVariant {
  bandwidth: number;
  averageBandwidth?: number;
  resolution?: { width: number; height: number };
  codecs?: string;
  frameRate?: number;
  name?: string;
  url: string;
}

export interface HlsManifest {
  isMaster: boolean;
  version?: number;
  targetDuration?: number;
  mediaSequence?: number;
  playlistType?: string; // e.g. 'VOD', 'EVENT'
  independentSegments?: boolean;
  variants: HlsVariant[];
  segments: HlsSegment[];
  totalDuration: number;
  keyInfo?: HlsKeyInfo;
  rawText: string;
}

export interface StreamStats {
  totalBytes: number;
  loadedBytes: number;
  totalChunks: number;
  loadedChunks: number;
  bufferedPercent: number;
  startupTimeMs: number;
  currentBitrateKbps: number;
  is206Partial: boolean;
  isEncrypted: boolean;
  activeRequests: number;
  cacheHits: number;
  isHls?: boolean;
  activeResolution?: string;
  activeVariantName?: string;
  encryptionMethod?: string;
}

const MEDIA_ENC_MAGIC = new Uint8Array([0x45, 0x4e, 0x43, 0x01]); // 'ENC\x01'
const globalKeyCache = new Map<string, Uint8Array>();

/**
 * Parses HLS attribute list strings: e.g. URI="key.bin",IV=0x0123,METHOD=AES-128
 */
export function parseHlsAttributes(attrStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /([A-Z0-9_-]+)=(?:"([^"]*)"|([^,]+))/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(attrStr)) !== null) {
    const key = match[1].toUpperCase();
    const value = match[2] !== undefined ? match[2] : match[3];
    result[key] = value.trim();
  }

  return result;
}

/**
 * Converts a sequence number integer into a 16-byte big-endian IV (RFC 8216 default for AES-128).
 */
export function sequenceNumberToIv(seq: number): Uint8Array {
  const iv = new Uint8Array(16);
  const view = new DataView(iv.buffer);
  view.setUint32(12, seq, false);
  return iv;
}

/**
 * Parses a hex string (with or without 0x prefix) into a Uint8Array.
 */
export function hexToUint8Array(hex: string): Uint8Array {
  let cleanHex = hex.trim();
  if (cleanHex.startsWith('0x') || cleanHex.startsWith('0X')) {
    cleanHex = cleanHex.slice(2);
  }
  if (cleanHex.length % 2 !== 0) {
    cleanHex = '0' + cleanHex;
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16) || 0;
  }
  return bytes;
}

/**
 * Resolves relative URLs against a base URL.
 */
export function resolveUrl(relativeOrAbsolute: string, baseUrl: string): string {
  if (!relativeOrAbsolute) return '';
  const trimmed = relativeOrAbsolute.trim();

  // If already absolute or blob / data URI
  if (/^(?:[a-z]+:)?\/\//i.test(trimmed) || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (!baseUrl) {
    return trimmed;
  }

  try {
    // If baseUrl is absolute
    if (/^(?:[a-z]+:)?\/\//i.test(baseUrl)) {
      return new URL(trimmed, baseUrl).toString();
    }

    // If baseUrl is root-relative (e.g. /api/media/123/master.m3u8)
    if (trimmed.startsWith('/')) {
      return trimmed;
    }

    const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
    return baseDir + trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Parses an RFC 8216 HLS Master or Media Playlist (.m3u8).
 */
export function parseHlsManifest(manifestContent: string, baseUrl: string = ''): HlsManifest {
  const lines = manifestContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  
  const variants: HlsVariant[] = [];
  const segments: HlsSegment[] = [];

  let version: number | undefined;
  let targetDuration: number | undefined;
  let mediaSequence: number = 0;
  let playlistType: string | undefined;
  let independentSegments = false;
  let isMaster = false;
  let currentKeyInfo: HlsKeyInfo | undefined;
  let cumulativeTime = 0;
  let segmentIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('#EXT-X-VERSION:')) {
      version = parseInt(line.split(':')[1], 10) || undefined;
    } else if (line.startsWith('#EXT-X-TARGETDURATION:')) {
      targetDuration = parseFloat(line.split(':')[1]) || undefined;
    } else if (line.startsWith('#EXT-X-MEDIA-SEQUENCE:')) {
      mediaSequence = parseInt(line.split(':')[1], 10) || 0;
    } else if (line.startsWith('#EXT-X-PLAYLIST-TYPE:')) {
      playlistType = line.split(':')[1].trim().toUpperCase();
    } else if (line.startsWith('#EXT-X-INDEPENDENT-SEGMENTS')) {
      independentSegments = true;
    } else if (line.startsWith('#EXT-X-STREAM-INF:')) {
      isMaster = true;
      const attrStr = line.slice('#EXT-X-STREAM-INF:'.length);
      const attrs = parseHlsAttributes(attrStr);
      const bandwidth = parseInt(attrs['BANDWIDTH'], 10) || 0;
      const avgBandwidth = attrs['AVERAGE-BANDWIDTH'] ? parseInt(attrs['AVERAGE-BANDWIDTH'], 10) : undefined;
      const codecs = attrs['CODECS'] || undefined;
      const frameRate = attrs['FRAME-RATE'] ? parseFloat(attrs['FRAME-RATE']) : undefined;
      const name = attrs['NAME'] || undefined;

      let resolution: { width: number; height: number } | undefined;
      if (attrs['RESOLUTION']) {
        const [w, h] = attrs['RESOLUTION'].split('x').map((n) => parseInt(n, 10));
        if (w && h) resolution = { width: w, height: h };
      }

      // Next non-comment line is variant URI
      let nextUri = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].startsWith('#')) {
          nextUri = lines[j];
          i = j;
          break;
        }
      }

      if (nextUri) {
        variants.push({
          bandwidth,
          averageBandwidth: avgBandwidth,
          resolution,
          codecs,
          frameRate,
          name,
          url: resolveUrl(nextUri, baseUrl),
        });
      }
    } else if (line.startsWith('#EXT-X-KEY:')) {
      const attrStr = line.slice('#EXT-X-KEY:'.length);
      const attrs = parseHlsAttributes(attrStr);
      const method = attrs['METHOD'] || 'NONE';

      if (method === 'NONE') {
        currentKeyInfo = undefined;
      } else {
        const uri = attrs['URI'] ? resolveUrl(attrs['URI'], baseUrl) : '';
        const rawIvHex = attrs['IV'] || undefined;
        let iv: Uint8Array | undefined;
        if (rawIvHex) {
          iv = hexToUint8Array(rawIvHex);
        }

        currentKeyInfo = {
          method,
          uri,
          iv,
          rawIvHex,
          keyFormat: attrs['KEYFORMAT'] || 'identity',
        };
      }
    } else if (line.startsWith('#EXTINF:')) {
      const infoStr = line.slice('#EXTINF:'.length);
      const commaIdx = infoStr.indexOf(',');
      const durStr = commaIdx !== -1 ? infoStr.slice(0, commaIdx) : infoStr;
      const title = commaIdx !== -1 ? infoStr.slice(commaIdx + 1).trim() : undefined;
      const duration = parseFloat(durStr) || 0;

      // Next non-comment line is segment URI
      let segmentUri = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].startsWith('#')) {
          segmentUri = lines[j];
          i = j;
          break;
        }
      }

      if (segmentUri) {
        const seqNumber = mediaSequence + segmentIndex;
        let effectiveKeyInfo = currentKeyInfo ? { ...currentKeyInfo } : undefined;
        
        // If AES-128 and no explicit IV, use sequence number IV
        if (effectiveKeyInfo && effectiveKeyInfo.method === 'AES-128' && !effectiveKeyInfo.iv) {
          effectiveKeyInfo.iv = sequenceNumberToIv(seqNumber);
        }

        const segStartTime = cumulativeTime;
        const segEndTime = cumulativeTime + duration;
        cumulativeTime = segEndTime;

        segments.push({
          index: segmentIndex,
          mediaSequence: seqNumber,
          duration,
          title,
          url: resolveUrl(segmentUri, baseUrl),
          keyInfo: effectiveKeyInfo,
          startTime: segStartTime,
          endTime: segEndTime,
        });

        segmentIndex++;
      }
    }
  }

  // Sort variants by bandwidth descending if master
  if (variants.length > 0) {
    variants.sort((a, b) => b.bandwidth - a.bandwidth);
  }

  return {
    isMaster,
    version,
    targetDuration,
    mediaSequence,
    playlistType,
    independentSegments,
    variants,
    segments,
    totalDuration: cumulativeTime,
    keyInfo: currentKeyInfo,
    rawText: manifestContent,
  };
}

/**
 * Maps a playback timestamp (in seconds) to the exact segment chunk index.
 */
export function findSegmentIndexForTime(segments: HlsSegment[], targetTime: number): number {
  if (!segments || segments.length === 0) return -1;
  if (targetTime <= 0) return 0;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (targetTime >= s.startTime && targetTime < s.endTime) {
      return i;
    }
  }

  return segments.length - 1;
}

/**
 * Returns the TimeRange covered by a given segment.
 */
export function getSegmentTimeRange(segments: HlsSegment[], index: number): TimeRange | null {
  if (!segments || index < 0 || index >= segments.length) return null;
  return {
    start: segments[index].startTime,
    end: segments[index].endTime,
  };
}

/**
 * Fetches an HLS decryption key securely with session credentials.
 */
export async function fetchHlsDecryptionKey(
  keyUri: string,
  baseUrl: string = '',
  signal?: AbortSignal
): Promise<Uint8Array | null> {
  const resolvedUri = resolveUrl(keyUri, baseUrl);
  if (!resolvedUri) return null;

  // Check cache
  if (globalKeyCache.has(resolvedUri)) {
    return globalKeyCache.get(resolvedUri)!;
  }

  try {
    const res = await fetch(resolvedUri, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/octet-stream, */*',
      },
      signal,
    });

    if (!res.ok) {
      console.warn(`[StreamingEngine] Key retrieval returned HTTP ${res.status} for ${resolvedUri}`);
      return null;
    }

    const keyBuf = new Uint8Array(await res.arrayBuffer());
    globalKeyCache.set(resolvedUri, keyBuf);
    return keyBuf;
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.warn(`[StreamingEngine] Failed to fetch decryption key from ${resolvedUri}:`, err);
    }
    return null;
  }
}

/**
 * In-browser AES-256-GCM Chunk Decryptor using Web Crypto API.
 */
export async function decryptMediaChunkInBrowser(
  encryptedData: Uint8Array,
  rawKey?: Uint8Array | CryptoKey
): Promise<Uint8Array> {
  // Check magic header: 'ENC\x01' (4 bytes) + IV (12 bytes) + AuthTag (16 bytes) + Ciphertext
  if (encryptedData.length < 32) return encryptedData;
  const hasMagic =
    encryptedData[0] === MEDIA_ENC_MAGIC[0] &&
    encryptedData[1] === MEDIA_ENC_MAGIC[1] &&
    encryptedData[2] === MEDIA_ENC_MAGIC[2] &&
    encryptedData[3] === MEDIA_ENC_MAGIC[3];

  const subtle = typeof window !== 'undefined' ? window.crypto?.subtle : (globalThis as any).crypto?.subtle;
  if (!hasMagic || !rawKey || !subtle) {
    return encryptedData;
  }

  try {
    const iv = encryptedData.subarray(4, 16);
    const authTag = encryptedData.subarray(16, 32);
    const ciphertext = encryptedData.subarray(32);

    // WebCrypto AES-GCM expects ciphertext + authTag concatenated
    const combinedCiphertext = new Uint8Array(ciphertext.length + authTag.length);
    combinedCiphertext.set(ciphertext, 0);
    combinedCiphertext.set(authTag, ciphertext.length);

    let cryptoKey: CryptoKey;
    if (rawKey instanceof CryptoKey) {
      cryptoKey = rawKey;
    } else {
      cryptoKey = await subtle.importKey(
        'raw',
        rawKey as unknown as BufferSource,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
    }

    const decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
        tagLength: 128,
      },
      cryptoKey,
      combinedCiphertext as unknown as BufferSource
    );

    return new Uint8Array(decryptedBuffer);
  } catch (err) {
    console.warn('[StreamingEngine] Decryption fallback to raw buffer:', err);
    return encryptedData;
  }
}

/**
 * Decrypts standard HLS AES-128-CBC or AES-256-GCM segment chunks in browser.
 */
export async function decryptHlsSegmentInBrowser(
  segmentData: Uint8Array,
  key: Uint8Array,
  iv?: Uint8Array,
  method: string = 'AES-128'
): Promise<Uint8Array> {
  const subtle = typeof window !== 'undefined' ? window.crypto?.subtle : (globalThis as any).crypto?.subtle;
  if (!subtle || !key || segmentData.length === 0) {
    return segmentData;
  }

  try {
    if (method === 'AES-128' || method === 'AES-128-CBC') {
      const effectiveIv = iv || new Uint8Array(16);
      const cryptoKey = await subtle.importKey(
        'raw',
        key as unknown as BufferSource,
        { name: 'AES-CBC' },
        false,
        ['decrypt']
      );

      const decrypted = await subtle.decrypt(
        {
          name: 'AES-CBC',
          iv: effectiveIv as unknown as BufferSource,
        },
        cryptoKey,
        segmentData as unknown as BufferSource
      );

      return new Uint8Array(decrypted);
    } else if (method === 'AES-256-GCM') {
      return await decryptMediaChunkInBrowser(segmentData, key);
    }
  } catch (err) {
    console.warn(`[StreamingEngine] Segment decryption failed with method ${method}:`, err);
  }

  return segmentData;
}

/**
 * Fast in-memory byte-range cache manager for streaming media sessions.
 */
export class MediaChunkCache {
  private ranges: { start: number; end: number; data: Uint8Array }[] = [];
  private totalSize: number = 0;
  private maxCacheBytes: number = 64 * 1024 * 1024; // 64MB max LRU memory per stream
  private currentCachedBytes: number = 0;

  constructor(totalSize: number = 0, maxCacheBytes?: number) {
    this.totalSize = totalSize;
    if (maxCacheBytes) this.maxCacheBytes = maxCacheBytes;
  }

  setTotalSize(size: number) {
    this.totalSize = size;
  }

  getTotalSize(): number {
    return this.totalSize;
  }

  getCachedBytesCount(): number {
    return this.currentCachedBytes;
  }

  isRangeCached(start: number, end: number): boolean {
    if (start > end) return false;
    for (const r of this.ranges) {
      if (r.start <= start && r.end >= end) {
        return true;
      }
    }
    return false;
  }

  getCachedSlice(start: number, end: number): Uint8Array | null {
    for (const r of this.ranges) {
      if (r.start <= start && r.end >= end) {
        const offsetStart = start - r.start;
        const offsetEnd = end - r.start + 1;
        return r.data.subarray(offsetStart, offsetEnd);
      }
    }
    return null;
  }

  addRange(start: number, end: number, data: Uint8Array) {
    if (start > end || data.length === 0) return;

    if (this.currentCachedBytes + data.length > this.maxCacheBytes && this.ranges.length > 2) {
      const evicted = this.ranges.shift();
      if (evicted) {
        this.currentCachedBytes -= evicted.data.length;
      }
    }

    const newEntry = { start, end, data };
    const merged: { start: number; end: number; data: Uint8Array }[] = [];
    let inserted = false;

    for (const r of this.ranges) {
      if (newEntry.end < r.start - 1) {
        if (!inserted) {
          merged.push(newEntry);
          inserted = true;
        }
        merged.push(r);
      } else if (newEntry.start > r.end + 1) {
        merged.push(r);
      } else {
        const minStart = Math.min(r.start, newEntry.start);
        const maxEnd = Math.max(r.end, newEntry.end);
        const combinedLen = maxEnd - minStart + 1;
        const combinedData = new Uint8Array(combinedLen);

        combinedData.set(r.data, r.start - minStart);
        combinedData.set(newEntry.data, newEntry.start - minStart);

        newEntry.start = minStart;
        newEntry.end = maxEnd;
        newEntry.data = combinedData;
      }
    }

    if (!inserted) {
      merged.push(newEntry);
    }

    this.ranges = merged;
    this.currentCachedBytes = this.ranges.reduce((acc, r) => acc + r.data.length, 0);
  }

  getBufferedByteRanges(): ByteRange[] {
    return this.ranges.map((r) => ({ start: r.start, end: r.end }));
  }

  getBufferedTimeRanges(duration: number): TimeRange[] {
    if (!duration || duration <= 0 || !this.totalSize || this.totalSize <= 0) {
      return [];
    }
    return this.ranges.map((r) => ({
      start: (r.start / this.totalSize) * duration,
      end: ((r.end + 1) / this.totalSize) * duration,
    }));
  }

  clear() {
    this.ranges = [];
    this.currentCachedBytes = 0;
  }
}

/**
 * Controller managing progressive HLS streaming and HTTP 206 byte-range streaming,
 * instant playback initialization (<2s), adaptive variant quality switching,
 * fast timeline scrubbing mapped to segments, and progressive buffer caching.
 */
export class ProgressiveStreamController {
  private url: string;
  private isHlsStream: boolean = false;
  private masterManifest: HlsManifest | null = null;
  private mediaManifest: HlsManifest | null = null;
  private variants: HlsVariant[] = [];
  private activeVariantIndex: number = 0;
  private segments: HlsSegment[] = [];
  private segmentCache: Map<number, Uint8Array> = new Map();
  private segmentKeyCache: Map<number, Uint8Array> = new Map();
  private totalDuration: number = 0;

  // Direct 206 range streaming fallbacks
  private cache: MediaChunkCache;
  private totalBytes: number = 0;
  private loadedBytes: number = 0;
  private mimeType: string = 'video/mp4';
  private chunkSize: number = 4 * 1024 * 1024; // 4MB slice for low-RAM streaming
  private initialChunkSize: number = 1024 * 1024; // 1MB for fast start

  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private startTime: number = 0;
  private startupDurationMs: number = 0;
  private activeFetches: number = 0;
  private cacheHits: number = 0;
  private is206Supported: boolean = true;
  private encryptionKey?: Uint8Array;
  private abortController: AbortController = new AbortController();

  private onProgressCallbacks: Set<(stats: StreamStats) => void> = new Set();

  constructor(url: string, encryptionKey?: Uint8Array) {
    this.url = url;
    this.cache = new MediaChunkCache();
    this.encryptionKey = encryptionKey;
    this.isHlsStream = this.checkIsHlsUrl(url);
  }

  private checkIsHlsUrl(targetUrl: string): boolean {
    if (!targetUrl) return false;
    return (
      /\.m3u8(?:$|\?)/i.test(targetUrl) ||
      /\/hls(?:\/|$)/i.test(targetUrl) ||
      /\/playlist\.m3u8/i.test(targetUrl) ||
      /\/master\.m3u8/i.test(targetUrl)
    );
  }

  getUrl(): string {
    return this.url;
  }

  isHls(): boolean {
    return this.isHlsStream;
  }

  getCache(): MediaChunkCache {
    return this.cache;
  }

  getTotalBytes(): number {
    return this.totalBytes;
  }

  getLoadedBytes(): number {
    return this.loadedBytes;
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getDuration(): number {
    return this.totalDuration;
  }

  getVariants(): HlsVariant[] {
    return this.variants;
  }

  getActiveVariantIndex(): number {
    return this.activeVariantIndex;
  }

  getActiveVariant(): HlsVariant | null {
    if (this.variants.length > 0 && this.activeVariantIndex >= 0 && this.activeVariantIndex < this.variants.length) {
      return this.variants[this.activeVariantIndex];
    }
    return null;
  }

  getSegments(): HlsSegment[] {
    return this.segments;
  }

  getMasterManifest(): HlsManifest | null {
    return this.masterManifest;
  }

  getMediaManifest(): HlsManifest | null {
    return this.mediaManifest;
  }

  onProgress(cb: (stats: StreamStats) => void): () => void {
    this.onProgressCallbacks.add(cb);
    return () => this.onProgressCallbacks.delete(cb);
  }

  private notifyProgress() {
    const stats = this.getStats();
    for (const cb of this.onProgressCallbacks) {
      cb(stats);
    }
  }

  getStats(): StreamStats {
    const activeVar = this.getActiveVariant();

    if (this.isHlsStream) {
      const totalSegs = Math.max(1, this.segments.length);
      const loadedSegs = this.segmentCache.size;
      const bufferedPercent = Math.min(100, Math.round((loadedSegs / totalSegs) * 100));
      const bitrate = activeVar?.bandwidth
        ? Math.round(activeVar.bandwidth / 1000)
        : Math.round((this.loadedBytes * 8) / 1024 / Math.max(1, this.startupDurationMs / 1000));

      const activeRes = activeVar?.resolution
        ? `${activeVar.resolution.width}x${activeVar.resolution.height}`
        : undefined;

      const activeVarName = activeVar?.name || (activeVar?.resolution ? `${activeVar.resolution.height}p` : undefined);
      const keyInfo = this.mediaManifest?.keyInfo || this.masterManifest?.keyInfo;
      const encryptionMethod = keyInfo ? `${keyInfo.method} Key-Protected` : this.encryptionKey ? 'AES-256-GCM' : 'None';

      return {
        totalBytes: this.totalBytes || this.loadedBytes,
        loadedBytes: this.loadedBytes,
        totalChunks: totalSegs,
        loadedChunks: loadedSegs,
        bufferedPercent,
        startupTimeMs: this.startupDurationMs,
        currentBitrateKbps: bitrate || 2500,
        is206Partial: false,
        isEncrypted: !!(keyInfo || this.encryptionKey),
        activeRequests: this.activeFetches,
        cacheHits: this.cacheHits,
        isHls: true,
        activeResolution: activeRes,
        activeVariantName: activeVarName,
        encryptionMethod,
      };
    }

    // HTTP 206 Direct Range Stream
    const loaded = this.cache.getCachedBytesCount();
    const total = this.totalBytes || loaded || 1;
    const bufferedPercent = Math.min(100, Math.round((loaded / total) * 100));
    const totalChunks = Math.max(1, Math.ceil(total / this.chunkSize));
    const loadedChunks = Math.ceil(loaded / this.chunkSize);

    return {
      totalBytes: this.totalBytes,
      loadedBytes: loaded,
      totalChunks,
      loadedChunks,
      bufferedPercent,
      startupTimeMs: this.startupDurationMs,
      currentBitrateKbps: Math.round((loaded * 8) / 1024 / Math.max(1, this.startupDurationMs / 1000)),
      is206Partial: this.is206Supported,
      isEncrypted: !!this.encryptionKey,
      activeRequests: this.activeFetches,
      cacheHits: this.cacheHits,
      isHls: false,
      encryptionMethod: this.encryptionKey ? 'AES-256-GCM Session-Gated' : 'None',
    };
  }

  /**
   * Initializes stream session:
   * - For HLS: fetches manifest, parses variants/segments, fetches key, and loads segment 0.
   * - For HTTP 206: fetches initial byte range and probes headers.
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    this.initPromise = (async () => {
      try {
        this.activeFetches++;
        this.notifyProgress();

        if (this.isHlsStream) {
          await this.initHlsPipeline();
        } else {
          await this.initHttp206Pipeline();
        }

        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        this.startupDurationMs = Math.round(now - this.startTime);
        this.isInitialized = true;
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('[StreamingEngine] Stream initialization error:', err);
        }
      } finally {
        this.activeFetches = Math.max(0, this.activeFetches - 1);
        this.notifyProgress();
      }
    })();

    return this.initPromise;
  }

  private async initHlsPipeline(): Promise<void> {
    const res = await fetch(this.url, {
      credentials: 'include',
      headers: {
        Accept: 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*',
      },
      signal: this.abortController.signal,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch HLS manifest (${res.status} ${res.statusText})`);
    }

    const manifestText = await res.text();
    const parsed = parseHlsManifest(manifestText, this.url);

    if (parsed.isMaster && parsed.variants.length > 0) {
      this.masterManifest = parsed;
      this.variants = parsed.variants;
      this.activeVariantIndex = 0; // Default to highest quality variant
      await this.loadMediaPlaylist(this.variants[0].url);
    } else {
      this.mediaManifest = parsed;
      this.segments = parsed.segments;
      this.totalDuration = parsed.totalDuration;
    }

    // Prefetch segment 0 for instant playback start (<2s)
    if (this.segments.length > 0) {
      await this.requestSegment(0);
    }
  }

  private async loadMediaPlaylist(mediaPlaylistUrl: string): Promise<void> {
    const res = await fetch(mediaPlaylistUrl, {
      credentials: 'include',
      headers: {
        Accept: 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*',
      },
      signal: this.abortController.signal,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch media playlist (${res.status})`);
    }

    const text = await res.text();
    this.mediaManifest = parseHlsManifest(text, mediaPlaylistUrl);
    this.segments = this.mediaManifest.segments;
    this.totalDuration = this.mediaManifest.totalDuration;
  }

  /**
   * Switches active variant / bitrate quality level.
   */
  async switchVariant(variantIndex: number): Promise<boolean> {
    if (!this.variants || variantIndex < 0 || variantIndex >= this.variants.length) {
      return false;
    }
    if (this.activeVariantIndex === variantIndex) {
      return true;
    }

    try {
      this.activeFetches++;
      this.notifyProgress();
      this.activeVariantIndex = variantIndex;
      const targetVariant = this.variants[variantIndex];
      await this.loadMediaPlaylist(targetVariant.url);
      
      // Clean segment cache for variant switch
      this.segmentCache.clear();
      this.segmentKeyCache.clear();
      this.loadedBytes = 0;

      // Immediately buffer current segment
      if (this.segments.length > 0) {
        await this.requestSegment(0);
      }
      return true;
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn(`[StreamingEngine] Failed to switch variant to index ${variantIndex}:`, err);
      }
      return false;
    } finally {
      this.activeFetches = Math.max(0, this.activeFetches - 1);
      this.notifyProgress();
    }
  }

  /**
   * Fetches and decrypts an HLS segment chunk by index.
   */
  async requestSegment(index: number): Promise<Uint8Array | null> {
    if (!this.segments || index < 0 || index >= this.segments.length) {
      return null;
    }

    // 1. Fast Segment Cache Lookup
    if (this.segmentCache.has(index)) {
      this.cacheHits++;
      this.notifyProgress();
      return this.segmentCache.get(index)!;
    }

    const seg = this.segments[index];

    try {
      this.activeFetches++;
      this.notifyProgress();

      // Fetch decryption key if required and not already cached
      let keyData = this.segmentKeyCache.get(index) || this.encryptionKey;
      if (!keyData && seg.keyInfo && seg.keyInfo.method !== 'NONE' && seg.keyInfo.uri) {
        const fetched = await fetchHlsDecryptionKey(seg.keyInfo.uri, this.url, this.abortController.signal);
        if (fetched) {
          keyData = fetched;
          this.segmentKeyCache.set(index, fetched);
        }
      }

      const res = await fetch(seg.url, {
        method: 'GET',
        credentials: 'include',
        signal: this.abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} fetching segment ${index}`);
      }

      const rawBuffer = new Uint8Array(await res.arrayBuffer());
      let decrypted: Uint8Array = rawBuffer;

      if (seg.keyInfo && keyData) {
        decrypted = await decryptHlsSegmentInBrowser(
          rawBuffer,
          keyData,
          seg.keyInfo.iv,
          seg.keyInfo.method
        );
      } else if (this.encryptionKey) {
        decrypted = await decryptMediaChunkInBrowser(rawBuffer, this.encryptionKey);
      }

      this.segmentCache.set(index, decrypted);
      this.loadedBytes += decrypted.length;

      // Keep cache strictly bounded around active playhead (max 8 segments in RAM)
      if (this.segmentCache.size > 8) {
        for (const [cachedIdx] of this.segmentCache.entries()) {
          if (Math.abs(cachedIdx - index) > 4) {
            this.segmentCache.delete(cachedIdx);
            this.segmentKeyCache.delete(cachedIdx);
          }
          if (this.segmentCache.size <= 8) break;
        }
      }

      // Update total bytes estimate
      if (!this.totalBytes && this.segments.length > 0) {
        this.totalBytes = decrypted.length * this.segments.length;
      }

      return decrypted;
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn(`[StreamingEngine] Failed to request segment ${index}:`, err);
      }
      return null;
    } finally {
      this.activeFetches = Math.max(0, this.activeFetches - 1);
      this.notifyProgress();
    }
  }

  hasSegment(index: number): boolean {
    return this.segmentCache.has(index);
  }

  /**
   * Pre-fetches subsequent HLS segments ahead of current playback index.
   * Loads only 1 next segment to avoid sequential bandwidth saturation.
   */
  async prefetchSegmentsAhead(currentIndex: number, count: number = 1): Promise<void> {
    if (!this.segments || currentIndex >= this.segments.length) return;

    for (let i = 0; i < count; i++) {
      const targetIndex = currentIndex + i;
      if (targetIndex >= this.segments.length) break;
      if (!this.segmentCache.has(targetIndex)) {
        await this.requestSegment(targetIndex);
      }
    }
  }

  private async initHttp206Pipeline(): Promise<void> {
    const headers: Record<string, string> = {
      Range: `bytes=0-${this.initialChunkSize - 1}`,
    };

    const res = await fetch(this.url, {
      headers,
      credentials: 'include',
      signal: this.abortController.signal,
    });

    const contentType = res.headers.get('content-type') || 'video/mp4';
    this.mimeType = contentType.split(';')[0].trim();

    if (res.status === 206) {
      this.is206Supported = true;
      const contentRange = res.headers.get('content-range');
      if (contentRange) {
        const match = contentRange.match(/bytes\s+(\d+)-(\d+)\/(\d+|\*)/i);
        if (match) {
          const rangeStart = parseInt(match[1], 10);
          const rangeEnd = parseInt(match[2], 10);
          const total = match[3] !== '*' ? parseInt(match[3], 10) : 0;
          this.totalBytes = total;
          this.cache.setTotalSize(total);

          const rawBuffer = new Uint8Array(await res.arrayBuffer());
          const decBuffer: Uint8Array = await decryptMediaChunkInBrowser(rawBuffer, this.encryptionKey);
          this.cache.addRange(rangeStart, rangeEnd, decBuffer);
          this.loadedBytes = this.cache.getCachedBytesCount();
        }
      }
    } else if (res.ok) {
      this.is206Supported = false;
      const rawBuffer = new Uint8Array(await res.arrayBuffer());
      const decBuffer: Uint8Array = await decryptMediaChunkInBrowser(rawBuffer, this.encryptionKey);
      this.totalBytes = decBuffer.length;
      this.loadedBytes = decBuffer.length;
      this.cache.setTotalSize(decBuffer.length);
      this.cache.addRange(0, decBuffer.length - 1, decBuffer);
    }
  }

  /**
   * Requests a byte range for standard HTTP 206 streams.
   */
  async requestByteRange(start: number, end: number): Promise<Uint8Array | null> {
    if (start > end) return null;

    if (this.cache.isRangeCached(start, end)) {
      this.cacheHits++;
      this.notifyProgress();
      return this.cache.getCachedSlice(start, end);
    }

    try {
      this.activeFetches++;
      this.notifyProgress();

      const fetchStart = start;
      const fetchEnd = this.totalBytes > 0 ? Math.min(this.totalBytes - 1, end) : end;

      const res = await fetch(this.url, {
        headers: {
          Range: `bytes=${fetchStart}-${fetchEnd}`,
        },
        credentials: 'include',
        signal: this.abortController.signal,
      });

      if (!res.ok && res.status !== 206) {
        throw new Error(`HTTP ${res.status} streaming range request failed`);
      }

      const rawBuffer = new Uint8Array(await res.arrayBuffer());
      const decBuffer: Uint8Array = await decryptMediaChunkInBrowser(rawBuffer, this.encryptionKey);

      let actualStart = fetchStart;
      let actualEnd = fetchStart + decBuffer.length - 1;
      const contentRange = res.headers.get('content-range');
      if (contentRange) {
        const m = contentRange.match(/bytes\s+(\d+)-(\d+)\/(\d+|\*)/i);
        if (m) {
          actualStart = parseInt(m[1], 10);
          actualEnd = parseInt(m[2], 10);
          if (m[3] !== '*' && !this.totalBytes) {
            this.totalBytes = parseInt(m[3], 10);
            this.cache.setTotalSize(this.totalBytes);
          }
        }
      }

      this.cache.addRange(actualStart, actualEnd, decBuffer);
      this.loadedBytes = this.cache.getCachedBytesCount();
      return this.cache.getCachedSlice(start, end) || decBuffer;
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn(`[StreamingEngine] Failed to fetch byte range ${start}-${end}:`, err);
      }
      return null;
    } finally {
      this.activeFetches = Math.max(0, this.activeFetches - 1);
      this.notifyProgress();
    }
  }

  /**
   * Pre-fetches subsequent byte chunk in background for 206 streams.
   */
  async prefetchAhead(currentByteOffset: number, chunksAhead: number = 2): Promise<void> {
    if (!this.totalBytes || currentByteOffset >= this.totalBytes - 1) return;

    for (let i = 0; i < chunksAhead; i++) {
      const start = currentByteOffset + i * this.chunkSize;
      const end = Math.min(this.totalBytes - 1, start + this.chunkSize - 1);
      if (start >= this.totalBytes) break;
      if (!this.cache.isRangeCached(start, end)) {
        await this.requestByteRange(start, end);
      }
    }
  }

  /**
   * Fast seek calculation:
   * - HLS: Maps target seek timestamp directly to segment index, checks cache, and buffers ahead.
   * - HTTP 206: Maps target seek timestamp to byte offset and checks byte cache.
   */
  async handleSeek(targetSeconds: number, duration: number): Promise<boolean> {
    if (this.isHlsStream) {
      if (this.segments.length === 0) return false;
      const targetSegIndex = findSegmentIndexForTime(this.segments, targetSeconds);
      if (targetSegIndex < 0) return false;

      // Prune distant cached segments from previous playback location
      for (const [cachedIdx] of this.segmentCache.entries()) {
        if (Math.abs(cachedIdx - targetSegIndex) > 3) {
          this.segmentCache.delete(cachedIdx);
          this.segmentKeyCache.delete(cachedIdx);
        }
      }

      if (this.segmentCache.has(targetSegIndex)) {
        this.cacheHits++;
        this.notifyProgress();
        this.prefetchSegmentsAhead(targetSegIndex + 1, 1).catch(() => {});
        return true;
      }

      // Fetch ONLY the required segment directly for instantaneous playback
      await this.requestSegment(targetSegIndex);
      this.prefetchSegmentsAhead(targetSegIndex + 1, 1).catch(() => {});
      return true;
    }

    // Direct HTTP 206 byte seek
    if (!duration || duration <= 0 || !this.totalBytes) return false;
    const ratio = Math.max(0, Math.min(1, targetSeconds / duration));
    const targetByte = Math.floor(ratio * this.totalBytes);
    const chunkEnd = Math.min(this.totalBytes - 1, targetByte + this.chunkSize - 1);

    if (this.cache.isRangeCached(targetByte, Math.min(chunkEnd, targetByte + 65536))) {
      this.cacheHits++;
      this.notifyProgress();
      this.prefetchAhead(chunkEnd + 1, 1).catch(() => {});
      return true;
    }

    await this.requestByteRange(targetByte, chunkEnd);
    this.prefetchAhead(chunkEnd + 1, 1).catch(() => {});
    return true;
  }

  /**
   * Returns buffered time ranges across timeline.
   */
  getBufferedTimeRanges(duration?: number): TimeRange[] {
    if (this.isHlsStream) {
      if (!this.segments || this.segments.length === 0) return [];
      const ranges: TimeRange[] = [];

      for (const [idx] of this.segmentCache.entries()) {
        const seg = this.segments[idx];
        if (seg) {
          ranges.push({ start: seg.startTime, end: seg.endTime });
        }
      }

      // Sort and merge adjacent/overlapping ranges
      ranges.sort((a, b) => a.start - b.start);
      const merged: TimeRange[] = [];
      for (const r of ranges) {
        if (merged.length === 0) {
          merged.push({ ...r });
        } else {
          const last = merged[merged.length - 1];
          if (r.start <= last.end + 0.1) {
            last.end = Math.max(last.end, r.end);
          } else {
            merged.push({ ...r });
          }
        }
      }
      return merged;
    }

    const effDuration = duration || this.totalDuration || 0;
    return this.cache.getBufferedTimeRanges(effDuration);
  }

  getStreamingUrl(): string {
    return this.url;
  }

  destroy() {
    this.abortController.abort();
    this.cache.clear();
    this.segmentCache.clear();
    this.segmentKeyCache.clear();
    this.onProgressCallbacks.clear();
  }
}

/**
 * Global registry for stream controllers to avoid duplicate fetch engines across re-renders.
 */
const streamControllerRegistry = new Map<string, ProgressiveStreamController>();

export function getOrCreateStreamController(
  url: string,
  encryptionKey?: Uint8Array
): ProgressiveStreamController {
  let controller = streamControllerRegistry.get(url);
  if (!controller) {
    controller = new ProgressiveStreamController(url, encryptionKey);
    streamControllerRegistry.set(url, controller);
  }
  return controller;
}

export function releaseStreamController(url: string) {
  const controller = streamControllerRegistry.get(url);
  if (controller) {
    controller.destroy();
    streamControllerRegistry.delete(url);
  }
}

export function clearAllStreamControllers() {
  for (const controller of streamControllerRegistry.values()) {
    controller.destroy();
  }
  streamControllerRegistry.clear();
}
