import type { Tool } from "../tools";

export const discountCalculator: Tool = {
  slug: "discount-calculator",
  name: "Discount & Sales Tax Calculator",
  category: "finance",
  icon: "BadgePercent",
  summary: "Sale price after discount, extra % off, and GST or sales tax.",
  title: "Discount Calculator – Sale Price, % Off & GST",
  description:
    "Work out the sale price after a percentage or fixed discount, stack an extra % off, add 18% GST or any sales tax, and see exactly how much you save.",
  intro:
    "Find out what you'll really pay in a sale. Enter the original price and the discount as a percentage or an amount, add an extra \"10% off\" if the shop stacks offers, and include GST or sales tax. The calculator shows the final price, how much you save and the effective discount, for one item or several.",
  steps: [
    "Enter the original price.",
    "Choose percent off or amount off and type the discount.",
    "Add an extra discount or GST if they apply.",
    "Set the quantity and read the final price and your savings.",
  ],
  faqs: [
    {
      q: "How do I calculate a discount?",
      a: "Multiply the price by the discount percentage and divide by 100, then subtract it from the price. For example, 20% off Rs 2,500 is Rs 500 off, so you pay Rs 2,000.",
    },
    {
      q: "Is 20% off plus an extra 10% off the same as 30% off?",
      a: "No. The extra 10% is taken from the already-discounted price. 20% off and then 10% off Rs 2,500 is Rs 1,800, which is 28% off in total, not 30%.",
    },
    {
      q: "Is GST added before or after the discount?",
      a: "Sales tax is normally charged on the price you actually pay, so it is added after the discount. This calculator applies the tax to the discounted price.",
    },
    {
      q: "What is the GST rate in Pakistan?",
      a: "The standard sales tax rate on goods in Pakistan is 18%. Some goods and services have different rates, so use the rate printed on your receipt.",
    },
  ],
};
