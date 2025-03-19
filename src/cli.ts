#!/usr/bin/env node

import { Command } from "commander";
import { writeChannel } from "./composer/channel";
import path from "path";
import { readCategory } from "./exported/reader";
import { exportConfigs } from "./config";
import { readUsers } from "./exported/user";

const program = new Command();

program
  .version("1.0.0")
  .description("Slack2Archive processor")
  .command("private <rootDir> <outDir>")
  .option("-c, --channels <channels>", "the channel IDs to compile")
  .action(async (rootDir, outDir, options) => {
    runCategory(rootDir, outDir, "private", options.channels?.split(",") || []);
  });

program.parse(process.argv);

async function runCategory(
  rootDir: string,
  outDir: string,
  exportType: string,
  onlyChannels: string[],
) {
  const users = await readUsers(path.resolve(rootDir, "users/users.json"));
  console.log(Array.from(users.keys()).length, "users are loaded.");
  const exportConfig = exportConfigs.get(exportType);
  if (!exportConfig) {
    throw new Error(`unknown export type ${exportType}`);
  }

  const jobs = exportConfig.categories.map(async (category) => ({
    category,
    channels: await readCategory({
      baseDir: path.resolve(rootDir, exportConfig.baseDir),
      categoryDir: category.categoryDir,
      manifestCsv: category.manifestCsv,
      outputDir: "fake", //todo
    }),
  }));
  const allChannelThreads = await Promise.all(jobs);
  allChannelThreads.map(({ category, channels }) =>
    channels.map((channelThreads) =>
      writeChannel(path.resolve(outDir, category.name), channelThreads, users),
    ),
  );
}
