import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Prefs = {
  theme: "light" | "dark";
  defaultTone: "Formal" | "Friendly" | "Persuasive";
  notifications: boolean;
  language: string;
};

type Ctx = Prefs & {
  setTheme: (v: Prefs["theme"]) => void;
  setDefaultTone: (v: Prefs["defaultTone"]) => void;
  setNotifications: (v: boolean) => void;
  setLanguage: (v: string) => void;
};

const PreferencesContext = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Prefs["theme"]>("light");
  const [defaultTone, setDefaultTone] = useState<Prefs["defaultTone"]>("Formal");
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        defaultTone,
        notifications,
        language,
        setTheme,
        setDefaultTone,
        setNotifications,
        setLanguage,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
