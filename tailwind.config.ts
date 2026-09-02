import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1a1a1a",
          800: "#2a2a2a",
          700: "#404040",
          600: "#5c5c5c",
          500: "#6b6b6b",
          400: "#8a8a8a",
          300: "#a3a3a3",
          200: "#d4d4d0",
          100: "#e5e5e0",
          50: "#f5f5f3",
        },
        accent: {
          DEFAULT: "#2f5d62",
          soft: "#e7f1f2",
          hover: "#264a4d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        editorial: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Book Antiqua",
          "Georgia",
          "serif",
        ],
      },
      maxWidth: {
        content: "1280px",
      },
      spacing: {
        sidebar: "256px",
      },
    },
  },
  plugins: [],
};

export default config;