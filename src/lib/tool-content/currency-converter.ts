import type { Tool } from "../tools";

export const currencyConverter: Tool = {
  slug: "currency-converter",
  name: "Currency Converter",
  category: "finance",
  icon: "ArrowLeftRight",
  summary: "Live exchange rates for PKR, USD, SAR, AED, GBP and 35+ currencies.",
  title: "Currency Converter – Live USD to PKR & 40 Currencies",
  description:
    "Convert US dollars, riyals, dirhams, pounds and euros to Pakistani rupees and 35+ other currencies with live exchange rates updated daily.",
  intro:
    "Convert money between Pakistani rupees, US dollars, Saudi riyals, UAE dirhams, British pounds, euros and more than 30 other currencies. Rates are fetched live and updated daily, and you can see the inverse rate and your amount in other popular currencies at a glance. Handy for remittances, freelancing payments, travel and online shopping.",
  steps: [
    "Enter the amount you want to convert.",
    "Choose the currency you have and the one you want, or tap a popular pair.",
    "Read the converted amount and the exchange rate.",
    "Check the table for the same amount in other popular currencies.",
  ],
  faqs: [
    {
      q: "Where do the exchange rates come from?",
      a: "Rates are mid-market rates from Exchange Rate API, updated once a day. Mid-market rates are the midpoint between buying and selling prices on global currency markets.",
    },
    {
      q: "Why does my bank give a different rate?",
      a: "Banks, exchange companies and money transfer services add a margin to the mid-market rate, and some also charge fees. Use this converter as a reference and check the final rate with your provider.",
    },
    {
      q: "What is the best way to send money to Pakistan?",
      a: "Compare the exchange rate and fees of banks and licensed money transfer services, and use official channels such as Roshan Digital Accounts or registered remittance services so the money arrives safely.",
    },
    {
      q: "Does the converter work offline?",
      a: "It needs an internet connection to fetch rates. Once loaded, rates are kept for an hour in your browser so switching currencies is instant.",
    },
  ],
};
