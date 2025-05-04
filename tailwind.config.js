/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6", // Modern blue as primary color
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6", // Main primary
          600: "#2563EB", // Darker primary for active states
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        secondary: {
          DEFAULT: "#8B5CF6", // Purple as secondary color
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6", // Main secondary
          600: "#7C3AED", // Darker secondary for active states
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        accent: {
          DEFAULT: "#F59E0B", // Warm amber accent color
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // Main accent
          600: "#D97706", // Darker accent for active states
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        neutral: {
          DEFAULT: "#F9FAFB", // Light background
          50: "#F9FAFB",
          100: "#F3F4F6", // Slightly darker background
          200: "#E5E7EB", // Border color
          300: "#D1D5DB", // Disabled state
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151", // Secondary text
          800: "#1F2937", // Primary text
          900: "#111827", // Headings
        },
        success: {
          DEFAULT: "#10B981", // Success messages/indicators
          light: "#A7F3D0",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#FBBF24", // Warning messages/indicators
          light: "#FDE68A",
          dark: "#D97706",
        },
        error: {
          DEFAULT: "#EF4444", // Error messages/indicators
          light: "#FCA5A5",
          dark: "#B91C1C",
        },
        info: {
          DEFAULT: "#3B82F6", // Info messages/indicators (same as primary)
          light: "#93C5FD",
          dark: "#1D4ED8",
        },
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2.5rem",
      },
    },
  },
  plugins: [],
};
