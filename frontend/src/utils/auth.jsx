import { jwtDecode } from "jwt-decode";

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
