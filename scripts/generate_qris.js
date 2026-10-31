import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createPng(width, height, pixelFn) {
  // RGBA buffer: height rows, each row has 1 filter byte (0) + width * 4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.alloc(4)
  ]);
  ihdrChunk.writeUInt32BE(crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData])), 17 + 4 - 4);

  // IDAT
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(compressedData.length, 0);
  const idatTypeAndData = Buffer.concat([Buffer.from('IDAT'), compressedData]);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(idatTypeAndData), 0);
  const idatChunk = Buffer.concat([idatLen, idatTypeAndData, idatCrc]);

  // IEND
  const iendChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate a 280x280 QRIS image
const size = 280;
const gridModules = 29;
const margin = 24;
const qrAreaSize = size - margin * 2;
const modSize = qrAreaSize / gridModules;

// 29x29 grid
const grid = Array.from({ length: gridModules }, () => Array(gridModules).fill(0));

function setFinder(startX, startY) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        grid[startY + r][startX + c] = 1;
      }
    }
  }
}

setFinder(0, 0);
setFinder(gridModules - 7, 0);
setFinder(0, gridModules - 7);

// Timing patterns
for (let i = 8; i < gridModules - 8; i++) {
  grid[6][i] = i % 2 === 0 ? 1 : 0;
  grid[i][6] = i % 2 === 0 ? 1 : 0;
}

// Deterministic pattern for remaining
let seed = 12345;
for (let r = 0; r < gridModules; r++) {
  for (let c = 0; c < gridModules; c++) {
    if ((r < 8 && c < 8) || (r < 8 && c >= gridModules - 8) || (r >= gridModules - 8 && c < 8)) {
      continue;
    }
    if (r === 6 || c === 6) continue;
    seed = (seed * 16807) % 2147483647;
    grid[r][c] = (seed % 3 === 0 || seed % 5 === 0) ? 1 : 0;
  }
}

// Center KS logo area (5x5 blanked)
const mid = Math.floor(gridModules / 2);
for (let r = mid - 2; r <= mid + 2; r++) {
  for (let c = mid - 2; c <= mid + 2; c++) {
    grid[r][c] = 2; // logo area
  }
}

const pngBuffer = createPng(size, size, (x, y) => {
  // Border
  if (x < 4 || x >= size - 4 || y < 4 || y >= size - 4) {
    return [22, 101, 52, 255]; // Forest green #166534
  }
  // Inside QR area
  if (x >= margin && x < size - margin && y >= margin && y < size - margin) {
    const gx = Math.floor((x - margin) / modSize);
    const gy = Math.floor((y - margin) / modSize);
    if (gx >= 0 && gx < gridModules && gy >= 0 && gy < gridModules) {
      if (grid[gy][gx] === 1) {
        return [15, 23, 42, 255]; // Dark slate black
      }
      if (grid[gy][gx] === 2) {
        // Logo center
        return [22, 101, 52, 255]; // Green KS
      }
    }
  }
  return [255, 255, 255, 255]; // White background
});

const outputPath = path.resolve('public', 'qris-dummy.png');
fs.writeFileSync(outputPath, pngBuffer);
console.log(`Successfully generated valid QRIS dummy PNG at ${outputPath} (${pngBuffer.length} bytes)`);
