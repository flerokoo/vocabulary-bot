import { formatFilename } from "./format-filename";

export async function exportJson(data: { word: string, meanings: string[] }[]) {
  return {
    data: Buffer.from(JSON.stringify(data, null, 2), "utf-8"),
    filename: formatFilename("Backup", "json")
  };
}