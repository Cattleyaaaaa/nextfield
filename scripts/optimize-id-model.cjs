const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const source = path.join(__dirname, "..", "components", "visual", "card.glb");
const target = path.join(__dirname, "..", "public", "models", "nextfield-id.glb");

const align4 = (length) => (length + 3) & ~3;

async function main() {
  const original = fs.readFileSync(source);
  if (original.toString("ascii", 0, 4) !== "glTF" || original.readUInt32LE(4) !== 2) {
    throw new Error("Expected a binary glTF 2.0 model");
  }

  const jsonLength = original.readUInt32LE(12);
  const json = JSON.parse(original.toString("utf8", 20, 20 + jsonLength));
  const binHeader = 20 + jsonLength;
  const binStart = binHeader + 8;
  const binLength = original.readUInt32LE(binHeader);
  const bin = original.subarray(binStart, binStart + binLength);
  const image = json.images[0];
  const imageView = json.bufferViews[image.bufferView];
  const imageEnd = imageView.byteOffset + imageView.byteLength;

  // The baked atlas is the final buffer view; the card front is redrawn at
  // runtime, so a 768px atlas keeps its detail without shipping a 2.3MB PNG.
  if (image.mimeType !== "image/png" || imageEnd !== json.buffers[0].byteLength) {
    throw new Error("Unexpected card model layout; review it before optimizing");
  }

  const atlas = bin.subarray(imageView.byteOffset, imageEnd);
  const optimized = await sharp(atlas).resize({ width: 768 }).png({ compressionLevel: 9 }).toBuffer();
  imageView.byteLength = optimized.length;
  json.buffers[0].byteLength = imageView.byteOffset + optimized.length;

  const jsonBytes = Buffer.from(JSON.stringify(json));
  const paddedJson = Buffer.alloc(align4(jsonBytes.length), 0x20);
  jsonBytes.copy(paddedJson);
  const binBytes = Buffer.concat([bin.subarray(0, imageView.byteOffset), optimized]);
  const paddedBin = Buffer.alloc(align4(binBytes.length));
  binBytes.copy(paddedBin);

  const header = Buffer.alloc(12);
  header.write("glTF", 0, "ascii");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + paddedJson.length + 8 + paddedBin.length, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(paddedJson.length, 0);
  jsonHeader.write("JSON", 4, "ascii");
  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(paddedBin.length, 0);
  binChunkHeader.write("BIN\0", 4, "ascii");

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, Buffer.concat([header, jsonHeader, paddedJson, binChunkHeader, paddedBin]));
  console.log(`${path.relative(process.cwd(), target)}: ${original.length} → ${fs.statSync(target).size} bytes`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
