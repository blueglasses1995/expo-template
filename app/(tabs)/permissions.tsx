import { Check, Fingerprint, LogIn, LogOut, X } from '@tamagui/lucide-icons'
import { useToastController } from '@tamagui/toast'
import { useRouter } from 'expo-router'
import { useAuth } from 'hooks/useAuth'
import { getBiometricTypeNames, useBiometrics } from 'hooks/useBiometrics'
import { useCan } from 'hooks/useCan'
import { Can } from 'lib/casl'
import { ScrollView } from 'react-native'
import { Button, H3, H4, Separator, Text, XStack, YStack } from 'tamagui'

/**
 * CASL 権限管理 & 認証デモ画面
 */
export default function PermissionsScreen() {
  const { user, signOut } = useAuth()
  const { can } = useCan()
  const router = useRouter()
  const toast = useToastController()

  // 生体認証
  const {
    isSupported,
    isEnrolled,
    availableTypes,
    securityLevel,
    authenticate,
    loading,
  } = useBiometrics()

  const handleBiometricAuth = async () => {
    const result = await authenticate('認証してください')
    if (result.success) {
      toast.show('生体認証成功！', { preset: 'done' })
    } else {
      toast.show('認証に失敗しました', { preset: 'error' })
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.show(error.message, { preset: 'error' })
    } else {
      toast.show('ログアウトしました', { preset: 'done' })
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
      <YStack padding="$4" gap="$4">
        <H3>🔐 認証 & 権限管理</H3>

        {/* ログイン状態 & アクション */}
        <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4" gap="$3">
          <H4>認証状態</H4>
          <Text color="$gray11">
            {user ? `ログイン中: ${user.email}` : 'ゲスト（未ログイン）'}
          </Text>
          <Text color="$gray11">ロール: {user ? 'user' : 'guest'}</Text>

          <XStack gap="$2" marginTop="$2">
            {user ? (
              <Button flex={1} theme="red" icon={LogOut} onPress={handleSignOut}>
                ログアウト
              </Button>
            ) : (
              <Button
                flex={1}
                theme="green"
                icon={LogIn}
                onPress={() => router.push('/auth/login')}
              >
                ログイン
              </Button>
            )}
          </XStack>
        </YStack>

        <Separator />

        {/* 生体認証 */}
        <H4>🔒 生体認証</H4>
        <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4" gap="$2">
          {loading ? (
            <Text color="$gray11">読み込み中...</Text>
          ) : (
            <>
              <XStack justifyContent="space-between">
                <Text color="$gray11">サポート:</Text>
                <Text color={isSupported ? '$green10' : '$red10'}>
                  {isSupported ? '対応' : '非対応'}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text color="$gray11">登録済み:</Text>
                <Text color={isEnrolled ? '$green10' : '$yellow10'}>
                  {isEnrolled ? 'はい' : 'いいえ'}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text color="$gray11">認証タイプ:</Text>
                <Text color="$gray11">{getBiometricTypeNames(availableTypes)}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text color="$gray11">セキュリティ:</Text>
                <Text color="$gray11">{securityLevel}</Text>
              </XStack>

              <Button
                marginTop="$2"
                theme="blue"
                icon={Fingerprint}
                onPress={handleBiometricAuth}
                disabled={!isSupported || !isEnrolled}
              >
                生体認証をテスト
              </Button>
            </>
          )}
        </YStack>

        <Separator />

        {/* CASL 権限チェック */}
        <H4>📋 CASL 権限チェック</H4>

        <YStack gap="$2">
          <PermissionRow label="Task を読む" allowed={can('read', 'Task')} />
          <PermissionRow label="Task を作成" allowed={can('create', 'Task')} />
          <PermissionRow label="Task を更新" allowed={can('update', 'Task')} />
          <PermissionRow label="Task を削除" allowed={can('delete', 'Task')} />
          <PermissionRow label="Profile を読む" allowed={can('read', 'Profile')} />
          <PermissionRow label="Profile を更新" allowed={can('update', 'Profile')} />
          <PermissionRow label="AdminPanel を読む" allowed={can('read', 'AdminPanel')} />
          <PermissionRow label="すべてを管理" allowed={can('manage', 'all')} />
        </YStack>

        <Separator />

        {/* Can コンポーネントのデモ */}
        <H4>🎯 条件付きレンダリング</H4>

        <YStack gap="$3">
          <Can I="create" a="Task">
            <Button theme="green" icon={Check}>
              タスクを作成（ユーザーのみ）
            </Button>
          </Can>

          <Can I="read" a="AdminPanel">
            <Button theme="red">管理パネル（管理者のみ）</Button>
          </Can>

          <Can I="read" a="Task">
            <YStack backgroundColor="$blue3" padding="$3" borderRadius="$3">
              <Text>📝 タスク一覧（全員に表示）</Text>
            </YStack>
          </Can>

          <Can I="read" a="AdminPanel" passThrough>
            {(allowed) =>
              allowed ? (
                <Button theme="red">管理パネルへ</Button>
              ) : (
                <YStack backgroundColor="$gray3" padding="$3" borderRadius="$3">
                  <Text color="$gray10">🔒 管理パネルへのアクセス権がありません</Text>
                </YStack>
              )
            }
          </Can>
        </YStack>

        <Separator />

        {/* 説明 */}
        <H4>💡 ロールの変更方法</H4>
        <YStack backgroundColor="$gray2" padding="$4" borderRadius="$4" gap="$2">
          <Text color="$gray11">• ログアウト状態 → guest ロール</Text>
          <Text color="$gray11">• ログイン状態 → user ロール</Text>
          <Text color="$gray11">• admin ロールはユーザーメタデータで設定</Text>
          <Text color="$gray11" fontSize="$2" marginTop="$2">
            ※ Supabase ダッシュボードでユーザーの user_metadata に {`{ "role": "admin" }`}{' '}
            を設定すると admin になります
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  )
}

// 権限表示用のコンポーネント
function PermissionRow({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <XStack
      backgroundColor="$gray2"
      padding="$3"
      borderRadius="$3"
      justifyContent="space-between"
      alignItems="center"
    >
      <Text>{label}</Text>
      <XStack alignItems="center" gap="$2">
        {allowed ? (
          <>
            <Check size={16} color="$green10" />
            <Text color="$green10">許可</Text>
          </>
        ) : (
          <>
            <X size={16} color="$red10" />
            <Text color="$red10">拒否</Text>
          </>
        )}
      </XStack>
    </XStack>
  )
}
