import { DefaultTheme, DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform, Text, View, useWindowDimensions, StyleSheet, DimensionValue } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { I18nProvider, TransRenderProps } from "@lingui/react";
import { i18n } from "../src/i18n";
import { useThemeMode } from "../hooks/useThemeMode";
import NavBar from "../src/components/NavBar";
import { Footer } from "../src/components/Footer";
import packageJson from '../package.json';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Ensure NativeWind emits CSS classes on web so Tailwind/daisyUI CSS variables work.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const NW = require("nativewind");
  NW?.NativeWindStyleSheet?.setOutput?.({ default: "web" });
} catch { }

// Set initial data-theme before React paints (web) to avoid FOUC and ensure theming applies immediately
if (typeof document !== "undefined") {
  try {
    const savedMode = window.localStorage.getItem("themeMode");
    const savedTheme = window.localStorage.getItem("themeName");
    const root = document.documentElement;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const mode = savedMode === "light" || savedMode === "dark" ? savedMode : "system";
    root.setAttribute("data-theme-mode", mode);
    const effectiveLD = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
    const theme = savedTheme || "nord";
    root.setAttribute("data-theme", `${theme}-${effectiveLD}`);
  } catch { }
}
// i18n initialization is handled in src/i18n.ts (auto-detects & activates locale)

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { isDark } = useThemeMode();
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Standard breakpoint for tablets/desktop

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const DefaultComponent = (props: TransRenderProps) => {
    return <Text>{props.children}</Text>;
  };

  // Fluid container that adapts to screen size
  // Removed unused containerStyle

  return (
    <I18nProvider i18n={i18n}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <NavBar />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'var(--b1)' },
            }}
          />
          <Footer version={packageJson.version} />
        </SafeAreaView>
      </ThemeProvider>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'var(--b1)',
  }
});
