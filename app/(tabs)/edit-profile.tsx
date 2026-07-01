import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import CustomModal from '@/components/CustomModal';

export default function EditProfileScreen() {
  const router = useRouter();
  const convex = useConvex();
  const user = useQuery(api.users.current);
  const editProfile = useMutation(api.users.editProfile);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');

  React.useEffect(() => {
    if (user) {
      setName(user.profile?.name || user.name || '');
      setEmail(user.profile?.email || user.email || '');
      setPhone(user.phone || '');
      setCity(user.location?.city || '');
    }
  }, [user]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF4C29" />
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setModalTitle('Name Required');
      setModalMessage('Please enter your name.');
      setModalType('error');
      setModalVisible(true);
      return;
    }

    if (email && email !== (user.profile?.email || user.email)) {
      const existing = await convex.query(api.users.getByEmail, { email });
      if (existing && existing._id !== user._id) {
        setModalTitle('Email Already In Use');
        setModalMessage('This email is already registered to another account.');
        setModalType('error');
        setModalVisible(true);
        return;
      }
    }

    setSaving(true);
    try {
      await editProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
      });

      setModalTitle('Profile Updated');
      setModalMessage('Your profile has been saved successfully.');
      setModalType('success');
      setModalVisible(true);
    } catch (error: any) {
      setModalTitle('Update Failed');
      setModalMessage(error.message || 'Could not update profile. Please try again.');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="pt-16 pb-8 px-6 bg-[#FF4C29]">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Edit Profile</Text>
        </View>
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white/30 overflow-hidden">
            {user.image || user.profile?.avatar ? (
              <Image source={{ uri: user.image || user.profile?.avatar }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={48} color="white" />
            )}
          </View>
          <TouchableOpacity className="mt-2 bg-white/20 px-4 py-1 rounded-full">
            <Text className="text-white text-sm font-semibold">Change Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 -mt-6">
        <View className="bg-white rounded-t-[40px] pt-10 min-h-[500px]">
          <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">Full Name</Text>
          <TextInput
            className="border-b border-gray-200 p-3 mb-6 text-lg text-black"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />

          <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">Email Address</Text>
          <TextInput
            className="border-b border-gray-200 p-3 mb-6 text-lg text-black"
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">Phone Number</Text>
          <TextInput
            className="border-b border-gray-200 p-3 mb-6 text-lg text-black"
            placeholder="+263 ..."
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">City/Town</Text>
          <TextInput
            className="border-b border-gray-200 p-3 mb-10 text-lg text-black"
            placeholder="e.g. Harare"
            value={city}
            onChangeText={setCity}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`bg-primary p-5 rounded-2xl items-center shadow-lg shadow-primary/30 ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 py-4 items-center"
          >
            <Text className="text-gray-500 text-base font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => {
          setModalVisible(false);
          if (modalType === 'success') router.back();
        }}
      />
    </ScrollView>
  );
}
