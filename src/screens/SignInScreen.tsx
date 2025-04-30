
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { auth } from '../services/firebase'; // Adjust path
import StyledTextInput from '../components/common/StyledTextInput'; // Adjust path
import StyledButton from '../components/common/StyledButton'; // Adjust path
import Colors from '../constants/Colors'; // Adjust path
import { RootStackParamList } from '../navigation/AppNavigator'; // Adjust path
import { useToast } from '../hooks/use-toast'; // Adjust path
import LoadingOverlay from '../components/common/LoadingOverlay'; // Adjust path

// Define props type for the screen
type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

// Define Zod schema for validation
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormData = z.infer<typeof formSchema>;

const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      showToast('success', 'Sign In Successful', 'Welcome back!');
      // AuthProvider and Navigator will handle redirect automatically
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "An unexpected error occurred.";
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
         errorMessage = "Invalid email or password.";
       } else if (error.code === 'auth/invalid-email') {
          errorMessage = "Invalid email format.";
       } else if (error.code === 'auth/too-many-requests') {
          errorMessage = "Too many attempts. Please try again later.";
       }
      showToast('error', 'Sign In Failed', errorMessage);
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
        <LoadingOverlay visible={isLoading} message="Signing In..." />
        <Icon name="airplane" size={60} color={Colors.primary} style={styles.logo} />
        <Text style={styles.title}>Sign In to WanderWise</Text>
        <Text style={styles.subtitle}>Access your saved trips and plan new ones.</Text>

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
              placeholder="••••••••"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="password"
            />
          )}
        />

        <StyledButton
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          style={styles.signInButton}
        />

         {/* Optional: Forgot Password */}
        {/* <TouchableOpacity onPress={() => { /* Handle forgot password * / }}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity> */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.linkText}>Sign Up</Text>
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
    flexGrow: 1, // Ensures content can scroll if needed
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
  signInButton: {
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

export default SignInScreen;
