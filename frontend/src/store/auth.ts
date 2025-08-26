import { create } from "zustand";

type User = { id:number; name:string; email:string };
type S = {
  user?: User;
  token?: string;
  set: (p: Partial<S>) => void;
  logout: () => void;
};

// Helpers to persist
const LS_TOKEN = "token";
const LS_USER  = "user";

export const useAuth = create<S>((set) => ({
  set: (p) => {
    if ("token" in p) {
      if (p.token) localStorage.setItem(LS_TOKEN, p.token);
      else localStorage.removeItem(LS_TOKEN);
    }
    if ("user" in p) {
      if (p.user) localStorage.setItem(LS_USER, JSON.stringify(p.user));
      else localStorage.removeItem(LS_USER);
    }
    set(p);
  },
  logout: () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    set({ user: undefined, token: undefined });
  },
}));
