export function splitByCharCount(text : string, count : number) {
  if (count <= 0) throw new Error();
  const out : string[] = []
  while (text.length > 0) {
    out.push(text.slice(0, count))
    text = text.slice(count)
  }
  return out;
}