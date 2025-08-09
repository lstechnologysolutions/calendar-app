/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: ({ opacityValue }) =>
          opacityValue == null ? `rgb(var(--color-primary))` : `rgb(var(--color-primary) / ${opacityValue})`,
        "primary-content": ({ opacityValue }) =>
          opacityValue == null ? `rgb(var(--color-primary-content))` : `rgb(var(--color-primary-content) / ${opacityValue})`,
        "base-100": ({ opacityValue }) =>
          opacityValue == null ? `rgb(var(--color-base-100))` : `rgb(var(--color-base-100) / ${opacityValue})`,
        "base-200": ({ opacityValue }) =>
          opacityValue == null ? `rgb(var(--color-base-200))` : `rgb(var(--color-base-200) / ${opacityValue})`,
        "base-300": ({ opacityValue }) =>
          opacityValue == null ? `rgb(var(--color-base-300))` : `rgb(var(--color-base-300) / ${opacityValue})`,
        "base-content": ({ opacityValue }) =>
          opacityValue == null ? `rgb(var(--color-base-content))` : `rgb(var(--color-base-content) / ${opacityValue})`,
      },
      borderColor: {
        DEFAULT: `rgb(var(--color-base-200))`,
      },
    },
  },
  plugins: [],
};
