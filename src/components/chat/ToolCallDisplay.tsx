import { Loader2 } from "lucide-react";

interface ToolInvocation {
  // v5: type is `tool-${toolName}`, v4: toolName is a direct field
  type?: string;
  toolName?: string;
  state: string;
  // v5: output, v4: result
  output?: unknown;
  result?: unknown;
  // v5: input, v4: args
  input?: Record<string, unknown>;
  args?: Record<string, unknown>;
}

export function getToolLabel(tool: ToolInvocation): string {
  const toolName = tool.toolName ?? tool.type?.replace(/^tool-/, "") ?? "";
  const args = tool.input || tool.args || {};
  const path = typeof args.path === "string" ? args.path : null;
  const command = typeof args.command === "string" ? args.command : null;

  if (toolName === "str_replace_editor") {
    if (!path) return "Editing file";
    switch (command) {
      case "create":
        return `Creating ${path}`;
      case "str_replace":
      case "insert":
        return `Editing ${path}`;
      case "view":
        return `Reading ${path}`;
      default:
        return `Editing ${path}`;
    }
  }

  if (toolName === "file_manager") {
    if (!path) return "Managing file";
    switch (command) {
      case "rename": {
        const newPath = typeof args.new_path === "string" ? args.new_path : null;
        return newPath ? `Renaming ${path} to ${newPath}` : `Renaming ${path}`;
      }
      case "delete":
        return `Deleting ${path}`;
      default:
        return `Managing ${path}`;
    }
  }

  return toolName;
}

interface ToolCallDisplayProps {
  tool: ToolInvocation;
}

export function ToolCallDisplay({ tool }: ToolCallDisplayProps) {
  const label = getToolLabel(tool);
  const isDone = (tool.state === "output-available" || tool.state === "result") &&
    (tool.output !== undefined || tool.result !== undefined);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
