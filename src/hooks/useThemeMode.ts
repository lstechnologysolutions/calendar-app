import { useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

export function useThemeMode() {
  const isWeb = typeof document !== "undefined";
  const [mode, setMode] = useState<ThemeMode>("system");
  const [explicitTheme, setExplicitTheme] = useState<string | null>(null);

  const systemPrefersDark = useMemo(() => {
    if (isWeb) {
      return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return Appearance.getColorScheme() === "dark";
  }, [isWeb]);

  const isDark = mode === "system" ? systemPrefersDark : mode === "dark";

  useEffect(() => {
    if (isWeb) {
      const root = document.documentElement;
      const read = () => {
        const m = (root.getAttribute("data-theme-mode") as ThemeMode) || "system";
        setMode(m);
        setExplicitTheme(root.getAttribute("data-theme"));
      };
      read();

      const observer = new MutationObserver(() => read());
      observer.observe(root, { attributes: true, attributeFilter: ["data-theme-mode", "data-theme"] });

      const mmq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        // trigger recompute by updating state with same value
        setMode((prev) => prev);
      };
      mmq?.addEventListener?.("change", onChange);

      return () => {
        observer.disconnect();
        mmq?.removeEventListener?.("change", onChange);
      };
    } else {
      const sub = Appearance.addChangeListener(() => {
        // trigger recompute
        setMode((prev) => prev);
      });
      return () => sub.remove();
    }
  }, [isWeb]);

  return { mode, isDark, theme: explicitTheme };
}
