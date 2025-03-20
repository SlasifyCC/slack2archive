#!/usr/bin/env node

import { Command } from "commander";
import { writeChannel } from "./composer/channel";
import path from "path";
import { readCategory } from "./exported/reader";
import { exportConfigs, ExportTypes } from "./config";
import { readUsers } from "./exported/user";
import { promises } from "fs";

const program = new Command();

program
  .version("1.0.0")
  .description("Slack2Archive processor")
  .addCommand(makeExportTypeCommand("private"))
  .addCommand(makeExportTypeCommand("public"));

program.parse(process.argv);

function makeExportTypeCommand(type: ExportTypes) {
  return new Command(type)
    .argument("<rootDir>", "Path to the root directory of all exported files")
    .argument(
      "<outDir>",
      "Path to the root directory where compiled files to be written",
    )
    .option("-c, --channels <channels>", "the channel IDs to compile")
    .action(async (rootDir, outDir, options) =>
      runTypedExport(rootDir, outDir, type, options.channels?.split(",") || []),
    );
}

async function runTypedExport(
  rootDir: string,
  outDir: string,
  exportType: ExportTypes,
  onlyChannels: string[],
) {
  console.log("Root directory", rootDir);
  console.log("Output Directory", outDir);
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
    }),
  }));
  const allChannelThreads = await Promise.all(jobs);
  await Promise.all(
    allChannelThreads.map(async ({ category, channels }) =>
      Promise.all(
        channels
          .filter(
            ({ channel }) =>
              !onlyChannels ||
              onlyChannels.length === 0 ||
              onlyChannels.includes(channel.id) ||
              onlyChannels.includes(channel.name),
          )
          .map(async (channelThreads) =>
            writeChannel(
              path.resolve(outDir, category.name),
              channelThreads,
              users,
            ),
          ),
      ),
    ),
  );
}
