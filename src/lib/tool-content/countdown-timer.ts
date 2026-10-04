import type { Tool } from "../tools";

export const countdownTimer: Tool = {
  slug: "countdown-timer",
  name: "Countdown Timer",
  category: "time",
  icon: "Hourglass",
  summary: "Online timer with an alarm sound, presets and a progress ring.",
  title: "Countdown Timer with Alarm – Free Online Timer",
  description:
    "Set an online countdown timer in hours, minutes and seconds, or tap a preset (1 to 60 min). Alarm sound, progress ring and countdown in the tab title.",
  intro:
    "Set a timer for cooking, exams, workouts, presentations or a quick break. Tap a preset or type hours, minutes and seconds. A progress ring shows how much time is left, the browser tab shows the countdown, and an alarm rings when time is up. The timer is worked out from timestamps, so it stays accurate if you switch to another tab.",
  steps: [
    "Tap a preset such as 5 or 10 minutes, or type your own hours, minutes and seconds.",
    "Press Start. Pause, resume or add a minute at any time.",
    "When the alarm rings, press Stop alarm, or Restart to run the same timer again.",
  ],
  faqs: [
    {
      q: "Will the alarm ring if I switch to another tab?",
      a: "Yes, as long as the tab stays open and your device volume is on. Pressing Start also unlocks sound in the browser, which is why browsers that block autoplay still play the alarm. The alarm beeps for about 30 seconds, or until you press Stop alarm. Use the Sound switch to mute it and rely on the visual alert instead.",
    },
    {
      q: "How accurate is the countdown timer?",
      a: "The timer records the moment it should finish and always shows the time left until then. It does not count down tick by tick, so it doesn't drift, even if the browser slows down a background tab. The alarm fires within about a second of the target, even in a hidden tab.",
    },
    {
      q: "What is the longest timer I can set?",
      a: "Up to 99 hours, 59 minutes and 59 seconds. For long timers, keep the device awake and the tab open. Closing the tab or reloading the page cancels the timer.",
    },
    {
      q: "Can I add time while the timer is running?",
      a: "Yes. Press “+1 min” to add a minute while it is running or paused. The progress ring adjusts to the new total.",
    },
    {
      q: "Can I see the countdown without keeping this tab open on screen?",
      a: "Yes. While the timer runs, the browser tab title shows the time left (for example “04:59 · Timer”), so you can glance at the tab bar while you work in another tab.",
    },
  ],
};
