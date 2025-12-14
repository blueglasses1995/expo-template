import { useEffect, useMemo, useState } from 'react'
import { BehaviorSubject, type Observable, Subject, type Subscription } from 'rxjs'

// --------------------------------------------------
// useObservable
// --------------------------------------------------

/**
 * Observableの値をReact stateとして使用
 *
 * @example
 * ```tsx
 * const appState = useObservable(appState$, 'active')
 * ```
 */
export function useObservable<T>(
  observable$: Observable<T>,
  initialValue: T
): T {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    const subscription = observable$.subscribe({
      next: setValue,
      error: (err) => console.error('useObservable error:', err),
    })

    return () => subscription.unsubscribe()
  }, [observable$])

  return value
}

/**
 * Observableの値をReact stateとして使用（初期値なし）
 *
 * @example
 * ```tsx
 * const data = useObservableState(data$)
 * if (data === undefined) return <Loading />
 * ```
 */
export function useObservableState<T>(
  observable$: Observable<T>
): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined)

  useEffect(() => {
    const subscription = observable$.subscribe({
      next: setValue,
      error: (err) => console.error('useObservableState error:', err),
    })

    return () => subscription.unsubscribe()
  }, [observable$])

  return value
}

// --------------------------------------------------
// useSubject
// --------------------------------------------------

/**
 * Subjectを作成して値を発行・購読
 *
 * @example
 * ```tsx
 * const { value, next, subject$ } = useSubject<string>('')
 *
 * return (
 *   <Input value={value} onChangeText={next} />
 * )
 * ```
 */
export function useSubject<T>(initialValue: T) {
  const subject = useMemo(() => new BehaviorSubject<T>(initialValue), [])
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    const subscription = subject.subscribe(setValue)
    return () => subscription.unsubscribe()
  }, [subject])

  return {
    value,
    next: (v: T) => subject.next(v),
    subject$: subject.asObservable(),
    getValue: () => subject.getValue(),
  }
}

// --------------------------------------------------
// useEventHandler
// --------------------------------------------------

/**
 * イベントハンドラをObservableとして使用
 *
 * @example
 * ```tsx
 * const [onClick, click$] = useEventHandler<void>()
 *
 * useEffect(() => {
 *   const sub = click$.pipe(
 *     debounceTime(300)
 *   ).subscribe(() => {
 *     console.log('Clicked!')
 *   })
 *   return () => sub.unsubscribe()
 * }, [click$])
 *
 * return <Button onPress={onClick}>Click</Button>
 * ```
 */
export function useEventHandler<T = void>(): [
  (value: T) => void,
  Observable<T>,
] {
  const subject = useMemo(() => new Subject<T>(), [])

  useEffect(() => {
    return () => subject.complete()
  }, [subject])

  return [(value: T) => subject.next(value), subject.asObservable()]
}

// --------------------------------------------------
// useSubscription
// --------------------------------------------------

/**
 * サブスクリプションを自動クリーンアップ
 *
 * @example
 * ```tsx
 * useSubscription(() =>
 *   interval(1000).subscribe(console.log)
 * )
 * ```
 */
export function useSubscription(
  factory: () => Subscription,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const subscription = factory()
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// --------------------------------------------------
// useObservableCallback
// --------------------------------------------------

/**
 * コールバック関数をObservableに変換
 *
 * @example
 * ```tsx
 * const [onSearch, searchResults] = useObservableCallback<string, User[]>(
 *   (input$) => input$.pipe(
 *     debounceTime(300),
 *     switchMap(query => searchUsers(query))
 *   )
 * )
 *
 * return (
 *   <>
 *     <Input onChangeText={onSearch} />
 *     {searchResults?.map(user => <UserItem key={user.id} user={user} />)}
 *   </>
 * )
 * ```
 */
export function useObservableCallback<TInput, TOutput>(
  transform: (input$: Observable<TInput>) => Observable<TOutput>,
  deps: React.DependencyList = []
): [(value: TInput) => void, TOutput | undefined] {
  const subject = useMemo(() => new Subject<TInput>(), [])
  const [output, setOutput] = useState<TOutput | undefined>(undefined)

  useEffect(() => {
    const subscription = transform(subject.asObservable()).subscribe({
      next: setOutput,
      error: (err) => console.error('useObservableCallback error:', err),
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, ...deps])

  useEffect(() => {
    return () => subject.complete()
  }, [subject])

  return [(value: TInput) => subject.next(value), output]
}

// --------------------------------------------------
// useLatestValue
// --------------------------------------------------

/**
 * 最新の値を保持（refとして）
 *
 * @example
 * ```tsx
 * const latestValue = useLatestValue(observable$)
 *
 * const handleClick = () => {
 *   console.log('Current value:', latestValue.current)
 * }
 * ```
 */
export function useLatestValue<T>(observable$: Observable<T>) {
  const ref = useMemo(() => ({ current: undefined as T | undefined }), [])

  useEffect(() => {
    const subscription = observable$.subscribe((value) => {
      ref.current = value
    })

    return () => subscription.unsubscribe()
  }, [observable$, ref])

  return ref
}
