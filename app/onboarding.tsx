import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConvex, useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import { api } from '../convex/_generated/api';
import { useAuthActions } from "@convex-dev/auth/react";
import CustomModal from '@/components/CustomModal';

// Step 1: Profile Details (Name, Email, City)
const ProfileRoute = ({ form, setForm, next }: any) => {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 p-6 bg-white">
      <Text className="text-2xl font-bold mb-2 text-black">Profile Details</Text>
      <Text className="text-gray-500 mb-8">Enter your details to get started</Text>

      <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">Full Name *</Text>
      <TextInput
        className="border-b border-gray-200 p-3 mb-6 text-lg"
        placeholder="e.g. John Doe"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />

      <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">Email Address</Text>
      <TextInput
        className="border-b border-gray-200 p-3 mb-6 text-lg"
        placeholder="e.g. john@example.com"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
      />

      <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">City/Town *</Text>
      <TextInput
        className="border-b border-gray-200 p-3 mb-10 text-lg"
        placeholder="e.g. Harare"
        value={form.city}
        onChangeText={(text) => setForm({ ...form, city: text })}
      />

      <TouchableOpacity
        onPress={next}
        className="bg-primary p-5 rounded-2xl items-center shadow-lg shadow-primary/30"
      >
        <Text className="text-white font-bold text-lg">Next: Security</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/auth/login')}
        className="mt-6 py-2 items-center"
      >
        <Text className="text-gray-500 text-base">
          Already have an account? <Text className="text-primary font-bold">Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Step 2: Security (Password)
const SecurityRoute = ({ form, setForm, next, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword }: any) => {
  const passwordsMatch = form.password === form.confirmPassword;
  const showMismatch = form.confirmPassword.length > 0 && !passwordsMatch;

  return (
    <ScrollView className="flex-1 p-6 bg-white">
      <Text className="text-2xl font-bold mb-2 text-black">Security</Text>
      <Text className="text-gray-500 mb-8">Create a password for your account</Text>

      <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">Password</Text>
      <View className="flex-row items-center border-b border-gray-200 mb-4">
        <TextInput
          className="flex-1 p-3 text-lg text-black"
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-3">
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#ABB3BB" />
        </TouchableOpacity>
      </View>

      <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">Confirm Password</Text>
      <View className="flex-row items-center border-b border-gray-200 mb-2">
        <TextInput
          className="flex-1 p-3 text-lg text-black"
          placeholder="••••••••"
          secureTextEntry={!showConfirmPassword}
          value={form.confirmPassword}
          onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-3">
          <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#ABB3BB" />
        </TouchableOpacity>
      </View>

      {showMismatch && (
        <View className="flex-row items-center mb-6">
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text className="text-red-500 text-sm ml-1">Passwords do not match</Text>
        </View>
      )}

      {!showMismatch && form.password.length > 0 && form.confirmPassword.length > 0 && (
        <View className="flex-row items-center mb-6">
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          <Text className="text-green-500 text-sm ml-1">Passwords match</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={passwordsMatch && form.password.length > 0 ? next : undefined}
        disabled={!passwordsMatch || form.password.length === 0}
        className={`p-5 rounded-2xl items-center shadow-lg ${passwordsMatch && form.password.length > 0 ? 'bg-primary shadow-primary/30' : 'bg-gray-200'}`}
      >
        <Text className={`font-bold text-lg ${passwordsMatch && form.password.length > 0 ? 'text-white' : 'text-gray-400'}`}>Next: Verification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Step 3: Verification (National ID)
const VerificationRoute = ({ form, setForm, next }: any) => {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm({ ...form, idImage: result.assets[0].uri });
    }
  };

  return (
    <ScrollView className="flex-1 p-6 bg-white">
      <Text className="text-2xl font-bold mb-2 text-black">Identity Verification</Text>
      <Text className="text-gray-500 mb-8">Please upload a clear picture of your National ID</Text>

      <TouchableOpacity
        onPress={pickImage}
        className="w-full h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center mb-10 overflow-hidden"
      >
        {form.idImage ? (
          <Image source={{ uri: form.idImage }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="items-center">
            <Ionicons name="camera-outline" size={48} color="#ABB3BB" />
            <Text className="text-gray-400 font-semibold mt-2">Tap to upload ID photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={next}
        className="bg-primary p-5 rounded-2xl items-center shadow-lg shadow-primary/30"
      >
        <Text className="text-white font-bold text-lg">Next: Trading Goals</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Step 4: Goals
const GoalsRoute = ({ form, setForm, finish, loading }: any) => {
  return (
    <ScrollView className="flex-1 p-6 bg-white">
      <Text className="text-2xl font-bold mb-2 text-black">Trading Goals</Text>
      <Text className="text-gray-500 mb-8">What are you looking to trade?</Text>

      <Text className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-widest">Preferred Language</Text>
      <View className="flex-row flex-wrap gap-2 mb-8">
        {['English', 'Shona', 'Ndebele'].map((lang) => (
          <TouchableOpacity
            key={lang}
            onPress={() => setForm({ ...form, language: lang })}
            className={`px-6 py-3 rounded-2xl border ${form.language === lang ? 'bg-primary border-primary' : 'bg-gray-100 border-transparent'}`}
          >
            <Text className={`font-semibold ${form.language === lang ? 'text-white' : 'text-gray-700'}`}>{lang}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">What are you looking for?</Text>
      <TextInput
        className="border border-gray-100 bg-gray-50 rounded-2xl p-4 mb-10 h-32"
        placeholder="e.g. Solar panels, Fertilizer..."
        placeholderTextColor="#ABB3BB"
        multiline
        textAlignVertical="top"
        value={form.goals}
        onChangeText={(text) => setForm({ ...form, goals: text })}
      />

      <TouchableOpacity
        onPress={finish}
        disabled={loading}
        className={`bg-primary p-5 rounded-2xl items-center shadow-lg shadow-primary/30 ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg text-center">Complete Onboarding</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default function OnboardingScreen() {
  const layout = useWindowDimensions();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthActions();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');

  const [form, setForm] = useState({
    name: '',
    email: '',
    city: '',
    password: '',
    confirmPassword: '',
    idImage: '',
    language: 'English',
    goals: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [routes] = useState([
    { key: 'profile', title: '1. Profile' },
    { key: 'security', title: '2. Security' },
    { key: 'verify', title: '3. Verify' },
    { key: 'goals', title: '4. Goals' },
  ]);

  const convex = useConvex();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFinish = async () => {
    if (!form.name || !form.email || !form.password || !form.city) {
      setModalTitle('Missing Details');
      setModalMessage('Please fill in all required fields (Name, Email, Password, and City).');
      setModalType('error');
      setModalVisible(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setModalTitle('Passwords Do Not Match');
      setModalMessage('Please make sure both passwords match.');
      setModalType('error');
      setModalVisible(true);
      return;
    }

    const existingUser = await convex.query(api.users.getByEmail, { email: form.email });
    if (existingUser) {
      setModalTitle('Email Already Registered');
      setModalMessage('An account with this email already exists. Please use a different email or log in.');
      setModalType('error');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      // 1. Upload ID Image if provided
      let storageId = undefined;
      if (form.idImage) {
        const postUrl = await generateUploadUrl();
        const response = await fetch(form.idImage);
        const blob = await response.blob();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type },
          body: blob,
        });
        const data = await result.json();
        storageId = data.storageId;
      }

      // 2. Sign up with Profile Data (Atomically)
      await signIn("password", { 
        email: form.email, 
        password: form.password, 
        flow: "signUp",
        name: form.name,
        city: form.city,
        province: "Harare",
        lat: -17.8252,
        lng: 31.0335,
        nationalIdImage: storageId,
      });

      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error(error);
      const message = error?.message || '';
      if (message.includes('already exists')) {
        setModalTitle('Email Already Registered');
        setModalMessage('An account with this email already exists. Please use a different email or log in.');
      } else {
        setModalTitle('Registration Failed');
        setModalMessage('Could not complete registration. Please try again.');
      }
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'profile':
        return <ProfileRoute form={form} setForm={setForm} next={() => setIndex(1)} />;
      case 'security':
        return (
          <SecurityRoute
            form={form}
            setForm={setForm}
            next={() => setIndex(2)}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />
        );
      case 'verify':
        return <VerificationRoute form={form} setForm={setForm} next={() => setIndex(3)} />;
      case 'goals':
        return <GoalsRoute form={form} setForm={setForm} finish={handleFinish} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View className="pt-16 pb-2 px-6 bg-white flex-row justify-between items-end">
        <View className="flex-row items-center">
          <Image 
            source={require('../assets/images/icon.png')} 
            className="w-12 h-12 mr-3 rounded-xl"
            resizeMode="contain"
          />
          <View>
            <Text className="text-3xl font-bold text-black tracking-tight">Pamwechete</Text>
            <Text className="text-gray-400 text-base">Trade anything, anytime.</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          className="bg-gray-100 px-4 py-2 rounded-xl"
        >
          <Text className="text-primary font-bold">Log in</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={props => (
            <TabBar
              {...props}
              scrollEnabled
              indicatorStyle={{ backgroundColor: '#FF4C29', height: 3, borderRadius: 3 }}
              style={{ backgroundColor: 'white', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#F2F3F2' }}
              activeColor="#FF4C29"
              inactiveColor="#ABB3BB"
              tabStyle={{ width: 120 }}
            />
          )}
        />
      </View>
      <CustomModal 
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
