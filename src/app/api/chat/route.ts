import type { FileNode } from "@/lib/file-system";
import { VirtualFileSystem } from "@/lib/file-system";
import { streamText, convertToModelMessages } from "ai";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";
import { buildFileManagerTool } from "@/lib/tools/file-manager";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getLanguageModel } from "@/lib/provider";
import { generationPrompt } from "@/lib/prompts/generation";

export async function POST(req: Request) {
  console.log("[chat] POST request received");
  const body = await req.json();
  const messages: any[] = body.messages ?? [];
  const files: Record<string, FileNode> = body.files ?? {};
  const projectId: string | undefined = body.projectId;
  console.log("[chat] messages count:", messages.length, "projectId:", projectId);

  // Convert UIMessages to model-compatible messages and prepend system prompt
  const modelMessages = await convertToModelMessages(messages);
  modelMessages.unshift({
    role: "system",
    content: generationPrompt,
  });

  // Reconstruct the VirtualFileSystem from serialized data
  const fileSystem = new VirtualFileSystem();
  fileSystem.deserializeFromNodes(files);

  const model = getLanguageModel();
  console.log("[chat] model:", model.modelId);

  const result = streamText({
    model: model,
    messages: modelMessages,
    maxOutputTokens: 10_000,
    tools: {
      str_replace_editor: buildStrReplaceTool(fileSystem),
      file_manager: buildFileManagerTool(fileSystem),
    },
    onError: (err: any) => {
      console.error("[chat] streamText error:", JSON.stringify(err, null, 2));
    },
    onFinish: async ({ response }) => {
      if (projectId) {
        try {
          const session = await getSession();
          if (!session) {
            console.error("User not authenticated, cannot save project");
            return;
          }

          const allMessages = [
            ...messages.filter((m: any) => m.role !== "system"),
            ...response.messages,
          ];

          await prisma.project.update({
            where: { id: projectId, userId: session.userId },
            data: {
              messages: JSON.stringify(allMessages),
              data: JSON.stringify(fileSystem.serialize()),
            },
          });
        } catch (error) {
          console.error("Failed to save project data:", error);
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}

export const maxDuration = 120;
