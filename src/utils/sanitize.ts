export type SanitizedWordString = string;

export function sanitize(word: string) : SanitizedWordString {
    word = word
        .toLowerCase()
        .trim()
        .replace(/^to\s+/i, "")
        .trim();

    return word;
}