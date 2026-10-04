import type { Tool } from "../tools";

export const timeZoneConverter: Tool = {
  slug: "time-zone-converter",
  name: "Time Zone Converter",
  category: "time",
  icon: "Globe",
  summary: "Convert a time between Pakistan, the Gulf, UK, US and 60+ cities.",
  title: "Time Zone Converter – Pakistan, UAE, UK & USA Time",
  description:
    "Convert any time between Pakistan (PKT), Dubai, Saudi Arabia, London, New York and 60+ cities. Daylight saving is handled automatically. Free.",
  intro:
    "Pick a date, a time and a city, and see the same moment in Pakistan, the Gulf, the UK, North America, Australia and anywhere else you add. Each city shows its local time and date, its UTC offset, how far ahead or behind it is, and whether it is day or night there. Daylight saving changes come from the IANA time zone database built into your browser, so meeting and call times are right all year.",
  steps: [
    "Enter the date and time, or press “Now” for the current time.",
    "Choose the city that time belongs to in “Time in”.",
    "Read the same moment in every city below.",
    "Add cities from the list or remove the ones you don't need.",
  ],
  faqs: [
    {
      q: "What is the time difference between Pakistan and the UK?",
      a: "Pakistan Standard Time (PKT) is UTC+5 all year. The UK uses GMT (UTC+0) in winter and British Summer Time (UTC+1) from the last Sunday of March to the last Sunday of October. So Pakistan is 5 hours ahead of London in winter and 4 hours ahead in summer. In 2026 the UK changes back to GMT on 25 October.",
    },
    {
      q: "What is the time difference between Pakistan and New York?",
      a: "New York uses EST (UTC−5) in winter and EDT (UTC−4) from the second Sunday of March to the first Sunday of November. Pakistan is 10 hours ahead of New York in winter and 9 hours ahead in summer. In 2026 US clocks go back on 1 November, so 9:00 AM in Karachi on 16 November 2026 is 11:00 PM the previous evening in New York.",
    },
    {
      q: "What is the time difference between Pakistan, Dubai and Saudi Arabia?",
      a: "None of the three use daylight saving time, so the gap never changes. The UAE (Gulf Standard Time) is UTC+4, one hour behind Pakistan. Saudi Arabia (Arabia Standard Time) is UTC+3, two hours behind Pakistan. When it is 12:00 noon in Lahore, it is 11:00 AM in Dubai and 10:00 AM in Riyadh.",
    },
    {
      q: "Does Pakistan observe daylight saving time?",
      a: "No. Pakistan tried daylight saving in 2002, 2008 and 2009, but has stayed on UTC+5 all year since 2009. India is UTC+5:30 with no daylight saving either, so India is always 30 minutes ahead of Pakistan.",
    },
    {
      q: "How does the converter handle daylight saving time?",
      a: "It uses the IANA time zone database built into your browser, which records every country's clock changes. The offset for each city is worked out for the exact date you choose, so a call booked after the US or UK clock change shows the new time. If you pick a time that is skipped when clocks spring forward, the tool warns you.",
    },
  ],
};
