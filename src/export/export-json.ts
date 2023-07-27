import { formatFilename } from "./format-filename";

export async function exportJson(data: { word: string, meanings: string[] }[]) {
  return {
    data: Buffer.from(JSON.stringify(data), "utf-8"),
    filename: formatFilename("Backup", "json")
  };
}