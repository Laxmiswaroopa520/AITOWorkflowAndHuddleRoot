import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const themeStorageKey = "aito-color-theme";
const initialDarkMode = () => window.localStorage.getItem(themeStorageKey) === "dark" || (!window.localStorage.getItem(themeStorageKey) && window.matchMedia("(prefers-color-scheme: dark)").matches);

/** Applies and persists only the user's visual theme preference. */
export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    window.localStorage.setItem(themeStorageKey, darkMode ? "dark" : "light");
  }, [darkMode]);
  return <Button type="button" variant="ghost" size="icon" aria-label={darkMode ? "Use light theme" : "Use dark theme"} title={darkMode ? "Use light theme" : "Use dark theme"} onClick={() => setDarkMode(value => !value)}>{darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>;
}
