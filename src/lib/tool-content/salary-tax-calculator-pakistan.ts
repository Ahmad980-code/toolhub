import type { Tool } from "../tools";

export const salaryTaxCalculatorPakistan: Tool = {
  slug: "salary-tax-calculator-pakistan",
  name: "Salary Tax Calculator Pakistan",
  category: "pakistan",
  icon: "ReceiptText",
  summary: "Income tax and take-home pay under the 2026-27 FBR slabs.",
  title: "Salary Tax Calculator Pakistan 2026-27 (FBR Slabs)",
  description:
    "Calculate monthly and yearly income tax on your salary in Pakistan under the Finance Act 2026 slabs, with take-home pay and a slab-by-slab breakdown.",
  intro:
    "Enter your monthly or annual salary to see how much income tax you pay in Pakistan and what you take home. The calculator uses the salaried-individual slabs from the Finance Act 2026 for tax year 2027 (July 2026 to June 2027), and you can switch to the 2025-26 slabs to compare. A table shows exactly how much of your salary falls in each slab.",
  steps: [
    "Pick the tax year: 2026-27 is the current one.",
    "Choose whether you are entering a monthly or an annual salary.",
    "Type your taxable salary in rupees.",
    "Read your monthly tax, take-home pay and the slab-by-slab breakdown.",
  ],
  faqs: [
    {
      q: "What are the salary tax slabs for 2026-27 in Pakistan?",
      a: "For tax year 2027 the Finance Act 2026 sets: no tax up to Rs 600,000 a year; 1% of the amount above Rs 600,000 up to Rs 1.2 million; Rs 6,000 + 11% up to Rs 2.2 million; Rs 116,000 + 20% up to Rs 3.2 million; Rs 316,000 + 25% up to Rs 4.1 million; Rs 541,000 + 29% up to Rs 5.6 million; Rs 976,000 + 32% up to Rs 7 million; and Rs 1,424,000 + 35% above Rs 7 million.",
    },
    {
      q: "How much tax do I pay on a Rs 150,000 monthly salary?",
      a: "Rs 150,000 a month is Rs 1.8 million a year. Under the 2026-27 slabs the tax is Rs 6,000 + 11% of Rs 600,000 = Rs 72,000 a year, or Rs 6,000 a month, leaving Rs 144,000 take-home each month.",
    },
    {
      q: "Is there still a surcharge on high salaries?",
      a: "No. The 9% surcharge on the tax of individuals earning more than Rs 10 million a year applied in tax year 2026 but was abolished by the Finance Act 2026 from 1 July 2026.",
    },
    {
      q: "Is no tax charged on salaries up to Rs 50,000 a month?",
      a: "Yes. Annual taxable salary up to Rs 600,000 (Rs 50,000 a month) is taxed at 0% in both 2025-26 and 2026-27.",
    },
    {
      q: "Is this calculation exact?",
      a: "It is an estimate of tax on salary income only. Your actual deduction can differ if you have other income, tax credits (for example on donations or pension contributions), or exempt allowances. Check your tax certificate or with FBR for the final figure.",
    },
  ],
};
