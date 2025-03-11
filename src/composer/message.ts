import dayjs from "dayjs";
import * as fs from "fs/promises";
import { FileData, MessageData } from "../archive";

function parseTs(ts: string) {
  const [time] = ts.split(".");
  const unixTime = parseInt(time);
  if (isNaN(unixTime)) {
    throw new Error(`invalid message timestamp: ${ts}`);
  }
  return dayjs.unix(unixTime);
}

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
    return this.mimeType.startsWith("image/");
  }

  public toMarkdownLink() {
    return `${this.isImage ? "!" : ""}[${this.title}](${this.fileName})`;
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
    this.files = data.files.map((file) => new File(file));
    this.isMainThread = data.ts === data.thread_ts;

    this.replies = new Map<string, Message | null>();
    for (const reply of data.replies) {
      this.replies.set(reply.ts, null);
    }
  }

  public connectReplies(allMessages: Map<string, Message>) {
    const replyIds: string[] = Array.from(this.replies.keys());
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

export async function readMessages(fileName: string): Promise<MessageMap> {
  try {
    const file = await fs.readFile(fileName, "utf8");
    const fileData = JSON.parse(file) as MessageData[];
    const messages = new Map<string, Message>();
    for (const item of fileData) {
      messages.set(item.ts, new Message(item));
    }
    const removingIds: string[] = [];
    for (const message of messages.values()) {
      if (message.isMainThread) {
        removingIds.push(...message.connectReplies(messages));
      }
    }
    removingIds.forEach((id) => messages.delete(id));
    return messages;
  } catch (e) {
    console.error(`Filed to read users file: ${fileName}`);
    throw e;
  }
}
