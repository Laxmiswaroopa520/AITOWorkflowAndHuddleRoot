const fileNameCharacters = /[<>:"/\\|?*]/g;

export function escapeHtml(value: string | number): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export function safeHtmlFileName(value: string, fallback: string): string {
  const printable = [...value].map((character) => character.charCodeAt(0) < 32 ? "-" : character).join("");
  const sanitized = printable.replace(fileNameCharacters, "-").replace(/\s+/g, " ").trim();
  return `${sanitized || fallback}.html`;
}
