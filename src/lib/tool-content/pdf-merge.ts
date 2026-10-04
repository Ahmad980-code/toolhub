import type { Tool } from "../tools";

export const pdfMerge: Tool = {
  slug: "pdf-merge",
  name: "Merge PDF",
  category: "media",
  icon: "Combine",
  summary: "Combine several PDF files into one, privately.",
  title: "Merge PDF – Combine PDF Files Online Free",
  description:
    "Merge multiple PDF files into one document in your browser. Drag to reorder, see page counts, and download instantly. No upload, no sign-up.",
  intro:
    "Combine assignments, scanned documents, invoices or certificates into a single PDF. Add your files, drag them into the right order, and download one merged document. The PDFs are processed on your own device, so even confidential documents stay private.",
  steps: [
    "Drop in two or more PDF files, or choose them from your device.",
    "Drag the files (or use the arrows) to put them in order.",
    "Click Merge to combine them.",
    "Your merged PDF downloads automatically.",
  ],
  faqs: [
    {
      q: "Is it safe to merge confidential PDFs here?",
      a: "Yes. The files are merged inside your browser and are never uploaded to a server, so nobody else can see them.",
    },
    {
      q: "Is there a limit on files or size?",
      a: "There's no fixed limit. Very large PDFs depend on your device's memory, so merging hundreds of megabytes works best on a computer.",
    },
    {
      q: "Can I merge password-protected PDFs?",
      a: "Not directly. Open the PDF with its password and save or print a copy without protection first, then merge that copy.",
    },
    {
      q: "Will the quality of my PDFs change?",
      a: "No. Pages are copied as they are, so text, images and links keep their original quality.",
    },
  ],
};
