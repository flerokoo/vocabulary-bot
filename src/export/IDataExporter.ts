export interface IDataExporter {
  (cards: { word: string; meanings: string[]; tags: string[] }[]): Promise<{ data: Buffer; filename: string }>;
}
