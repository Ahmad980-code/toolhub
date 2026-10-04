import type { Tool } from "../tools";

export const typingSpeedTest: Tool = {
  slug: "typing-speed-test",
  name: "Typing Speed Test",
  category: "text",
  icon: "Keyboard",
  summary: "Test your typing speed in WPM with live accuracy.",
  title: "Typing Speed Test – Free WPM & Accuracy Test Online",
  description:
    "Free typing speed test: 15 seconds, 30 seconds, 1 or 2 minutes. See live WPM and accuracy, get a rating for your speed and track your personal best.",
  intro:
    "Find out how fast you type with this free typing speed test. Choose a 15-second, 30-second, 1-minute or 2-minute test and type the passage shown: the timer starts on your first keystroke, and your words per minute (WPM) and accuracy update live as you go. When time is up you get your net WPM, raw speed, character counts and a rating, and your best score for each test length is saved in your browser. It works with phone and tablet keyboards too.",
  steps: [
    "Pick a test length: 15 s, 30 s, 1 min or 2 min.",
    "Click the passage (or tap it on a phone) and start typing; the timer starts on your first key.",
    "Type the words exactly as shown, fixing mistakes with Backspace if you like.",
    "When time runs out, check your WPM and accuracy, then press Tab or Enter to go again.",
  ],
  faqs: [
    {
      q: "How is typing speed (WPM) calculated?",
      a: "Typing tests count a “word” as 5 characters, including spaces and punctuation. Net WPM is the number of correctly typed characters divided by 5, divided by the minutes taken. For example, 250 correct characters in 1 minute is 250 ÷ 5 = 50 WPM, and the same 250 characters in a 30-second test is 100 WPM. Raw WPM counts every character you typed, right or wrong, so it is always the same as or higher than net WPM.",
    },
    {
      q: "What is a good typing speed?",
      a: "Around 40 WPM is the figure most often quoted as the average for adults. In this test, 40–54 WPM rates as average, 55–69 WPM as above average, 70–89 WPM as fast and 90 WPM or more as exceptional. For most office and student work, 40–60 WPM with 95% accuracy or better is plenty.",
    },
    {
      q: "How is accuracy calculated?",
      a: "Accuracy is the share of your keystrokes that were correct when you typed them. A mistake still counts against accuracy even if you go back and fix it with Backspace, because it cost you time. Typing 200 characters with 10 mistakes gives 190 ÷ 200 = 95% accuracy.",
    },
    {
      q: "Does the typing test work on a phone or tablet?",
      a: "Yes. Tap the passage to open your keyboard and start typing. Autocorrect, auto-capitalisation and spell check are switched off for the test box, but some keyboards still insert suggestions, so turn off predictive text in your keyboard settings for the fairest result. A physical keyboard will usually give a higher score than a touch screen.",
    },
    {
      q: "How can I improve my typing speed?",
      a: "Learn to touch type with your fingers resting on the home row (A S D F and J K L ;), keep your eyes on the screen rather than the keys, and get accurate before you push for speed. Ten to fifteen minutes of daily practice works better than an occasional long session. Take the 1-minute test once a day to track your progress: your personal best is saved in this browser.",
    },
  ],
};
