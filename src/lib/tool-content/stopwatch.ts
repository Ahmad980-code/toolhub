import type { Tool } from "../tools";

export const stopwatch: Tool = {
  slug: "stopwatch",
  name: "Online Stopwatch",
  category: "time",
  icon: "Timer",
  summary: "Accurate stopwatch with laps and keyboard shortcuts.",
  title: "Online Stopwatch with Laps – Accurate to 0.01 s",
  description:
    "Free online stopwatch with lap times, fastest and slowest lap highlighting and keyboard shortcuts. Accurate to 1/100 s, even in a background tab.",
  intro:
    "A simple, accurate stopwatch that runs in your browser. Start, pause and resume with one key, record as many laps as you need, and see each lap and the running total in a table, with your fastest and slowest laps highlighted. Time is measured from the browser's high-resolution clock, so it stays accurate if you switch tabs or lock your phone screen.",
  steps: [
    "Press Start, or press the Space bar.",
    "Press Lap (or L) to record a lap without stopping the clock.",
    "Press Pause to stop the clock and Resume to carry on.",
    "Press Reset (or R) to clear the time and laps.",
  ],
  faqs: [
    {
      q: "How accurate is this online stopwatch?",
      a: "The display shows hundredths of a second. Time comes from the browser's high-resolution clock (performance.now), which measures to well under a millisecond. The figure on screen is always worked out as the time since you pressed Start, so it does not drift. Your own reaction time when pressing the button, typically 0.15 to 0.25 seconds, matters far more than the clock.",
    },
    {
      q: "Does the stopwatch keep running if I switch tabs or lock my phone?",
      a: "Yes. Browsers slow down hidden tabs, but the time is calculated from timestamps rather than counted tick by tick, so it is correct when you come back. The browser tab title also shows the running time. Closing the tab or reloading the page resets the stopwatch.",
    },
    {
      q: "What are the keyboard shortcuts?",
      a: "Space starts, pauses and resumes. L records a lap and R resets. Shortcuts are ignored while you are typing in a text box, and they don't work with Ctrl, Alt or Cmd held, so normal browser shortcuts still work.",
    },
    {
      q: "What is the difference between lap time and total time?",
      a: "Lap time is how long that one lap took, measured from the previous lap (or the start). Total time, sometimes called split time, is the time on the clock when you pressed Lap. For example, laps at 0:40 and 1:25 give a second lap time of 0:45. The fastest lap is marked in green and the slowest in red.",
    },
    {
      q: "Can I copy my lap times?",
      a: "Yes. Press “Copy laps” above the lap table to copy every lap with its lap time and total time as plain text. You can paste it into a spreadsheet, a training log or a message.",
    },
  ],
};
