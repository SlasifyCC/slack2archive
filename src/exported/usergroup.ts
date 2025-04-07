import { UserGroupData } from "./types";
import fs from "fs/promises";

export class UserGroup {
  public static RegExp = /<\!subteam\^(S[A-Z0-9]+)>/gi;
  public id: string;
  public name: string;

  constructor(data: UserGroupData) {
    this.id = data.id;
    this.name = data.name;
  }

  public toNameTag(): string {
    return `<@${this.name}>`;
  }
}
export type UserGroupMap = Map<string, UserGroup>;

export async function readUserGroups(fileName: string): Promise<UserGroupMap> {
  const users = new Map<string, UserGroup>();
  try {
    const file = await fs.readFile(fileName, "utf8");
    const fileData = JSON.parse(file) as UserGroupData[];
    for (const item of fileData) {
      users.set(item.id, new UserGroup(item));
    }
  } catch (e) {
    console.error(`Failed reading usergroups file ${fileName}: ${e}`);
  }
  return users;
}
