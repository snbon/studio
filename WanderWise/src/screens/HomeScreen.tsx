
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Or Feather, etc.

import StyledButton from '../components/common/StyledButton'; // Adjust path as needed
import Colors from '../constants/Colors'; // Adjust path as needed
import { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path as needed
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase'; // Adjust path as needed
import { useToast } from '../hooks/use-toast'; // Adjust path as needed

// Define props type for the screen
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

   const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('success', 'Signed Out', 'You have been successfully signed out.');
      // Navigator will automatically redirect to SignIn screen due to user state change
    } catch (error: any) {
      console.error("Sign out error:", error);
      showToast('error', 'Sign Out Error', error.message || 'Could not sign out.');
    }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Icon name="airplane" size={80} color={Colors.primary} style={styles.logo} />

      <Text style={styles.title}>Welcome to WanderWise</Text>
      <Text style={styles.subtitle}>
        Your personal AI travel assistant. Craft, save, and share your perfect trip itineraries.
      </Text>

       {user && (
            <Text style={styles.welcomeUser}>
                Signed in as: {user.email}
            </Text>
        )}

      <View style={styles.card}>
        <Icon name="plus-circle-outline" size={24} color={Colors.primary} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Create New Itinerary</Text>
        <Text style={styles.cardDescription}>
          Tell us your destination, dates, preferences, and let AI plan your adventure.
        </Text>
        <StyledButton
          title="Start Planning"
          onPress={() => navigation.navigate('NewItinerary')}
          style={styles.cardButton}
        />
      </View>

      <View style={styles.card}>
        <Icon name="format-list-bulleted" size={24} color={Colors.primary} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>View Saved Itineraries</Text>
        <Text style={styles.cardDescription}>
          Access and manage your previously created travel plans anytime.
        </Text>
        <StyledButton
          title="My Trips"
          onPress={() => navigation.navigate('SavedItineraries')}
          variant="outline"
          style={styles.cardButton}
        />
      </View>

       {user && (
         <StyledButton
            title="Sign Out"
            onPress={handleSignOut}
            variant="destructive"
            style={styles.signOutButton}
            iconLeft={<Icon name="logout" size={18} color={Colors.white} />}
         />
       )}

       {!user && (
            <StyledButton
                title="Sign In / Sign Up"
                onPress={() => navigation.navigate('SignIn')}
                style={styles.signOutButton} // Reuse style or create a specific one
            />
       )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
   contentContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logo: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: '90%',
  },
   welcomeUser: {
     fontSize: 14,
     color: Colors.textMuted,
     marginBottom: 20,
   },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
   cardIcon: {
     marginBottom: 10,
   },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 15,
  },
  cardButton: {
    width: '80%', // Make buttons slightly narrower than card
  },
   signOutButton: {
    marginTop: 20,
    width: '100%',
  },
});

export default HomeScreen;
