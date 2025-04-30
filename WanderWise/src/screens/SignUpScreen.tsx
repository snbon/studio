
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { auth, db } from '../services/firebase'; // Adjust path
import StyledTextInput from '../components/common/StyledTextInput'; // Adjust path
import StyledButton from '../components/common/StyledButton'; // Adjust path
import Colors from '../constants/Colors'; // Adjust path
import { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path
import { useToast } from '../hooks/use-toast'; // Adjust path
import LoadingOverlay from '../components/common/LoadingOverlay'; // Adjust path


// Define props type for the screen
type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

// Define Zod schema with password confirmation
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Path of the error
});

type FormData = z.infer<typeof formSchema>;

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Optional: Create a user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(), // Use server timestamp
        // Add any other initial user data here
      });

      showToast('success', 'Sign Up Successful', 'Your account has been created.');
      // AuthProvider and Navigator handle redirect
    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Try signing in.";
      } else if (error.code === 'auth/invalid-email') {
         errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      }
      showToast('error', 'Sign Up Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <LoadingOverlay visible={isLoading} message="Creating Account..." />
        <Icon name="account-plus-outline" size={60} color={Colors.primary} style={styles.logo} />
        <Text style={styles.title}>Create WanderWise Account</Text>
        <Text style={styles.subtitle}>Join us to start planning your trips.</Text>


        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledTextInput
              label="Email"
              placeholder="you@example.com"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledTextInput
              label="Password"
              placeholder="Minimum 6 characters"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="new-password" // Use new-password for sign up
            />
          )}
        />

         <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledTextInput
              label="Confirm Password"
              placeholder="••••••••"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword?.message}
              secureTextEntry
            />
          )}
        />


        <StyledButton
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          style={styles.signUpButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
     </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
   keyboardAvoidingView: {
      flex: 1,
    },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 30,
    backgroundColor: Colors.background,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
   subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 30,
  },
  signUpButton: {
    marginTop: 15,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default SignUpScreen;
