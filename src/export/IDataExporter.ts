export interface IDataExporter {
  (cards: { word: string, meanings: string[] }[]): Promise<{ data: Buffer, filename: string }>;
}