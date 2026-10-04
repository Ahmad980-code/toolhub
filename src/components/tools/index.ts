import type { ComponentType } from "react";
import AgeCalculator from "./age-calculator";
import Base64Tool from "./base64-encode-decode";
import BmiCalculator from "./bmi-calculator";
import CaseConverter from "./case-converter";
import CompoundInterestCalculator from "./compound-interest-calculator";
import JsonFormatter from "./json-formatter";
import LoanCalculator from "./loan-calculator";
import PasswordGenerator from "./password-generator";
import PercentageCalculator from "./percentage-calculator";
import TipCalculator from "./tip-calculator";
import UnitConverter from "./unit-converter";
import WordCounter from "./word-counter";
import CgpaCalculator from "./cgpa-calculator";
import CurrencyConverter from "./currency-converter";
import DiscountCalculator from "./discount-calculator";
import FuelCostCalculator from "./fuel-cost-calculator";
import SalaryTaxCalculatorPakistan from "./salary-tax-calculator-pakistan";
import ZakatCalculator from "./zakat-calculator";
import ElectricityBillCalculator from "./electricity-bill-calculator";
import AmountInWords from "./amount-in-words";
import CalorieCalculator from "./calorie-calculator";
import DateCalculator from "./date-calculator";
import TimeZoneConverter from "./time-zone-converter";
import Stopwatch from "./stopwatch";
import CountdownTimer from "./countdown-timer";
import PomodoroTimer from "./pomodoro-timer";
import TypingSpeedTest from "./typing-speed-test";
import ImageCompressor from "./image-compressor";
import ImageConverter from "./image-converter";
import PdfMerge from "./pdf-merge";
import PdfSplit from "./pdf-split";
import QrCodeGenerator from "./qr-code-generator";
import KeyboardTester from "./keyboard-tester";

/** Maps each tool slug in src/lib/tools.ts to its interactive component. */
export const toolComponents: Record<string, ComponentType> = {
  "percentage-calculator": PercentageCalculator,
  "age-calculator": AgeCalculator,
  "bmi-calculator": BmiCalculator,
  "loan-calculator": LoanCalculator,
  "compound-interest-calculator": CompoundInterestCalculator,
  "tip-calculator": TipCalculator,
  "word-counter": WordCounter,
  "case-converter": CaseConverter,
  "json-formatter": JsonFormatter,
  "base64-encode-decode": Base64Tool,
  "unit-converter": UnitConverter,
  "password-generator": PasswordGenerator,
  "cgpa-calculator": CgpaCalculator,
  "currency-converter": CurrencyConverter,
  "discount-calculator": DiscountCalculator,
  "fuel-cost-calculator": FuelCostCalculator,
  "salary-tax-calculator-pakistan": SalaryTaxCalculatorPakistan,
  "zakat-calculator": ZakatCalculator,
  "electricity-bill-calculator": ElectricityBillCalculator,
  "amount-in-words": AmountInWords,
  "calorie-calculator": CalorieCalculator,
  "date-calculator": DateCalculator,
  "time-zone-converter": TimeZoneConverter,
  "stopwatch": Stopwatch,
  "countdown-timer": CountdownTimer,
  "pomodoro-timer": PomodoroTimer,
  "typing-speed-test": TypingSpeedTest,
  "image-compressor": ImageCompressor,
  "image-converter": ImageConverter,
  "pdf-merge": PdfMerge,
  "pdf-split": PdfSplit,
  "qr-code-generator": QrCodeGenerator,
  "keyboard-tester": KeyboardTester,
};
