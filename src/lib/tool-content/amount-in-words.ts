import type { Tool } from "../tools";

export const amountInWords: Tool = {
  slug: "amount-in-words",
  name: "Amount in Words",
  category: "pakistan",
  icon: "Banknote",
  summary: "Write any amount in words in rupees (lakh/crore) or millions, for cheques.",
  title: "Amount in Words – Rupees in Words for Cheques (Lakh, Crore)",
  description:
    "Convert any number or amount to words in Pakistani rupees using lakh and crore, or in millions. Cheque style with paisa and \"Only\". Free and instant.",
  intro:
    "Type an amount and get it written out in words, ready for a cheque, invoice or legal document. Choose the South Asian system (thousand, lakh, crore, arab) used in Pakistan and India, or the international system (million, billion). Rupees, paisa, dollars and cents are handled, and you can add \"Only\" at the end the way banks expect.",
  steps: [
    "Type the amount in figures; commas and decimals are fine.",
    "Choose lakh/crore or million, and the currency.",
    "Pick a letter case and whether to add \"Only\".",
    "Copy the amount in words.",
  ],
  faqs: [
    {
      q: "How do I write 1,25,000 in words?",
      a: "In the lakh/crore system, 1,25,000 is \"One Lakh Twenty-Five Thousand\", so on a cheque you write \"Rupees One Lakh Twenty-Five Thousand Only\". In the international system the same amount, 125,000, is \"One Hundred Twenty-Five Thousand\".",
    },
    {
      q: "How many lakh are in a million, and how many crore in a billion?",
      a: "One million is 10 lakh, and ten million is 1 crore. One billion is 100 crore, which is also called 1 arab.",
    },
    {
      q: "How should I write paisa on a cheque?",
      a: "Write the rupees first and the paisa after \"and\", for example \"Rupees Five Thousand and Fifty Paisa Only\" for Rs 5,000.50. The calculator rounds to two decimal places.",
    },
    {
      q: "Why add \"Only\" at the end?",
      a: "Ending the amount with \"Only\" shows that nothing comes after it, which stops anyone adding words to change the amount. Banks in Pakistan and South Asia expect it on cheques.",
    },
    {
      q: "How large an amount can I convert?",
      a: "Up to 15 digits before the decimal point, which is 999 trillion in the international system or 99 neel in the South Asian system.",
    },
  ],
};
