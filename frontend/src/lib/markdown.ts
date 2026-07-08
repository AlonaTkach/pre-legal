// Minimal markdown -> plain-text lines, used for the PDF renderer where we
// cannot embed a full markdown component. Templates are simple (numbered,
// bolded clauses), so light stripping is sufficient.
export function markdownToPlainLines(md: string): string[] {
  return md
    .split("\n")
    .map((line) =>
      line
        .replace(/^#{1,6}\s*/, "") // headings
        .replace(/\*\*(.+?)\*\*/g, "$1") // bold
        .replace(/\*(.+?)\*/g, "$1") // italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
        .replace(/^\s*[-*]\s+/, "• ") // bullets
        .trim(),
    )
    .filter((line) => line.length > 0);
}
