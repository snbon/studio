
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import StyledTextInput from '../common/StyledTextInput'; // Adjust path as needed
import StyledButton from '../common/StyledButton'; // Adjust path as needed
import Colors from '../../constants/Colors'; // Adjust path as needed
import { ItineraryInput } from '../../types/itinerary'; // Adjust path as needed
// Import a Picker component if needed for Group Type
// import { Picker } from '@react-native-picker/picker'; // Example, choose your preferred picker library

// Define Zod schema for validation
const formSchema = z.object({
  title: z.string().min(3, { message: "Trip Title must be at least 3 characters." }),
  destination: z.string().min(2, { message: "Destination must be at least 2 characters." }),
  travelDates: z.string().min(5, { message: "Provide travel dates (e.g., 'July 10-17, 2024')." }),
  groupSize: z.string() // Input will be string initially
    .min(1, { message: "Group size is required." })
    .regex(/^[1-9]\d*$/, { message: "Must be a positive number." })
    .transform(Number), // Transform to number after validation
  activityPreferences: z.string().min(10, { message: "Describe activities (min 10 characters)." }),
  groupType: z.enum(['family', 'friends', 'colleagues', 'solo', 'couple', 'other'], { required_error: "Select a group type." }),
  tripLength: z.string() // Input will be string initially
    .min(1, { message: "Trip length is required." })
    .regex(/^[1-9]\d*$/, { message: "Must be a positive number of days." })
    .transform(Number), // Transform to number after validation
});

// Infer the type from the schema
type FormData = z.infer<typeof formSchema>;

interface ItineraryFormProps {
  onSubmit: (data: ItineraryInput & { title: string }) => void; // Include title in submitted data
  isLoading?: boolean;
  initialData?: Partial<FormData>; // For potential editing feature
}

const groupTypeOptions = [
  { label: 'Family', value: 'family' },
  { label: 'Friends', value: 'friends' },
  { label: 'Colleagues', value: 'colleagues' },
  { label: 'Solo', value: 'solo' },
  { label: 'Couple', value: 'couple' },
  { label: 'Other', value: 'other' },
];


const ItineraryForm: React.FC<ItineraryFormProps> = ({ onSubmit, isLoading = false, initialData }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupSize: initialData?.groupSize?.toString() || '1',
      tripLength: initialData?.tripLength?.toString() || '1',
      groupType: initialData?.groupType || undefined, // Or set a default like 'solo' if appropriate
      title: initialData?.title || '',
      destination: initialData?.destination || '',
      travelDates: initialData?.travelDates || '',
      activityPreferences: initialData?.activityPreferences || '',
    },
  });

   const handleFormSubmit = (data: FormData) => {
      // The resolver already transformed groupSize and tripLength to numbers
      const submitData: ItineraryInput & { title: string } = {
        ...data,
      };
      onSubmit(submitData);
    };

  // Basic Picker Implementation (Replace with a styled picker component if desired)
  const renderGroupTypePicker = (field: any) => (
      <View style={styles.pickerContainer}>
        {/* Basic Text indicator - Replace with a proper Picker */}
        <Text style={styles.pickerText}>
           {field.value ? groupTypeOptions.find(opt => opt.value === field.value)?.label : 'Select Group Type...'}
        </Text>
        {/*
         <Picker
           selectedValue={field.value}
           onValueChange={field.onChange}
           style={styles.picker} // Style the picker itself
         >
           <Picker.Item label="Select Group Type..." value={undefined} />
           {groupTypeOptions.map(option => (
             <Picker.Item key={option.value} label={option.label} value={option.value} />
           ))}
         </Picker>
        */}
      </View>
  );


  return (
    <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledTextInput
              label="Trip Title *"
              placeholder="e.g., Paris Summer Adventure"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="destination"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledTextInput
              label="Destination *"
              placeholder="e.g., Paris, France"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.destination?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="travelDates"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledTextInput
              label="Travel Dates *"
              placeholder="e.g., July 10 - July 17, 2024"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.travelDates?.message}
            />
          )}
        />

       <View style={styles.row}>
            <Controller
              control={control}
              name="groupSize"
              render={({ field: { onChange, onBlur, value } }) => (
                <StyledTextInput
                  label="Group Size *"
                  placeholder="e.g., 2"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value?.toString()} // Ensure value is string for input
                  error={errors.groupSize?.message}
                  keyboardType="number-pad"
                  containerStyle={styles.flexInput}
                />
              )}
            />
            <Controller
              control={control}
              name="tripLength"
              render={({ field: { onChange, onBlur, value } }) => (
                 <StyledTextInput
                   label="Length (Days) *"
                   placeholder="e.g., 7"
                   onBlur={onBlur}
                   onChangeText={onChange}
                   value={value?.toString()} // Ensure value is string for input
                   error={errors.tripLength?.message}
                   keyboardType="number-pad"
                   containerStyle={styles.flexInput}
                 />
              )}
             />
       </View>


        {/* Group Type Picker */}
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>Group Type *</Text>
             <Controller
                control={control}
                name="groupType"
                // No `render` needed if using a library component that integrates well,
                // otherwise, use render to wrap the Picker component.
                // If using basic text indicator:
                 render={({ field }) => renderGroupTypePicker(field)}
            />
            {errors.groupType && <Text style={styles.errorText}>{errors.groupType.message}</Text>}
        </View>


        <Controller
          control={control}
          name="activityPreferences"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledTextInput
              label="Activity Preferences *"
              placeholder="e.g., Museums, local food, light hiking..."
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.activityPreferences?.message}
              multiline
              numberOfLines={4}
              inputStyle={styles.textArea} // Specific style for multiline
            />
          )}
        />

        <StyledButton
          title={isLoading ? "Generating..." : "Generate Itinerary"}
          onPress={handleSubmit(handleFormSubmit)}
          disabled={isLoading}
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
   scrollView: {
      flex: 1,
   },
  formContainer: {
    padding: 20,
    flex: 1,
  },
   row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Negative margin to counteract the default marginBottom of StyledTextInput
    marginBottom: -16,
  },
  flexInput: {
    flex: 1,
    marginHorizontal: 5, // Add some space between inputs in the row
  },
  inputWrapper: { // Wrapper for picker or other custom inputs
     marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    fontWeight: '500',
  },
  pickerContainer: { // Style for the picker wrapper (if using one)
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
     backgroundColor: Colors.inputBackground,
     paddingHorizontal: 12,
  },
  pickerText: { // Style for the text indicator if not using a real picker
      fontSize: 16,
      color: Colors.text,
  },
  picker: { // Style for the Picker component itself (if used)
     // height: 50, // Adjust as needed
     // width: '100%',
  },
  textArea: {
    minHeight: 100, // Make textarea taller
    textAlignVertical: 'top', // Align text to top in Android
    paddingTop: 10, // Adjust padding for multiline
  },
  submitButton: {
    marginTop: 20,
  },
   errorText: { // Copied from StyledTextInput for consistency
    fontSize: 12,
    color: Colors.destructive,
    marginTop: 4,
  },
});

export default ItineraryForm;
