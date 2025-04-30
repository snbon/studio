
// Based on the style guidelines provided:
// - Primary color: Neutral white or light gray background.
// - Secondary color: Soft blue (#A0D2EB) for trust and calmness.
// - Accent: Teal (#008080) for interactive elements.

// We'll interpret "Primary" in the guidelines as the main interactive/branding color (Teal),
// "Secondary" as the specified soft blue, and use light gray/white for backgrounds.

const tintColorLight = '#008080'; // Teal (Accent in guidelines, used as Primary interactive color here)
const tintColorDark = '#ffffff'; // White for dark mode elements

export default {
  light: {
    text: '#1C1C1E', // Dark Gray for text
    background: '#F2F2F7', // Light Gray background (Primary in guidelines interpretation)
    cardBackground: '#FFFFFF', // White for cards/surfaces
    inputBackground: '#FFFFFF',
    tint: tintColorLight,
    primary: tintColorLight, // Teal
    secondary: '#A0D2EB', // Soft Blue
    accent: tintColorLight, // Teal as accent too
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    border: '#D1D1D6', // Light border color
    muted: '#E5E5EA', // Muted background elements
    textMuted: '#8E8E93', // Muted text color
    destructive: '#FF3B30', // Standard iOS destructive red
    white: '#FFFFFF',
  },
  dark: {
    // Define dark theme colors later if needed, mirroring the light theme structure
    text: '#FFFFFF',
    background: '#000000',
    cardBackground: '#1C1C1E',
    inputBackground: '#2C2C2E',
    tint: tintColorDark,
    primary: tintColorLight, // Keep Teal vibrant in dark mode? Or adjust?
    secondary: '#A0D2EB', // Soft Blue might need adjustment for contrast
    accent: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    border: '#3A3A3C',
    muted: '#2C2C2E',
    textMuted: '#8E8E93',
    destructive: '#FF453A', // Standard iOS dark destructive red
    white: '#FFFFFF',
  },
   // Add common colors directly for easier access
    primary: tintColorLight,
    secondary: '#A0D2EB',
    accent: tintColorLight,
    background: '#F2F2F7',
    cardBackground: '#FFFFFF',
    inputBackground: '#FFFFFF',
    text: '#1C1C1E',
    textMuted: '#8E8E93',
    border: '#D1D1D6',
    destructive: '#FF3B30',
    white: '#FFFFFF',
    black: '#000000',
};

// Function to get color based on current theme (optional helper)
// import { useColorScheme } from 'react-native';
// export function useThemeColor(
//   props: { light?: string; dark?: string },
//   colorName: keyof typeof Colors.light & keyof typeof Colors.dark
// ) {
//   const theme = useColorScheme() ?? 'light';
//   const colorFromProps = props[theme];

//   if (colorFromProps) {
//     return colorFromProps;
//   } else {
//     return Colors[theme][colorName];
//   }
// }
