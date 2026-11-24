import { createContext } from "react";

export type AuthContextValue = {
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (redirectTo?: string) => void;
  signUp: (redirectTo?: string) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
