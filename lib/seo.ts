import type { PortableTextBlock } from "@portabletext/types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mp.fck.inc").replace(/\/$/, "");
export const SITE_NAME = "Motel Paradise";
export const SITE_TITLE = "Come in Paradise.";
export const SITE_DESCRIPTION =
  "Girls with bad reputation for delivering good times.";

export function portableTextToPlainText(blocks: PortableTextBlock[] = [], maxLength = 160): string {
  const text = (blocks || [])
    .map((block) => {
      if (block._type !== "block" || !("children" in block)) return "";
      return (block.children as { text?: string }[]).map((child) => child.text || "").join("");
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
