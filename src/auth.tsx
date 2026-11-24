import { Navigate, useLocation, useNavigate } from "@tanstack/react-router";
import React, { lazy, Suspense, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext, type AuthContextValue } from "./authContext";

const ClerkAuthProvider = lazy(() =>
  import("./clerkAuth").then((module) => ({ default: module.ClerkAuthProvider })),
);
const ClerkAuthActionButton = lazy(() =>
  import("./clerkAuth").then((module) => ({ default: module.ClerkAuthActionButton })),
);
const testUserStorageKey = "todo-by-ai-test-user";
const defaultTestUserId = "test-user";
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const authMode = import.meta.env.VITE_TODO_BY_AI_AUTH_MODE;

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  if (authMode === "test") {
    return <TestAuthProvider>{children}</TestAuthProvider>;
  }

  if (!clerkPublishableKey) {
    return <MissingAuthProvider>{children}</MissingAuthProvider>;
  }

  return (
    <Suspense fallback={<main className="mx-auto max-w-5xl p-6 md:p-10">Loading...</main>}>
      <ClerkAuthProvider publishableKey={clerkPublishableKey}>{children}</ClerkAuthProvider>
    </Suspense>
  );
}

export function useAppAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Authentication is only available inside AuthProvider.");
  }
  return context;
}

export function RequireSignedIn({ children }: Readonly<{ children: React.ReactNode }>) {
  const auth = useAppAuth();
  const location = useLocation();

  if (!auth.isLoaded) {
    return <main className="mx-auto max-w-5xl p-6 md:p-10">Loading...</main>;
  }

  if (!auth.isSignedIn) {
    return <SignInRequired returnTo={location.href} />;
  }

  return children;
}

export function RedirectSignedInToTasks() {
  const auth = useAppAuth();

  if (auth.isLoaded && auth.isSignedIn) {
    return <Navigate to="/task" replace />;
  }

  return null;
}

export type AuthActionButtonProps = Readonly<{
  children: React.ReactNode;
  intent: "sign-in" | "sign-up" | "sign-out";
  redirectTo?: string;
  className: string;
}>;

export function AuthActionButton({
  children,
  intent,
  redirectTo = "/task",
  className,
}: AuthActionButtonProps) {
  const auth = useAppAuth();

  if (authMode !== "test" && clerkPublishableKey) {
    return (
      <ClerkAuthActionButton className={className} intent={intent} redirectTo={redirectTo}>
        {children}
      </ClerkAuthActionButton>
    );
  }

  return (
    <button
      className={className}
      type="button"
      onClick={() => {
        if (intent === "sign-in") {
          auth.signIn(redirectTo);
        } else if (intent === "sign-up") {
          auth.signUp(redirectTo);
        } else {
          auth.signOut();
        }
      }}
    >
      {children}
    </button>
  );
}

function TestAuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsSignedIn(Boolean(window.localStorage.getItem(testUserStorageKey)));
    setIsLoaded(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded,
      isSignedIn,
      signIn: (redirectTo = "/task") => {
        setTestUserIdentity(window.localStorage.getItem(testUserStorageKey) ?? defaultTestUserId);
        setIsSignedIn(true);
        window.location.href = redirectTo;
      },
      signUp: (redirectTo = "/task") => {
        setTestUserIdentity(window.localStorage.getItem(testUserStorageKey) ?? defaultTestUserId);
        setIsSignedIn(true);
        window.location.href = redirectTo;
      },
      signOut: () => {
        window.localStorage.removeItem(testUserStorageKey);
        clearTestUserIdentity();
        setIsSignedIn(false);
        void navigate({ to: "/" });
      },
    }),
    [isLoaded, isSignedIn, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function setTestUserIdentity(userId: string) {
  window.localStorage.setItem(testUserStorageKey, userId);
  document.cookie = `${testUserStorageKey}=${encodeURIComponent(userId)}; Path=/; SameSite=Lax`;
}

function clearTestUserIdentity() {
  document.cookie = `${testUserStorageKey}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function MissingAuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded: true,
      isSignedIn: false,
      signIn: () => undefined,
      signUp: () => undefined,
      signOut: () => undefined,
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function SignInRequired({ returnTo }: Readonly<{ returnTo: string }>) {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-6 p-6 md:p-10">
      <section className="grid gap-4">
        <p className="text-sm font-bold text-ink-muted">Todo by AI</p>
        <h1 className="text-4xl font-bold tracking-normal text-ink-strong">
          Sign in to Todo by AI
        </h1>
        {authMode !== "test" && !clerkPublishableKey ? (
          <p className="max-w-2xl text-danger">
            Authentication is not configured. Add VITE_CLERK_PUBLISHABLE_KEY to run protected Task
            routes locally.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <AuthActionButton
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-accent bg-accent px-4 text-sm font-semibold text-surface"
            intent="sign-in"
            redirectTo={returnTo}
          >
            Sign in
          </AuthActionButton>
          <AuthActionButton
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-control-rule bg-surface px-4 text-sm font-semibold text-ink"
            intent="sign-up"
            redirectTo={returnTo}
          >
            Sign up
          </AuthActionButton>
        </div>
      </section>
    </main>
  );
}
