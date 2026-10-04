import type { Tool } from "../tools";

export const imageConverter: Tool = {
  slug: "image-converter",
  name: "Image Converter",
  category: "media",
  icon: "FileImage",
  summary: "Convert between JPG, PNG and WebP and resize, in your browser.",
  title: "Image Converter – PNG to JPG, JPG to PNG, WebP Online",
  description:
    "Convert images between JPG, PNG and WebP and resize them by percent or pixels. Batch convert in your browser; your files are never uploaded.",
  intro:
    "Change image formats in seconds: PNG to JPG, JPG to PNG, WebP to JPG, JPG to WebP and more. Convert several images at once, resize them by percentage or exact pixels, and choose the background colour for transparent images when converting to JPG. All processing happens in your browser.",
  steps: [
    "Drop in your images or choose them from your device.",
    "Pick the format to convert to: JPG, PNG or WebP.",
    "Optionally set the quality and resize the images.",
    "Click Convert and download your files.",
  ],
  faqs: [
    {
      q: "How do I convert PNG to JPG?",
      a: "Add your PNG files, choose JPG and click Convert. Transparent areas are filled with the background colour you pick (white by default), because JPG can't store transparency.",
    },
    {
      q: "Should I use JPG, PNG or WebP?",
      a: "Use JPG for photos, PNG for screenshots, logos and images that need transparency, and WebP for websites, since it makes files smaller than both while keeping good quality.",
    },
    {
      q: "Can I convert HEIC photos from an iPhone?",
      a: "Only if your browser can open HEIC files, which most can't (Safari on a Mac can). On an iPhone you can set the camera to \"Most Compatible\" to save photos as JPG instead.",
    },
    {
      q: "Is converting images here private?",
      a: "Yes. The conversion uses your browser's built-in image tools, so nothing is uploaded and the files stay on your device.",
    },
  ],
};
