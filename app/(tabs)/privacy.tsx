import { Ionicons } from '@expo/vector-icons'
import * as Device from 'expo-device'
import * as TrackingTransparency from 'expo-tracking-transparency'
import { useCallback, useEffect, useState } from 'react'
import { Platform, ScrollView } from 'react-native'
import { Button, Paragraph, Separator, SizableText, Text, XStack, YStack } from 'tamagui'

// 情報カテゴリの型
interface CollectedInfo {
  category: string
  data: string
  risk: 'low' | 'medium' | 'high'
  usage: string
}

export default function PrivacyTab() {
  const [trackingStatus, setTrackingStatus] = useState<string>('checking...')
  const [deviceInfo, setDeviceInfo] = useState<CollectedInfo[]>([])
  const [showDetails, setShowDetails] = useState(false)

  // デバイス情報を収集して表示
  const collectDeviceInfo = useCallback(() => {
    const info: CollectedInfo[] = [
      {
        category: '📱 デバイスモデル',
        data: Device.modelName || 'Unknown',
        risk: 'medium',
        usage: '特定のデバイスユーザー層へのターゲティング広告',
      },
      {
        category: '🏭 メーカー',
        data: Device.manufacturer || 'Unknown',
        risk: 'low',
        usage: 'ユーザー層の分析（Apple/Samsung等）',
      },
      {
        category: '💻 OS名',
        data: Device.osName || Platform.OS,
        risk: 'low',
        usage: 'プラットフォーム別の広告配信',
      },
      {
        category: '📊 OSバージョン',
        data: Device.osVersion || 'Unknown',
        risk: 'medium',
        usage: 'セキュリティ脆弱性の把握、ターゲティング',
      },
      {
        category: '🔧 デバイス名',
        data: Device.deviceName || 'Unknown',
        risk: 'high',
        usage: '個人名が含まれる場合がある（例: "〇〇のiPhone"）',
      },
      {
        category: '📐 デバイスタイプ',
        data: Device.deviceType?.toString() || 'Unknown',
        risk: 'low',
        usage: 'スマホ/タブレット別の広告配信',
      },
      {
        category: '🔢 総メモリ',
        data: Device.totalMemory
          ? `${Math.round(Device.totalMemory / 1024 / 1024 / 1024)} GB`
          : 'Unknown',
        risk: 'medium',
        usage: 'デバイスの価格帯推定、購買力分析',
      },
      {
        category: '⚡ 物理デバイス',
        data: Device.isDevice ? 'はい' : 'いいえ（シミュレータ）',
        risk: 'low',
        usage: '開発者/一般ユーザーの判別',
      },
    ]
    setDeviceInfo(info)
  }, [])

  // トラッキング状態を確認
  const checkTrackingStatus = useCallback(async () => {
    try {
      const { status } = await TrackingTransparency.getTrackingPermissionsAsync()
      setTrackingStatus(status)
    } catch {
      setTrackingStatus('unavailable')
    }
  }, [])

  // トラッキング許可をリクエスト
  const requestTracking = useCallback(async () => {
    try {
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync()
      setTrackingStatus(status)
    } catch {
      setTrackingStatus('error')
    }
  }, [])

  useEffect(() => {
    collectDeviceInfo()
    checkTrackingStatus()
  }, [collectDeviceInfo, checkTrackingStatus])

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return '$green10'
      case 'medium':
        return '$yellow10'
      case 'high':
        return '$red10'
    }
  }

  const getRiskLabel = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return '低リスク'
      case 'medium':
        return '中リスク'
      case 'high':
        return '高リスク'
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#000' }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 18,
        alignItems: 'center',
        paddingBottom: 120,
      }}
    >
      <YStack ai="center" gap="$2">
        <Ionicons name="shield-checkmark-outline" size={28} color="#EF4444" />
        <SizableText size="$6" color="$color">
          プライバシー教育
        </SizableText>
        <Paragraph ta="center" color="$gray11">
          アプリがあなたについて知り得る情報
        </Paragraph>
      </YStack>

      {/* トラッキング状態 */}
      <YStack gap="$3" w="100%" maw={420} bg="$gray2" p="$4" br="$4">
        <Text fontSize={18} color="$color">
          🎯 広告トラッキング状態
        </Text>
        <YStack bg={trackingStatus === 'granted' ? '$red3' : '$green3'} p="$3" br="$3">
          <XStack ai="center" gap="$2">
            <Ionicons
              name={trackingStatus === 'granted' ? 'warning' : 'checkmark-circle'}
              size={24}
              color={trackingStatus === 'granted' ? '#EF4444' : '#22C55E'}
            />
            <YStack flex={1}>
              <Text
                color={trackingStatus === 'granted' ? '$red11' : '$green11'}
                fontWeight="bold"
              >
                {trackingStatus === 'granted'
                  ? 'トラッキング許可済み'
                  : 'トラッキング制限中'}
              </Text>
              <Text
                color={trackingStatus === 'granted' ? '$red10' : '$green10'}
                fontSize="$2"
              >
                {trackingStatus === 'granted'
                  ? '広告主があなたの行動を追跡できます'
                  : 'アプリ間での行動追跡が制限されています'}
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <XStack gap="$2">
          <Button flex={1} size="$3" onPress={requestTracking}>
            権限を変更
          </Button>
          <Button flex={1} size="$3" variant="outlined" onPress={checkTrackingStatus}>
            状態を確認
          </Button>
        </XStack>

        <YStack bg="$gray4" p="$3" br="$3" gap="$2">
          <Text color="$gray11" fontSize="$2" fontWeight="bold">
            📚 トラッキングとは？
          </Text>
          <Text color="$gray10" fontSize="$2">
            • IDFA/広告IDを使ってアプリ間であなたの行動を追跡
          </Text>
          <Text color="$gray10" fontSize="$2">
            • SNSで見た商品が他のアプリで広告表示される仕組み
          </Text>
          <Text color="$gray10" fontSize="$2">
            • iOS 14.5以降はユーザーの許可が必要
          </Text>
        </YStack>
      </YStack>

      <Separator />

      {/* 収集可能な情報 */}
      <YStack gap="$3" w="100%" maw={420}>
        <XStack jc="space-between" ai="center">
          <Text fontSize={18} color="$color">
            📊 このアプリが取得可能な情報
          </Text>
          <Button size="$2" onPress={() => setShowDetails(!showDetails)}>
            {showDetails ? '簡易表示' : '詳細表示'}
          </Button>
        </XStack>

        {deviceInfo.map((info, index) => (
          <YStack key={index} bg="$gray2" p="$3" br="$3" gap="$2">
            <XStack jc="space-between" ai="center">
              <Text color="$gray11" fontWeight="bold">
                {info.category}
              </Text>
              <Text color={getRiskColor(info.risk)} fontSize="$2">
                {getRiskLabel(info.risk)}
              </Text>
            </XStack>
            <Text color="$color" fontSize="$4">
              {info.data}
            </Text>
            {showDetails && (
              <YStack bg="$gray4" p="$2" br="$2">
                <Text color="$gray10" fontSize="$2">
                  💡 使われ方: {info.usage}
                </Text>
              </YStack>
            )}
          </YStack>
        ))}
      </YStack>

      <Separator />

      {/* その他の追跡可能な情報 */}
      <YStack gap="$3" w="100%" maw={420} bg="$gray2" p="$4" br="$4">
        <Text fontSize={18} color="$color">
          🔍 その他の追跡方法
        </Text>

        <YStack gap="$2">
          <YStack bg="$red3" p="$3" br="$3">
            <Text color="$red11" fontWeight="bold">
              🌐 IPアドレス
            </Text>
            <Text color="$red10" fontSize="$2">
              大まかな位置情報（市区町村レベル）、ISP情報
            </Text>
          </YStack>

          <YStack bg="$orange3" p="$3" br="$3">
            <Text color="$orange11" fontWeight="bold">
              📍 位置情報
            </Text>
            <Text color="$orange10" fontSize="$2">
              GPSで正確な位置、行動パターン、よく行く場所
            </Text>
          </YStack>

          <YStack bg="$yellow3" p="$3" br="$3">
            <Text color="$yellow11" fontWeight="bold">
              ⏰ 使用パターン
            </Text>
            <Text color="$yellow10" fontSize="$2">
              アプリ起動時間、使用頻度、セッション時間
            </Text>
          </YStack>

          <YStack bg="$blue3" p="$3" br="$3">
            <Text color="$blue11" fontWeight="bold">
              🔗 ブラウザフィンガープリント
            </Text>
            <Text color="$blue10" fontSize="$2">
              画面サイズ、フォント、言語設定などの組み合わせで個人特定
            </Text>
          </YStack>
        </YStack>
      </YStack>

      <Separator />

      {/* プライバシー保護のヒント */}
      <YStack gap="$3" w="100%" maw={420} bg="$green2" p="$4" br="$4">
        <Text fontSize={18} color="$green11">
          ✅ プライバシーを守るには
        </Text>

        <YStack gap="$2">
          <XStack gap="$2" ai="flex-start">
            <Text color="$green10">1.</Text>
            <Text color="$green10" flex={1}>
              トラッキングを拒否する（設定 → プライバシー → トラッキング）
            </Text>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color="$green10">2.</Text>
            <Text color="$green10" flex={1}>
              位置情報は「使用中のみ」または「なし」に設定
            </Text>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color="$green10">3.</Text>
            <Text color="$green10" flex={1}>
              デバイス名から個人名を削除（例: "iPhone" のみにする）
            </Text>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color="$green10">4.</Text>
            <Text color="$green10" flex={1}>
              不要なアプリの権限を定期的に見直す
            </Text>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color="$green10">5.</Text>
            <Text color="$green10" flex={1}>
              VPNを使用してIPアドレスを隠す
            </Text>
          </XStack>
        </YStack>
      </YStack>

      {/* フッター説明 */}
      <YStack gap="$2" w="100%" maw={420} ai="center">
        <Paragraph color="$gray10" fontSize="$2" ta="center">
          この画面は教育目的です。実際に情報を外部送信していません。
        </Paragraph>
      </YStack>
    </ScrollView>
  )
}
