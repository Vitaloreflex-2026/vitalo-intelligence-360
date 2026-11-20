import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SALE = {
  id: 7,
  first_name: "Nathalie",
  last_name: "Martin",
  avatar: null,
  administrator: false,
};
const PUBLIC_URL = "https://example.supabase.co/storage/v1/object/public/a.png";

const upload = vi.fn();
const invoke = vi.fn();

vi.mock("./supabase", () => {
  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: "user-1" } }, error: null }),
      getSession: async () => ({
        data: { session: { user: { id: "user-1" } } },
        error: null,
      }),
    },
    from: () => ({
      select: () => ({
        match: () => ({ single: async () => ({ data: SALE, error: null }) }),
      }),
    }),
    storage: {
      from: () => ({
        upload,
        getPublicUrl: () => ({ data: { publicUrl: PUBLIC_URL } }),
      }),
    },
    functions: { invoke },
  };
  return { getSupabaseClient: () => client };
});

vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
vi.stubEnv("VITE_SB_PUBLISHABLE_KEY", "test-key");

const { getAuthProvider } = await import("./authProvider");
const { getDataProvider } = await import("./dataProvider");

describe("current sale cache", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("still returns the identity when localStorage is full", async () => {
    // Arrange
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // Act
    const identity = await getAuthProvider().getIdentity!();

    // Assert
    expect(identity.fullName).toBe("Nathalie Martin");
  });
});

describe("salesUpdate", () => {
  beforeEach(() => {
    upload.mockReset().mockResolvedValue({ error: null });
    invoke.mockReset().mockResolvedValue({ data: { data: SALE }, error: null });
  });

  it("sends a storage URL, not the cropped data URL, as the avatar", async () => {
    // Arrange
    const dataUrl = "data:image/png;base64,iVBORw0KGgo=";
    const avatar = {
      src: dataUrl,
      title: "me.png",
      rawFile: new File(["x"], "me.png", { type: "image/png" }),
    };

    // Act
    await getDataProvider().salesUpdate(7, {
      first_name: "Nathalie",
      last_name: "Martin",
      avatar,
    });

    // Assert
    const body = invoke.mock.calls[0][1].body;
    expect(body.avatar.src).toBe(PUBLIC_URL);
  });
});
