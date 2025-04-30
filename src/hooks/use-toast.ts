
import Toast, { ToastShowParams } from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions extends Omit<ToastShowParams, 'type'> {
  // Additional options if needed in the future
}

/**
 * Custom hook to provide a simple interface for showing toast messages.
 * Uses react-native-toast-message library.
 *
 * @returns An object containing the `showToast` function.
 */
export function useToast() {
  /**
   * Shows a toast message.
   * @param type - The type of toast ('success', 'error', 'info').
   * @param text1 - The primary text (title).
   * @param text2 - The secondary text (description).
   * @param options - Additional options for the toast.
   */
  const showToast = (
    type: ToastType,
    text1: string,
    text2?: string,
    options?: ToastOptions
  ) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'bottom', // Default position
      visibilityTime: 3000, // Default duration
      ...options,
    });
  };

  return { showToast };
}
