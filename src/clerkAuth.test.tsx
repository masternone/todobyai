import { useContext, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "./authContext";
import { ClerkAuthActionButton, ClerkAuthProvider } from "./clerkAuth";

const clerk = vi.hoisted(() => ({
  provider: vi.fn(({ children }: { children: ReactNode }) => children),
  signIn: vi.fn(({ children }: { children: ReactNode }) => children),
  signUp: vi.fn(({ children }: { children: ReactNode }) => children),
  signOut: vi.fn(({ children }: { children: ReactNode }) => children),
  useAuth: vi.fn(() => ({ isLoaded: true, isSignedIn: false })),
}));

vi.mock("@clerk/tanstack-react-start", () => ({
  ClerkProvider: clerk.provider,
  SignInButton: clerk.signIn,
  SignUpButton: clerk.signUp,
  SignOutButton: clerk.signOut,
  useAuth: clerk.useAuth,
}));

describe("Clerk authentication boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards configuration and exposes the Clerk session", () => {
    function Session() {
      const auth = useContext(AuthContext);
      return <output>{auth?.isLoaded && auth.isSignedIn ? "Signed in" : "Signed out"}</output>;
    }

    clerk.useAuth.mockReturnValue({ isLoaded: true, isSignedIn: true });
    expect(
      renderToStaticMarkup(
        <ClerkAuthProvider publishableKey="test-publishable-key">
          <Session />
        </ClerkAuthProvider>,
      ),
    ).toContain("Signed in");
    expect(clerk.provider.mock.calls[0][0]).toMatchObject({
      publishableKey: "test-publishable-key",
    });
  });

  it.each(["sign-in", "sign-up"] as const)(
    "preserves modal and protected redirect behavior for %s",
    (intent) => {
      const markup = renderToStaticMarkup(
        <ClerkAuthActionButton className="focus-ring" intent={intent} redirectTo="/task/archive">
          Continue
        </ClerkAuthActionButton>,
      );
      const action = intent === "sign-in" ? clerk.signIn : clerk.signUp;
      expect(action.mock.calls[0][0]).toMatchObject({
        fallbackRedirectUrl: "/task/archive",
        mode: "modal",
      });
      expect(markup).toBe('<button class="focus-ring" type="button">Continue</button>');
    },
  );

  it("preserves the public destination after signing out", () => {
    renderToStaticMarkup(
      <ClerkAuthActionButton className="focus-ring" intent="sign-out">
        Sign out
      </ClerkAuthActionButton>,
    );
    expect(clerk.signOut.mock.calls[0][0]).toMatchObject({ redirectUrl: "/" });
  });
});
