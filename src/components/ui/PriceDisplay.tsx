import React from 'react';
import { Text, View } from 'react-native';
import { getFormattedAmounts } from '@/utils/currencyUtils';

interface PriceDisplayProps {
  amount: number | null;
  variant?: 'default' | 'large' | 'small';
  showFree?: boolean;
}

const sizeStyles = {
  default: {
    usd: 'text-base',
    cop: 'text-sm',
  },
  large: {
    usd: 'text-xl font-bold',
    cop: 'text-base',
  },
  small: {
    usd: 'text-sm',
    cop: 'text-xs',
  },
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  variant = 'default',
  showFree = true,
}) => {
  if (amount === null || amount === undefined) {
    return showFree ? (
      <Text className="text-primary font-medium">Gratis</Text>
    ) : null;
  }

  const { usd, cop } = getFormattedAmounts(amount);
  const styles = sizeStyles[variant];

  return (
    <View className="flex-col items-baseline gap-2">
      <Text className={`text-base-content ${styles.usd} font-medium`}>
        USD {usd}
      </Text>
      <Text className={`text-base-content/70 ${styles.cop}`}>
        COP ({cop})
      </Text>
    </View>
  );
};

export default PriceDisplay;
