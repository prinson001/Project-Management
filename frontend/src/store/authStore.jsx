import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  users:[],
  setToken: (token) => {
    set({ token });
    localStorage.setItem("token", token);
  },
  clearToken: () => {
    set({ token: null });
    localStorage.removeItem("token");
  },
  setUsers:(users)=>{
    set({users});
  }
}));

export default useAuthStore;
