import type { Tool } from "../tools";

export const keyboardTester: Tool = {
  slug: "keyboard-tester",
  name: "Keyboard Tester",
  category: "developer",
  icon: "Command",
  summary: "Check every key on your keyboard works, online.",
  title: "Keyboard Tester – Test Every Key Online, Free",
  description:
    "Test your keyboard online: every key lights up as you press it. Check full-size, TKL and laptop keyboards, see key codes, and test ghosting.",
  intro:
    "Find dead or sticky keys in seconds. Start the test and press each key on your keyboard: it lights up on the on-screen keyboard while you hold it and turns green once it has worked. You can switch between full-size, tenkeyless and laptop layouts, see the exact key code for every press, and hold several keys at once to check how many your keyboard can register together.",
  steps: [
    "Pick your keyboard layout: Full-size, TKL or Laptop.",
    "Click Start testing, then press every key on your keyboard.",
    "Watch keys turn green as they work; the counter shows how many are left.",
    "Use \"Show keys not tested yet\" to find any key that didn't register.",
  ],
  faqs: [
    {
      q: "How do I know if a key is broken?",
      a: "Press it during the test. If the key never lights up or turns green, the keyboard isn't sending it. Try cleaning under the key, reconnecting the keyboard, or testing on another computer to rule out software problems.",
    },
    {
      q: "What is keyboard ghosting and N-key rollover?",
      a: "Ghosting is when a keyboard misses some keys pressed together. N-key rollover means it can register many keys at once. Hold several keys and watch the \"Most at once\" number: gaming keyboards often reach 6 or more, while basic office keyboards may stop at 2 or 3.",
    },
    {
      q: "Why doesn't the Fn key or Print Screen register?",
      a: "Fn is handled inside the keyboard and never reaches the computer. Print Screen, media keys and some Windows-key shortcuts may be taken by the operating system first, so the browser can't always see them. That doesn't mean the key is broken.",
    },
    {
      q: "Does it work for laptop keyboards?",
      a: "Yes. Choose the Laptop layout, which shows the main keys and arrow keys found on most laptops.",
    },
    {
      q: "Why are left and right Shift shown separately?",
      a: "The tester reads each key's physical position, so it can tell left and right Shift, Ctrl and Alt apart, and the number pad from the number row. That makes sure every single key gets tested.",
    },
  ],
};
