import { Ionicons } from '@expo/vector-icons'
import { ExternalLink } from '@tamagui/lucide-icons'
import { ToastControl } from 'components/CurrentToast'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { Anchor, H2, Paragraph, SizableText, XStack, YStack } from 'tamagui'
import StorybookUIRoot from '../../storybook'

export default function TabOneScreen() {
  const spin = useSharedValue(0)

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [spin])

  const spinStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${spin.value * 360}deg`,
      },
    ],
  }))

  return (
    <YStack flex={1} items="center" gap="$8" px="$10" pt="$5" bg="$background">
      <XStack ai="center" gap="$2">
        <Ionicons name="rocket-outline" size={24} color="#5EEAD4" />
        <H2>Tamagui + Expo</H2>
      </XStack>

      <ToastControl />

      <Animated.View
        style={[
          {
            width: 96,
            height: 96,
            borderRadius: 24,
            backgroundColor: '#5EEAD4',
          },
          spinStyle,
        ]}
      />

      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=600&auto=format&fit=crop',
        }}
        style={{ width: 220, height: 140, borderRadius: 16 }}
        contentFit="cover"
        transition={400}
      />

      <YStack gap="$2" ai="center">
        <SizableText size="$4" color="$color">
          Expo Constants
        </SizableText>
        <SizableText size="$3" color="$gray11">
          appOwnership: {Constants.appOwnership ?? 'unknown'}
        </SizableText>
        <SizableText size="$3" color="$gray11">
          expoVersion: {Constants.expoVersion ?? 'n/a'}
        </SizableText>
      </YStack>

      <YStack gap="$2" ai="center">
        <SizableText size="$4" color="$color">
          Expo Device
        </SizableText>
        <SizableText size="$3" color="$gray11">
          model: {Device.modelName ?? 'unknown'}
        </SizableText>
        <SizableText size="$3" color="$gray11">
          os: {Device.osName ?? 'unknown'} {Device.osVersion ?? ''}
        </SizableText>
        <SizableText size="$3" color="$gray11">
          deviceType: {Device.deviceType ?? 'n/a'}
        </SizableText>
      </YStack>

      <YStack gap="$3" ai="center">
        <SizableText size="$4" color="$color">
          Haptics & SVG
        </SizableText>
        <XStack gap="$3">
          <Animated.View>
            <Svg width={120} height={120}>
              <Circle cx={60} cy={60} r={52} fill="#C7D2FE" />
              <Circle cx={60} cy={60} r={32} fill="#818CF8" />
            </Svg>
          </Animated.View>
        </XStack>
        <XStack gap="$3">
          <Paragraph color="$color">Trigger haptics:</Paragraph>
          <Anchor
            href="#"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              return false
            }}
            color="$blue10"
          >
            impact
          </Anchor>
          <Anchor
            href="#"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              return false
            }}
            color="$green10"
          >
            success
          </Anchor>
        </XStack>
      </YStack>

      <XStack
        items="center"
        justify="center"
        flexWrap="wrap"
        gap="$1.5"
        position="absolute"
        b="$8"
      >
        <Paragraph fontSize="$5">Add</Paragraph>

        <Paragraph fontSize="$5" px="$2" py="$1" color="$blue10" bg="$blue5">
          tamagui.config.ts
        </Paragraph>

        <Paragraph fontSize="$5">to root and follow the</Paragraph>

        <XStack
          items="center"
          gap="$1.5"
          px="$2"
          py="$1"
          rounded="$3"
          bg="$green5"
          hoverStyle={{ bg: '$green6' }}
          pressStyle={{ bg: '$green4' }}
        >
          <Anchor
            href="https://tamagui.dev/docs/core/configuration"
            textDecorationLine="none"
            color="$green10"
            fontSize="$5"
          >
            Configuration guide
          </Anchor>
          <ExternalLink size="$1" color="$green10" />
        </XStack>

        <Paragraph fontSize="$5" text="center">
          to configure your themes and tokens.
        </Paragraph>
      </XStack>

      <YStack gap="$3" ai="center" w="100%">
        <SizableText size="$4" color="$color">
          Storybook (embedded)
        </SizableText>
        <StorybookUIRoot />
      </YStack>
    </YStack>
  )
}
