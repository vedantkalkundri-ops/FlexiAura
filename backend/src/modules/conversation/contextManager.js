import { getAppConfig } from "../../config/app.js";

function selectRecentHistory(history, maxMessages, maxChars) {
  const selected = [];
  let usedChars = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (selected.length >= maxMessages) {
      break;
    }

    const message = history[index];
    const messageChars = message.content.length;

    if (selected.length > 0 && usedChars + messageChars > maxChars) {
      break;
    }

    selected.unshift(message);
    usedChars += messageChars;
  }

  return selected;
}

function appendContent(contents, role, text) {
  const last = contents[contents.length - 1];

  if (last && last.role === role) {
    last.parts[0].text = `${last.parts[0].text}\n\n${text}`;
    return;
  }

  contents.push({ role, parts: [{ text }] });
}

export function buildContents(history, currentMessage) {
  const config = getAppConfig();
  const recentHistory = selectRecentHistory(
    history,
    config.maxContextMessages,
    config.maxContextChars,
  );

  const contents = [];

  for (const message of recentHistory) {
    const role = message.role === "assistant" ? "model" : "user";
    appendContent(contents, role, message.content);
  }

  if (currentMessage) {
    appendContent(contents, "user", currentMessage);
  }

  while (contents.length > 0 && contents[0].role === "model") {
    contents.shift();
  }

  return contents;
}
