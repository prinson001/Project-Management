import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  setToken: (token) => {
    set({ token });
    localStorage.setItem("token", token);
  },
  clearToken: () => {
    set({ token: null });
    localStorage.removeItem("token");
  },
}));

export default useAuthStore;
