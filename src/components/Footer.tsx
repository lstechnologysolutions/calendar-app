import { Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';

interface FooterProps {
  version: string;
}

export function Footer({ version }: FooterProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View 
      className="py-2 px-4 border-t border-gray-200 dark:border-gray-700"
      style={{
        backgroundColor: 'var(--b1)',
        alignItems: isMobile ? 'center' : 'flex-end',
        justifyContent: 'center',
      }}
    >
      <Text className="text-xs text-gray-500 dark:text-gray-400">
        All rights reserved LSTS © {new Date().getFullYear()} v{version}
      </Text>
    </View>
  );
}
