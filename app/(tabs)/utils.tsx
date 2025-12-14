import { Ionicons } from '@expo/vector-icons'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { FlashList } from '@shopify/flash-list'
import * as TrackingTransparency from 'expo-tracking-transparency'
import { useCallback, useState } from 'react'
import { Platform, ScrollView, TextInput } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import MapView, { Marker } from 'react-native-maps'
import { Button, Paragraph, Separator, SizableText, Text, XStack, YStack } from 'tamagui'

// Sample data for FlashList
const SAMPLE_DATA = Array.from({ length: 100 }, (_, i) => ({
  id: i.toString(),
  title: `Item ${i + 1}`,
  subtitle: `This is the description for item ${i + 1}`,
}))

export default function UtilsTab() {
  // Tracking Transparency
  const [trackingStatus, setTrackingStatus] = useState<string>('not requested')

  // Segmented Control
  const [selectedIndex, setSelectedIndex] = useState(0)
  const segmentOptions = ['Option A', 'Option B', 'Option C']

  // FlashList visibility
  const [showFlashList, setShowFlashList] = useState(false)

  // Map region (Tokyo)
  const [region] = useState({
    latitude: 35.6762,
    longitude: 139.6503,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  })

  const requestTracking = useCallback(async () => {
    try {
      setTrackingStatus('requesting...')
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync()
      setTrackingStatus(status)
    } catch (error) {
      setTrackingStatus(`error: ${String(error)}`)
    }
  }, [])

  const checkTracking = useCallback(async () => {
    try {
      const status = await TrackingTransparency.getTrackingPermissionsAsync()
      setTrackingStatus(status.status)
    } catch (error) {
      setTrackingStatus(`error: ${String(error)}`)
    }
  }, [])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#000' }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          gap: 18,
          alignItems: 'center',
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack ai="center" gap="$2">
          <Ionicons name="build-outline" size={28} color="#FB923C" />
          <SizableText size="$6" color="$color">
            Utils (Various Tools)
          </SizableText>
          <Paragraph ta="center" color="$gray11">
            Tracking, Maps, FlashList, Keyboard, Segmented
          </Paragraph>
        </YStack>

        {/* Tracking Transparency Section */}
        <YStack gap="$2" w="100%" maw={420}>
          <Text fontSize={18} color="$color">
            🔒 Tracking Transparency (ATT)
          </Text>
          <XStack gap="$2">
            <Button flex={1} onPress={requestTracking}>
              Request
            </Button>
            <Button flex={1} variant="outlined" onPress={checkTracking}>
              Check Status
            </Button>
          </XStack>
          <Paragraph color="$gray11">Status: {trackingStatus}</Paragraph>
          <Paragraph color="$gray10" fontSize="$2">
            iOS 14.5+ requires ATT permission for ad tracking
          </Paragraph>
        </YStack>

        <Separator />

        {/* Segmented Control Section */}
        <YStack gap="$2" w="100%" maw={420}>
          <Text fontSize={18} color="$color">
            🔘 Segmented Control
          </Text>
          <SegmentedControl
            values={segmentOptions}
            selectedIndex={selectedIndex}
            onChange={(event) => {
              setSelectedIndex(event.nativeEvent.selectedSegmentIndex)
            }}
            style={{ width: '100%' }}
          />
          <Text color="$gray11" ta="center">
            Selected: {segmentOptions[selectedIndex]}
          </Text>
        </YStack>

        <Separator />

        {/* Keyboard Controller Section */}
        <YStack gap="$2" w="100%" maw={420}>
          <Text fontSize={18} color="$color">
            ⌨️ Keyboard Controller
          </Text>
          <Paragraph color="$gray10" fontSize="$2">
            This screen uses KeyboardAvoidingView from react-native-keyboard-controller
          </Paragraph>
          <TextInput
            placeholder="Type here to test keyboard..."
            style={{
              borderWidth: 1,
              borderColor: '#444',
              borderRadius: 8,
              padding: 12,
              color: '#fff',
              backgroundColor: '#222',
            }}
            placeholderTextColor="#666"
          />
        </YStack>

        <Separator />

        {/* Maps Section */}
        <YStack gap="$2" w="100%" maw={420}>
          <Text fontSize={18} color="$color">
            🗺️ Maps (Tokyo)
          </Text>
          <YStack h={200} w="100%" br="$4" overflow="hidden">
            <MapView
              style={{ flex: 1 }}
              initialRegion={region}
              showsUserLocation
              showsMyLocationButton
            >
              <Marker
                coordinate={{ latitude: 35.6762, longitude: 139.6503 }}
                title="Tokyo"
                description="Capital of Japan"
              />
              <Marker
                coordinate={{ latitude: 35.6586, longitude: 139.7454 }}
                title="Tokyo Tower"
                description="Famous landmark"
              />
            </MapView>
          </YStack>
          <Paragraph color="$gray10" fontSize="$2">
            Requires API key for production (Google Maps / Apple Maps)
          </Paragraph>
        </YStack>

        <Separator />

        {/* FlashList Section */}
        <YStack gap="$2" w="100%" maw={420}>
          <XStack jc="space-between" ai="center">
            <Text fontSize={18} color="$color">
              ⚡ FlashList (100 items)
            </Text>
            <Button size="$2" onPress={() => setShowFlashList(!showFlashList)}>
              {showFlashList ? 'Hide' : 'Show'}
            </Button>
          </XStack>
          {showFlashList && (
            <YStack h={300} w="100%" br="$4" overflow="hidden" bg="$gray2">
              <FlashList
                data={SAMPLE_DATA}
                renderItem={({ item }) => (
                  <YStack p="$3" borderBottomWidth={1} borderBottomColor="$gray5">
                    <Text color="$color" fontWeight="bold">
                      {item.title}
                    </Text>
                    <Text color="$gray11" fontSize="$2">
                      {item.subtitle}
                    </Text>
                  </YStack>
                )}
              />
            </YStack>
          )}
          <Paragraph color="$gray10" fontSize="$2">
            @shopify/flash-list for high-performance lists
          </Paragraph>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
