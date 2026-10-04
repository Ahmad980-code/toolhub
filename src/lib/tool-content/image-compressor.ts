import type { Tool } from "../tools";

export const imageCompressor: Tool = {
  slug: "image-compressor",
  name: "Image Compressor",
  category: "media",
  icon: "ImageDown",
  summary: "Shrink JPG, PNG and WebP images without uploading them.",
  title: "Image Compressor – Reduce JPG & PNG Size Online, Free",
  description:
    "Compress JPG, PNG and WebP images in your browser. Choose the quality, resize large photos and download smaller files. Nothing is uploaded.",
  intro:
    "Make photos and screenshots smaller for email, WhatsApp, websites and online forms. Drop in one or many images, pick a quality level and an optional maximum size, and download the compressed files. Everything happens on your device, so your pictures are never uploaded to a server.",
  steps: [
    "Drop your images in, choose them, or paste a screenshot.",
    "Set the quality and, if you like, a maximum width or height.",
    "Compare the original and new sizes for each image.",
    "Download the files one by one or all at once.",
  ],
  faqs: [
    {
      q: "Are my images uploaded anywhere?",
      a: "No. Compression runs entirely in your browser using your device's own image encoder. Your files never leave your computer or phone.",
    },
    {
      q: "What quality setting should I use?",
      a: "Around 70–80% usually cuts JPG and WebP files by more than half with no visible difference. Go lower for the smallest files, or higher for photos you plan to print.",
    },
    {
      q: "Why didn't my PNG get much smaller?",
      a: "PNG is a lossless format, so it can't be compressed by lowering quality. Converting it to WebP or JPG (if it has no transparency) usually makes it much smaller.",
    },
    {
      q: "How do I reduce an image to under 100 KB or 200 KB?",
      a: "Lower the quality and set a maximum width, such as 1280 or 1024 pixels. Smaller dimensions shrink the file the most, which helps meet upload limits on job and admission portals.",
    },
  ],
};
