#!/usr/bin/env node

import { Command } from "commander";
import { compileChannel } from "./composer/channel";
import path from "path";
import { readCategory } from "./exported/reader";
import { exportConfigs } from "./config";

const program = new Command();

program
  .version("1.0.0")
  .description("Slack2Archive processor")
  // .command("channel <root-dir> [channels...]")
  // .alias("c")
  // .action((rootDir, channels) => {
  //   console.log({
  //     rootDir,
  //     channels,
  //   });
  //   const channel = channels[0];
  //   compileChannel({
  //     usersFile: path.resolve(rootDir, "users.json"),
  //     channelDir: path.resolve(rootDir, channel),
  //     fileDirName: "attachments",
  //     outputDir: path.resolve(rootDir, "md"),
  //   });
  // })
  .command("private <rootDir> [channels...]")
  .action((rootDir, channels) => {
    runCategory(rootDir, "private", channels);
  });

program.parse(process.argv);

function runCategory(rootDir: string, exportType: string, channels: string[]) {
  const exportConfig = exportConfigs.get(exportType);
  if (!exportConfig) {
    throw new Error(`unknown export type ${exportType}`);
  }
  const jobs = exportConfig.categories.map((category) =>
    readCategory({
      baseDir: path.resolve(rootDir, exportConfig.baseDir),
      categoryDir: category.categoryDir,
      manifestCsv: category.manifestCsv,
      outputDir: "fake", //todo
    }),
  );
  Promise.all(jobs).then((result) => console.log(result));
}
