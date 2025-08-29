import { FileItem } from "./types";

export const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"];
export const DEFAULT_AGENT_ID = "orbital_cli";

export function getLanguage(filePath: string) {
  if (!filePath) return "plaintext";
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case "js": case "jsx": return "javascript";
    case "ts": case "tsx": return "typescript";
    case "py": return "python";
    case "html": return "html";
    case "css": return "css";
    case "json": return "json";
    case "md": return "markdown";
    case "xml": return "xml";
    case "sql": return "sql";
    default: return "plaintext";
  }
}

export function extractBotMentions(content: string) {
  if (!content) return [];
  return availableBots.filter(bot => content.includes(bot));
}

export function buildFileTree(files: FileItem[]) {
  const root = { type: "folder", name: "", path: "", children: [] } as any;
  for (const file of files) {
    const parts = file.path.split("/");
    let curr = root, currPath = "";
    for (let i = 0; i < parts.length; i++) {
      currPath = currPath ? currPath + "/" + parts[i] : parts[i];
      const existing = curr.children.find(
        (c: any) => c.name === parts[i] && (i === parts.length - 1 ? c.type === "file" : c.type === "folder")
      );
      if (i === parts.length - 1) {
        if (!existing) curr.children.push({ type: "file", name: parts[i], path: file.path });
      } else {
        if (existing && existing.type === "folder") {
          curr = existing;
        } else if (!existing) {
          const newFolder = { type: "folder", name: parts[i], path: currPath, children: [] };
          curr.children.push(newFolder);
          curr = newFolder;
        }
      }
    }
  }
  return root;
}