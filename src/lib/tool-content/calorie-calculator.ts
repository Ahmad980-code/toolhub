import type { Tool } from "../tools";

export const calorieCalculator: Tool = {
  slug: "calorie-calculator",
  name: "Calorie Calculator",
  category: "health",
  icon: "Flame",
  summary: "Daily calories, BMR, TDEE and macros for your weight goal.",
  title: "Calorie Calculator – BMR, TDEE & Calories to Lose Weight",
  description:
    "Free calorie calculator using the Mifflin-St Jeor equation. Get your BMR, TDEE and daily calories to lose, maintain or gain weight, plus a macro split.",
  intro:
    "This calorie calculator estimates the energy your body burns at rest (BMR) with the Mifflin-St Jeor equation, then multiplies it by your activity level to find your total daily energy expenditure (TDEE). From there it shows daily calorie targets to maintain your weight or to lose or gain it at a steady pace, based on roughly 7,700 kcal per kilogram of body weight, along with a balanced protein, carb and fat split. The numbers are estimates for healthy adults, not medical advice: speak to a doctor or registered dietitian before a big change in diet, especially if you are pregnant, breastfeeding, under 18 or managing a health condition.",
  steps: [
    "Choose metric or imperial units and select your sex.",
    "Enter your age, height and weight.",
    "Pick the activity level that matches a typical week, then choose your goal.",
    "Read your daily calorie target, BMR, TDEE and suggested macros.",
  ],
  faqs: [
    {
      q: "How does this calorie calculator work?",
      a: "It uses the Mifflin-St Jeor equation: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age (years) + 5 for men, or − 161 for women. BMR is then multiplied by an activity factor from 1.2 (sedentary) to 1.9 (extra active) to give your TDEE. For example, a 30-year-old man who is 175 cm tall and weighs 75 kg has a BMR of about 1,699 kcal and, if moderately active (× 1.55), a TDEE of about 2,633 kcal. Mifflin-St Jeor is the formula most dietitians use and is usually within about 10% of measured values for healthy adults.",
    },
    {
      q: "How many calories should I eat to lose weight?",
      a: "A kilogram of body fat holds roughly 7,700 kcal, so eating about 550 kcal a day below your TDEE leads to around 0.5 kg of loss per week, and 1,100 kcal a day below to about 1 kg per week. Health services such as the NHS recommend losing no more than 0.5–1 kg a week. Weight loss slows as you get lighter, so recalculate every few kilograms and adjust by 100–200 kcal if your weight stalls for 2–3 weeks.",
    },
    {
      q: "What is the difference between BMR and TDEE?",
      a: "BMR (basal metabolic rate) is the energy your body needs at complete rest just to stay alive: breathing, circulation, keeping warm and repairing cells. TDEE (total daily energy expenditure) adds everything else you do, such as walking, work, exercise and digesting food. Base your eating on TDEE; eating at or below your BMR is rarely a good idea without medical supervision.",
    },
    {
      q: "Is it safe to eat fewer than 1,200 calories a day?",
      a: "For most adults, no, unless a doctor is supervising. Common guidance is to stay above about 1,200 kcal a day for women and 1,500 kcal a day for men, because very low intakes make it hard to get enough protein, vitamins and minerals and can cause muscle loss and fatigue. The calculator warns you when your target falls below these levels: choose a slower rate of loss or add more activity instead.",
    },
    {
      q: "How are the suggested macros worked out?",
      a: "The balanced split puts 30% of your calories into protein, 40% into carbohydrates and 30% into fat. Protein and carbohydrates provide 4 kcal per gram and fat provides 9 kcal per gram, so on 2,000 kcal a day that is 150 g of protein, 200 g of carbs and about 67 g of fat. Athletes, people with diabetes and anyone on a medical diet may need a different split.",
    },
  ],
};
