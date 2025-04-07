import { UserData } from "./types";
import * as fs from "fs/promises";

export class User {
  public static RegExp = /<@(U[A-Z0-9]+)>/gi;
  public id: string;
  public name: string;

  constructor(data: UserData) {
    this.id = data.id;
    this.name = data.profile.display_name_normalized;
  }

  public toNameTag(): string {
    return `<@${this.name}>`;
  }
}
export type UserMap = Map<string, User>;

export async function readUsers(fileNames: string[]): Promise<UserMap> {
  const users = new Map<string, User>();
  for (const fileName of fileNames) {
    try {
      const file = await fs.readFile(fileName, "utf8");
      const fileData = JSON.parse(file) as UserData[];
      for (const item of fileData) {
        users.set(item.id, new User(item));
      }
    } catch (e) {
      console.error(`Failed reading users file ${fileName}: ${e}`);
    }
  }
  return users;
}
