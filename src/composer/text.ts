import { Message } from "../exported/message";
import { User, UserMap } from "../exported/user";
import { UserGroup, UserGroupMap } from "../exported/usergroup";

const slackLinkRegExp = /<([^@|>\n][^|>\n]*)(?:\|([^>\n]*))?>/gi;
const inlineEmojiRegExp = /:[A-Za-z0-9-_]+:/gi;

export function formatMessageText(
  message: Message,
  users: UserMap,
  userGroups: UserGroupMap,
): string {
  return new TextPipeline(message.text)
    .do(replaceEmojis())
    .do(replaceUserGroupHandles(userGroups))
    .do(replaceUserHandles(users))
    .do(replaceSlackLinks()).content;
}

class TextPipeline {
  public content: string;

  constructor(content: string) {
    this.content = content;
  }
  public do(p: TextProcessor) {
    const newContent = p(this);
    this.content = newContent;
    return this;
  }
}
type TextProcessor = (t: TextPipeline) => string;

function replaceSlackLinks(): TextProcessor {
  return (t) =>
    t.content.replace(slackLinkRegExp, (_, ...[url, text]) => {
      return `[${url}](${text || url})`;
    });
}

function replaceUserHandles(users: UserMap): TextProcessor {
  return (t) =>
    t.content.replace(User.RegExp, (original, ...[userId]) => {
      const user = users.get(userId);
      if (!users) {
        console.warn(`failed to map user ${userId}`);
      }
      return user ? user.toNameTag() : original;
    });
}

function replaceUserGroupHandles(userGroups: UserGroupMap): TextProcessor {
  return (t) =>
    t.content.replace(UserGroup.RegExp, (original, ...[userGroupId]) => {
      const user = userGroups.get(userGroupId);
      if (!userGroups) {
        console.warn(`failed to map user group ${userGroupId}`);
      }
      return user ? user.toNameTag() : original;
    });
}

function replaceEmojis(): TextProcessor {
  return (t) => t.content.replace(inlineEmojiRegExp, "");
}
