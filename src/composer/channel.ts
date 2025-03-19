import path from "path";
import fs from "fs/promises";
import { UserMap } from "../exported/user";
import { Message } from "../exported/message";
import { formatMessageText } from "./text";
import { ChannelThreads } from "../exported/reader";

export async function writeChannel(
  outBaseDir: string,
  { channel, threads }: ChannelThreads,
  users: UserMap,
) {
  console.log(`Writing messages of channel ${channel.name}(${channel.id})`);
  const channelDir = path.resolve(outBaseDir, channel.name);
  for (const thread of threads) {
    const message = await thread.build();
    if (message == null) {
      console.log(`skip thread ${thread.id}: message is empty`);
      continue;
    }
    const threadDir = path.resolve(channelDir, thread.id);
    const content = [
      composeFrontmatter(channel.name, thread.date),
      composeMessage(message, users, ""),
    ].join("\n\n");
    await fs.mkdir(threadDir, { recursive: true });
    const threadFile = path.resolve(threadDir, `${thread.id}.md`);
    await fs.writeFile(threadFile, content, "utf8");

    // copy files
    await thread.copyFiles(path.resolve(threadDir));
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
    const icon = indentLevel <= 0 ? "💬" : "🗨️";
    const lines: string[] = [
      `${icon}**${author?.name || "unknown"} | ${message.printTime()}**`,
      ...formatMessageText(message, users).split("\n"),
    ];

    for (const file of message.files) {
      lines.push(`\n${file.toMarkdownLink(fileDir)}`);
    }
    for (const reply of message.replies.values()) {
      if (!reply) continue;
      lines.push(
        `-  ${composeMessage(reply, users, fileDir, indentLevel + 1)}`,
      );
    }

    const indent = Array(indentLevel).fill("   ").join();
    return lines.join(`\n${indent}`);
  }
}
