import { Message } from "../exported/message";
import { UserMap } from "../exported/user";

const slackLinkRegExp = /<([^@|>\n][^|>\n]*)(?:\|([^>\n]*))?>/gi;
const userHandleRegExp = /<@(U[A-Z0-9]+)>/gi;
const inlineEmojiRegExp = /:[A-Za-z0-9-_]+:/gi;

export function formatMessageText(message: Message, users: UserMap): string {
  // TODO: convert user handle, links, and emojis
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = users;
  return message.text
    ? replaceUserHandles(replaceSlackLinks(replaceEmojis(message.text)), users)
    : "";
}

function replaceSlackLinks(content: string) {
  return content.replace(slackLinkRegExp, (_, ...[url, text]) => {
    return `[${url}](${text || url})`;
  });
}

function replaceUserHandles(content: string, users: UserMap): string {
  return content.replace(userHandleRegExp, (original, ...[userId]) => {
    const user = users.get(userId);
    return user ? user.toNameTag() : original;
  });
}

function replaceEmojis(content: string): string {
  return content.replace(inlineEmojiRegExp, "");
}
