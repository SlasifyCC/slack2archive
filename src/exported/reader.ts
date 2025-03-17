import { createReadStream, existsSync } from "fs";
import { readFile } from "fs/promises";

import path from "path";
import csv from "csv-parser";
import { ChannelData, ThreadData } from "./types";
import { Thread } from "./thread";

interface ReaderContext {
  baseDir: string;
  outputDir: string;
  channels: ChannelData[];
}

export async function readCategory({
  baseDir,
  categoryDir,
  manifestCsv,
  outputDir,
}: {
  baseDir: string;
  categoryDir: string;
  manifestCsv: string;
  outputDir: string;
}) {
  const channels = await readChannelList(path.resolve(baseDir, manifestCsv));
  const ctx: ReaderContext = {
    baseDir: path.resolve(baseDir, categoryDir),
    outputDir,
    channels,
  };
  return Promise.all(channels.map((channel) => readThreads(ctx, channel)));
}

async function readChannelList(manifestCsv: string) {
  return new Promise<ChannelData[]>((resolve, reject) => {
    if (!existsSync(manifestCsv)) {
      resolve([]);
      return;
    }
    const results: ChannelData[] = [];
    createReadStream(manifestCsv)
      .pipe(
        csv({
          skipLines: 1,
          headers: ["id", "name"],
        }),
      )
      .on("data", ({ id, name }) =>
        results.push({
          id,
          name,
        }),
      )
      .on("end", () => resolve(results))
      .on("error", (e) => reject(e));
  });
}

async function readThreads(ctx: ReaderContext, channel: ChannelData) {
  const threadList = JSON.parse(
    await readFile(
      path.resolve(path.resolve(ctx.baseDir, "threads"), `${channel.id}.json`),
      "utf8",
    ),
  ) as ThreadData[];
  const messageDir = path.resolve(ctx.baseDir, "messages", channel.id);
  return threadList.map((thread) => new Thread(thread.ts, messageDir, channel));
}
