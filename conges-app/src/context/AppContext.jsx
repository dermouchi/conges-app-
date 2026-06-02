import { createContext, useContext, useState } from "react";
import { initialData } from "../data/initialData";

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [data, setDataRaw] = useState(() => {
    try {
      const saved = localStorage.getItem("conges_data");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    const fresh = JSON.parse(JSON.stringify(initialData));
    localStorage.setItem("conges_data", JSON.stringify(fresh));
    return fresh;
  });

  const setData = (updater) => {
    setDataRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("conges_data", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ user, setUser, data, setData }}>
      {children}
    </AppContext.Provider>
  );
}