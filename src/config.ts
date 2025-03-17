interface ExportConfig {
  baseDir: string;
  categories: CategoryConfig[];
}
interface CategoryConfig {
  name: string;
  categoryDir: string;
  manifestCsv: string;
}
export const exportConfigs = new Map<string, ExportConfig>([
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
