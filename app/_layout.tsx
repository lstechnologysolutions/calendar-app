import { DefaultTheme, DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform, Text, View } from "react-native";
import { I18nProvider, TransRenderProps } from "@lingui/react";
import { i18n } from "../src/i18n";
import LanguageSwitcher from "../src/components/LanguageSwitcher";
import ThemeSwitcher from "../src/components/ThemeSwitcher";
import { useThemeMode } from "../src/hooks/useThemeMode";
import NavBar from "../src/components/NavBar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Ensure NativeWind emits CSS classes on web so Tailwind/daisyUI CSS variables work.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const NW = require("nativewind");
  NW?.NativeWindStyleSheet?.setOutput?.({ default: "web" });
} catch {}

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
  } catch {}
}
// i18n initialization is handled in src/i18n.ts (auto-detects & activates locale)

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { isDark } = useThemeMode();

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

  return (
    <I18nProvider i18n={i18n} defaultComponent={DefaultComponent}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={({ route }) => ({
            header: () => <NavBar />,
            headerShown: !route.name.startsWith("tempobook"),
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            contentStyle: { backgroundColor: "transparent" },
          })}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: true,
              headerTitle: "",
            }}
          />
        </Stack>
        {/* Theme-aware status bar tint */}
        <StatusBar style={isDark ? "light" : "dark"} />
      </ThemeProvider>
    </I18nProvider>
  );
}
