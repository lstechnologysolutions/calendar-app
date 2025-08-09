import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Appearance, useWindowDimensions } from "react-native";
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

interface ThemeSwitcherProps {
  onSelect?: () => void;
}

export default function ThemeSwitcher({ onSelect }: ThemeSwitcherProps) {
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

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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
  const prevTheme = () => {
    setTheme(THEMES[(idx - 1 + THEMES.length) % THEMES.length]);
    onSelect?.();
  };
  
  const nextTheme = () => {
    setTheme(THEMES[(idx + 1) % THEMES.length]);
    onSelect?.();
  };

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    onSelect?.();
  };

  return (
    <View className={`flex-col ${isMobile ? 'w-full' : 'items-center'}`}>
      {/* Main theme selector row */}
      <View className={`flex-row items-center ${isMobile ? 'w-full justify-between' : 'rounded-full border border-base-300 overflow-hidden'}`}>
        {/* Prev button - only show on desktop */}
        {!isMobile && (
          <TouchableOpacity
            onPress={prevTheme}
            disabled={mode === "system"}
            className={`px-3 py-2 ${mode === "system" ? "opacity-50" : "active:bg-base-200/50"}`}
            accessibilityRole="button"
            accessibilityLabel="Previous theme"
          >
            <Text className="text-base text-base-content">‹</Text>
          </TouchableOpacity>
        )}

        {/* Theme mode selector */}
        <View className={`flex-row items-center ${isMobile ? 'w-full justify-between' : ''}`}>
          <TouchableOpacity
            onPress={() => handleModeChange("system")}
            className={`px-3 py-2 ${isMobile ? 'flex-1 items-center' : ''} ${mode === "system" ? "bg-primary" : "bg-base-100 active:bg-base-200/50"}`}
            accessibilityRole="button"
            accessibilityLabel="Use system theme"
          >
            <Text className={`text-base ${mode === "system" ? "text-primary-content" : "text-base-content"}`}>
               🖥️
              {!isMobile && <Text className="ml-2 text-sm"><Trans>System</Trans></Text>}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleModeChange("light")}
            className={`px-3 py-2 ${isMobile ? 'flex-1 items-center' : ''} ${mode === "light" ? "bg-primary" : "bg-base-100 active:bg-base-200/50"}`}
            accessibilityRole="button"
            accessibilityLabel="Use light theme"
          >
            <Text className={`text-base ${mode === "light" ? "text-primary-content" : "text-base-content"}`}>
              ☀️
              {!isMobile && <Text className="ml-2 text-sm"><Trans>Light</Trans></Text>}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleModeChange("dark")}
            className={`px-3 py-2 ${isMobile ? 'flex-1 items-center' : ''} ${mode === "dark" ? "bg-primary" : "bg-base-100 active:bg-base-200/50"}`}
            accessibilityRole="button"
            accessibilityLabel="Use dark theme"
          >
            <Text className={`text-base ${mode === "dark" ? "text-primary-content" : "text-base-content"}`}>
              🌙
              {!isMobile && <Text className="ml-2 text-sm"><Trans>Dark</Trans></Text>}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Next button - only show on desktop */}
        {!isMobile && (
          <TouchableOpacity
            onPress={nextTheme}
            disabled={mode === "system"}
            className={`px-3 py-2 ${mode === "system" ? "opacity-50" : "active:bg-base-200/50"}`}
            accessibilityRole="button"
            accessibilityLabel="Next theme"
          >
            <Text className="text-base text-base-content">›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Theme name and navigation - only show on mobile */}
      {isMobile && (
        <View className="mt-2 flex-row items-center justify-between w-full px-2">
          <Text className="text-sm text-base-content/80">
            <LabelComponent /> · {theme}
          </Text>
          <View className="flex-row">
            <TouchableOpacity 
              onPress={prevTheme}
              disabled={mode === "system"}
              className={`p-2 ${mode === "system" ? "opacity-50" : "active:opacity-70"}`}
              accessibilityRole="button"
              accessibilityLabel="Previous theme"
            >
              <Text className="text-base-content">‹</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={nextTheme}
              disabled={mode === "system"}
              className={`p-2 ${mode === "system" ? "opacity-50" : "active:opacity-70"}`}
              accessibilityRole="button"
              accessibilityLabel="Next theme"
            >
              <Text className="text-base-content">›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
