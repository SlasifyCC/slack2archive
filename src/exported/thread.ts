import { createReadStream, existsSync } from "fs";
import path from "path";
import csv from "csv-parser";
import { cp, readFile } from "fs/promises";
import { MessageData } from "./types";
import { Message } from "./message";
import { ChannelData } from "./types";
import { parseTsToDate } from "../utils/ts";

export class Thread {
  public parentDir: string;
  public channel: ChannelData;
  public id: string;

  private replyIds: string[] = [];

  constructor(id: string, rootDir: string, channel: ChannelData) {
    this.id = id;
    this.parentDir = rootDir;
    this.channel = channel;
  }

  private getPath(v: string) {
    return path.resolve(this.parentDir, v);
  }

  private async parseReplyIds() {
    const replyManifest = this.getPath("replies.csv");
    return new Promise<void>((resolve, reject) => {
      this.replyIds = [];
      if (!existsSync(replyManifest)) {
        resolve();
        return;
      }
      createReadStream(replyManifest)
        .pipe(
          csv({
            skipLines: 1,
            headers: ["channel", "mainTs", "replyTs"],
          }),
        )
        .on("data", ({ replyTs }) => {
          if (!!replyTs && replyTs !== this.id) {
            this.replyIds.push(replyTs);
          }
        })
        .on("end", () => resolve())
        .on("error", (e) => {
          reject(e);
        });
    });
  }

  private async parseMessages(): Promise<Message | null> {
    const filePath = this.getPath(`${this.id}.json`);
    const file = await readFile(filePath, "utf8");
    const fileData = JSON.parse(file) as MessageData[];
    const messages = new Map<string, Message>();
    let mainMessage: Message | null = null;
    for (const item of fileData) {
      const message = new Message(item);
      messages.set(item.ts, message);
      if (item.ts === this.id) {
        mainMessage = message;
      }
    }
    mainMessage?.connectReplies(this.replyIds, messages);
    return mainMessage;
  }

  public async build() {
    try {
      await this.parseReplyIds();
      return await this.parseMessages();
    } catch (e) {
      console.error(`Failed to read thread ${this.id}`);
      throw e;
    }
  }

  public get date() {
    return parseTsToDate(this.id);
  }

  public async copyFiles(destDir: string) {
    const src = this.getPath("files");
    if (!existsSync(src)) return;
    await cp(src, destDir, { recursive: true });
  }
}
