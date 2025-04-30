
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path
import ItineraryForm from '../components/itinerary/ItineraryForm'; // Adjust path
import LoadingOverlay from '../components/common/LoadingOverlay'; // Adjust path
import { db, auth } from '../services/firebase'; // Adjust path
import { callGenerateItinerary } from '../services/aiService'; // Adjust path
import { ItineraryInput, NewItinerary } from '../types/itinerary'; // Adjust path
import { useToast } from '../hooks/use-toast'; // Adjust path
import Colors from '../constants/Colors'; // Adjust path
import StyledButton from '../components/common/StyledButton';

// Define props type for the screen
type NewItineraryScreenProps = NativeStackScreenProps<RootStackParamList, 'NewItinerary'>;

const NewItineraryScreen: React.FC<NewItineraryScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedItineraryContent, setGeneratedItineraryContent] = useState<string | null>(null);
  const [formDataUsed, setFormDataUsed] = useState<(ItineraryInput & { title: string }) | null>(null);
  const { showToast } = useToast();
  const currentUser = auth.currentUser;

  const handleGenerate = async (formData: ItineraryInput & { title: string }) => {
    if (!currentUser) {
      showToast('error', 'Authentication Required', 'Please sign in to generate itineraries.');
      navigation.navigate('SignIn');
      return;
    }

    setIsLoading(true);
    setGeneratedItineraryContent(null); // Clear previous result
    setFormDataUsed(formData); // Store data used for generation

    // Prepare input for the API call (excluding title if API doesn't need it)
    const apiInput: ItineraryInput = {
      destination: formData.destination,
      travelDates: formData.travelDates,
      groupSize: formData.groupSize,
      activityPreferences: formData.activityPreferences,
      groupType: formData.groupType,
      tripLength: formData.tripLength,
    };

    try {
      console.log("Calling AI with input:", apiInput);
      const result = await callGenerateItinerary(apiInput);
      console.log("AI Result:", result);

      if (result?.itinerary) {
        setGeneratedItineraryContent(result.itinerary);
        showToast('success', 'Itinerary Generated!', 'Review the itinerary below and save it.');
      } else {
        throw new Error("AI did not return a valid itinerary.");
      }
    } catch (error: any) {
      console.error("Error generating itinerary:", error);
       let errorMessage = 'Could not generate itinerary.';
      if (error.response) {
        // Axios error with response
        errorMessage += ` Server responded with status ${error.response.status}.`;
        console.error("Server response data:", error.response.data);
      } else if (error.request) {
        // Axios error, no response received
        errorMessage += ' No response received from the server. Is it running?';
      } else {
        // Other errors
         errorMessage += ` ${error.message || 'Unknown error'}`;
      }
      showToast('error', 'Generation Failed', errorMessage);
      setFormDataUsed(null); // Clear stored data on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
     if (!currentUser || !generatedItineraryContent || !formDataUsed) {
       showToast('error', 'Cannot Save', 'Missing data or user not logged in.');
       return;
     }
     setIsLoading(true);
     try {
       const newItineraryData: NewItinerary = {
          ...formDataUsed, // Includes title, destination, etc. from the form
          itinerary: generatedItineraryContent,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // summary: Optional - could call a summarize flow here or later
       };

       const docRef = await addDoc(collection(db, "itineraries"), newItineraryData);

       showToast('success', 'Itinerary Saved!', `"${formDataUsed.title}" saved successfully.`);
       navigation.replace('ItineraryDetail', { itineraryId: docRef.id }); // Go to the detail view of the newly saved trip
       // Reset state (though navigation replaces the screen)
       setGeneratedItineraryContent(null);
       setFormDataUsed(null);

     } catch (error: any) {
       console.error("Error saving itinerary:", error);
       showToast('error', 'Save Failed', error.message || 'Could not save itinerary.');
     } finally {
       setIsLoading(false);
     }
  };

  const handleGenerateNew = () => {
      // Simply reset the state to show the form again
      setGeneratedItineraryContent(null);
      setFormDataUsed(null);
       showToast('info', 'Form Cleared', 'Enter new trip details.');
  }


  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} message={generatedItineraryContent ? "Saving..." : "Generating..."} />

      {!generatedItineraryContent ? (
         <>
            <Text style={styles.headerText}>Enter Trip Details</Text>
             <ItineraryForm onSubmit={handleGenerate} isLoading={isLoading} />
         </>
      ) : (
        <ScrollView style={styles.resultsScrollView}>
            <Text style={styles.resultsHeader}>{formDataUsed?.title || "Generated Itinerary"}</Text>
             <Text style={styles.resultsMeta}>
                 For {formDataUsed?.destination}, {formDataUsed?.travelDates} ({formDataUsed?.tripLength} days, {formDataUsed?.groupSize} people, {formDataUsed?.groupType})
             </Text>
            <View style={styles.itineraryBox}>
                <Text style={styles.itineraryText}>{generatedItineraryContent}</Text>
            </View>
            <View style={styles.buttonContainer}>
                 <StyledButton
                    title="Generate New"
                    onPress={handleGenerateNew}
                    variant="outline"
                    style={styles.actionButton}
                    disabled={isLoading}
                  />
                <StyledButton
                    title="Save Itinerary"
                    onPress={handleSave}
                    style={styles.actionButton}
                    disabled={isLoading}
                    loading={isLoading} // Show loading only on the save button when saving
                 />
            </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
   headerText: {
     fontSize: 20,
     fontWeight: '600',
     color: Colors.text,
     paddingHorizontal: 20,
     paddingTop: 20,
      paddingBottom: 10,
     // textAlign: 'center',
   },
   resultsScrollView: {
     flex: 1,
     paddingHorizontal: 20,
     paddingTop: 20,
   },
   resultsHeader: {
     fontSize: 22,
     fontWeight: 'bold',
     color: Colors.text,
     marginBottom: 5,
     textAlign: 'center',
   },
   resultsMeta: {
       fontSize: 14,
       color: Colors.textMuted,
       marginBottom: 15,
       textAlign: 'center',
   },
    itineraryBox: {
      backgroundColor: Colors.muted,
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
    },
    itineraryText: {
      fontSize: 15,
      color: Colors.text,
      lineHeight: 22,
    },
   buttonContainer: {
     flexDirection: 'row',
     justifyContent: 'space-around',
     marginBottom: 30, // Space at the bottom
   },
   actionButton: {
     flex: 1, // Make buttons take equal width
     marginHorizontal: 10, // Add space between buttons
   },
});

export default NewItineraryScreen;
