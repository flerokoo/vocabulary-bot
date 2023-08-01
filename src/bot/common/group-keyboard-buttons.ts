import { InlineKeyboardButton } from "node-telegram-bot-api";

export function groupKeyboardButtons(buttons: InlineKeyboardButton[], perGroup = 2) {
  const output: InlineKeyboardButton[][] = [];
  let cur: InlineKeyboardButton[] = [];
  for (const button of buttons) {
    if (cur.length === perGroup) {
      output.push(cur);
      cur = [];
    }
    cur.push(button);
  }

  if (cur.length > 0) output.push(cur);
  return output;
}