import type { Tool } from "../tools";
import { cgpaCalculator } from "./cgpa-calculator";
import { currencyConverter } from "./currency-converter";
import { discountCalculator } from "./discount-calculator";
import { fuelCostCalculator } from "./fuel-cost-calculator";
import { salaryTaxCalculatorPakistan } from "./salary-tax-calculator-pakistan";
import { zakatCalculator } from "./zakat-calculator";
import { electricityBillCalculator } from "./electricity-bill-calculator";
import { amountInWords } from "./amount-in-words";
import { calorieCalculator } from "./calorie-calculator";
import { dateCalculator } from "./date-calculator";
import { timeZoneConverter } from "./time-zone-converter";
import { stopwatch } from "./stopwatch";
import { countdownTimer } from "./countdown-timer";
import { pomodoroTimer } from "./pomodoro-timer";
import { typingSpeedTest } from "./typing-speed-test";
import { imageCompressor } from "./image-compressor";
import { imageConverter } from "./image-converter";
import { pdfMerge } from "./pdf-merge";
import { pdfSplit } from "./pdf-split";
import { qrCodeGenerator } from "./qr-code-generator";
import { keyboardTester } from "./keyboard-tester";

/** Tools whose content lives in one file each (see tools.ts). Order within a category = display order. */
export const extraTools: Tool[] = [
  cgpaCalculator,
  currencyConverter,
  discountCalculator,
  fuelCostCalculator,
  salaryTaxCalculatorPakistan,
  zakatCalculator,
  electricityBillCalculator,
  amountInWords,
  calorieCalculator,
  dateCalculator,
  timeZoneConverter,
  stopwatch,
  countdownTimer,
  pomodoroTimer,
  typingSpeedTest,
  imageCompressor,
  imageConverter,
  pdfMerge,
  pdfSplit,
  qrCodeGenerator,
  keyboardTester,
];
