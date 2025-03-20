interface ExportConfig {
  baseDir: string;
  categories: CategoryConfig[];
}
interface CategoryConfig {
  name: string;
  categoryDir: string;
  manifestCsv: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ExportTypeValues = ["private", "public", "dm", "multi-dms"] as const;
export type ExportTypes = (typeof ExportTypeValues)[number];
export const exportConfigs = new Map<ExportTypes, ExportConfig>([
  [
    "private",
    {
      baseDir: `channels/private_channels`,
      categories: [
        {
          name: "unarchive",
          categoryDir: "unarchive",
          manifestCsv: "unArchiveList.csv",
        },
        {
          name: "archive",
          categoryDir: "archive",
          manifestCsv: "archiveList.csv",
        },
      ],
    },
  ],
]);
