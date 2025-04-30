
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase"; // Adjust path as needed
// Optional: Use AsyncStorage for persistence if needed, though Firebase SDK handles basic session persistence.
// import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from "../constants/Colors"; // Adjust path as needed

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      console.log("Auth state changed, user:", currentUser?.uid);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show a loading indicator while Firebase Auth initializes
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading WanderWise...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background, // Use your theme background color
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textMuted, // Use a muted text color
  },
});
