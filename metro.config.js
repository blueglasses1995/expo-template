// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config').MetroConfig}
 */
const { getDefaultConfig } = require('expo/metro-config')
const { withTamagui } = require('@tamagui/metro-plugin')

const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
})

// rxdb workaround: prioritize .mjs over .ts for plugins
// rxdb v16 has index.ts files that re-export types, which Metro can't process
const sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== 'ts' && ext !== 'tsx'
)
sourceExts.unshift('mjs', 'ts', 'tsx') // mjs first, then ts/tsx
config.resolver.sourceExts = sourceExts

module.exports = withTamagui(config, {
  components: ['tamagui'],
  config: './tamagui.config.ts',
  outputCSS: './tamagui-web.css',
  cssInterop: true,
})
