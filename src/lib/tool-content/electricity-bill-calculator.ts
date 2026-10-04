import type { Tool } from "../tools";

export const electricityBillCalculator: Tool = {
  slug: "electricity-bill-calculator",
  name: "Electricity Bill Calculator",
  category: "pakistan",
  icon: "Zap",
  summary: "Estimate your LESCO, IESCO or other DISCO bill from units used.",
  title: "Electricity Bill Calculator Pakistan 2026 (NEPRA Rates)",
  description:
    "Estimate your WAPDA/DISCO electricity bill from units consumed with 2026 NEPRA slab rates for protected and non-protected users, GST and duty.",
  intro:
    "Type the units on your meter to estimate your electricity bill for LESCO, IESCO, FESCO, GEPCO, MEPCO, PESCO, HESCO, SEPCO, QESCO or TESCO. The calculator uses NEPRA's 2026 uniform domestic tariff for lifeline, protected and non-protected consumers, adds fixed charges, electricity duty, GST and the PTV fee, and shows the bill line by line. You can edit every rate, including the monthly fuel price adjustment, to match your latest bill.",
  steps: [
    "Enter the units consumed this month from your meter or bill.",
    "Choose your consumer type: non-protected, protected or lifeline.",
    "Enter your sanctioned load in kW (it's printed on your bill).",
    "Read the estimated bill and breakdown; edit rates or add the fuel adjustment for a closer match.",
  ],
  faqs: [
    {
      q: "What are the electricity unit rates in Pakistan in 2026?",
      a: "Under NEPRA's uniform domestic tariff effective 12 February 2026, non-protected consumers pay Rs 22.44 per unit up to 100 units, Rs 28.91 for 101–200, Rs 33.10 for 201–300, Rs 36.46 for 301–400, Rs 38.95 for 401–500, Rs 40.22 for 501–600, Rs 41.85 for 601–700 and Rs 47.20 above 700 units. Protected consumers pay Rs 10.54 up to 100 units and Rs 13.01 for 101–200.",
    },
    {
      q: "Who is a protected electricity consumer?",
      a: "A domestic consumer who has used 200 units or less in each of the previous six months. Protected consumers get lower rates and the benefit of one previous slab. If you cross 200 units in a month, you lose protected status and are billed at non-protected rates.",
    },
    {
      q: "Why does going over 200 or 300 units raise my bill so much?",
      a: "For non-protected consumers every unit is charged at the rate of the slab your total usage reaches. So 301 units are all charged at the 301–400 rate, not just the extra unit. Keeping usage just under a slab limit can noticeably lower your bill.",
    },
    {
      q: "What is the fuel price adjustment (FPA)?",
      a: "FPA is a monthly per-unit charge or refund that NEPRA approves when the actual cost of fuel for power generation differs from the reference cost. It changes every month, so enter the figure from your latest bill under Edit rates.",
    },
    {
      q: "Will this match my bill exactly?",
      a: "It is an estimate. Your DISCO may add other items such as provincial duty differences, income tax for non-filers, arrears or quarterly adjustments. Use your latest bill's figures in the Edit rates section for the closest match.",
    },
  ],
};
