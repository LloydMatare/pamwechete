import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../convex/_generated/api';

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

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
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
    if (!title || !category || !condition) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const storageIds = [];

      for (const imageUri of images) {
        // 1. Get upload URL
        const postUrl = await generateUploadUrl();

        // 2. Upload image
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type },
          body: blob,
        });

        const { storageId } = await result.json();
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
          city: "Harare", // This should be fetched from user profile or geo
          coordinates: { lat: -17.8252, lng: 31.0335 }, // Default for now
          displayPrecise: false,
        }
      });

      Alert.alert('Success', 'Item listed successfully!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to list item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">List an Item</Text>

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
                <Text className="text-white text-xs font-bold">X</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              onPress={pickImage}
              className="w-24 h-24 bg-gray-100 rounded-lg items-center justify-center border-2 border-dashed border-gray-300"
            >
              <Text className="text-gray-400 text-3xl">+</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Details */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">Title *</Text>
      <TextInput
        className="border border-gray-200 rounded-lg p-3 mb-4"
        placeholder="What are you trading?"
        value={title}
        onChangeText={setTitle}
      />

      <Text className="text-sm font-semibold text-gray-700 mb-2">Category *</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-black border-black' : 'border-gray-200'}`}
          >
            <Text className={category === cat ? 'text-white' : 'text-black'}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-semibold text-gray-700 mb-2">Condition *</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {CONDITIONS.map((cond) => (
          <TouchableOpacity
            key={cond}
            onPress={() => setCondition(cond)}
            className={`px-4 py-2 rounded-full border ${condition === cond ? 'bg-black border-black' : 'border-gray-200'}`}
          >
            <Text className={condition === cond ? 'text-white' : 'text-black'}>{cond}</Text>
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

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`bg-black p-4 rounded-xl items-center mb-10 ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">List Item</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
