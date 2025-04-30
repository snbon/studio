
/**
 * Formats a Date object or Firestore Timestamp into a readable date string.
 * @param dateInput - The Date object or Timestamp.
 * @returns A formatted date string (e.g., "MM/DD/YYYY") or 'N/A' if input is invalid.
 */
export const formatDate = (dateInput: Date | undefined | null): string => {
  if (!dateInput || !(dateInput instanceof Date)) {
    return 'N/A';
  }
  // You can customize the format as needed using options or libraries like date-fns
  return dateInput.toLocaleDateString(undefined, { // Use locale default
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
  });
};

// Add other formatting functions as needed
