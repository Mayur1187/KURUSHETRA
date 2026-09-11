import { createContext, useEffect, useState } from "react";
import * as authService from "../services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    authService.getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    const { data } = authService.onAuthStateChange((s) => setSession(s));
    unsubscribe = () => data?.subscription?.unsubscribe();

    return () => unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user || null,
    isAuthenticated: Boolean(session),
    loading,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    resetPassword: authService.resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
