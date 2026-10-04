/**
 * Everyday English passages for the typing speed test. Plain ASCII only (straight quotes, no dashes
 * that need special keys) so every character can be typed on any keyboard, including phones.
 * Passage 0 is always the first test, so the first paint is deterministic.
 */
export const TYPING_PASSAGES = [
  "A good morning routine does not need to be complicated. Wake up at the same time each day, drink a glass of water and open a window to let in some fresh air. Make your bed, stretch for a few minutes and eat a simple breakfast before you check your phone. Small habits like these help you feel calm, focused and ready for whatever the day brings.",
  "Cooking at home is one of the easiest ways to save money and eat better. Plan a few meals for the week, write a short shopping list and buy only what you need. Rice, lentils, eggs, onions and fresh vegetables can turn into dozens of tasty dishes. If you cook a little extra at dinner, you will have a ready lunch for the next day.",
  "Learning to type without looking at the keyboard takes patience, but it pays off for years. Rest your fingers on the home row, keep your wrists relaxed and let each finger reach only its own keys. Start slowly and focus on accuracy rather than speed. After a few weeks of short daily practice, you will notice your words flowing onto the screen.",
  "The train left the station just as the sun came up over the hills. Through the window, farmers were already working in green fields, and children waved from the side of the road. A tea seller walked down the aisle calling out his prices, and the smell of fresh bread drifted from the next carriage. It was going to be a long but pleasant journey.",
  "Saving money is easier when you know where it goes. At the end of each month, look at your bank statement and sort your spending into a few groups such as rent, food, travel, bills and fun. Decide how much you want to save first, then plan the rest. Even putting aside a small amount every week can grow into a useful emergency fund.",
  "A short walk after dinner is good for both body and mind. It helps with digestion, clears your head after a busy day and gives you time to talk with family or friends. You do not need special shoes or a gym membership. Twenty minutes around the neighbourhood at a steady pace is enough to make a real difference to how you feel.",
  "When you write an email at work, start with a clear subject line that says what the message is about. Keep your sentences short, put the most important point at the top and end with a simple request or next step. Before you press send, read it once more to check names, dates and attachments. A tidy email saves time for everyone who reads it.",
  "Rain had been falling all afternoon, so the streets were quiet and shiny under the lamps. Ali closed his umbrella at the door of the small bookshop and stepped inside. The owner looked up from her desk and smiled, as if she had been expecting him. On the counter sat a parcel wrapped in brown paper with his name written neatly across the top.",
  "Plants can make any room feel brighter and more alive. If you are new to gardening, start with hardy plants such as a money plant, a snake plant or aloe vera. Place them near a window with indirect light and water them only when the top of the soil feels dry. Most indoor plants are harmed by too much water rather than too little.",
  "Good sleep is one of the best things you can do for your health. Try to go to bed and wake up at the same times, even at weekends. Keep your bedroom dark, cool and quiet, and put screens away for half an hour before bed. If you cannot sleep after twenty minutes, get up, read something calm and return to bed when you feel tired.",
] as const;

/**
 * The full text for a test: the chosen passage followed by the others in order, so even a very fast
 * typist never runs out of text before a 2-minute test ends (about 3,500 characters in total).
 */
export function typingText(start: number) {
  const n = TYPING_PASSAGES.length;
  return Array.from({ length: n }, (_, i) => TYPING_PASSAGES[(start + i) % n]).join(" ");
}

/** WPM rating bands (net WPM). */
export function typingRating(wpm: number): { label: string; tone: "neutral" | "accent" | "success" | "warning" } {
  if (wpm >= 90) return { label: "Exceptional", tone: "success" };
  if (wpm >= 70) return { label: "Fast", tone: "success" };
  if (wpm >= 55) return { label: "Above average", tone: "accent" };
  if (wpm >= 40) return { label: "Average", tone: "accent" };
  if (wpm >= 25) return { label: "Below average", tone: "warning" };
  return { label: "Beginner", tone: "warning" };
}
