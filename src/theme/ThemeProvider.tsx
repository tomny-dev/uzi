"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { UZI_THEMES, UZI_ACCENTS, THEME_STORAGE_KEY as DEFAULT_THEME_KEY, ACCENT_STORAGE_KEY as DEFAULT_ACCENT_KEY } from "./constants";

export type UziTheme = typeof UZI_THEMES[number];
export type UziResolvedTheme = "light" | "dark";
export type UziAccent = typeof UZI_ACCENTS[number];

type ThemeContextValue = {
  theme: UziTheme;
  resolvedTheme: UziResolvedTheme;
  accent: UziAccent;
  setTheme: (theme: UziTheme) => void;
  setAccent: (accent: UziAccent) => void;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: ReactNode;
  theme?: UziTheme;
  defaultTheme?: UziTheme;
  accent?: UziAccent;
  defaultAccent?: UziAccent;
  onThemeChange?: (theme: UziTheme) => void;
  onAccentChange?: (accent: UziAccent) => void;
  storageKey?: string;
  accentStorageKey?: string;
  disableStorage?: boolean;
};

const THEME_STORAGE_KEY = DEFAULT_THEME_KEY;
const ACCENT_STORAGE_KEY = DEFAULT_ACCENT_KEY;
const THEME_ATTRIBUTE = "data-uzi-theme";
const ACCENT_ATTRIBUTE = "data-uzi-accent";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(value: string | null): value is UziTheme {
  return UZI_THEMES.includes(value as UziTheme);
}

function isAccent(value: string | null): value is UziAccent {
  return UZI_ACCENTS.includes(value as UziAccent);
}

function getSystemTheme(): UziResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  theme,
  defaultTheme = "system",
  accent,
  defaultAccent = "blue",
  onThemeChange,
  onAccentChange,
  storageKey = THEME_STORAGE_KEY,
  accentStorageKey = ACCENT_STORAGE_KEY,
  disableStorage = false,
}: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<UziTheme>(defaultTheme);
  const [internalAccent, setInternalAccent] = useState<UziAccent>(defaultAccent);
  const [systemTheme, setSystemTheme] = useState<UziResolvedTheme>("light");

  useEffect(() => {
    setSystemTheme(getSystemTheme());
    if (!disableStorage) {
      const storedTheme = window.localStorage.getItem(storageKey);
      if (isTheme(storedTheme)) setInternalTheme(storedTheme);
      const storedAccent = window.localStorage.getItem(accentStorageKey);
      if (isAccent(storedAccent)) setInternalAccent(storedAccent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isThemeControlled = theme !== undefined;
  const isAccentControlled = accent !== undefined;

  const currentTheme = isThemeControlled ? theme : internalTheme;
  const currentAccent = isAccentControlled ? accent : internalAccent;
  const resolvedTheme = currentTheme === "system" ? systemTheme : currentTheme;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(mediaQuery.matches ? "dark" : "light");

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute(THEME_ATTRIBUTE, resolvedTheme);
    root.setAttribute(ACCENT_ATTRIBUTE, currentAccent);
    root.style.colorScheme = resolvedTheme;
    root.classList.toggle("dark", resolvedTheme === "dark");
  }, [currentAccent, resolvedTheme]);

  const setTheme = useCallback(
    (nextTheme: UziTheme) => {
      if (!isThemeControlled) setInternalTheme(nextTheme);
      if (!disableStorage && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, nextTheme);
      }
      onThemeChange?.(nextTheme);
    },
    [disableStorage, isThemeControlled, onThemeChange, storageKey],
  );

  const setAccent = useCallback(
    (nextAccent: UziAccent) => {
      if (!isAccentControlled) setInternalAccent(nextAccent);
      if (!disableStorage && typeof window !== "undefined") {
        window.localStorage.setItem(accentStorageKey, nextAccent);
      }
      onAccentChange?.(nextAccent);
    },
    [accentStorageKey, disableStorage, isAccentControlled, onAccentChange],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: currentTheme,
      resolvedTheme,
      accent: currentAccent,
      setTheme,
      setAccent,
      toggleTheme,
    }),
    [currentAccent, currentTheme, resolvedTheme, setAccent, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
