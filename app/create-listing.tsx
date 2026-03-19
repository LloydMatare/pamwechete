import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import CustomModal from '@/components/CustomModal';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CATEGORIES = ['Agriculture', 'Electronics', 'Clothing', 'Livestock', 'Home', 'Services'];

export default function CreateListingScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [wants, setWants] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createListing = useMutation(api.items.create);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!title || !category || !condition) {
      setModalTitle('Missing Fields');
      setModalMessage('Please fill in all required fields marked with *');
      setModalType('error');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const storageIds = [];

      for (const imageUri of images) {
        // 1. Get upload URL
        const postUrl = await generateUploadUrl();

        // 2. Upload image using native FileSystem.uploadAsync for maximum reliability
        const uploadResult = await FileSystem.uploadAsync(postUrl, imageUri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: 'image/jpeg',
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });

        if (uploadResult.status !== 200) {
          throw new Error(`Upload failed with status ${uploadResult.status}`);
        }

        const { storageId } = JSON.parse(uploadResult.body);
        storageIds.push(storageId);
      }

      // 3. Create Listing
      await createListing({
        title,
        description,
        category,
        condition,
        images: storageIds,
        estimatedValue: parseFloat(estimatedValue) || 0,
        wants: wants.split(',').map(s => s.trim()).filter(s => s.length > 0),
        location: {
          city: "Harare", 
          coordinates: { lat: -17.8252, lng: 31.0335 }, 
          displayPrecise: false,
        }
      });

      setModalTitle('Success');
      setModalMessage('Your item has been listed successfully!');
      setModalType('success');
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        router.back();
      }, 1500);
    } catch (error) {
      console.error(error);
      setModalTitle('Upload Error');
      setModalMessage('Failed to list item. Please check your network.');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-14 pb-4 px-6 flex-row items-center border-b border-gray-50">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">List an Item</Text>
        </View>

        <View className="p-6">
          {/* Image Picker */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Images (Max 5)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
              {images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white"
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  onPress={pickImage}
                  className="w-24 h-24 bg-gray-50 rounded-lg items-center justify-center border-2 border-dashed border-gray-200"
                >
                  <Ionicons name="add" size={32} color="#ABB3BB" />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Details */}
          <Text className="text-sm font-semibold text-gray-700 mb-2">Title *</Text>
          <TextInput
            className={`border rounded-lg p-3 mb-4 ${submitted && !title ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            placeholder="What are you trading?"
            value={title}
            onChangeText={setTitle}
          />

          <Text className="text-sm font-semibold text-gray-700 mb-2">Category * {submitted && !category && <Text className="text-red-500">(Required)</Text>}</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-black border-black' : (submitted && !category ? 'border-red-300 bg-red-50' : 'border-gray-200')}`}
              >
                <Text className={category === cat ? 'text-white' : (submitted && !category ? 'text-red-500' : 'text-black')}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold text-gray-700 mb-2">Condition * {submitted && !condition && <Text className="text-red-500">(Required)</Text>}</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {CONDITIONS.map((cond) => (
              <TouchableOpacity
                key={cond}
                onPress={() => setCondition(cond)}
                className={`px-4 py-2 rounded-full border ${condition === cond ? 'bg-black border-black' : (submitted && !condition ? 'border-red-300 bg-red-50' : 'border-gray-200')}`}
              >
                <Text className={condition === cond ? 'text-white' : (submitted && !condition ? 'text-red-500' : 'text-black')}>{cond}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-4 h-24"
            placeholder="Tell us about the item..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <Text className="text-sm font-semibold text-gray-700 mb-2">What do you want in exchange?</Text>
          <TextInput
            className="border border-gray-200 rounded-lg p-3 mb-6"
            placeholder="e.g. Maize, Solar components (comma separated)"
            value={wants}
            onChangeText={setWants}
          />

          <Text className="text-sm font-semibold text-gray-700 mb-2">Estimated Value (TP)</Text>
          <View className="flex-row items-center border border-gray-200 rounded-lg p-3 mb-8 bg-gray-50">
            <TextInput
              className="flex-1 text-lg font-semibold"
              placeholder="e.g. 150"
              keyboardType="numeric"
              value={estimatedValue}
              onChangeText={setEstimatedValue}
            />
            <Text className="text-gray-400 font-bold ml-2">TP</Text>
          </View>
          
          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-10 left-6 right-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-primary p-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold text-lg">List Item</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <CustomModal 
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
