import type { Tool } from "../tools";

export const fuelCostCalculator: Tool = {
  slug: "fuel-cost-calculator",
  name: "Fuel Cost Calculator",
  category: "finance",
  icon: "Fuel",
  summary: "Trip fuel cost from distance, mileage and petrol price.",
  title: "Fuel Cost Calculator – Petrol Cost for Any Trip",
  description:
    "Calculate the petrol or diesel cost of a trip from distance, your car's mileage (km/L, L/100 km or MPG) and the fuel price. Split it between passengers.",
  intro:
    "Planning a road trip or a daily commute? Enter the distance, your car's fuel economy and the current petrol price to see how much fuel you'll need and what it will cost. Switch on round trip for the drive back, and split the total between everyone in the car.",
  steps: [
    "Enter the distance in kilometres or miles.",
    "Choose how your fuel economy is measured and enter your car's figure.",
    "Type today's fuel price per litre (or per gallon for MPG).",
    "Turn on round trip if needed, set how many people share, and read the cost.",
  ],
  faqs: [
    {
      q: "How do I calculate fuel cost for a trip?",
      a: "Divide the distance by your car's mileage to get the litres needed, then multiply by the price per litre. For example, 120 km in a car that does 14 km/L needs about 8.57 litres; at Rs 265 a litre that's about Rs 2,271.",
    },
    {
      q: "How do I find my car's mileage?",
      a: "Fill the tank, reset the trip meter, drive normally, then fill up again. Divide the kilometres driven by the litres you added to get km per litre.",
    },
    {
      q: "How do I convert km/L to L/100 km?",
      a: "Divide 100 by the km/L figure. A car that does 14 km/L uses 100 ÷ 14 ≈ 7.14 litres per 100 km. The calculator converts automatically when you switch units.",
    },
    {
      q: "Why is my real fuel cost higher than the estimate?",
      a: "City traffic, high speeds, air conditioning, heavy loads and low tyre pressure all increase fuel use. Add 10–15% for a safe budget.",
    },
  ],
};
