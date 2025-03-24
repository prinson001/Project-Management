import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  users: [],
  projectTypes: [], // Initialized as empty array
  projectPhases: [],
  setToken: (token) => {
    set({ token });
    localStorage.setItem("token", token);
  },
  setRole: (role) => {
    set({ role });
    localStorage.setItem("role", role);
  },
  clearToken: () => {
    set({ token: null, role: null });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  },
  setUsers: (users) => {
    set({ users });
  },
  setProjectTypes: (projectTypes) => {
    set({ projectTypes }); // Correctly stores the array of objects
  },
  setProjectPhases: (projectPhases) => {
    set({ projectPhases });
  }
}));

export default useAuthStore;
