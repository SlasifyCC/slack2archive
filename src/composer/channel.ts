import path from "path";
import { readUsers, User, UserMap } from "./user";
import { Message, readMessages } from "./message";

export async function compileChannel(args: {
  usersFile: string;
  channelDir: string;
  fileDir: string;
}) {
  const users = await readUsers(args.usersFile);
}

export async function composeChannelFile(args: {
  users: UserMap;
  channelName: string;
  fileName: string;
  fileDir: string;
}) {
  const date = path.parse(args.fileName).name;
  const content = composeFrontmatter(args.channelName, date);
  const messages = await readMessages(args.fileName);
}

function composeFrontmatter(channel: string, date: string) {
  return `channel: ${channel}
date: ${date}
---
`;
}

function composeMessage(message: Message, users: UserMap, fileDir: string) {
  let content = `${message.printTime()}|`;
  const author = users.get(message.userId);
  if (!author) {
    content += `<unknown>`;
  } else {
    content += author.toString();
  }
  content += ": " + formatMessageText(message, users);

  for (const file of message.files) {
    content += `\n${file.toMarkdownLink()}`;
  }

  return content;
}

function formatMessageText(message: Message, users: UserMap): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = users;
  return message.text;
}
