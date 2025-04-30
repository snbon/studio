
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import Colors from '../../constants/Colors'; // Adjust path as needed

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  iconLeft,
  iconRight,
}) => {
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'destructive':
        return styles.destructiveButton;
      case 'outline':
        return styles.outlineButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyles = (): StyleProp<TextStyle> => {
     switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'destructive':
        return styles.destructiveText;
       case 'outline':
        return styles.outlineText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  }

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        getButtonStyles(),
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? Colors.white : Colors.primary} size="small" />
      ) : (
        <>
          {iconLeft && <>{iconLeft}</>}
          <Text style={[styles.textBase, getTextStyles(), textStyle]}>
            {title}
          </Text>
          {iconRight && <>{iconRight}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48, // Ensure a minimum touch target size
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000', // Basic shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // For Android shadow
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  destructiveButton: {
    backgroundColor: Colors.destructive,
     borderColor: Colors.destructive,
  },
   outlineButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8, // Space between icon and text
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.text, // Assuming default text color on secondary bg
  },
  destructiveText: {
    color: Colors.white,
  },
   outlineText: {
    color: Colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default StyledButton;
