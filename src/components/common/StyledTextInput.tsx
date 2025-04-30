
import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Colors from '../../constants/Colors'; // Adjust path as needed

interface StyledTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const StyledTextInput: React.FC<StyledTextInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  style, // Capture the style prop passed to TextInput itself
  ...rest
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error ? styles.inputContainerError : null,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, inputStyle, style]} // Apply passed style here
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // Default spacing
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground, // Slightly different background
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5, // Slightly thicker border on focus
     // Optional: Add a subtle shadow on focus
     shadowColor: Colors.primary,
     shadowOffset: { width: 0, height: 0 },
     shadowOpacity: 0.2,
     shadowRadius: 3,
     elevation: 3,
  },
  inputContainerError: {
    borderColor: Colors.destructive,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 10, // Adjust vertical padding inside input
  },
  iconContainer: {
    marginHorizontal: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.destructive,
    marginTop: 4,
  },
});

export default StyledTextInput;
