import { AppState, type AppStateStatus, Dimensions, Keyboard } from 'react-native'
import {
  BehaviorSubject,
  Observable,
  Subject,
  fromEvent,
  interval,
  merge,
  timer,
} from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  share,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs/operators'

// --------------------------------------------------
// App State Observable
// --------------------------------------------------

/**
 * アプリの状態（フォアグラウンド/バックグラウンド）を監視
 *
 * @example
 * ```tsx
 * appState$.subscribe(state => {
 *   console.log('App state:', state) // 'active' | 'background' | 'inactive'
 * })
 * ```
 */
export const appState$ = new Observable<AppStateStatus>((subscriber) => {
  const subscription = AppState.addEventListener('change', (state) => {
    subscriber.next(state)
  })

  // 初期値を発行
  subscriber.next(AppState.currentState)

  return () => {
    subscription.remove()
  }
}).pipe(shareReplay(1))

/**
 * アプリがアクティブかどうか
 */
export const isAppActive$ = appState$.pipe(
  map((state) => state === 'active'),
  distinctUntilChanged(),
  shareReplay(1)
)

/**
 * アプリがフォアグラウンドに戻った時
 */
export const appBecameActive$ = appState$.pipe(
  filter((state) => state === 'active'),
  share()
)

/**
 * アプリがバックグラウンドに移動した時
 */
export const appWentToBackground$ = appState$.pipe(
  filter((state) => state === 'background'),
  share()
)

// --------------------------------------------------
// Screen Dimensions Observable
// --------------------------------------------------

/**
 * 画面サイズの変更を監視
 *
 * @example
 * ```tsx
 * dimensions$.subscribe(({ width, height }) => {
 *   console.log('Screen size:', width, height)
 * })
 * ```
 */
export const dimensions$ = new Observable<{
  width: number
  height: number
  scale: number
  fontScale: number
}>((subscriber) => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    subscriber.next({
      width: window.width,
      height: window.height,
      scale: window.scale,
      fontScale: window.fontScale,
    })
  })

  // 初期値を発行
  const initial = Dimensions.get('window')
  subscriber.next({
    width: initial.width,
    height: initial.height,
    scale: initial.scale,
    fontScale: initial.fontScale,
  })

  return () => {
    subscription.remove()
  }
}).pipe(shareReplay(1))

/**
 * 画面の向き
 */
export const orientation$ = dimensions$.pipe(
  map(({ width, height }) => (width > height ? 'landscape' : 'portrait') as const),
  distinctUntilChanged(),
  shareReplay(1)
)

// --------------------------------------------------
// Keyboard Observable
// --------------------------------------------------

/**
 * キーボードの表示状態を監視
 *
 * @example
 * ```tsx
 * keyboard$.subscribe(({ visible, height }) => {
 *   console.log('Keyboard visible:', visible, 'height:', height)
 * })
 * ```
 */
export const keyboard$ = new Observable<{
  visible: boolean
  height: number
}>((subscriber) => {
  const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
    subscriber.next({ visible: true, height: e.endCoordinates.height })
  })

  const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
    subscriber.next({ visible: false, height: 0 })
  })

  // 初期値
  subscriber.next({ visible: false, height: 0 })

  return () => {
    showSubscription.remove()
    hideSubscription.remove()
  }
}).pipe(shareReplay(1))

// --------------------------------------------------
// Polling Observable Factory
// --------------------------------------------------

/**
 * 定期的にデータをフェッチするObservableを作成
 *
 * @example
 * ```tsx
 * const data$ = createPolling$(
 *   () => fetch('/api/data').then(r => r.json()),
 *   30000 // 30秒ごと
 * )
 *
 * data$.subscribe(data => console.log(data))
 * ```
 */
