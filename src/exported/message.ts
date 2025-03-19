import dayjs from "dayjs";
import { FileData, MessageData } from "./types";
import path from "path";
import { parseTs } from "../utils/ts";

const ImageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".svg",
  ".ico",
  ".bmp",
  ".heif",
  ".heic",
];
export class File {
  public id: string;
  public rawName: string;
  public title: string;
  public mimeType: string;

  constructor(data: FileData) {
    this.id = data.id;
    this.rawName = data.name;
    this.title = data.title;
    this.mimeType = data.mimetype;
  }

  public get fileName() {
    return `${this.id}-${this.rawName}`;
  }

  public get isImage() {
    return ImageExtensions.includes(path.parse(this.fileName).ext);
  }

  public toMarkdownLink(fileDir: string) {
    return `${this.isImage ? "!" : ""}[${this.title}](${path.join(fileDir, this.fileName)})`;
  }
}

export class Message {
  public id: string;
  public userId: string;
  public time: dayjs.Dayjs;
  public text: string;
  public replies: Map<string, Message | null>;
  public files: File[];
  public isMainThread: boolean;
  constructor(data: MessageData) {
    this.id = data.ts;
    this.userId = data.user;
    this.time = parseTs(data.ts);
    this.text = data.text;
    this.files = data?.files?.map((file) => new File(file)) ?? [];
    this.isMainThread = data.ts === data.thread_ts;

    this.replies = new Map<string, Message | null>();
    if (Array.isArray(data.replies)) {
      for (const reply of data.replies) {
        this.replies.set(reply.ts, null);
      }
    }
  }

  public connectReplies(replyIds: string[], allMessages: Map<string, Message>) {
    replyIds.forEach((id) => {
      const reply = allMessages.get(id);
      if (reply) {
        this.replies.set(id, reply);
      }
    });
    return replyIds;
  }

  public printTime() {
    return this.time.format("HH:mm:ss");
  }
}

export type MessageMap = Map<string, Message>;
