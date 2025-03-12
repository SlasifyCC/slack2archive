import path from "path";
import fs from "fs/promises";
import { readUsers, UserMap } from "./user";
import { Message, readMessages } from "./message";
import { formatMessageText } from "./text";

export async function compileChannel(args: {
  usersFile: string;
  channelDir: string;
  fileDirName: string;
  outputDir: string;
}) {
  const users = await readUsers(args.usersFile);
  const channelName = path.parse(args.channelDir).name;
  const outputDir = path.join(args.outputDir, channelName);
  await fs.mkdir(outputDir, { recursive: true });
  const files = await fs.readdir(args.channelDir, { withFileTypes: true });
  await Promise.all(
    files
      .filter((file) => !file.isDirectory())
      .map(async (file) => {
        const output = await composeChannelFile({
          users,
          channelName,
          fileName: path.join(args.channelDir, file.name),
          fileDir: path.join(args.channelDir, args.fileDirName),
        });
        const outFileName = path.parse(file.name).name + `.md`;
        const outFilePath = path.join(outputDir, outFileName);
        return fs.writeFile(outFilePath, output, "utf8");
      }),
  );
  console.log("done");
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
  return [
    content,
    ...Array.from(messages.values()).map((message) =>
      composeMessage(message, args.users, args.fileDir, 0),
    ),
  ].join("\n\n");
}

function composeFrontmatter(channel: string, date: string) {
  return `channel: ${channel}
date: ${date}
---
`;
}

function composeMessage(
  message: Message,
  users: UserMap,
  fileDir: string,
  indentLevel = 0,
) {
  const author = users.get(message.userId);
  const lines: string[] = [
    `**${message.printTime()}|${author?.name || "unknown"}**`,
    ...formatMessageText(message, users).split("\n"),
  ];

  for (const file of message.files) {
    lines.push(`\n${file.toMarkdownLink(fileDir)}`);
  }
  for (const reply of message.replies.values()) {
    if (!reply) continue;
    lines.push(`-  ${composeMessage(reply, users, fileDir, indentLevel + 1)}`);
  }

  const indent = Array(indentLevel).fill("   ").join();
  return lines.join(`\n${indent}`);
}
