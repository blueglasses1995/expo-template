import { type MonoTypeOperatorFunction, type Observable, of, throwError } from 'rxjs'
import {
  catchError,
  delay,
  distinctUntilChanged,
  filter,
  map,
  retry,
  scan,
  shareReplay,
  take,
  takeWhile,
  tap,
  timeout,
} from 'rxjs/operators'

// --------------------------------------------------
// Custom Operators
// --------------------------------------------------

/**
 * null/undefinedを除外する
 *
 * @example
 * ```tsx
 * source$.pipe(filterNullish())
 * ```
 */
export function filterNullish<T>(): (
  source: Observable<T | null | undefined>
) => Observable<T> {
  return (source) =>
    source.pipe(filter((value): value is T => value != null))
}

/**
 * 値の変更をログ出力
 *
 * @example
 * ```tsx
 * source$.pipe(debug('MyValue'))
 * // Output: [MyValue] value
 * ```
 */
export function debug<T>(label: string): MonoTypeOperatorFunction<T> {
  return tap({
    next: (value) => console.log(`[${label}]`, value),
    error: (err) => console.error(`[${label}] Error:`, err),
    complete: () => console.log(`[${label}] Complete`),
  })
}

/**
 * エラーをキャッチしてデフォルト値を返す
 *
 * @example
 * ```tsx
 * source$.pipe(catchToDefault([]))
 * ```
 */
export function catchToDefault<T>(
  defaultValue: T
): (source: Observable<T>) => Observable<T> {
  return (source) =>
    source.pipe(
      catchError((error) => {
        console.error('Caught error, returning default:', error)
        return of(defaultValue)
      })
    )
}

/**
 * タイムアウト付きでエラーハンドリング
 *
 * @example
 * ```tsx
 * source$.pipe(withTimeout(5000, 'Request timed out'))
 * ```
 */
export function withTimeout<T>(
  ms: number,
  errorMessage = 'Operation timed out'
): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      timeout(ms),
      catchError(() => throwError(() => new Error(errorMessage)))
    )
}

/**
 * 値が変わるまで待機（deep comparison）
 *
 * @example
 * ```tsx
 * source$.pipe(distinctUntilDeepChanged())
 * ```
 */
export function distinctUntilDeepChanged<T>(): MonoTypeOperatorFunction<T> {
  return distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
}

/**
 * 累積値を計算
 *
 * @example
 * ```tsx
 * clicks$.pipe(accumulate())
 * // 1, 2, 3, 4, ...
 * ```
 */
export function accumulate(): (source: Observable<unknown>) => Observable<number> {
  return (source) => source.pipe(scan((acc) => acc + 1, 0))
}

/**
 * 最初のN個の値を取得してキャッシュ
 *
 * @example
 * ```tsx
 * source$.pipe(takeAndCache(1))
 * ```
 */
export function takeAndCache<T>(
  count: number
): (source: Observable<T>) => Observable<T> {
  return (source) => source.pipe(take(count), shareReplay(count))
}

/**
 * 条件がtrueの間だけ値を通す
 *
 * @example
 * ```tsx
 * counter$.pipe(takeWhileLoading(loading$))
 * ```
 */
export function takeWhileTrue<T>(
  condition$: Observable<boolean>
): (source: Observable<T>) => Observable<T> {
  let isActive = true
  condition$.subscribe((active) => {
    isActive = active
  })

  return (source) => source.pipe(takeWhile(() => isActive))
}

/**
 * 値をオブジェクトのプロパティに変換
 *
 * @example
 * ```tsx
 * value$.pipe(mapToProperty('count'))
 * // { count: value }
 * ```
 */
export function mapToProperty<T, K extends string>(
  key: K
): (source: Observable<T>) => Observable<Record<K, T>> {
  return (source) =>
    source.pipe(map((value) => ({ [key]: value }) as Record<K, T>))
}

/**
 * 遅延実行（デバッグ用）
 *
 * @example
 * ```tsx
 * source$.pipe(delayEach(1000))
 * ```
 */
export function delayEach<T>(ms: number): MonoTypeOperatorFunction<T> {
  return delay(ms)
}

/**
 * リトライ（固定回数）
 *
 * @example
 * ```tsx
 * apiCall$.pipe(retryTimes(3))
 * ```
 */
export function retryTimes<T>(count: number): MonoTypeOperatorFunction<T> {
  return retry(count)
}

/**
 * 値の変換ログ
 *
 * @example
 * ```tsx
 * source$.pipe(
 *   logTransform('before'),
 *   map(x => x * 2),
 *   logTransform('after')
 * )
 * ```
 */
export function logTransform<T>(label: string): MonoTypeOperatorFunction<T> {
  return tap((value) => console.log(`[${label}]`, value))
}
