import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLingui } from "@lingui/react";
import { activateLocale } from "../i18n";

// Compact, segmented pill toggle for EN/ES styled like ThemeSwitcher
const LanguageSwitcher = () => {
  const { i18n } = useLingui();
  const current = (i18n as any)?.locale ?? "en";
  const [uiLocale, setUiLocale] = useState<"en" | "es">(current === "es" ? "es" : "en");

  const onToggle = async (target: "en" | "es") => {
    if (target !== uiLocale) {
      // Reflect UI immediately for a snappy toggle
      setUiLocale(target);
      // Activate i18n (async)
      await activateLocale(target);
      if (typeof window !== "undefined" && "localStorage" in window) {
        try {
          window.localStorage.setItem("locale", target);
        } catch {}
      }
    }
  };

  // Sync UI state with i18n.locale changes
  useEffect(() => {
    const desired: "en" | "es" = (current === "es" ? "es" : "en");
    setUiLocale(desired);
  }, [current]);

  // Also subscribe to Lingui i18n change events to reflect external changes
  useEffect(() => {
    const handler = () => {
      const loc = (i18n as any)?.locale === "es" ? "es" : "en";
      setUiLocale(loc);
    };
    try {
      (i18n as any)?.on?.("change", handler);
    } catch {}
    return () => {
      try {
        (i18n as any)?.off?.("change", handler);
      } catch {}
    };
  }, [i18n]);

  return (
    <View className="flex-row items-center">
      {/* Segmented pill like ThemeSwitcher */}
      <View className="flex-row items-center rounded-full overflow-hidden border border-base-300">
        <TouchableOpacity
          onPress={() => onToggle("en")}
          accessibilityRole="button"
          accessibilityLabel="Switch language to English"
          className={`px-3 py-1 ${uiLocale === "en" ? "bg-primary" : "bg-base-100"}`}
        >
          <Text className={`text-xs ${uiLocale === "en" ? "text-primary-content" : "text-base-content"}`}>EN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onToggle("es")}
          accessibilityRole="button"
          accessibilityLabel="Cambiar idioma a Español"
          className={`px-3 py-1 ${uiLocale === "es" ? "bg-primary" : "bg-base-100"}`}
        >
          <Text className={`text-xs ${uiLocale === "es" ? "text-primary-content" : "text-base-content"}`}>ES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LanguageSwitcher;