export function createPolling$<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  options?: {
    /** フォアグラウンド時のみポーリング */
    onlyWhenActive?: boolean
    /** 初回即時実行 */
    immediate?: boolean
  }
): Observable<T> {
  const { onlyWhenActive = true, immediate = true } = options ?? {}

  const polling$ = interval(intervalMs).pipe(
    startWith(immediate ? -1 : null),
    filter((v) => v !== null),
    switchMap(() => fetcher())
  )

  if (onlyWhenActive) {
    // フォアグラウンド時のみポーリング
    return isAppActive$.pipe(
      switchMap((isActive) => (isActive ? polling$ : new Observable<T>(() => {})))
    )
  }

  return polling$
}

// --------------------------------------------------
// Search Input Observable Factory
// --------------------------------------------------

/**
 * 検索入力用のSubjectを作成（debounce付き）
 *
 * @example
 * ```tsx
 * const { input$, search$, next } = createSearchInput$(300)
 *
 * // 入力を送信
 * next('検索ワード')
 *
 * // debounce後の値を購読
 * search$.subscribe(query => {
 *   console.log('Search:', query)
 * })
 * ```
 */
export function createSearchInput$(debounceMs = 300) {
  const subject = new BehaviorSubject<string>('')

  return {
    /** 現在の入力値 */
    input$: subject.asObservable(),

    /** debounce後の検索クエリ */
    search$: subject.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      share()
    ),

    /** 値を更新 */
    next: (value: string) => subject.next(value),

    /** 現在の値を取得 */
    getValue: () => subject.getValue(),

    /** クリア */
    clear: () => subject.next(''),
  }
}

// --------------------------------------------------
// Retry with Backoff
// --------------------------------------------------

/**
 * 指数バックオフでリトライするObservableを作成
 *
 * @example
 * ```tsx
 * const result$ = retryWithBackoff$(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * )
 * ```
 */
export function retryWithBackoff$<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffFactor?: number
  }
): Observable<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
  } = options ?? {}

  return new Observable<T>((subscriber) => {
    let retryCount = 0
    let isCancelled = false

    const attempt = async () => {
      if (isCancelled) return

      try {
        const result = await operation()
        if (!isCancelled) {
          subscriber.next(result)
          subscriber.complete()
        }
      } catch (error) {
        if (isCancelled) return

        if (retryCount < maxRetries) {
          const delay = Math.min(
            initialDelay * backoffFactor ** retryCount,
            maxDelay
          )
          retryCount++
          console.log(`Retry ${retryCount}/${maxRetries} after ${delay}ms`)
          setTimeout(attempt, delay)
        } else {
          subscriber.error(error)
        }
      }
    }

    attempt()

    return () => {
      isCancelled = true
    }
  })
}

// --------------------------------------------------
// Event Bus
// --------------------------------------------------

type EventMap = Record<string, unknown>

/**
 * 型安全なイベントバスを作成
 *
 * @example
 * ```tsx
 * type Events = {
 *   userLoggedIn: { userId: string }
 *   cartUpdated: { items: number }
 * }
 *
 * const eventBus = createEventBus<Events>()
 *
 * // 購読
 * eventBus.on('userLoggedIn').subscribe(({ userId }) => {
 *   console.log('User logged in:', userId)
 * })
 *
 * // 発行
 * eventBus.emit('userLoggedIn', { userId: '123' })
 * ```
 */
export function createEventBus<T extends EventMap>() {
  const subjects = new Map<keyof T, Subject<unknown>>()

  const getSubject = <K extends keyof T>(event: K): Subject<T[K]> => {
    if (!subjects.has(event)) {
      subjects.set(event, new Subject())
    }
    return subjects.get(event) as Subject<T[K]>
  }

  return {
    /** イベントを購読 */
    on: <K extends keyof T>(event: K): Observable<T[K]> => {
      return getSubject(event).asObservable()
    },

    /** イベントを発行 */
    emit: <K extends keyof T>(event: K, payload: T[K]) => {
      getSubject(event).next(payload)
    },

    /** すべてのSubjectを完了 */
    complete: () => {
      subjects.forEach((subject) => subject.complete())
      subjects.clear()
    },
  }
}
