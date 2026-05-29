import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "restaurant_jwt";
const NAME_KEY = "restaurant_name";
const ID_KEY = "restaurant_id";

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [restaurantName, setRestaurantName] = useState(() => localStorage.getItem(NAME_KEY));
  const [restaurantId, setRestaurantId] = useState(() => localStorage.getItem(ID_KEY));

  const saveLoginData = useCallback(({ token, restaurantName, restaurantId }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(NAME_KEY, restaurantName);
    localStorage.setItem(ID_KEY, restaurantId);
    setToken(token);
    setRestaurantName(restaurantName);
    setRestaurantId(restaurantId);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(ID_KEY);
    setToken(null);
    setRestaurantName(null);
    setRestaurantId(null);
  }, []);

  const decodedToken = token ? decodeJwt(token) : null;

  return (
    <AuthContext.Provider value={{ token, decodedToken, restaurantName, restaurantId, saveLoginData, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
