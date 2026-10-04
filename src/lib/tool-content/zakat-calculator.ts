import type { Tool } from "../tools";

export const zakatCalculator: Tool = {
  slug: "zakat-calculator",
  name: "Zakat Calculator",
  category: "pakistan",
  icon: "HandCoins",
  summary: "Zakat due on cash, gold, silver and business assets.",
  title: "Zakat Calculator 2026 – Gold, Silver, Cash in Rupees",
  description:
    "Calculate zakat in rupees on cash, bank savings, gold and silver (tola or grams), business stock and investments, with the nisab worked out for you.",
  intro:
    "Work out how much zakat you owe in a few minutes. Enter your cash, bank balances, gold and silver (in tola or grams), business stock and other zakatable assets, subtract debts that are due now, and the calculator checks your wealth against the nisab and applies the 2.5% rate. Use today's gold and silver prices for an accurate result.",
  steps: [
    "Choose tola or grams, and whether to use the silver or gold nisab.",
    "Enter your cash, bank balances and the weight of your gold and silver.",
    "Type today's gold and silver price per tola or gram.",
    "Add business stock and investments, subtract debts due now, and read your zakat.",
  ],
  faqs: [
    {
      q: "What is the nisab for zakat?",
      a: "Nisab is the minimum wealth on which zakat becomes due: 52.5 tola (612.36 grams) of silver or 7.5 tola (87.48 grams) of gold, valued at today's price. Many scholars in Pakistan recommend the silver nisab because it is lower, so more people give.",
    },
    {
      q: "How is zakat calculated?",
      a: "Add up your zakatable assets (cash, bank savings, gold, silver, business stock, money owed to you and investments), subtract debts that are due now, and if the result is at or above the nisab, pay 2.5% of it. For example, net wealth of Rs 1,000,000 means zakat of Rs 25,000.",
    },
    {
      q: "How many grams are in one tola?",
      a: "One tola is 11.664 grams. The calculator converts automatically when you switch between tola and grams.",
    },
    {
      q: "Is zakat due on jewellery I wear?",
      a: "Scholars differ. Under the Hanafi school, followed by most people in Pakistan, zakat is due on gold and silver jewellery too. Under other schools, jewellery for regular personal use may be exempt. Ask a scholar you trust if you are unsure.",
    },
    {
      q: "When do I have to pay zakat?",
      a: "Zakat is due once a full lunar (Hijri) year has passed while your wealth stayed at or above the nisab. Many people calculate and pay it in Ramadan. This calculator gives an estimate; consult a scholar for your personal situation.",
    },
  ],
};
