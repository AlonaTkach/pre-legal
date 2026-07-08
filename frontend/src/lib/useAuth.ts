"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const TOKEN_KEY = "prelegal_token";
const EMAIL_KEY = "prelegal_email";

export type Session = { token: string; email: string } | null;

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  listeners.forEach((l) => l());
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "null";
  const token = localStorage.getItem(TOKEN_KEY);
  const email = localStorage.getItem(EMAIL_KEY);
  return token && email ? JSON.stringify({ token, email }) : "null";
}

function getServerSnapshot(): string {
  return "null";
}

export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const session = useMemo(() => JSON.parse(snapshot) as Session, [snapshot]);

  const signIn = useCallback((token: string, email: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
    emit();
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    emit();
  }, []);

  return { session, signIn, signOut };
}
