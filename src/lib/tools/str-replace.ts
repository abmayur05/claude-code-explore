import { tool } from "ai";
import { z } from "zod";
import { VirtualFileSystem } from "@/lib/file-system";

export const buildStrReplaceTool = (fileSystem: VirtualFileSystem) => {
  return tool({
    description:
      "View, create, edit, or insert content in files in the file system.",
    parameters: z.object({
      command: z
        .enum(["view", "create", "str_replace", "insert"])
        .describe("The operation to perform"),
      path: z.string().describe("The path to the file"),
      file_text: z
        .string()
        .optional()
        .describe("The content for create command"),
      insert_line: z
        .number()
        .optional()
        .describe("The line number for insert command"),
      new_str: z
        .string()
        .optional()
        .describe("The new content for str_replace or insert"),
      old_str: z
        .string()
        .optional()
        .describe("The old content to replace in str_replace"),
      view_range: z
        .array(z.number())
        .optional()
        .describe("The line range [start, end] for view command"),
    }),
    execute: async ({
      command,
      path,
      file_text,
      insert_line,
      new_str,
      old_str,
      view_range,
    }) => {
      switch (command) {
        case "view":
          return fileSystem.viewFile(
            path,
            view_range as [number, number] | undefined
          );

        case "create":
          return fileSystem.createFileWithParents(path, file_text || "");

        case "str_replace":
          return fileSystem.replaceInFile(path, old_str || "", new_str || "");

        case "insert":
          return fileSystem.insertInFile(path, insert_line || 0, new_str || "");

        default:
          return `Error: Unknown command ${command}`;
      }
    },
  });
};
