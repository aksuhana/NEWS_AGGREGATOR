import { create } from "zustand";

type User = { id: number; name: string; email: string };
type S = {
  user?: User;
  token?: string;
  set: (p: Partial<S>) => void;
  logout: () => void;
};

export const useAuth = create<S>((set) => ({
  set: (p) => {
    if ("token" in p) {
      if (p.token) localStorage.setItem("token", p.token);
      else localStorage.removeItem("token");
    }
    set(p);
  },
  logout: () => set({ user: undefined, token: undefined }),
}));
