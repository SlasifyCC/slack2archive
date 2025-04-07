#!/usr/bin/env node

import { Command } from "commander";
import { writeChannel } from "./composer/channel";
import path from "path";
import { ChannelThreads, readCategory } from "./exported/reader";
import { CategoryConfig, exportConfigs, ExportTypes } from "./config";
import { readUsers, UserMap } from "./exported/user";
import { trim } from "lodash";

interface TypedExportOptions {
  onlyChannels?: string[];
}

interface CustomExportOptions {
  category: string;
  contentDir: string;
  manifest: string;
  usersFiles: string[];
  onlyChannels?: string[];
}

interface Job {
  category: CategoryConfig;
  channels: ChannelThreads[];
}

const program = new Command();

program
  .version("1.0.0")
  .description("Slack2Archive processor")
  .addCommand(makeTypedExportCommand("private"))
  .addCommand(makeTypedExportCommand("public"))
  .addCommand(makeCustomExportCommand());

program.parse(process.argv);

function makeTypedExportCommand(type: ExportTypes) {
  return new Command(type)
    .argument("<rootDir>", "Path to the root directory of all exported files")
    .argument(
      "<outDir>",
      "Path to the root directory where compiled files to be written",
    )
    .option("-c, --channels <channels>", "the channel IDs to compile")
    .action(async (rootDir, outDir, { channels, ...restOptions }) =>
      runTypedExport(rootDir, outDir, type, {
        onlyChannels: channels?.split(",") || [],
        ...restOptions,
      }),
    );
}

function makeCustomExportCommand() {
  return new Command("custom")
    .argument("<rootDir>", "Path to the root directory of all exported files")
    .argument(
      "<outDir>",
      "Path to the root directory where compiled files to be written",
    )
    .option("-c, --channels <channels>", "the channel IDs to compile")
    .option(
      "--category <category>",
      "The category's name to compile to, such as 'unarchived'",
    )
    .option(
      "--contentDir <contentDir>",
      "The content directory (where messages/, threads, and files.csv lie) relative to the baseDir.",
    )
    .option(
      "-m, --manifest <manifest>",
      "The channels manifest CSV's path relative to baseDir.",
    )
    .option(
      "-u --usersFiles <usersFiles>",
      "The relative file paths of user lists, sepearated by commas",
    )
    .action(async (rootDir, outDir, { channels, usersFiles, ...restOptions }) =>
      runCustomExport(rootDir, outDir, {
        onlyChannels: channels?.split(",").map(trim) || [],
        usersFiles: usersFiles?.split(",").map(trim) || [],
        ...restOptions,
      }),
    );
}

async function runTypedExport(
  rootDir: string,
  outDir: string,
  exportType: ExportTypes,
  { onlyChannels }: TypedExportOptions,
) {
  console.log("Root directory", rootDir);
  console.log("Output Directory", outDir);
  const users = await readUsers([path.resolve(rootDir, "users/users.json")]);
  console.log(Array.from(users.keys()).length, "users are loaded.");
  const exportConfig = exportConfigs.get(exportType);
  if (!exportConfig) {
    throw new Error(`unknown export type ${exportType}`);
  }

  const jobs = exportConfig.categories.map<Promise<Job>>(async (category) => ({
    category,
    channels: await readCategory({
      baseDir: path.resolve(rootDir, exportConfig.baseDir),
      categoryDir: category.categoryDir,
      manifestCsv: category.manifestCsv,
    }),
  }));
  await runJobs(jobs, outDir, users, onlyChannels);
}

async function runCustomExport(
  rootDir: string,
  outDir: string,
  options: CustomExportOptions,
) {
  const {
    manifest,
    category: categoryName,
    contentDir,
    usersFiles,
    onlyChannels,
  } = options;
  if (
    !categoryName ||
    !manifest ||
    !contentDir ||
    !usersFiles ||
    usersFiles.length === 0
  ) {
    console.error({
      categoryName,
      manifest,
      contentDir,
      usersFiles,
    });
    throw new Error(
      "must specify categoryName, manifest, contentDir, and usersFiles",
    );
  }
  const users = await readUsers(
    usersFiles.map((f) => path.resolve(rootDir, f)),
  );
  console.log("Root directory", rootDir);
  console.log("Output Directory", outDir);
  const category: CategoryConfig = {
    name: categoryName,
    categoryDir: contentDir,
    manifestCsv: manifest,
  };
  const job: Job = {
    category,
    channels: await readCategory({
      baseDir: path.resolve(rootDir),
      categoryDir: category.categoryDir,
      manifestCsv: category.manifestCsv,
    }),
  };
  await runJobs([Promise.resolve(job)], outDir, users, onlyChannels);
}

async function runJobs(
  jobs: Promise<Job>[],
  outDir: string,
  users: UserMap,
  onlyChannels: string[] | undefined,
) {
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
