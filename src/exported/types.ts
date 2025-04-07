export interface UserData {
  id: string;
  profile: {
    display_name_normalized: string;
  };
}

export interface MessageData {
  user: string;
  text: string;
  ts: string;
  thread_ts: string;
  replies: {
    user: string;
    ts: string;
  }[];
  files: FileData[];
}

export interface FileData {
  id: string;
  name: string;
  title: string;
  mimetype: string;
}

export interface ChannelData {
  id: string;
  name: string;
}

export interface ThreadData {
  ts: string;
}

export interface UserGroupData {
  id: string;
  name: string;
}
