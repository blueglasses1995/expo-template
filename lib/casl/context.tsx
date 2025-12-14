import { createContextualCan } from '@casl/react'
import { createContext, useContext } from 'react'
import { type AppAbility, defaultAbility } from './ability'

// Ability Context
export const AbilityContext = createContext<AppAbility>(defaultAbility)

// Can コンポーネント（CASL 公式）
export const Can = createContextualCan(AbilityContext.Consumer)

// Ability を取得するフック
export function useAbility(): AppAbility {
  return useContext(AbilityContext)
}
