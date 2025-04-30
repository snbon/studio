
import type { RootStackParamList } from './AppNavigator'; // Adjust path as needed

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
