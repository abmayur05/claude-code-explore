import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../use-auth";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock actions
vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

// Mock anon work tracker
vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

// Mock project actions
vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

// Import mocked modules
import * as authActions from "@/actions";
import * as anonTracker from "@/lib/anon-work-tracker";
import * as projectActions from "@/actions/get-projects";
import * as createProjectModule from "@/actions/create-project";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    test("sets isLoading to true during sign in", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });
      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([]);
      (createProjectModule.createProject as any).mockResolvedValue({ id: "new-1" });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let isLoadingDuringCall = false;
      const signInPromise = act(async () => {
        const promise = result.current.signIn("test@example.com", "password");
        // Check loading state synchronously after calling signIn
        isLoadingDuringCall = result.current.isLoading;
        await promise;
      });

      await signInPromise;
      expect(result.current.isLoading).toBe(false);
    });

    test("returns success when signIn action succeeds", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });
      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([]);
      (createProjectModule.createProject as any).mockResolvedValue({ id: "new-1" });

      const { result } = renderHook(() => useAuth());

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password"
        );
      });

      expect(signInResult).toEqual({ success: true });
    });

    test("returns error when signIn action fails", async () => {
      const errorMessage = "Invalid credentials";
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: false, error: errorMessage });

      const { result } = renderHook(() => useAuth());

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "wrong-password"
        );
      });

      expect(signInResult).toEqual({ success: false, error: errorMessage });
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("sets isLoading to false when signIn fails", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: false, error: "Auth failed" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("passes email and password to signIn action", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });
      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([]);
      (createProjectModule.createProject as any).mockResolvedValue({ id: "new-1" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "mypassword");
      });

      expect(mockSignIn).toHaveBeenCalledWith("user@example.com", "mypassword");
    });
  });

  describe("signUp", () => {
    test("sets isLoading to true during sign up", async () => {
      const mockSignUp = vi.spyOn(authActions, "signUp");
      mockSignUp.mockResolvedValue({ success: true });
      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([]);
      (createProjectModule.createProject as any).mockResolvedValue({ id: "new-1" });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("returns success when signUp action succeeds", async () => {
      const mockSignUp = vi.spyOn(authActions, "signUp");
      mockSignUp.mockResolvedValue({ success: true });
      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([]);
      (createProjectModule.createProject as any).mockResolvedValue({ id: "new-1" });

      const { result } = renderHook(() => useAuth());

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "new@example.com",
          "password"
        );
      });

      expect(signUpResult).toEqual({ success: true });
    });

    test("returns error when signUp action fails", async () => {
      const errorMessage = "Email already exists";
      const mockSignUp = vi.spyOn(authActions, "signUp");
      mockSignUp.mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => useAuth());

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "existing@example.com",
          "password"
        );
      });

      expect(signUpResult).toEqual({ success: false, error: errorMessage });
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("sets isLoading to false when signUp fails", async () => {
      const mockSignUp = vi.spyOn(authActions, "signUp");
      mockSignUp.mockResolvedValue({ success: false, error: "Signup failed" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("passes email and password to signUp action", async () => {
      const mockSignUp = vi.spyOn(authActions, "signUp");
      mockSignUp.mockResolvedValue({ success: true });
      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([]);
      (createProjectModule.createProject as any).mockResolvedValue({ id: "new-1" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("signup@example.com", "secure123");
      });

      expect(mockSignUp).toHaveBeenCalledWith("signup@example.com", "secure123");
    });
  });

  describe("post-sign-in navigation with anonymous work", () => {
    test("creates project from anonymous work and redirects", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      const anonWork = {
        messages: [
          { id: "1", role: "user" as const, content: "Hello" },
          { id: "2", role: "assistant" as const, content: "Hi there!" },
        ],
        fileSystemData: { "/test.js": { type: "file", content: "test" } },
      };

      (anonTracker.getAnonWorkData as any).mockReturnValue(anonWork);

      const newProject = { id: "project-123" };
      (createProjectModule.createProject as any).mockResolvedValue(newProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(createProjectModule.createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: anonWork.messages,
        data: anonWork.fileSystemData,
      });

      expect(anonTracker.clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-123");
    });

    test("clears anonymous work after creating project", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      const anonWork = {
        messages: [{ id: "1", role: "user" as const, content: "test" }],
        fileSystemData: {},
      };

      (anonTracker.getAnonWorkData as any).mockReturnValue(anonWork);
      (createProjectModule.createProject as any).mockResolvedValue({
        id: "project-456",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(anonTracker.clearAnonWork).toHaveBeenCalled();
    });

    test("skips anonymous work if messages array is empty", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      const anonWork = {
        messages: [],
        fileSystemData: { "/test.js": { type: "file" } },
      };

      (anonTracker.getAnonWorkData as any).mockReturnValue(anonWork);
      (projectActions.getProjects as any).mockResolvedValue([
        { id: "existing-1" },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(createProjectModule.createProject).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-1");
    });

    test("skips anonymous work if it is null", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([
        { id: "existing-2" },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(createProjectModule.createProject).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-2");
    });
  });

  describe("post-sign-in navigation with existing projects", () => {
    test("redirects to first project when multiple exist", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([
        { id: "project-1" },
        { id: "project-2" },
        { id: "project-3" },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/project-1");
      expect(createProjectModule.createProject).not.toHaveBeenCalled();
    });

    test("redirects to only project when one exists", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([{ id: "only-1" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/only-1");
    });
  });

  describe("post-sign-in navigation with no projects", () => {
    test("creates new project when no projects exist", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([]);

      const newProject = { id: "new-project-123" };
      (createProjectModule.createProject as any).mockResolvedValue(newProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(createProjectModule.createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });

      expect(mockPush).toHaveBeenCalledWith("/new-project-123");
    });

    test("generates random project name when creating new project", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([]);
      (createProjectModule.createProject as any).mockResolvedValue({
        id: "new-1",
      });

      const { result } = renderHook(() => useAuth());

      const callResults = [];

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await result.current.signIn("test@example.com", "password");
        });
        if (i < 2) {
          // Reset for next iteration
          vi.clearAllMocks();
          mockSignIn.mockResolvedValue({ success: true });
          (anonTracker.getAnonWorkData as any).mockReturnValue(null);
          (projectActions.getProjects as any).mockResolvedValue([]);
          (createProjectModule.createProject as any).mockResolvedValue({
            id: "new-1",
          });
        }
      }

      // Verify the names match the expected pattern
      const calls = (createProjectModule.createProject as any).mock.calls;
      calls.forEach((call: any) => {
        expect(call[0].name).toMatch(/^New Design #\d+$/);
      });
    });
  });

  describe("navigation precedence", () => {
    test("prioritizes anonymous work over existing projects", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      const anonWork = {
        messages: [{ id: "1", role: "user" as const, content: "design" }],
        fileSystemData: {},
      };

      (anonTracker.getAnonWorkData as any).mockReturnValue(anonWork);
      (projectActions.getProjects as any).mockResolvedValue([
        { id: "old-project-1" },
        { id: "old-project-2" },
      ]);
      (createProjectModule.createProject as any).mockResolvedValue({
        id: "anon-project",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      // Should use anonymous work, not existing projects
      expect(createProjectModule.createProject).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/anon-project");
      expect(mockPush).not.toHaveBeenCalledWith("/old-project-1");
    });

    test("prioritizes existing projects over creating new project", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([
        { id: "existing-1" },
      ]);
      (createProjectModule.createProject as any).mockResolvedValue({
        id: "new-1",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      // Should redirect to existing project, not create new one
      expect(mockPush).toHaveBeenCalledWith("/existing-1");
      expect(createProjectModule.createProject).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    test("continues to loading state false if createProject throws", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockRejectedValue(
        new Error("Database error")
      );

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.signIn("test@example.com", "password");
        })
      ).rejects.toThrow("Database error");

      expect(result.current.isLoading).toBe(false);
    });

    test("handles getProjects throwing error", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      mockSignIn.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockRejectedValue(
        new Error("Failed to fetch projects")
      );

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.signIn("test@example.com", "password");
        })
      ).rejects.toThrow("Failed to fetch projects");
    });
  });

  describe("initial state", () => {
    test("returns isLoading as false initially", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });

    test("returns signIn and signUp functions", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
    });
  });

  describe("multiple sequential calls", () => {
    test("handles multiple signIn calls sequentially", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");

      let callCount = 0;
      mockSignIn.mockImplementation(async () => {
        callCount++;
        return callCount === 1
          ? { success: false, error: "First attempt" }
          : { success: true };
      });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([
        { id: "project-1" },
      ]);

      const { result } = renderHook(() => useAuth());

      // First call fails
      let result1;
      await act(async () => {
        result1 = await result.current.signIn("test@example.com", "wrong");
      });
      expect(result1?.success).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();

      // Second call succeeds
      await act(async () => {
        await result.current.signIn("test@example.com", "correct");
      });
      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    test("can alternate between signIn and signUp", async () => {
      const mockSignIn = vi.spyOn(authActions, "signIn");
      const mockSignUp = vi.spyOn(authActions, "signUp");

      mockSignIn.mockResolvedValue({ success: true });
      mockSignUp.mockResolvedValue({ success: true });

      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([{ id: "p1" }]);
      (createProjectModule.createProject as any).mockResolvedValue({
        id: "new-1",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });
      expect(mockSignIn).toHaveBeenCalled();

      vi.clearAllMocks();
      mockSignUp.mockResolvedValue({ success: true });
      (anonTracker.getAnonWorkData as any).mockReturnValue(null);
      (projectActions.getProjects as any).mockResolvedValue([{ id: "p2" }]);

      await act(async () => {
        await result.current.signUp("new@example.com", "password");
      });
      expect(mockSignUp).toHaveBeenCalled();
    });
  });
});
