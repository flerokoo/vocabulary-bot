export function formatFilename(base: string, ext: string) {
  if (!ext.startsWith(".")) ext = `.${ext}`;
  const date = new Date();
  return `Export_${base}_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}${ext}`;
}