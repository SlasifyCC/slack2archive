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
  return message.text
    ? replaceSlackLinks(
        replaceEmojis(
          replaceUserGroupHandles(
            replaceUserHandles(message.text, users),
            userGroups,
          ),
        ),
      )
    : "";
}

function replaceSlackLinks(content: string) {
  return content.replace(slackLinkRegExp, (_, ...[url, text]) => {
    return `[${url}](${text || url})`;
  });
}

function replaceUserHandles(content: string, users: UserMap): string {
  return content.replace(User.RegExp, (original, ...[userId]) => {
    const user = users.get(userId);
    if (!users) {
      console.warn(`failed to map user ${userId}`);
    }
    return user ? user.toNameTag() : original;
  });
}

function replaceUserGroupHandles(
  content: string,
  userGroups: UserGroupMap,
): string {
  return content.replace(UserGroup.RegExp, (original, ...[userGroupId]) => {
    const user = userGroups.get(userGroupId);
    if (!userGroups) {
      console.warn(`failed to map user group ${userGroupId}`);
    }
    return user ? user.toNameTag() : original;
  });
}

function replaceEmojis(content: string): string {
  return content.replace(inlineEmojiRegExp, "");
}
