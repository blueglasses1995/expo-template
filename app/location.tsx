import { Ionicons } from '@expo/vector-icons'
import { useToastController } from '@tamagui/toast'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'
import { Alert, ScrollView } from 'react-native'
import { Button, H2, SizableText, XStack, YStack } from 'tamagui'

type LocationData = {
  latitude: number
  longitude: number
  altitude: number | null
  accuracy: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number
}

export default function LocationModal() {
  const toast = useToastController()
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null)
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(
    null
  )

  // 権限状態を確認
  useEffect(() => {
    checkPermission()
  }, [])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove()
      }
    }
  }, [subscription])

  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync()
    setPermissionStatus(status)
  }

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setPermissionStatus(status)

      if (status !== 'granted') {
        toast.show('位置情報の権限が必要です', {
          message: '設定アプリから位置情報の権限を許可してください',
        })
        return false
      }

      toast.show('位置情報の権限が許可されました', {
        message: '位置情報を取得できます',
      })
      return true
    } catch (error) {
      toast.show('エラーが発生しました', {
        message: error instanceof Error ? error.message : '不明なエラー',
      })
      return false
    }
  }

  const getCurrentLocation = async () => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return
    }

    try {
      toast.show('位置情報を取得中...', {
        message: 'しばらくお待ちください',
      })

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        altitude: locationData.coords.altitude,
        accuracy: locationData.coords.accuracy,
        altitudeAccuracy: locationData.coords.altitudeAccuracy ?? null,
        heading: locationData.coords.heading,
        speed: locationData.coords.speed,
        timestamp: locationData.timestamp,
      })

      toast.show('位置情報を取得しました', {
        message: '現在地が表示されています',
      })
    } catch (error) {
      toast.show('位置情報の取得に失敗しました', {
        message: error instanceof Error ? error.message : '不明なエラー',
      })
    }
  }

  const startWatching = async () => {
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission()
      if (!granted) return
    }

    try {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000, // 1秒ごと
          distanceInterval: 1, // 1メートル移動したら
        },
        (locationData) => {
          setLocation({
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            altitude: locationData.coords.altitude,
            accuracy: locationData.coords.accuracy,
            altitudeAccuracy: locationData.coords.altitudeAccuracy ?? null,
            heading: locationData.coords.heading,
            speed: locationData.coords.speed,
            timestamp: locationData.timestamp,
          })
        }
      )

      setSubscription(sub)
      setIsWatching(true)
      toast.show('位置情報の監視を開始しました', {
        message: 'リアルタイムで位置情報を更新します',
      })
    } catch (error) {
      toast.show('位置情報の監視に失敗しました', {
        message: error instanceof Error ? error.message : '不明なエラー',
      })
    }
  }

  const stopWatching = () => {
    if (subscription) {
      subscription.remove()
      setSubscription(null)
      setIsWatching(false)
      toast.show('位置情報の監視を停止しました', {
        message: 'リアルタイム更新を終了しました',
      })
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#000' }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 24,
        paddingBottom: 120,
      }}
    >
      <XStack ai="center" gap="$2">
        <Ionicons name="location-outline" size={24} color="#5EEAD4" />
        <H2>位置情報</H2>
      </XStack>

      <YStack gap="$3">
        <SizableText size="$4" color="$color">
          権限状態
        </SizableText>
        <SizableText size="$3" color="$gray11">
          {permissionStatus === 'granted'
            ? '✅ 許可済み'
            : permissionStatus === 'denied'
              ? '❌ 拒否'
              : permissionStatus === 'undetermined'
                ? '⏳ 未設定'
                : '...'}
        </SizableText>
      </YStack>

      <YStack gap="$3">
        <SizableText size="$4" color="$color">
          操作
        </SizableText>
        <XStack gap="$2" flexWrap="wrap">
          {permissionStatus !== 'granted' && (
            <Button onPress={requestPermission} theme="blue">
              権限をリクエスト
            </Button>
          )}
          <Button
            onPress={getCurrentLocation}
            theme="blue"
            disabled={permissionStatus !== 'granted'}
          >
            現在地を取得
          </Button>
          {!isWatching ? (
            <Button
              onPress={startWatching}
              theme="green"
              disabled={permissionStatus !== 'granted'}
            >
              監視を開始
            </Button>
          ) : (
            <Button onPress={stopWatching} theme="red">
              監視を停止
            </Button>
          )}
        </XStack>
      </YStack>

      {location && (
        <YStack gap="$3" p="$4" bg="$gray2" borderRadius="$4">
          <SizableText size="$4" color="$color" fontWeight="bold">
            位置情報データ
          </SizableText>

          <YStack gap="$2">
            <SizableText size="$3" color="$gray11">
              緯度:{' '}
              <SizableText color="$color">{location.latitude.toFixed(6)}</SizableText>
            </SizableText>
            <SizableText size="$3" color="$gray11">
              経度:{' '}
              <SizableText color="$color">{location.longitude.toFixed(6)}</SizableText>
            </SizableText>
            {location.altitude !== null && (
              <SizableText size="$3" color="$gray11">
                高度:{' '}
                <SizableText color="$color">{location.altitude.toFixed(2)}m</SizableText>
              </SizableText>
            )}
            {location.accuracy !== null && (
              <SizableText size="$3" color="$gray11">
                精度:{' '}
                <SizableText color="$color">{location.accuracy.toFixed(2)}m</SizableText>
              </SizableText>
            )}
            {location.altitudeAccuracy !== null && (
              <SizableText size="$3" color="$gray11">
                高度精度:{' '}
                <SizableText color="$color">
                  {location.altitudeAccuracy.toFixed(2)}m
                </SizableText>
              </SizableText>
            )}
            {location.heading !== null && (
              <SizableText size="$3" color="$gray11">
                方位:{' '}
                <SizableText color="$color">{location.heading.toFixed(2)}°</SizableText>
              </SizableText>
            )}
            {location.speed !== null && (
              <SizableText size="$3" color="$gray11">
                速度:{' '}
                <SizableText color="$color">{location.speed.toFixed(2)}m/s</SizableText>
              </SizableText>
            )}
            <SizableText size="$3" color="$gray11">
              取得時刻:{' '}
              <SizableText color="$color">
                {formatTimestamp(location.timestamp)}
              </SizableText>
            </SizableText>
          </YStack>

          {isWatching && (
            <XStack ai="center" gap="$2" mt="$2">
              <Ionicons name="radio-button-on" size={16} color="#5EEAD4" />
              <SizableText size="$2" color="$green10">
                リアルタイム更新中
              </SizableText>
            </XStack>
          )}
        </YStack>
      )}

      <YStack gap="$2" p="$4" bg="$blue2" borderRadius="$4">
        <SizableText size="$3" color="$blue11" fontWeight="bold">
          💡 使い方
        </SizableText>
        <SizableText size="$2" color="$blue11">
          • 「権限をリクエスト」で位置情報の使用許可を求めます
        </SizableText>
        <SizableText size="$2" color="$blue11">
          • 「現在地を取得」で一度だけ位置情報を取得します
        </SizableText>
        <SizableText size="$2" color="$blue11">
          • 「監視を開始」でリアルタイムに位置情報を更新します
        </SizableText>
        <SizableText size="$2" color="$blue11">
          • 「監視を停止」でリアルタイム更新を終了します
        </SizableText>
      </YStack>
    </ScrollView>
  )
}
