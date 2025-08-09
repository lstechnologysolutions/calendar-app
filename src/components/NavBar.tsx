import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { Trans } from "@lingui/react/macro";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

// A clean, lightweight top bar matching the light card-like style
// - subtle shadow, rounded bottom corners
// - centered title (from current route if present)
// - actions on the right (language & theme)
// - optional back button when not on root
const NavBar: React.FC = () => {
  const router = useRouter();
  const segments = useSegments();
  const canGoBack = typeof (useRouter() as any)?.canGoBack === "function" ? (router as any).canGoBack() : true;
  const isRoot = !canGoBack;

  // Derive a simple title from the route; you can refine per-screen
  const title = <Trans>Book Your Appointment</Trans>;

  return (
    <View className="bg-base-100 px-4 pt-3 pb-3 shadow-sm border-b border-base-200 rounded-b-2xl">
      <View className="flex-row items-center justify-between">
        {/* Left: Back (if any) + Title */}
        <View className="flex-row items-center gap-3 flex-shrink">
          {!isRoot && (
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              className="px-2 py-1 rounded-lg bg-base-200 border border-base-300"
            >
              <Text className="text-sm text-base-content">←</Text>
            </Pressable>
          )}
          <Text className="text-lg font-semibold text-base-content">
            {title}
          </Text>
        </View>

        {/* Right: Actions (Language & Theme) */}
        <View className="flex-row items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </View>
      </View>
    </View>
  );
};

export default NavBar;
