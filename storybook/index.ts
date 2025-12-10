// Storybook React Native v10 currently lacks proper TypeScript types for getStorybookUI,
// so we require it to avoid type errors while keeping functionality.
// Storybook RN v10: use generated requires + start() to obtain the UI.
import AsyncStorage from '@react-native-async-storage/async-storage'
import { view } from '../.rnstorybook/storybook.requires'

export default view.getStorybookUI({
  enableWebsockets: false,
  shouldPersistSelection: true,
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
})

