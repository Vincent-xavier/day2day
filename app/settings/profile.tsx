import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BackButton, Button, Card, Field, Screen, ScreenHeader, styles } from '@/design-system';

type ProfileType = 'personal' | 'business' | 'both';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<ProfileType>('personal');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('day2day_profile').then((value) => {
      if (!value) return;
      try {
        const stored = JSON.parse(value) as { name?: string; profile?: ProfileType; imageUri?: string };
        setName(stored.name ?? '');
        if (stored.profile) setProfile(stored.profile);
        setImageUri(stored.imageUri);
      } catch {
        // Ignore malformed local profile data and keep the editable defaults.
      }
    });
  }, []);

  const saveProfile = async () => {
    try {
      await SecureStore.setItemAsync('day2day_profile', JSON.stringify({ name: name.trim(), profile, imageUri }));
      setSaved(true);
    } catch {
      Alert.alert('Could not save your profile', 'Please try again in a moment.');
    }
  };

  const selectProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access is needed', 'Allow photo access to choose a profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setSaved(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 24 }}>
        <BackButton onPress={() => router.back()} label="Settings" />
        <ScreenHeader eyebrow="SETTINGS" title="Profile" subtitle="Personalize how Day2Day supports you. This information stays on your device." />

        <Card>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            {imageUri ? (
              <Image accessibilityLabel="Selected profile photo" source={{ uri: imageUri }} style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 12 }} />
            ) : (
              <View style={[styles.accountAvatar, { width: 96, height: 96, borderRadius: 48, marginBottom: 12 }]}>
                <Text style={[styles.accountAvatarText, { fontSize: 36 }]}>{name.trim().slice(0, 1).toUpperCase() || '•'}</Text>
              </View>
            )}
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={imageUri ? 'Change profile photo' : 'Add profile photo'} onPress={selectProfileImage}>
              <Text style={styles.linkText}>{imageUri ? 'Change photo' : 'Add photo'}</Text>
            </TouchableOpacity>
          </View>

          <Field
            label="Your name"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setSaved(false);
            }}
            placeholder="Your first name"
            autoCapitalize="words"
          />

          <Text style={styles.label}>How do you use Day2Day?</Text>
          <View style={styles.row}>
            {(['personal', 'business', 'both'] as const).map((item) => (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: profile === item }}
                key={item}
                style={[styles.choice, profile === item && styles.choiceActive]}
                onPress={() => {
                  setProfile(item);
                  setSaved(false);
                }}
              >
                <Text style={styles.choiceText}>{item === 'both' ? 'Both' : item[0].toUpperCase() + item.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Save changes" onPress={saveProfile} disabled={!name.trim()} />
          {saved ? <Text style={[styles.success, { marginTop: 14, textAlign: 'center' }]}>Profile updated</Text> : null}
        </Card>
      </ScrollView>
    </Screen>
  );
}
