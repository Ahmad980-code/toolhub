import type { Tool } from "../tools";

export const pdfSplit: Tool = {
  slug: "pdf-split",
  name: "Split PDF",
  category: "media",
  icon: "Scissors",
  summary: "Extract pages or split a PDF into separate files.",
  title: "Split PDF – Extract Pages from PDF Online Free",
  description:
    "Split a PDF into separate files or extract the pages you need, like 1-3, 5. Works in your browser; your document is never uploaded.",
  intro:
    "Pull out just the pages you need from a PDF, or break a long document into smaller files. Type page ranges such as 1-3, 5, 8-10 to extract them into one PDF, save every page as its own file, or split the document every few pages. Everything runs in your browser, so your document stays private.",
  steps: [
    "Drop in a PDF or choose it from your device.",
    "Choose Extract pages, Every page, or Every N pages.",
    "Enter the page ranges or how many pages each file should have.",
    "Click the button and download your new PDF files.",
  ],
  faqs: [
    {
      q: "How do I extract specific pages from a PDF?",
      a: "Choose Extract pages and type the pages you want, separated by commas, with dashes for ranges. For example, 1-3, 5 creates a PDF with pages 1, 2, 3 and 5.",
    },
    {
      q: "Can I split a PDF into single pages?",
      a: "Yes. Choose Every page and each page is saved as its own PDF. Use Download all to save them in one go.",
    },
    {
      q: "Is my PDF uploaded?",
      a: "No. The PDF is read and split on your device, and nothing is sent to a server.",
    },
    {
      q: "Does splitting reduce the quality?",
      a: "No. Pages are copied exactly, so text stays sharp and images keep their original resolution.",
    },
  ],
};
