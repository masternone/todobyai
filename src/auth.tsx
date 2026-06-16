import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useAuth as useClerkAuth,
} from "@clerk/tanstack-react-start";
import { Navigate, useLocation, useNavigate } from "@tanstack/react-router";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (redirectTo?: string) => void;
  signUp: (redirectTo?: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
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
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ClerkAuthProvider>{children}</ClerkAuthProvider>
    </ClerkProvider>
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

export function AuthActionButton({
  children,
  intent,
  redirectTo = "/task",
  className,
}: Readonly<{
  children: React.ReactNode;
  intent: "sign-in" | "sign-up" | "sign-out";
  redirectTo?: string;
  className: string;
}>) {
  const auth = useAppAuth();

  if (authMode !== "test" && clerkPublishableKey) {
    if (intent === "sign-in") {
      return (
        <SignInButton fallbackRedirectUrl={redirectTo} mode="modal">
          <button className={className} type="button">
            {children}
          </button>
        </SignInButton>
      );
    }

    if (intent === "sign-up") {
      return (
        <SignUpButton fallbackRedirectUrl={redirectTo} mode="modal">
          <button className={className} type="button">
            {children}
          </button>
        </SignUpButton>
      );
    }

    return (
      <SignOutButton redirectUrl="/">
        <button className={className} type="button">
          {children}
        </button>
      </SignOutButton>
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

function ClerkAuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      signIn: () => undefined,
      signUp: () => undefined,
      signOut: () => undefined,
    }),
    [isLoaded, isSignedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-accent bg-accent px-4 text-sm font-semibold text-surface"
            intent="sign-in"
            redirectTo={returnTo}
          >
            Sign in
          </AuthActionButton>
          <AuthActionButton
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-rule bg-surface px-4 text-sm font-semibold text-ink"
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
