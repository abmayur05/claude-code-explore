import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay, getToolLabel } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create command", () => {
  expect(
    getToolLabel({ toolName: "str_replace_editor", state: "result", args: { command: "create", path: "/App.jsx" } })
  ).toBe("Creating /App.jsx");
});

test("getToolLabel: str_replace_editor str_replace command", () => {
  expect(
    getToolLabel({ toolName: "str_replace_editor", state: "result", args: { command: "str_replace", path: "/components/Card.jsx" } })
  ).toBe("Editing /components/Card.jsx");
});

test("getToolLabel: str_replace_editor insert command", () => {
  expect(
    getToolLabel({ toolName: "str_replace_editor", state: "result", args: { command: "insert", path: "/App.jsx" } })
  ).toBe("Editing /App.jsx");
});

test("getToolLabel: str_replace_editor view command", () => {
  expect(
    getToolLabel({ toolName: "str_replace_editor", state: "result", args: { command: "view", path: "/App.jsx" } })
  ).toBe("Reading /App.jsx");
});

test("getToolLabel: str_replace_editor unknown command falls back to Editing", () => {
  expect(
    getToolLabel({ toolName: "str_replace_editor", state: "result", args: { path: "/App.jsx" } })
  ).toBe("Editing /App.jsx");
});

test("getToolLabel: str_replace_editor with no path", () => {
  expect(
    getToolLabel({ toolName: "str_replace_editor", state: "result", args: {} })
  ).toBe("Editing file");
});

test("getToolLabel: file_manager rename command", () => {
  expect(
    getToolLabel({ toolName: "file_manager", state: "result", args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" } })
  ).toBe("Renaming /old.jsx to /new.jsx");
});

test("getToolLabel: file_manager delete command", () => {
  expect(
    getToolLabel({ toolName: "file_manager", state: "result", args: { command: "delete", path: "/App.jsx" } })
  ).toBe("Deleting /App.jsx");
});

test("getToolLabel: file_manager with no path", () => {
  expect(
    getToolLabel({ toolName: "file_manager", state: "result", args: {} })
  ).toBe("Managing file");
});

test("getToolLabel: unknown tool returns tool name", () => {
  expect(
    getToolLabel({ toolName: "some_other_tool", state: "result" })
  ).toBe("some_other_tool");
});

// --- ToolCallDisplay render tests ---

test("ToolCallDisplay shows label when done", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        result: "ok",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("ToolCallDisplay shows label while in progress", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "str_replace", path: "/components/Card.jsx" },
      }}
    />
  );

  expect(screen.getByText("Editing /components/Card.jsx")).toBeDefined();
});

test("ToolCallDisplay shows green dot when done", () => {
  const { container } = render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        result: "ok",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolCallDisplay shows spinner while in progress", () => {
  const { container } = render(
    <ToolCallDisplay
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallDisplay handles file_manager delete", () => {
  render(
    <ToolCallDisplay
      tool={{
        toolName: "file_manager",
        state: "result",
        result: { success: true },
        args: { command: "delete", path: "/old.jsx" },
      }}
    />
  );

  expect(screen.getByText("Deleting /old.jsx")).toBeDefined();
});
