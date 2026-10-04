import type { Tool } from "../tools";

export const pomodoroTimer: Tool = {
  slug: "pomodoro-timer",
  name: "Pomodoro Timer",
  category: "time",
  icon: "AlarmClock",
  summary: "Focus in 25-minute sessions with automatic breaks.",
  title: "Pomodoro Timer Online – 25/5 Focus Timer",
  description:
    "Free Pomodoro timer: 25-minute focus sessions, 5-minute breaks and a 15-minute long break every 4 sessions. Custom lengths, sound and a daily count.",
  intro:
    "The Pomodoro Technique breaks work into short, focused sessions with regular breaks: 25 minutes of focus, a 5-minute break, and a longer break after every four sessions. This timer runs the whole cycle for you. It chimes when each phase ends, can start the next phase on its own, and counts the focus sessions you finish today. Lengths can be changed and are saved in your browser.",
  steps: [
    "Press Start to begin a 25-minute focus session.",
    "Work on one task until the chime, then take the break the timer starts.",
    "After four focus sessions, enjoy the longer break.",
    "Open Settings to change the lengths, auto-start or sound.",
  ],
  faqs: [
    {
      q: "What is the Pomodoro Technique?",
      a: "It is a time-management method created by Francesco Cirillo in the late 1980s and named after his tomato-shaped kitchen timer (pomodoro is Italian for tomato). You pick a task and work on it for one pomodoro of 25 minutes, then take a 3 to 5 minute break. After four pomodoros you take a longer break of 15 to 30 minutes.",
    },
    {
      q: "What are the default settings?",
      a: "Focus 25 minutes, short break 5 minutes, long break 15 minutes, with a long break after every 4 focus sessions. One full cycle takes 2 hours 10 minutes: four 25-minute sessions (100 min), three short breaks (15 min) and one long break (15 min).",
    },
    {
      q: "Can I change the session lengths?",
      a: "Yes. Open Settings to set the focus length (1 to 180 minutes), the short and long breaks (1 to 60 minutes) and how many sessions come before a long break. Many people use 50/10 for deep work or 15/3 for tasks they keep putting off. Changes apply to the next phase that starts.",
    },
    {
      q: "Are my settings and session count saved?",
      a: "Yes, in your browser's local storage on this device. Nothing is uploaded and you don't need an account. Today's focus count starts again at zero each day, and clearing your browser data resets everything.",
    },
    {
      q: "Does the timer work in a background tab?",
      a: "Yes. The timer works out the time left from timestamps, so it stays accurate when you switch tabs, and the tab title shows the countdown and the current phase. Keep the tab open and the sound on to hear the chime when a phase ends.",
    },
  ],
};
