import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  userId: localStorage.getItem("userId") || null,
  users: [],
  projectTypes: [],
  projectPhases: [],
  documents: [],
  departments: [],
  roles: [],
  initiatives: [],
  meetingId: localStorage.getItem("meetingId") || null,
  setToken: (token) => {
    set({ token });
    localStorage.setItem("token", token);
  },
  setRole: (role) => {
    set({ role });
    localStorage.setItem("role", role);
  },
  setUserId: (userId) => {
    // Add setter for userId
    set({ userId });
    localStorage.setItem("userId", userId);
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
  },
  setDocuments: (documents) => {
    set({ documents });
  },
  setDepartments: (departments) => {
    set({ departments });
  },
  setRoles: (roles) => {
    set({ roles });
  },
  setInitiatives: (initiatives) => {
    set({ initiatives });
  },
    setMeetingId: (meetingId) => { // ✅ NEW
    set({ meetingId });
    localStorage.setItem("meetingId", meetingId);
  },
}));

export default useAuthStore;
