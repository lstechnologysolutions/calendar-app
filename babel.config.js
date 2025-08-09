const path = require('path');

module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            'expo-router/node/locales': './src/locales',
          },
        },
      ],
      "@lingui/babel-plugin-lingui-macro",
    ],
  };
};
