import dayjs from "dayjs";

export function parseTs(ts: string) {
  const [time] = ts.split(".");
  const unixTime = parseInt(time);
  if (isNaN(unixTime)) {
    throw new Error(`invalid message timestamp: ${ts}`);
  }
  return dayjs.unix(unixTime);
}

export function parseTsToDate(ts: string) {
  return parseTs(ts).format("YYYY-MM-DD");
}

export function parseTsToTime(ts: string) {
  return parseTs(ts).format("HH:mm:ss");
}
