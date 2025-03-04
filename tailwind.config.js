/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F05193",
          light: "#F78FB3",
          dark: "#9A3C72",
        },
        secondary: {
          DEFAULT: "#9333EA",
          light: "#C084FC",
          dark: "#7E22CE",
        },
      },
    },
  },
  plugins: [],
};
