import type { Tool } from "../tools";

export const dateCalculator: Tool = {
  slug: "date-calculator",
  name: "Date Calculator",
  category: "time",
  icon: "CalendarDays",
  summary: "Days between two dates, business days, or add and subtract days.",
  title: "Date Calculator – Days Between Dates & Add Days",
  description:
    "Count the days between two dates in years, months, weeks and business days, or add and subtract days, weeks, months and years from any date. Free.",
  intro:
    "This date calculator answers two everyday questions. Count the days between two dates, with a breakdown in years, months and days, weeks, and business days (Monday to Friday). Or add or subtract years, months, weeks and days from a date to find a deadline, notice period, visa expiry or due date, along with its weekday. Leap years and month lengths are handled for you.",
  steps: [
    "Choose “Between two dates” or “Add / subtract”.",
    "Pick your dates, or tap “Today” to fill in today's date.",
    "Turn on “Include end date” if both the first and last day should count.",
    "Read the total days, the breakdown and the business days, or the resulting date.",
  ],
  faqs: [
    {
      q: "How do I count the number of days between two dates?",
      a: "Subtract the earlier date from the later one. By default the start date is counted and the end date is not, so 1 January to 31 December 2026 is 364 days. Turn on “Include end date” to count both days, which gives 365. Use the inclusive count for things like leave applications, where the first and last days both count.",
    },
    {
      q: "How are business days calculated?",
      a: "Business days are the weekdays, Monday to Friday, inside the range. Saturdays and Sundays are skipped. Public holidays such as Pakistan Day (23 March) or Independence Day (14 August) are not removed automatically, because they differ by country and some (like Eid) follow the moon. Subtract any holidays that fall on weekdays yourself.",
    },
    {
      q: "What date is 90 days from 1 January 2026?",
      a: "Wednesday, 1 April 2026. January has 31 days and February 2026 has 28, so 31 + 28 + 31 = 90 days brings you to 1 April. Use the “Add / subtract” mode to count forward or back any number of days, weeks, months or years.",
    },
    {
      q: "What happens if I add one month to 31 January?",
      a: "February has no 31st, so the calculator moves to the last day of February: 28 February 2026, or 29 February in a leap year such as 2028. Years and months are added first, then weeks and days, which matches how contracts and banks usually count calendar months.",
    },
    {
      q: "Does the calculator handle leap years?",
      a: "Yes. A year is a leap year if it divides by 4, except century years, which must divide by 400. So 2024 and 2028 have 29 February, while 2100 will not. Month lengths and 29 February are taken into account in every result.",
    },
  ],
};
