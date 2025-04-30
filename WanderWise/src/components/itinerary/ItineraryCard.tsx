
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Or use another icon set like Feather
import { Itinerary, FetchedItinerary } from '../../types/itinerary'; // Adjust path as needed
import Colors from '../../constants/Colors'; // Adjust path as needed
import { formatDate } from '../../utils/formatters'; // Adjust path as needed

interface ItineraryCardProps {
  itinerary: FetchedItinerary; // Use FetchedItinerary with Date objects
  onPress: () => void;
  onDelete: () => void; // Callback for delete action
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary, onPress, onDelete }) => {

  const confirmDelete = () => {
    Alert.alert(
      "Delete Itinerary",
      `Are you sure you want to delete "${itinerary.title || 'this trip'}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: onDelete,
          style: "destructive"
        }
      ]
    );
  };


  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
         <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{itinerary.title || "Untitled Trip"}</Text>
          <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
             <Icon name="trash-can-outline" size={22} color={Colors.destructive} />
          </TouchableOpacity>
      </View>

      <View style={styles.detailRow}>
        <Icon name="map-marker-outline" size={16} color={Colors.textMuted} style={styles.icon} />
        <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{itinerary.destination}</Text>
      </View>
       <View style={styles.detailRow}>
        <Icon name="calendar-range" size={16} color={Colors.textMuted} style={styles.icon} />
        <Text style={styles.detailText}>{itinerary.travelDates} ({itinerary.tripLength} days)</Text>
      </View>
       <View style={styles.detailRow}>
        <Icon name="account-group-outline" size={16} color={Colors.textMuted} style={styles.icon} />
        <Text style={styles.detailText}>{itinerary.groupSize} ({itinerary.groupType})</Text>
      </View>
        <View style={[styles.detailRow, styles.lastDetailRow]}>
         <Icon name="format-list-bulleted" size={16} color={Colors.textMuted} style={styles.icon} />
         <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
             Activities: {itinerary.activityPreferences}
         </Text>
      </View>

       <Text style={styles.createdDate}>Created: {formatDate(itinerary.createdAt)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1, // Allow title to take space but truncate
    marginRight: 10, // Space before delete icon
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lastDetailRow: {
      marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textMuted,
    flex: 1, // Allow text to wrap or truncate within the row
  },
  createdDate: {
      fontSize: 12,
      color: Colors.textMuted,
      textAlign: 'right',
      marginTop: 5,
  }
});

export default ItineraryCard;
