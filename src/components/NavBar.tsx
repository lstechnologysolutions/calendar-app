import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  Dimensions, 
  StyleProp, 
  ViewStyle
} from "react-native";
import { useRouter } from "expo-router";
import { Trans } from "@lingui/react/macro";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

// Custom hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const { width } = Dimensions.get('window');
      setIsMobile(width < 768); // Common breakpoint for mobile devices
    };

    // Initial check
    checkIfMobile();

    // Add event listener for screen resize
    const subscription = Dimensions.addEventListener('change', checkIfMobile);

    // Clean up
    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  return isMobile;
};

interface NavBarProps {
  isMobile?: boolean;
}

// A clean, lightweight top bar matching the light card-like style
// - subtle shadow, rounded bottom corners
// - centered title (from current route if present)
// - actions on the right (language & theme)
// - optional back button when not on root
// - responsive design for mobile and desktop
// Mobile-specific NavBar component
const MobileNavBar = () => {
  const router = useRouter();
  const canGoBack = typeof (useRouter() as any)?.canGoBack === "function" ? (router as any).canGoBack() : true;
  const isRoot = !canGoBack;
  const title = <Trans>Book Your Appointment</Trans>;

  const backButtonStyle = ({ pressed }: { pressed: boolean }) => ({
    opacity: pressed ? 0.7 : 1,
  });

  return (
    <View className={mobileClasses.container}>
      <View className={mobileClasses.content}>
        {!isRoot && (
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={backButtonStyle}
            className={mobileClasses.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-base-content">←</Text>
          </Pressable>
        )}
        <Text className={mobileClasses.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <View className={mobileClasses.actions}>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </View>
      </View>
    </View>
  );
};

// Desktop NavBar component
const DesktopNavBar = () => {
  const router = useRouter();
  const canGoBack = typeof (useRouter() as any)?.canGoBack === "function" ? (router as any).canGoBack() : true;
  const isRoot = !canGoBack;
  const title = <Trans>Book Your Appointment</Trans>;

  const backButtonStyle = ({ pressed }: { pressed: boolean }) => ({
    opacity: pressed ? 0.7 : 1,
  });

  return (
    <View className={desktopClasses.container}>
      <View className={desktopClasses.content}>
        <View className={desktopClasses.leftSection}>
          {!isRoot && (
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              style={backButtonStyle}
              className={desktopClasses.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-base-content">←</Text>
            </Pressable>
          )}
          <Text className={desktopClasses.title}>
            {title}
          </Text>
        </View>
        <View className={desktopClasses.actions}>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </View>
      </View>
    </View>
  );
};

const NavBar: React.FC<NavBarProps> = () => {
  const isMobile = useIsMobile();
  
  return isMobile ? <MobileNavBar /> : <DesktopNavBar />;
};

// Shared base styles
// Base Tailwind classes for common styles
const baseClasses = {
  container: 'w-full z-10 bg-base-100 shadow-sm border-b border-base-content/10',
  content: 'flex flex-row items-center justify-between w-full max-w-[1200px] mx-auto',
  backButton: 'px-3 py-1.5 rounded-lg bg-base-content/10 border border-base-content/10 active:opacity-70',
  title: 'font-semibold text-base-content flex-shrink text-lg',
  actions: 'flex flex-row items-center gap-3',
};

// Mobile-specific classes
const mobileClasses = {
  ...baseClasses,
  container: `${baseClasses.container} px-4 py-3`,
  content: `${baseClasses.content} px-0`,
  title: `${baseClasses.title} text-base ml-2 flex-1 text-center`,
  actions: `${baseClasses.actions} gap-2`,
};

// Desktop-specific classes
const desktopClasses = {
  ...baseClasses,
  container: `${baseClasses.container} px-6 py-3`,
  content: `${baseClasses.content} px-0`,
  leftSection: 'flex flex-row items-center flex-1 gap-4',
  title: `${baseClasses.title} ml-2`,
  actions: `${baseClasses.actions} gap-4`,
};

export default NavBar;
