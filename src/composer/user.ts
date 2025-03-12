import { UserData } from "../archive";
import * as fs from "fs/promises";

export class User {
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

export async function readUsers(fileName: string): Promise<UserMap> {
  try {
    const file = await fs.readFile(fileName, "utf8");
    const fileData = JSON.parse(file) as UserData[];
    const users = new Map<string, User>();
    for (const item of fileData) {
      users.set(item.id, new User(item));
    }
    return users;
  } catch (e) {
    console.error(`Filed to read users file: ${fileName}`);
    throw e;
  }
}
