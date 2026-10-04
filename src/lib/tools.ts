import type { IconName } from "@/components/icon";
import { extraTools } from "./tool-content";

export type CategoryId =
  | "calculators"
  | "finance"
  | "pakistan"
  | "health"
  | "time"
  | "text"
  | "media"
  | "developer"
  | "converters";

// Insertion order is the display order on the home page, header menu and footer.
export const categories: Record<CategoryId, { name: string; description: string }> = {
  calculators: {
    name: "Everyday Calculators",
    description: "Quick answers for percentages, ages and grades.",
  },
  finance: {
    name: "Finance Calculators",
    description: "Plan loans, savings, shopping and bills with clear breakdowns.",
  },
  pakistan: {
    name: "Pakistan Tools",
    description: "Salary tax, zakat, electricity bills and rupees in words.",
  },
  health: {
    name: "Health & Fitness",
    description: "BMI, calories and the numbers behind a healthy routine.",
  },
  time: {
    name: "Date & Time",
    description: "Dates, time zones, stopwatches and focus timers.",
  },
  text: {
    name: "Text Tools",
    description: "Count, clean up, transform and type text faster.",
  },
  media: {
    name: "Image & PDF Tools",
    description: "Compress and convert images, merge and split PDFs, privately.",
  },
  developer: {
    name: "Developer & Device Tools",
    description: "Format, validate and encode data, and test your keyboard.",
  },
  converters: {
    name: "Converters & Generators",
    description: "Convert units and generate passwords and QR codes.",
  },
};

export type Tool = {
  slug: string;
  name: string;
  category: CategoryId;
  icon: IconName;
  /** Short line shown on cards. */
  summary: string;
  /** <title> — keep under ~60 characters, lead with the search keyword. */
  title: string;
  /** Meta description — keep under ~155 characters. */
  description: string;
  intro: string;
  steps: string[];
  faqs: { q: string; a: string }[];
};

