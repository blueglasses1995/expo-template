import { Ionicons } from '@expo/vector-icons'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
// expo-live-photo may not be available in Expo Go
import type * as LivePhotoModule from 'expo-live-photo'
import * as Localization from 'expo-localization'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, useColorScheme } from 'react-native'
import {
  Button,
  Image,
  Paragraph,
  Separator,
  SizableText,
  Text,
  XStack,
  YStack,
} from 'tamagui'
import '../../lib/i18n'

export default function MediaTab() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { t, i18n } = useTranslation()

  const [pickedImage, setPickedImage] = useState<string | null>(null)
  const [manipulatedImage, setManipulatedImage] = useState<string | null>(null)
  const [manipulating, setManipulating] = useState(false)
  const [livePhotoAvailable, setLivePhotoAvailable] = useState<boolean | null>(null)
  const [localeInfo, setLocaleInfo] = useState<string>('')

  useEffect(() => {
    // Check Live Photo availability (dynamic import – not in Expo Go)
    import('expo-live-photo')
      .then((mod: typeof LivePhotoModule) => mod.isAvailableAsync())
      .then((available) => setLivePhotoAvailable(available))
      .catch(() => setLivePhotoAvailable(false))

    // Get locale info
    const locales = Localization.getLocales()
    const first = locales[0]
    if (first) {
      setLocaleInfo(
        `${first.languageCode}-${first.regionCode ?? '??'} (${first.languageTag})`
      )
    }
  }, [])

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setPickedImage(result.assets[0].uri)
      setManipulatedImage(null)
    }
  }

  const manipulateImage = async () => {
    if (!pickedImage) return
    setManipulating(true)
    try {
      const result = await ImageManipulator.manipulateAsync(
        pickedImage,
        [{ resize: { width: 300 } }, { rotate: 90 }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      )
      setManipulatedImage(result.uri)
    } finally {
      setManipulating(false)
    }
  }

  const toggleLanguage = () => {
    const next = i18n.language === 'ja' ? 'en' : 'ja'
    i18n.changeLanguage(next)
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 18,
        alignItems: 'center',
        paddingBottom: 120,
      }}
    >
      <YStack ai="center" gap="$2">
        <Ionicons name="images-outline" size={28} color="#C084FC" />
        <SizableText size="$6" color="$color">
          Media & i18n
        </SizableText>
        <Paragraph ta="center" color="$gray11">
          ImagePicker, ImageManipulator, LinearGradient, LivePhoto, Localization
        </Paragraph>
      </YStack>

      {/* Linear Gradient Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Linear Gradient
        </Text>
        <LinearGradient
          colors={
            isDark ? ['#1e1b4b', '#4c1d95', '#7c3aed'] : ['#c4b5fd', '#a78bfa', '#8b5cf6']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: '100%',
            height: 100,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text color="white" fontSize={16} fontWeight="600">
            expo-linear-gradient
          </Text>
        </LinearGradient>
      </YStack>

      <Separator />

      {/* Localization + i18n Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Localization + react-i18next
        </Text>
        <YStack gap="$1" bg="$gray3" p="$3" br="$3">
          <Text color="$gray11">Device locale: {localeInfo}</Text>
          <Text color="$gray11">Current language: {i18n.language}</Text>
          <Text color="$color" fontSize={16} mt="$2">
            {t('welcome')}
          </Text>
          <Text color="$color" fontSize={14}>
            {t('greeting', { name: 'Expo' })}
          </Text>
        </YStack>
        <Button onPress={toggleLanguage}>
          Switch to {i18n.language === 'ja' ? 'English' : '日本語'}
        </Button>
      </YStack>

      <Separator />

      {/* Image Picker + Manipulator Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          {t('imageDemo')} (Picker + Manipulator)
        </Text>
        <XStack gap="$2">
          <Button flex={1} onPress={pickImage}>
            {t('pickImage')}
          </Button>
          <Button
            flex={1}
            onPress={manipulateImage}
            disabled={!pickedImage || manipulating}
            variant="outlined"
          >
            {manipulating ? 'Processing…' : 'Rotate + Resize'}
          </Button>
        </XStack>
        {pickedImage && (
          <YStack gap="$2">
            <Text color="$gray11" fontSize={12}>
              Original:
            </Text>
            <Image
              source={{ uri: pickedImage }}
              width="100%"
              height={200}
              borderRadius={8}
              resizeMode="cover"
            />
          </YStack>
        )}
        {manipulatedImage && (
          <YStack gap="$2">
            <Text color="$gray11" fontSize={12}>
              Manipulated (rotated 90°, resized to 300px):
            </Text>
            <Image
              source={{ uri: manipulatedImage }}
              width="100%"
              height={200}
              borderRadius={8}
              resizeMode="contain"
            />
          </YStack>
        )}
      </YStack>

      <Separator />

      {/* Live Photo Demo */}
      <YStack gap="$2" w="100%" maw={420}>
        <Text fontSize={18} color="$color">
          Live Photo
        </Text>
        <YStack bg="$gray3" p="$3" br="$3">
          <Text color="$gray11">
            Available:{' '}
            {livePhotoAvailable === null
              ? 'checking…'
              : livePhotoAvailable
                ? 'yes'
                : 'no (iOS 17+ only)'}
          </Text>
          <Text color="$gray10" fontSize={12} mt="$1">
            expo-live-photo allows displaying and capturing Live Photos on supported iOS
            devices.
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
