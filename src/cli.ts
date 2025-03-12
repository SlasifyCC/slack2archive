#!/usr/bin/env node

import { Command } from "commander";
import { compileChannel } from "./composer/channel";
import path from "path";

const program = new Command();

program
  .version("1.0.0")
  .description("Slack2Archive processor")
  .command("channel <root-dir> [channels...]")
  .alias("c")
  .action((rootDir, channels) => {
    console.log({
      rootDir,
      channels,
    });
    const channel = channels[0];
    compileChannel({
      usersFile: path.resolve(rootDir, "users.json"),
      channelDir: path.resolve(rootDir, channel),
      fileDirName: "attachments",
      outputDir: path.resolve(rootDir, "md"),
    });
  });

program.parse(process.argv);
