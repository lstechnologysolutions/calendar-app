import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Appearance } from "react-native";
import { Trans } from "@lingui/react/macro";

// Core palette of DaisyUI themes to choose from
const THEMES = ["nord", "abyss", "cupcake", "dracula", "business"] as const;
type ThemeName = (typeof THEMES)[number];
type ThemeMode = "system" | "light" | "dark";

const isWeb = typeof document !== "undefined";

const applyTheme = (mode: ThemeMode, theme?: ThemeName) => {
  if (!isWeb) return;

  const root = document.documentElement;
  root.setAttribute("data-theme-mode", mode);

  // Determine effective light/dark and set combined theme token: `${theme}-${light|dark}`
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const effectiveLD = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  if (theme) root.setAttribute("data-theme", `${theme}-${effectiveLD}`);
};

export default function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [theme, setTheme] = useState<ThemeName>("nord");
  const systemPrefersDark = useMemo(
    () => (isWeb ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches : Appearance.getColorScheme() === "dark"),
    [],
  );

  // Initialize from localStorage / DOM
  useEffect(() => {
    if (!isWeb) return;
    try {
      const savedMode = window.localStorage.getItem("themeMode") as ThemeMode | null;
      const savedTheme = window.localStorage.getItem("themeName") as ThemeName | null;
      if (savedMode === "system" || savedMode === "light" || savedMode === "dark") {
        setMode(savedMode);
      }
      if (savedTheme && (THEMES as readonly string[]).includes(savedTheme)) {
        setTheme(savedTheme as ThemeName);
      }
    } catch {}
  }, []);

  // Persist and apply on change
  useEffect(() => {
    if (isWeb) {
      try {
        window.localStorage.setItem("themeMode", mode);
        window.localStorage.setItem("themeName", theme);
      } catch {}
    }
    applyTheme(mode, theme);
  }, [mode, theme]);

  // React to system preference changes when in system mode
  useEffect(() => {
    if (!isWeb) return;
    const mm = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "system") applyTheme(mode, theme);
    };
    try {
      mm?.addEventListener?.("change", handler);
    } catch {
      // Safari
      // @ts-ignore
      mm?.addListener?.(handler);
    }
    return () => {
      try {
        mm?.removeEventListener?.("change", handler);
      } catch {
        // @ts-ignore
        mm?.removeListener?.(handler);
      }
    };
  }, [mode, theme]);

  // UI helpers — use Trans components so messages are extracted from source
  const LabelComponent = () => (
    <>
      {mode === "system" ? (
        systemPrefersDark ? (
          <Trans id="theme.systemDark">System (Dark)</Trans>
        ) : (
          <Trans id="theme.systemLight">System (Light)</Trans>
        )
      ) : mode === "dark" ? (
        <Trans id="theme.dark">Dark</Trans>
      ) : (
        <Trans id="theme.light">Light</Trans>
      )}
    </>
  );

  // Helpers to cycle themes
  const idx = THEMES.indexOf(theme);
  const prevTheme = () => setTheme(THEMES[(idx - 1 + THEMES.length) % THEMES.length]);
  const nextTheme = () => setTheme(THEMES[(idx + 1) % THEMES.length]);

  return (
    <View className="flex-row items-center">
      {/* Single pill that contains SYS/L/D and theme navigation */}
      <View className={`flex-row items-center rounded-full border border-base-300 overflow-hidden`}>
        {/* Prev */}
        <TouchableOpacity
          onPress={prevTheme}
          disabled={mode === "system"}
          className={`px-2 py-1 ${mode === "system" ? "opacity-50" : ""}`}
          accessibilityRole="button"
          accessibilityLabel="Previous theme"
        >
          <Text className="text-xs text-base-content">‹</Text>
        </TouchableOpacity>

        {/* Segmented SYS/L/D with icons */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setMode("system")}
            className={`px-2 py-1 ${mode === "system" ? "bg-primary" : "bg-base-100"}`}
            accessibilityRole="button"
            accessibilityLabel="Use system theme"
          >
            <Text className={`text-xs ${mode === "system" ? "text-primary-content" : "text-base-content"}`}>🖥️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("light")}
            className={`px-2 py-1 ${mode === "light" ? "bg-primary" : "bg-base-100"}`}
            accessibilityRole="button"
            accessibilityLabel="Use light theme"
          >
            <Text className={`text-xs ${mode === "light" ? "text-primary-content" : "text-base-content"}`}>☀️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("dark")}
            className={`px-2 py-1 ${mode === "dark" ? "bg-primary" : "bg-base-100"}`}
            accessibilityRole="button"
            accessibilityLabel="Use dark theme"
          >
            <Text className={`text-xs ${mode === "dark" ? "text-primary-content" : "text-base-content"}`}>🌙</Text>
          </TouchableOpacity>
        </View>

        {/* Label */}
        <View className="px-3 py-1 bg-base-100">
          <Text className="text-xs text-base-content">
            <LabelComponent />
            {" · "}
            {theme}
          </Text>
        </View>

        {/* Next */}
        <TouchableOpacity
          onPress={nextTheme}
          disabled={mode === "system"}
          className={`px-2 py-1 ${mode === "system" ? "opacity-50" : ""}`}
          accessibilityRole="button"
          accessibilityLabel="Next theme"
        >
          <Text className="text-xs text-base-content">›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
