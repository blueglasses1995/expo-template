/**
 * Crypto polyfill for React Native
 * Required for libraries like TanStack DB that depend on global crypto
 */
import * as ExpoCrypto from 'expo-crypto'

// Polyfill crypto.getRandomValues if not available
if (typeof global.crypto === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).crypto = {
    getRandomValues: <T extends ArrayBufferView>(array: T): T => {
      const bytes = ExpoCrypto.getRandomBytes(array.byteLength)
      const typedArray = array as unknown as Uint8Array
      typedArray.set(bytes)
      return array
    },
    randomUUID: () => ExpoCrypto.randomUUID(),
  }
} else if (typeof global.crypto.getRandomValues === 'undefined') {
  // crypto exists but getRandomValues doesn't
  global.crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
    const bytes = ExpoCrypto.getRandomBytes(array.byteLength)
    const typedArray = array as unknown as Uint8Array
    typedArray.set(bytes)
    return array
  }
}

// Also polyfill crypto.randomUUID if missing
if (global.crypto && typeof global.crypto.randomUUID === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global.crypto as any).randomUUID = () => ExpoCrypto.randomUUID()
}