export const tools: Tool[] = [
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    category: "calculators",
    icon: "Percent",
    summary: "Find X% of a number, percentage change and more.",
    title: "Percentage Calculator – Free & Instant",
    description:
      "Free percentage calculator. Work out X% of Y, what percent one number is of another, and percentage increase or decrease instantly.",
    intro:
      "This percentage calculator solves the three most common percentage questions: what is X% of a number, what percentage one number is of another, and the percentage change between two values. Results update as you type.",
    steps: [
      "Pick the question that matches your problem.",
      "Type your two numbers into the boxes.",
      "Read the answer instantly — it updates as you type.",
    ],
    faqs: [
      {
        q: "How do I calculate a percentage of a number?",
        a: "Multiply the number by the percentage and divide by 100. For example, 20% of 150 is 150 × 20 ÷ 100 = 30.",
      },
      {
        q: "How do I calculate percentage increase?",
        a: "Subtract the old value from the new value, divide by the old value and multiply by 100. Going from 50 to 65 is (65 − 50) ÷ 50 × 100 = 30% increase.",
      },
      {
        q: "What percentage is one number of another?",
        a: "Divide the part by the whole and multiply by 100. For example, 30 out of 120 is 30 ÷ 120 × 100 = 25%.",
      },
    ],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    category: "calculators",
    icon: "Cake",
    summary: "Exact age in years, months and days, plus your next birthday.",
    title: "Age Calculator – Exact Age in Years, Months & Days",
    description:
      "Calculate your exact age in years, months and days from your date of birth. See total days lived and a countdown to your next birthday.",
    intro:
      "Enter a date of birth to get an exact age in years, months and days. You can also pick a different “as of” date to find someone's age on a past or future date, and see how many days remain until the next birthday.",
    steps: [
      "Enter the date of birth.",
      "Optionally choose an “as of” date (defaults to today).",
      "See the exact age, total days and next birthday countdown.",
    ],
    faqs: [
      {
        q: "How is exact age calculated?",
        a: "We count full years since the birth date, then full months since the last birthday, then the remaining days — the same way ages are counted on official documents.",
      },
      {
        q: "Can I calculate age on a specific date?",
        a: "Yes. Change the “as of” date to any past or future date to see the age on that day.",
      },
      {
        q: "What about people born on 29 February?",
        a: "In non-leap years their birthday is treated as 1 March for the next-birthday countdown.",
      },
    ],
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    category: "health",
    icon: "Scale",
    summary: "Body Mass Index in metric or imperial units.",
    title: "BMI Calculator – Metric & Imperial",
    description:
      "Free BMI calculator for adults. Enter height and weight in kg/cm or lb/ft to get your Body Mass Index, category and healthy weight range.",
    intro:
      "Body Mass Index (BMI) is a quick screening measure that compares weight to height. Enter your height and weight in metric or imperial units to see your BMI, its category and the healthy weight range for your height.",
    steps: [
      "Choose metric (cm, kg) or imperial (ft, in, lb).",
      "Enter your height and weight.",
      "See your BMI, its category and your healthy weight range.",
    ],
    faqs: [
      {
        q: "What is a healthy BMI?",
        a: "For most adults, a BMI between 18.5 and 24.9 is considered a healthy weight. Below 18.5 is underweight, 25–29.9 is overweight and 30 or above is obese.",
      },
      {
        q: "How is BMI calculated?",
        a: "BMI is your weight in kilograms divided by your height in metres squared (kg/m²).",
      },
      {
        q: "Is BMI accurate for everyone?",
        a: "No. BMI doesn't distinguish muscle from fat and isn't designed for children, pregnant people or very muscular athletes. Talk to a doctor for a full health assessment.",
      },
    ],
  },
  {
    slug: "loan-calculator",
    name: "Loan / EMI Calculator",
    category: "finance",
    icon: "Landmark",
    summary: "Monthly payment, total interest and yearly schedule.",
    title: "Loan EMI Calculator – Monthly Payment & Interest",
    description:
      "Calculate your loan EMI (monthly payment), total interest and total cost for home, car or personal loans, with a year-by-year repayment schedule.",
    intro:
      "Use this loan calculator to work out the monthly payment (EMI) for a home loan, car loan or personal loan. It also shows the total interest you'll pay and a year-by-year breakdown of how your balance goes down.",
    steps: [
      "Enter the loan amount.",
      "Enter the annual interest rate and the loan term.",
      "See your monthly payment, total interest and repayment schedule.",
    ],
    faqs: [
      {
        q: "What is EMI?",
        a: "EMI (Equated Monthly Instalment) is the fixed amount you pay every month until a loan is fully repaid. Each payment covers that month's interest plus part of the principal.",
      },
      {
        q: "What formula is used?",
        a: "EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where P is the loan amount, r is the monthly interest rate and n is the number of monthly payments.",
      },
      {
        q: "How can I reduce the total interest?",
        a: "Choose a shorter term, negotiate a lower rate, or make extra payments toward the principal whenever your lender allows it.",
      },
    ],
  },
  {
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    category: "finance",
    icon: "TrendingUp",
    summary: "See how savings grow with compounding and monthly deposits.",
    title: "Compound Interest Calculator with Monthly Deposits",
    description:
      "See how your savings or investments grow with compound interest. Add monthly contributions, choose the compounding frequency and view a yearly breakdown.",
    intro:
      "Compound interest means you earn interest on your interest. Enter a starting amount, an annual rate, how often it compounds and an optional monthly deposit to see how your money grows year by year.",
    steps: [
      "Enter your starting amount and annual interest rate.",
      "Choose the number of years and how often interest compounds.",
      "Add an optional monthly contribution and review the yearly table.",
    ],
    faqs: [
      {
        q: "What is compound interest?",
        a: "It's interest calculated on both your original deposit and the interest already earned, so your balance grows faster over time than with simple interest.",
      },
      {
        q: "Does compounding frequency matter?",
        a: "Yes, a little. The more often interest compounds (daily vs. yearly), the more you earn at the same nominal rate, though the difference is usually small.",
      },
      {
        q: "When are monthly contributions added?",
        a: "This calculator adds contributions at the end of each month, which is a common and slightly conservative assumption.",
      },
    ],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    category: "finance",
    icon: "Receipt",
    summary: "Work out the tip and split the bill between friends.",
    title: "Tip Calculator – Split the Bill Easily",
    description:
      "Free tip calculator. Pick a tip percentage, split the bill between any number of people and see the tip and total per person instantly.",
    intro:
      "Enter the bill, pick a tip percentage and the number of people sharing. The calculator shows the tip, the total and exactly how much each person owes.",
    steps: [
      "Enter the bill amount.",
      "Choose a tip percentage or type your own.",
      "Set the number of people to split the bill.",
    ],
    faqs: [
      {
        q: "How much should I tip?",
        a: "Customs vary by country. In the US, 15–20% is typical at restaurants; many other countries expect less or include service in the bill.",
      },
      {
        q: "Should I tip on the total before or after tax?",
        a: "Most people tip on the pre-tax amount, but tipping on the total is also common. Enter whichever amount you prefer.",
      },
      {
        q: "How do I split a bill evenly?",
        a: "Add the tip to the bill and divide by the number of people. This calculator does it for you.",
      },
    ],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    category: "text",
    icon: "FileText",
    summary: "Count words, characters, sentences and reading time.",
    title: "Word Counter – Count Words & Characters Online",
    description:
      "Free online word counter. Instantly count words, characters (with and without spaces), sentences, paragraphs and estimate reading and speaking time.",
    intro:
      "Paste or type your text to instantly count words, characters, sentences and paragraphs. It's ideal for essays, social media posts, SEO meta descriptions and anything with a length limit. Your text never leaves your browser.",
    steps: [
      "Paste or type your text into the box.",
      "Counts update instantly as you type.",
      "Use the reading time to plan articles and speeches.",
    ],
    faqs: [
      {
        q: "Is my text stored or uploaded?",
        a: "No. Counting happens entirely in your browser — nothing is sent to a server.",
      },
      {
        q: "How is reading time estimated?",
        a: "We use an average reading speed of 200 words per minute and a speaking speed of 130 words per minute.",
      },
      {
        q: "Does it count characters with spaces?",
        a: "Yes, it shows both characters with spaces and characters without spaces.",
      },
    ],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    category: "text",
    icon: "CaseSensitive",
    summary: "UPPER, lower, Title, Sentence, camelCase and more.",
    title: "Case Converter – Upper, Lower, Title & Sentence Case",
    description:
      "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case or kebab-case instantly. Free and private.",
    intro:
      "Accidentally typed with Caps Lock on? Need a headline in Title Case or a variable name in camelCase? Paste your text and convert it with one click, then copy the result.",
    steps: [
      "Paste your text into the box.",
      "Click the case you want.",
      "Copy the converted text.",
    ],
    faqs: [
      {
        q: "What is Title Case?",
        a: "Title Case capitalises the first letter of every word, as in “The Quick Brown Fox”.",
      },
      {
        q: "What is Sentence case?",
        a: "Sentence case capitalises only the first letter of each sentence, like normal writing.",
      },
      {
        q: "What are camelCase, snake_case and kebab-case?",
        a: "They are naming styles used in programming: camelCase joins words with capitals (myVariable), snake_case uses underscores (my_variable) and kebab-case uses hyphens (my-variable).",
      },
    ],
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    category: "developer",
    icon: "Braces",
    summary: "Pretty-print, minify and validate JSON.",
    title: "JSON Formatter & Validator – Beautify JSON Online",
    description:
      "Free online JSON formatter and validator. Beautify messy JSON with 2 or 4 space indentation, minify it, and find syntax errors fast.",
    intro:
      "Paste JSON to format it with clean indentation, minify it for production, or validate it and see exactly what's wrong. Everything runs locally in your browser, so it's safe for private data.",
    steps: [
      "Paste your JSON into the input box.",
      "Click Format, Minify or Validate.",
      "Copy the result or fix the error shown.",
    ],
    faqs: [
      {
        q: "Is it safe to paste sensitive JSON?",
        a: "Yes. The JSON is parsed by your own browser and never uploaded anywhere.",
      },
      {
        q: "Why is my JSON invalid?",
        a: "Common causes are trailing commas, single quotes instead of double quotes, unquoted keys and comments — none of which are allowed in standard JSON.",
      },
      {
        q: "What does minify do?",
        a: "It removes all unnecessary whitespace so the JSON is as small as possible, which is useful for APIs and config files.",
      },
    ],
  },
  {
    slug: "base64-encode-decode",
    name: "Base64 Encoder / Decoder",
    category: "developer",
    icon: "Binary",
    summary: "Encode text to Base64 or decode it back (UTF-8 safe).",
    title: "Base64 Encode & Decode Online – Free Tool",
    description:
      "Encode text to Base64 or decode Base64 to text instantly. Supports emojis and all UTF-8 characters. Free, fast and private.",
    intro:
      "Base64 turns text or binary data into a safe set of ASCII characters, commonly used in emails, data URLs and APIs. Switch between encode and decode and get the result as you type.",
    steps: [
      "Choose Encode or Decode.",
      "Paste your text or Base64 string.",
      "Copy the result.",
    ],
    faqs: [
      {
        q: "Is Base64 encryption?",
        a: "No. Base64 is an encoding, not encryption. Anyone can decode it, so never use it to protect secrets.",
      },
      {
        q: "Does it support emojis and non-English text?",
        a: "Yes. Text is encoded as UTF-8 first, so any language and emoji works.",
      },
      {
        q: "Why does Base64 make data bigger?",
        a: "Base64 uses 4 characters to represent every 3 bytes, so encoded data is about 33% larger.",
      },
    ],
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    category: "converters",
    icon: "Ruler",
    summary: "Length, weight, temperature, volume and speed.",
    title: "Unit Converter – Length, Weight, Temperature & More",
    description:
      "Convert between metric and imperial units: length, weight, temperature, volume and speed. Instant results and a full conversion table.",
    intro:
      "Convert centimetres to inches, kilograms to pounds, Celsius to Fahrenheit and much more. Pick a category, enter a value and see the result alongside a table of every other unit.",
    steps: [
      "Pick a category such as Length or Temperature.",
      "Enter a value and choose the units to convert between.",
      "See the result and the full conversion table.",
    ],
    faqs: [
      {
        q: "How many centimetres are in an inch?",
        a: "One inch is exactly 2.54 centimetres.",
      },
      {
        q: "How do I convert Celsius to Fahrenheit?",
        a: "Multiply by 9/5 and add 32. For example, 25 °C is 25 × 9 ÷ 5 + 32 = 77 °F.",
      },
      {
        q: "How many pounds are in a kilogram?",
        a: "One kilogram is about 2.20462 pounds.",
      },
    ],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    category: "converters",
    icon: "KeyRound",
    summary: "Strong random passwords, generated in your browser.",
    title: "Strong Password Generator – Secure & Random",
    description:
      "Generate strong, random passwords with letters, numbers and symbols. Uses your browser's secure random generator — nothing is sent or stored.",
    intro:
      "Create strong, unique passwords in one click. Choose the length and character types; passwords are generated with your browser's cryptographically secure random number generator and are never sent anywhere.",
    steps: [
      "Choose a length (16+ characters is recommended).",
      "Select the character types to include.",
      "Click Generate and copy your password.",
    ],
    faqs: [
      {
        q: "Are the generated passwords secure?",
        a: "Yes. They use crypto.getRandomValues, the browser's cryptographically secure random generator, and are created entirely on your device.",
      },
      {
        q: "How long should a password be?",
        a: "At least 12 characters, and 16 or more for important accounts. Longer passwords are much harder to crack.",
      },
      {
        q: "Should I reuse passwords?",
        a: "Never. Use a unique password for every account and store them in a password manager.",
      },
    ],
  },
  // Newer tools keep their content in src/lib/tool-content/<slug>.ts (one file per tool).
  ...extraTools,
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}

export function toolsInCategory(category: CategoryId) {
  return tools.filter((t) => t.category === category);
}

export function relatedTools(tool: Tool, count = 4) {
  const same = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug);
  const others = tools.filter((t) => t.category !== tool.category);
  return [...same, ...others].slice(0, count);
}
