/** Storybook React Native main config */
module.exports = {
  stories: ['../storybook/stories/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-ondevice-actions', '@storybook/addon-ondevice-controls'],
  reactNative: {
    packagerPort: 7007,
  },
};

