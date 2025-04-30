import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, Timestamp } from "firebase/firestore";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path
import { db, auth } from '../services/firebase'; // Adjust path
import { Itinerary, FetchedItinerary } from '../types/itinerary'; // Adjust path
import Colors from '../constants/Colors'; // Adjust path
import StyledButton from '../components/common/StyledButton'; // Adjust path
import ItineraryCard from '../components/itinerary/ItineraryCard'; // Adjust path
import { useToast } from '../hooks/use-toast'; // Adjust path
import { useFocusEffect } from '@react-navigation/native'; // To refresh data on screen focus

// Define props type for the screen
type SavedItinerariesScreenProps = NativeStackScreenProps<RootStackParamList, 'SavedItineraries'>;

const SavedItinerariesScreen: React.FC<SavedItinerariesScreenProps> = ({ navigation }) => {
  const [itineraries, setItineraries] = useState<FetchedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which item is being deleted
  const { showToast } = useToast();
  const currentUser = auth.currentUser;

  const fetchItineraries = useCallback(async () => {
    if (!currentUser) {
      showToast('error', 'Authentication Required');
      navigation.navigate('SignIn');
      return;
    }
    console.log("Fetching itineraries for user:", currentUser.uid); // Debug log

    // Don't set loading to true if just refreshing
    if (!isRefreshing) setIsLoading(true);

    try {
      const q = query(
        collection(db, "itineraries"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedItineraries: FetchedItinerary[] = [];
      querySnapshot.forEach((doc) => {
          const data = doc.data() as Itinerary;
           // Convert Timestamps
           fetchedItineraries.push({
             ...data,
             id: doc.id,
             createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(), // Handle potential missing timestamp
             updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
           });
      });
      setItineraries(fetchedItineraries);
       console.log(`Fetched ${fetchedItineraries.length} itineraries.`); // Debug log
    } catch (error: any) {
      console.error("Error fetching itineraries:", error);
      showToast('error', 'Fetch Error', 'Could not load your saved trips.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUser, navigation, showToast, isRefreshing]); // isRefreshing added to dependencies

  // Fetch data when the screen comes into focus
   useFocusEffect(
     useCallback(() => {
       fetchItineraries();
     }, [fetchItineraries])
   );

  const onRefresh = useCallback(() => {
    console.log("Refreshing itineraries...");
    setIsRefreshing(true);
    // fetchItineraries will be called due to state change triggering useEffect/useFocusEffect
    // or call it directly if useFocusEffect isn't sufficient
     fetchItineraries();
  }, [fetchItineraries]);


   const handleDelete = async (itineraryId: string) => {
     // Prevent multiple delete attempts on the same item
     if (deletingId) return;

     setDeletingId(itineraryId); // Mark this item as being deleted
     try {
       await deleteDoc(doc(db, "itineraries", itineraryId));
       setItineraries((prev) => prev.filter((it) => it.id !== itineraryId));
       showToast('success', 'Itinerary Deleted');
     } catch (error) {
       console.error("Error deleting itinerary:", error);
       showToast('error', 'Deletion Failed', 'Could not delete the itinerary.');
     } finally {
         setDeletingId(null); // Reset deleting state
     }
   };

   const renderEmptyComponent = () => (
     <View style={styles.centered}>
       <Icon name="briefcase-off-outline" size={60} color={Colors.textMuted} style={styles.emptyIcon} />
       <Text style={styles.emptyText}>No Saved Trips Yet!</Text>
       <Text style={styles.emptySubText}>Start planning your next adventure.</Text>
       <StyledButton
         title="Create First Itinerary"
         onPress={() => navigation.navigate('NewItinerary')}
         style={styles.createButton}
       />
     </View>
   );


  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={Colors.primary} />
         <Text style={styles.loadingText}>Loading Your Trips...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
         {/* Optionally add a header button to create new */}
         {/* <View style={styles.headerActions}>
            <StyledButton title="Create New" onPress={() => navigation.navigate('NewItinerary')} size="small"/>
         </View> */}
         <FlatList
             data={itineraries}
             keyExtractor={(item) => item.id}
             renderItem={({ item }) => (
                 <ItineraryCard
                     itinerary={item}
                     onPress={() => navigation.navigate('ItineraryDetail', { itineraryId: item.id })}
                     onDelete={() => handleDelete(item.id)} // Pass delete handler
                 />
             )}
             contentContainerStyle={styles.listContent}
             ListEmptyComponent={renderEmptyComponent}
             refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={[Colors.primary]} // Android loading indicator color
                    tintColor={Colors.primary} // iOS loading indicator color
                />
            }
         />
    </View>
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
     marginTop: 50, // Adjust as needed so it's not stuck at the very top
  },
  loadingText: {
       marginTop: 10,
       fontSize: 16,
       color: Colors.textMuted,
   },
   emptyIcon: {
     marginBottom: 20,
   },
   emptyText: {
     fontSize: 18,
     fontWeight: 'bold',
     color: Colors.text,
     marginBottom: 10,
   },
   emptySubText: {
       fontSize: 14,
       color: Colors.textMuted,
       textAlign: 'center',
       marginBottom: 20,
   },
  listContent: {
     padding: 15,
     // If ListEmptyComponent is used, ensure padding doesn't break layout
     flexGrow: 1, // Ensures empty component can center if list is empty
  },
   createButton: {
     // Style for the button in the empty state
   },
    headerActions: { // Optional: If adding buttons above the list
        paddingHorizontal: 15,
        paddingTop: 10,
        alignItems: 'flex-end', // Or 'flex-start' or 'center'
    },
});

export default SavedItinerariesScreen;
