import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useAuth,
} from "@clerk/tanstack-react-start";
import { useMemo, type ReactNode } from "react";
import type { AuthActionButtonProps } from "./auth";
import { AuthContext, type AuthContextValue } from "./authContext";

export function ClerkAuthProvider({
  children,
  publishableKey,
}: Readonly<{ children: ReactNode; publishableKey: string }>) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkSessionProvider>{children}</ClerkSessionProvider>
    </ClerkProvider>
  );
}

function ClerkSessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { isLoaded, isSignedIn } = useAuth();
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

export function ClerkAuthActionButton({
  children,
  intent,
  redirectTo = "/task",
  className,
}: AuthActionButtonProps) {
  const button = (
    <button className={className} type="button">
      {children}
    </button>
  );
  if (intent === "sign-in") {
    return (
      <SignInButton fallbackRedirectUrl={redirectTo} mode="modal">
        {button}
      </SignInButton>
    );
  }
  if (intent === "sign-up") {
    return (
      <SignUpButton fallbackRedirectUrl={redirectTo} mode="modal">
        {button}
      </SignUpButton>
    );
  }
  return <SignOutButton redirectUrl="/">{button}</SignOutButton>;
}
