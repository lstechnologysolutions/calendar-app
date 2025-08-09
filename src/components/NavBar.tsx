import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  Dimensions, 
  StyleSheet,
  TouchableOpacity,
  Modal
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

const MobileNavBar = () => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const canGoBack = typeof (useRouter() as any)?.canGoBack === "function" ? (router as any).canGoBack() : true;
  const isRoot = !canGoBack;
  const title = <Trans>Calendar Appointments</Trans>;

  const backButtonStyle = ({ pressed }: { pressed: boolean }) => ({
    opacity: pressed ? 0.7 : 1,
  });

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleThemeSelect = () => {
    setShowMenu(false);
  };

  return (
    <View className={mobileClasses.container}>
      <View className={mobileClasses.content}>
        <View className="flex-1 flex-row items-center">
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
        </View>
        
        <View className="relative">
          <Pressable
            onPress={toggleMenu}
            className="p-2 rounded-full active:bg-base-300/30"
            accessibilityLabel="Open menu"
          >
            <Text className="text-2xl text-base-content">☰</Text>
          </Pressable>

          <Modal
            visible={showMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
          >
            <TouchableOpacity
              className="flex-1 bg-black/50"
              activeOpacity={1}
              onPress={() => setShowMenu(false)}
            >
              <View className="absolute top-16 right-4 bg-base-100 rounded-lg shadow-lg p-4 w-48" style={styles.menuShadow}>
                <View className="flex-col space-y-3">
                  <LanguageSwitcher onSelect={handleThemeSelect} />
                  <View className="border-t border-base-300 my-1"></View>
                  <View onTouchStart={(e) => e.stopPropagation()}>
                    <ThemeSwitcher onSelect={handleThemeSelect} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
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
  const title = <Trans>Calendar Appointments</Trans>;

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
  container: 'w-full z-50 bg-[rgb(var(--b1))] border-b border-base-content/10',
  content: 'flex flex-row items-center justify-between w-full max-w-[1200px] mx-auto',
  backButton: 'px-3 py-1.5 rounded-lg bg-base-content/10 border border-base-content/10 active:opacity-70',
  title: 'font-semibold text-base-content flex-shrink text-lg',
  actions: 'flex flex-row items-center gap-3',
};

// Additional styles
const styles = StyleSheet.create({
  menuShadow: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

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
