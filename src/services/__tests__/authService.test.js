/**
 * Tests for src/services/authService.js
 *
 * The service has dual modes (mock | api). These tests focus on:
 *  - getCurrentUserId behavior (guest vs logged-in)
 *  - mock login/register flows (default REACT_APP_AUTH_MODE !== 'api' path)
 *  - expired token handling in getSession
 *
 * api.js is mocked because axios v1 ESM imports break jest's default transform.
 */

jest.mock("../api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

beforeEach(() => {
  jest.resetModules();
  jest.mock("../api", () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    },
  }));
  localStorage.clear();
});

describe("authService (mock mode)", () => {
  beforeEach(() => {
    process.env.REACT_APP_AUTH_MODE = "mock";
  });

  it('getCurrentUserId returns "guest" when no user is stored', () => {
    const authService = require("../authService");
    expect(authService.getCurrentUserId()).toBe("guest");
  });

  it("login stores a token + user and getCurrentUserId returns the new id", async () => {
    const authService = require("../authService");
    const session = await authService.login({
      email: "Foo@Example.com",
      password: "pw",
    });
    expect(session.token).toMatch(/^mock-token-/);
    expect(session.user.email).toBe("foo@example.com");
    expect(authService.getCurrentUserId()).toBe(session.user.id);
    expect(localStorage.getItem("ze-praga-auth-token")).toBe(session.token);
  });

  it("register stores full_name and email", async () => {
    const authService = require("../authService");
    const session = await authService.register({
      full_name: "Produtor Teste",
      email: "p@example.com",
      password: "pw",
    });
    expect(session.user.full_name).toBe("Produtor Teste");
    expect(session.user.email).toBe("p@example.com");
  });

  it("logout clears localStorage", async () => {
    const authService = require("../authService");
    await authService.login({ email: "a@b.com", password: "pw" });
    expect(authService.getAuthToken()).not.toBeNull();
    authService.logout();
    expect(authService.getAuthToken()).toBeNull();
    expect(authService.getCurrentUser()).toBeNull();
  });

  it("getSession returns null when token is expired", async () => {
    const authService = require("../authService");
    await authService.login({ email: "a@b.com", password: "pw" });
    // Force expiry in the past
    localStorage.setItem("ze-praga-auth-expires-at", String(Date.now() - 1000));
    const session = await authService.getSession();
    expect(session).toBeNull();
    expect(authService.getAuthToken()).toBeNull();
  });

  it("getAuthHeaders returns Authorization when token present", async () => {
    const authService = require("../authService");
    await authService.login({ email: "a@b.com", password: "pw" });
    const headers = authService.getAuthHeaders();
    expect(headers.Authorization).toMatch(/^Bearer mock-token-/);
  });

  it("getAuthHeaders returns {} when no token", () => {
    const authService = require("../authService");
    expect(authService.getAuthHeaders()).toEqual({});
  });
});
