import * as LocalAuthentication from 'expo-local-authentication'
import { useCallback, useEffect, useState } from 'react'

/**
 * 生体認証の種類
 */
export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none'

/**
 * 生体認証の状態
 */
export type BiometricState = {
  /** デバイスが生体認証をサポートしているか */
  isSupported: boolean
  /** 生体認証が登録されているか */
  isEnrolled: boolean
  /** 利用可能な認証タイプ */
  availableTypes: BiometricType[]
  /** セキュリティレベル */
  securityLevel: 'none' | 'secret' | 'biometric'
  /** ローディング中 */
  loading: boolean
}

/**
 * 認証タイプを文字列に変換
 */
function mapAuthenticationType(
  type: LocalAuthentication.AuthenticationType
): BiometricType {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return 'fingerprint'
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return 'facial'
    case LocalAuthentication.AuthenticationType.IRIS:
      return 'iris'
    default:
      return 'none'
  }
}

/**
 * セキュリティレベルを文字列に変換
 */
function mapSecurityLevel(
  level: LocalAuthentication.SecurityLevel
): 'none' | 'secret' | 'biometric' {
  switch (level) {
    case LocalAuthentication.SecurityLevel.NONE:
      return 'none'
    case LocalAuthentication.SecurityLevel.SECRET:
      return 'secret' // PINやパターン
    case LocalAuthentication.SecurityLevel.BIOMETRIC:
    case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
    case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
      return 'biometric'
    default:
      return 'none'
  }
}

/**
 * 生体認証フック
 *
 * @example
 * ```tsx
 * const { isSupported, availableTypes, authenticate } = useBiometrics()
 *
 * const handleLogin = async () => {
 *   const result = await authenticate('ログインするには認証してください')
 *   if (result.success) {
 *     // 認証成功
 *   }
 * }
 * ```
 */
export function useBiometrics() {
  const [state, setState] = useState<BiometricState>({
    isSupported: false,
    isEnrolled: false,
    availableTypes: [],
    securityLevel: 'none',
    loading: true,
  })

  // デバイスの生体認証機能をチェック
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        // ハードウェアサポートをチェック
        const isSupported = await LocalAuthentication.hasHardwareAsync()

        // 生体認証が登録されているかチェック
        const isEnrolled = await LocalAuthentication.isEnrolledAsync()

        // 利用可能な認証タイプを取得
        const authTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync()
        const availableTypes = authTypes.map(mapAuthenticationType)

        // セキュリティレベルを取得
        const securityLevel = await LocalAuthentication.getEnrolledLevelAsync()

        setState({
          isSupported,
          isEnrolled,
          availableTypes,
          securityLevel: mapSecurityLevel(securityLevel),
          loading: false,
        })
      } catch (error) {
        console.error('Biometrics check failed:', error)
        setState((prev) => ({ ...prev, loading: false }))
      }
    }

    checkBiometrics()
  }, [])

  /**
   * 生体認証を実行
   *
   * @param promptMessage - 認証ダイアログに表示するメッセージ
   * @param options - 追加オプション
   * @returns 認証結果
   */
  const authenticate = useCallback(
    async (
      promptMessage = '認証してください',
      options?: {
        /** キャンセルボタンのラベル */
        cancelLabel?: string
        /** パスコードへのフォールバックを許可 */
        fallbackLabel?: string
        /** パスコードフォールバックを無効化 */
        disableDeviceFallback?: boolean
      }
    ) => {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          cancelLabel: options?.cancelLabel ?? 'キャンセル',
          fallbackLabel: options?.fallbackLabel ?? 'パスコードを使用',
          disableDeviceFallback: options?.disableDeviceFallback ?? false,
        })

        return result
      } catch (error) {
        console.error('Authentication failed:', error)
        return {
          success: false,
          error: 'unknown' as const,
          warning: undefined,
        }
      }
    },
    []
  )

  /**
   * 認証をキャンセル（Android用）
   */
  const cancelAuthentication = useCallback(async () => {
    await LocalAuthentication.cancelAuthenticate()
  }, [])

  return {
    ...state,
    authenticate,
    cancelAuthentication,
  }
}

/**
 * 生体認証タイプの表示名を取得
 */
export function getBiometricTypeName(type: BiometricType): string {
  switch (type) {
    case 'fingerprint':
      return '指紋認証'
    case 'facial':
      return '顔認証'
    case 'iris':
      return '虹彩認証'
    default:
      return '生体認証'
  }
}

/**
 * 利用可能な生体認証の表示名リストを取得
 */
export function getBiometricTypeNames(types: BiometricType[]): string {
  if (types.length === 0) return '生体認証'
  return types.map(getBiometricTypeName).join(' / ')
}
