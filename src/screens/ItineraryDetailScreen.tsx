import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Share, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc, Timestamp, deleteDoc } from "firebase/firestore";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path
import { db, auth } from '../services/firebase'; // Adjust path
import { Itinerary, FetchedItinerary } from '../types/itinerary'; // Adjust path
import Colors from '../constants/Colors'; // Adjust path
import StyledButton from '../components/common/StyledButton'; // Adjust path
import { useToast } from '../hooks/use-toast'; // Adjust path
import { formatDate } from '../utils/formatters'; // Adjust path

type ItineraryDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ItineraryDetail'>;

const ItineraryDetailScreen: React.FC<ItineraryDetailScreenProps> = ({ route, navigation }) => {
  const { itineraryId } = route.params;
  const [itinerary, setItinerary] = useState<FetchedItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!currentUser) {
        showToast('error', 'Authentication Required', 'Please sign in.');
        navigation.navigate('SignIn');
        return;
      }
       if (!itineraryId) {
           showToast('error', 'Error', 'Itinerary ID not found.');
           navigation.goBack();
           return;
       }

      setIsLoading(true);
      try {
        const docRef = doc(db, "itineraries", itineraryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Itinerary; // Data from Firestore

          // Basic security check
          if (data.userId !== currentUser.uid) {
            showToast('error', 'Access Denied', 'You cannot view this itinerary.');
            navigation.navigate('SavedItineraries');
            return;
          }

          // Convert Firestore Timestamps to JS Date objects
          const fetchedData: FetchedItinerary = {
            ...data,
            id: docSnap.id,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          };
          setItinerary(fetchedData);

          // Update header title dynamically
          navigation.setOptions({ title: fetchedData.title || 'Itinerary Details' });

        } else {
          showToast('error', 'Not Found', 'This itinerary does not exist.');
          navigation.navigate('SavedItineraries');
        }
      } catch (error: any) {
        console.error("Error fetching itinerary:", error);
        showToast('error', 'Loading Error', 'Could not load itinerary details.');
        navigation.navigate('SavedItineraries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [itineraryId, currentUser, navigation, showToast]);

  const handleShare = async () => {
      if (!itinerary) return;
      try {
          const result = await Share.share({
              message: `Check out this trip: ${itinerary.title}\nDestination: ${itinerary.destination}`,
              // url: 'Optional URL if you have a web version', // Optional
              title: `WanderWise Trip: ${itinerary.title}`
          });
          if (result.action === Share.sharedAction) {
              if (result.activityType) {
              // Shared with activity type of result.activityType
              console.log('Shared via:', result.activityType);
              } else {
              // Shared
               console.log('Shared successfully');
              }
          } else if (result.action === Share.dismissedAction) {
              // Dismissed
              console.log('Share dismissed');
          }
      } catch (error: any) {
          showToast('error', 'Share Failed', error.message);
      }
  };

  const handleDelete = async () => {
     if (!itinerary || !currentUser || itinerary.userId !== currentUser.uid) {
         showToast('error', 'Cannot Delete', 'You do not have permission or data is missing.');
         return;
     }

     Alert.alert(
       "Confirm Deletion",
       `Are you sure you want to permanently delete "${itinerary.title}"?`,
       [
         { text: "Cancel", style: "cancel" },
         {
           text: "Delete",
           style: "destructive",
           onPress: async () => {
             setIsDeleting(true);
             try {
               await deleteDoc(doc(db, "itineraries", itineraryId));
               showToast('success', 'Itinerary Deleted', `"${itinerary.title}" was removed.`);
               navigation.navigate('SavedItineraries'); // Go back to the list
             } catch (error: any) {
               console.error("Error deleting itinerary:", error);
               showToast('error', 'Deletion Failed', 'Could not delete the itinerary.');
               setIsDeleting(false);
             }
             // No finally needed as we navigate away on success
           },
         },
       ]
     );
   };


  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Itinerary...</Text>
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Itinerary not found or access denied.</Text>
         <StyledButton title="Back to My Trips" onPress={() => navigation.navigate('SavedItineraries')} variant="outline" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
         {/* Title is now in the navigation header */}
         <View style={styles.metaRow}>
            <Icon name="map-marker-outline" size={16} color={Colors.textMuted} style={styles.icon} />
            <Text style={styles.metaText}>{itinerary.destination}</Text>
         </View>
         <View style={styles.metaRow}>
             <Icon name="calendar-range" size={16} color={Colors.textMuted} style={styles.icon} />
             <Text style={styles.metaText}>{itinerary.travelDates} ({itinerary.tripLength} days)</Text>
         </View>
         <View style={styles.metaRow}>
              <Icon name="account-group-outline" size={16} color={Colors.textMuted} style={styles.icon} />
              <Text style={styles.metaText}>{itinerary.groupSize} ({itinerary.groupType})</Text>
         </View>
         <Text style={styles.createdDate}>Created on {formatDate(itinerary.createdAt)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Detailed Itinerary</Text>
        <View style={styles.itineraryBox}>
            <Text style={styles.itineraryText}>{itinerary.itinerary}</Text>
        </View>
      </View>

       <View style={styles.footerButtons}>
           <StyledButton
             title="Share"
             onPress={handleShare}
             variant="secondary"
             iconLeft={<Icon name="share-variant-outline" size={18} color={Colors.text} style={styles.buttonIcon} />}
             style={styles.footerButton}
           />
           <StyledButton
             title={isDeleting ? "Deleting..." : "Delete"}
             onPress={handleDelete}
             variant="destructive"
             iconLeft={<Icon name="trash-can-outline" size={18} color={Colors.white} style={styles.buttonIcon} />}
             style={styles.footerButton}
             loading={isDeleting}
             disabled={isDeleting}
           />
       </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
     backgroundColor: Colors.background,
  },
  loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: Colors.textMuted,
  },
   errorText: {
      fontSize: 16,
      color: Colors.destructive,
      textAlign: 'center',
      marginBottom: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cardBackground, // Slightly different background for header section
  },
  metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  icon: {
      marginRight: 8,
  },
  metaText: {
      fontSize: 14,
      color: Colors.textMuted,
      flexShrink: 1, // Allow text to shrink if needed
  },
  createdDate: {
      fontSize: 12,
      color: Colors.textMuted,
      marginTop: 8,
      textAlign: 'right',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  itineraryBox: {
      backgroundColor: Colors.muted, // Muted background for the text
      padding: 15,
      borderRadius: 8,
  },
  itineraryText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22, // Improve readability
  },
   footerButtons: {
     flexDirection: 'row',
     justifyContent: 'space-around', // Space out buttons
     paddingVertical: 15,
     paddingHorizontal: 20,
     borderTopWidth: 1,
     borderTopColor: Colors.border,
     backgroundColor: Colors.cardBackground, // Match header bg
   },
   footerButton: {
     flex: 1, // Make buttons take equal space
     marginHorizontal: 10, // Add space between buttons
   },
    buttonIcon: {
     marginRight: 5, // Space between icon and text inside button
   },
});

export default ItineraryDetailScreen;
