/**
 * In-browser image decode / resize / encode used by the image compressor and converter.
 * Decoding honours EXIF orientation; encoding uses canvas.toBlob, so the output is whatever the
 * browser's own JPEG/PNG/WebP encoder produces.
 */
import { extension } from "./files";

export type OutputType = "image/jpeg" | "image/png" | "image/webp";

export const OUTPUT_LABEL: Record<OutputType, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
};

export const OUTPUT_EXT: Record<OutputType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Largest edge we allow for an output canvas (Chrome/Firefox limit; Safari is lower by area). */
export const MAX_EDGE = 16_384;

const LABELS: Record<string, string> = {
  jpg: "JPG",
  jpeg: "JPG",
  jfif: "JPG",
  png: "PNG",
  webp: "WebP",
  gif: "GIF",
  bmp: "BMP",
  avif: "AVIF",
  heic: "HEIC",
  heif: "HEIF",
  svg: "SVG",
  tif: "TIFF",
  tiff: "TIFF",
  ico: "ICO",
};

/** Short format name of an input file from its MIME type or extension ("JPG", "PNG", "HEIC"…). */
export function formatLabel(file: File) {
  const fromType = file.type.startsWith("image/") ? file.type.slice(6).replace("svg+xml", "svg").replace("x-icon", "ico").replace("vnd.microsoft.icon", "ico") : "";
  return LABELS[fromType] ?? LABELS[extension(file.name)] ?? (extension(file.name).toUpperCase() || "Image");
}

/** The output MIME type that matches the input file, if it is one we can encode. */
export function sameOutputType(file: File): OutputType | null {
  const label = formatLabel(file);
  if (label === "JPG") return "image/jpeg";
  if (label === "PNG") return "image/png";
  if (label === "WebP") return "image/webp";
  return null;
}

export type Decoded = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

export class ImageToolError extends Error {}

/** Friendly explanation for a file the browser could not decode. */
export function decodeErrorMessage(file: File) {
  const label = formatLabel(file);
  if (label === "HEIC" || label === "HEIF")
    return "This browser can't open HEIC photos (the iPhone default). Open it in Safari, or on the iPhone choose Settings > Camera > Formats > Most Compatible, or share the photo as JPG first.";
  if (label === "TIFF") return "This browser can't open TIFF images (only Safari can). Export it as PNG or JPG from another app first.";
  if (label === "AVIF") return "This browser can't open AVIF images. Update to the latest Chrome, Edge, Firefox or Safari.";
  if (!file.type.startsWith("image/") && !LABELS[extension(file.name)])
    return "This doesn't look like an image file.";
  return "This image couldn't be opened. It may be damaged, or in a format this browser can't read.";
}

/**
 * Decodes an image file with EXIF orientation applied. Falls back to an <img> element for formats
 * createImageBitmap rejects in some browsers (SVG, ICO, HEIC in Safari).
 */
export async function decodeImage(file: Blob & { name?: string }): Promise<Decoded> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      if (!img.naturalWidth || !img.naturalHeight) throw new Error("no size");
      return {
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      };
    } catch {
      URL.revokeObjectURL(url);
      throw new ImageToolError(file instanceof File ? decodeErrorMessage(file) : "This image couldn't be opened.");
    }
  }
}

/** Scales (w, h) down to fit inside maxW x maxH (either may be NaN = no limit). Never upscales. */
export function fitWithin(w: number, h: number, maxW: number, maxH: number) {
  let scale = 1;
  if (maxW > 0) scale = Math.min(scale, maxW / w);
  if (maxH > 0) scale = Math.min(scale, maxH / h);
  if (scale >= 1) return { width: w, height: h };
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx || canvas.width !== width || canvas.height !== height)
    throw new ImageToolError("This image is too large for your browser to process. Try a smaller size.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

function release(canvas: HTMLCanvasElement) {
  // Frees the backing store right away instead of waiting for GC (matters on phones).
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Draws the decoded image at width x height and encodes it. For large reductions the image is
 * halved step by step first, which keeps downscaled photos sharp in every browser.
 * `background` fills transparent areas (needed for JPG, which has no transparency).
 */
export async function encodeImage(
  img: Decoded,
  { width, height, type, quality, background }: { width: number; height: number; type: OutputType; quality: number; background?: string },
): Promise<Blob> {
  if (width > MAX_EDGE || height > MAX_EDGE)
    throw new ImageToolError(`Images can be at most ${MAX_EDGE.toLocaleString("en-US")} px on each side.`);

  let source: CanvasImageSource = img.source;
  let sw = img.width;
  let sh = img.height;
  const temps: HTMLCanvasElement[] = [];
  while (sw / 2 >= width && sh / 2 >= height && sw > 2 && sh > 2) {
    const nw = Math.max(width, Math.round(sw / 2));
    const nh = Math.max(height, Math.round(sh / 2));
    const step = makeCanvas(nw, nh);
    step.ctx.drawImage(source, 0, 0, sw, sh, 0, 0, nw, nh);
    temps.push(step.canvas);
    source = step.canvas;
    sw = nw;
    sh = nh;
  }

  const { canvas, ctx } = makeCanvas(width, height);
  try {
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(source, 0, 0, sw, sh, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    if (!blob) throw new ImageToolError("This image is too large for your browser to process. Try a smaller size.");
    if (blob.type !== type)
      throw new ImageToolError(`This browser can't create ${OUTPUT_LABEL[type]} files. Choose another format.`);
    return blob;
  } finally {
    release(canvas);
    temps.forEach(release);
  }
}

/** True when the browser's canvas can encode WebP (Safari can't); client-only. */
export function canEncodeWebp() {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}
