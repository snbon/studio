
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed

// Import Screens
import HomeScreen from '../screens/HomeScreen'; // Adjust path as needed
import SignInScreen from '../screens/SignInScreen'; // Adjust path as needed
import SignUpScreen from '../screens/SignUpScreen'; // Adjust path as needed
import NewItineraryScreen from '../screens/NewItineraryScreen'; // Adjust path as needed
import SavedItinerariesScreen from '../screens/SavedItinerariesScreen'; // Adjust path as needed
import ItineraryDetailScreen from '../screens/ItineraryDetailScreen'; // Adjust path as needed

import Colors from '../constants/Colors'; // Adjust path as needed
import { Itinerary, FetchedItinerary } from '../types/itinerary'; // Adjust path as needed

// Define Param List for type safety
export type RootStackParamList = {
  Home: undefined;
  SignIn: undefined;
  SignUp: undefined;
  NewItinerary: undefined;
  SavedItineraries: undefined;
  ItineraryDetail: { itineraryId: string }; // Pass itinerary ID as param
  // Add other screens here
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  // Don't render navigator until auth state is determined
  if (loading) {
    // AuthProvider already shows a loading indicator, so return null or a minimal placeholder
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background, // Use theme background
        },
        headerTintColor: Colors.primary, // Color for back button and title
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false, // Hide text next to back button on iOS
      }}
    >
      {user ? (
        // Screens accessible when logged in
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'WanderWise Home' }}
          />
          <Stack.Screen
            name="NewItinerary"
            component={NewItineraryScreen}
            options={{ title: 'Create New Itinerary' }}
          />
          <Stack.Screen
            name="SavedItineraries"
            component={SavedItinerariesScreen}
            options={{ title: 'My Saved Trips' }}
          />
          <Stack.Screen
            name="ItineraryDetail"
            component={ItineraryDetailScreen}
            options={({ route }) => ({
                title: 'Itinerary Details', // Title can be dynamic based on route.params if needed
                // Consider adding an edit button here later:
                // headerRight: () => (
                //   <Button onPress={() => alert('Edit pressed!')} title="Edit" color={Colors.primary} />
                // ),
             })}
          />
        </>
      ) : (
        // Auth screens
        <>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: 'Sign In', headerShown: false }} // Hide header for initial auth screen
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: 'Sign Up' }}
          />
           {/* Redirect unauthenticated users trying to access protected routes */}
           {/* React Navigation handles initial route, but deep linking might need checks */}
           <Stack.Screen
            name="Home" // Define Home here too, but it won't be reachable if user is null
            component={SignInScreen} // Redirect to SignIn
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="NewItinerary"
             component={SignInScreen} // Redirect to SignIn
            options={{ headerShown: false }}
          />
           <Stack.Screen
            name="SavedItineraries"
            component={SignInScreen} // Redirect to SignIn
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ItineraryDetail"
            component={SignInScreen} // Redirect to SignIn
             options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
