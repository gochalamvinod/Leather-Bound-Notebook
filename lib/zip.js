/**
 * Pure Node.js ZIP Archive Encoder & Decoder
 * Standard PKZIP 2.0 implementation with DEFLATE (zlib) compression and CRC32.
 */

const zlib = require('zlib');

// Precomputed CRC32 Lookup Table
const CRC32_TABLE = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC32_TABLE[i] = c;
}

function calculateCrc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function dosDateTime(date) {
  const d = date || new Date();
  const time = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
  const dateVal = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  return { time, date: dateVal };
}

/**
 * Creates a standard ZIP archive buffer from a list of file entries.
 * @param {Array<{ name: string, data: Buffer|string }>} entries
 * @returns {Buffer}
 */
function createZip(entries) {
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;
  const { time: dosTime, date: dosDate } = dosDateTime();

  for (const entry of entries) {
    const rawData = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data || '', 'utf8');
    const nameBuf = Buffer.from(entry.name.replace(/\\/g, '/'), 'utf8');
    const crc = calculateCrc32(rawData);
    const uncompressedSize = rawData.length;

    // Deflate raw data
    let compressedData;
    let method = 8; // DEFLATE
    try {
      compressedData = zlib.deflateRawSync(rawData, { level: 6 });
      if (compressedData.length >= uncompressedSize) {
        compressedData = rawData;
        method = 0;
      }
    } catch (e) {
      compressedData = rawData;
      method = 0;
    }
    const compressedSize = compressedData.length;

    // --- Local File Header ---
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034B50, 0); // Local header signature
    localHeader.writeUInt16LE(20, 4);         // Version needed (2.0)
    localHeader.writeUInt16LE(0, 6);          // General purpose bit flag
    localHeader.writeUInt16LE(method, 8);     // Compression method
    localHeader.writeUInt16LE(dosTime, 10);   // Last mod time
    localHeader.writeUInt16LE(dosDate, 12);   // Last mod date
    localHeader.writeUInt32LE(crc, 14);       // CRC32
    localHeader.writeUInt32LE(compressedSize, 18);   // Compressed size
    localHeader.writeUInt32LE(uncompressedSize, 22); // Uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);   // File name length
    localHeader.writeUInt16LE(0, 28);                // Extra field length

    const localOffset = offset;
    localChunks.push(localHeader, nameBuf, compressedData);
    offset += localHeader.length + nameBuf.length + compressedData.length;

    // --- Central Directory Header ---
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014B50, 0); // Central header signature
    centralHeader.writeUInt16LE(20, 4);         // Version made by
    centralHeader.writeUInt16LE(20, 6);         // Version needed
    centralHeader.writeUInt16LE(0, 8);          // Flags
    centralHeader.writeUInt16LE(method, 10);    // Compression method
    centralHeader.writeUInt16LE(dosTime, 12);   // Mod time
    centralHeader.writeUInt16LE(dosDate, 14);   // Mod date
    centralHeader.writeUInt32LE(crc, 16);       // CRC32
    centralHeader.writeUInt32LE(compressedSize, 20);   // Compressed size
    centralHeader.writeUInt32LE(uncompressedSize, 24); // Uncompressed size
    centralHeader.writeUInt16LE(nameBuf.length, 28);   // Name length
    centralHeader.writeUInt16LE(0, 30);                // Extra field length
    centralHeader.writeUInt16LE(0, 32);                // Comment length
    centralHeader.writeUInt16LE(0, 34);                // Disk start
    centralHeader.writeUInt16LE(0, 36);                // Internal attributes
    centralHeader.writeUInt32LE(0, 38);                // External attributes
    centralHeader.writeUInt32LE(localOffset, 42);      // Relative offset of local header

    centralChunks.push(centralHeader, nameBuf);
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const chunk of centralChunks) centralDirSize += chunk.length;

  // --- End of Central Directory (EOCD) ---
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054B50, 0);        // EOCD signature
  eocd.writeUInt16LE(0, 4);                 // Disk number
  eocd.writeUInt16LE(0, 6);                 // Start disk
  eocd.writeUInt16LE(entries.length, 8);    // Entries on disk
  eocd.writeUInt16LE(entries.length, 10);   // Total entries
  eocd.writeUInt32LE(centralDirSize, 12);   // Central directory size
  eocd.writeUInt32LE(centralDirOffset, 16); // Central directory offset
  eocd.writeUInt16LE(0, 20);                // Comment length

  return Buffer.concat([...localChunks, ...centralChunks, eocd]);
}

/**
 * Extracts all files from a ZIP archive buffer.
 * @param {Buffer} zipBuffer
 * @returns {Array<{ name: string, data: Buffer }>}
 */
function readZip(zipBuffer) {
  if (!Buffer.isBuffer(zipBuffer) || zipBuffer.length < 22) {
    throw new Error('Invalid ZIP buffer: size too small');
  }

  // Locate EOCD signature from the end
  let eocdOffset = -1;
  const maxSearch = Math.min(zipBuffer.length - 22, 65536);
  for (let i = zipBuffer.length - 22; i >= zipBuffer.length - 22 - maxSearch; i--) {
    if (zipBuffer.readUInt32LE(i) === 0x06054B50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid ZIP: End of Central Directory (EOCD) signature not found');
  }

  const totalEntries = zipBuffer.readUInt16LE(eocdOffset + 10);
  const centralDirOffset = zipBuffer.readUInt32LE(eocdOffset + 16);

  const files = [];
  let cOffset = centralDirOffset;

  for (let i = 0; i < totalEntries; i++) {
    if (cOffset + 46 > zipBuffer.length) break;
    const sig = zipBuffer.readUInt32LE(cOffset);
    if (sig !== 0x02014B50) break;

    const method = zipBuffer.readUInt16LE(cOffset + 10);
    const compressedSize = zipBuffer.readUInt32LE(cOffset + 20);
    const uncompressedSize = zipBuffer.readUInt32LE(cOffset + 24);
    const nameLen = zipBuffer.readUInt16LE(cOffset + 28);
    const extraLen = zipBuffer.readUInt16LE(cOffset + 30);
    const commentLen = zipBuffer.readUInt16LE(cOffset + 32);
    const localHeaderOffset = zipBuffer.readUInt32LE(cOffset + 42);

    const name = zipBuffer.toString('utf8', cOffset + 46, cOffset + 46 + nameLen);
    cOffset += 46 + nameLen + extraLen + commentLen;

    // Read from local header
    if (localHeaderOffset + 30 > zipBuffer.length) continue;
    const localSig = zipBuffer.readUInt32LE(localHeaderOffset);
    if (localSig !== 0x04034B50) continue;

    const localNameLen = zipBuffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = zipBuffer.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;

    if (dataOffset + compressedSize > zipBuffer.length) continue;
    const compressedData = zipBuffer.subarray(dataOffset, dataOffset + compressedSize);

    let uncompressedData;
    if (method === 0) {
      uncompressedData = Buffer.from(compressedData);
    } else if (method === 8) {
      uncompressedData = zlib.inflateRawSync(compressedData);
    } else {
      throw new Error(`Unsupported ZIP compression method: ${method}`);
    }

    files.push({
      name,
      data: uncompressedData,
    });
  }

  return files;
}

module.exports = {
  createZip,
  readZip,
  calculateCrc32,
};
