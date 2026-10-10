import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#f6e2ec",
          light: "#fff9fb",
          subtle: "#fbf2f6",
        },
        ink: {
          DEFAULT: "#27566c",
          light: "#517e94",
          dark: "#143747",
        },
        teal: {
          DEFAULT: "#168eac",
          dark: "#08718d",
          light: "#e4f5f9",
          border: "rgba(22, 142, 172, 0.28)",
        },
        rose: {
          DEFAULT: "#dc4f89",
          dark: "#b8356c",
          light: "#fae8f0",
          subtle: "rgba(220, 79, 137, 0.12)",
        },
        yellow: {
          DEFAULT: "#f6dd59",
          dark: "#d9bc27",
        },
        violet: {
          DEFAULT: "#9a7ab4",
          light: "#f1ebf7",
        },
        green: {
          DEFAULT: "#98c97e",
          light: "#ebf6e5",
        },
        chalk: {
          bg: "#0c1b24",
          surface: "rgba(16, 33, 43, 0.9)",
          border: "rgba(38, 198, 218, 0.35)",
          teal: "#2dd4bf",
          rose: "#fb7185",
          yellow: "#fde047",
          green: "#86efac",
          white: "#f8fafc",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"SF Pro"',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Kaku Gothic Pro"',
          '"Hiragino Sans"',
          "sans-serif",
        ],
      },
      boxShadow: {
        festive: "6px 6px 0px rgba(22, 142, 172, 0.16)",
        rosefestive: "6px 6px 0px rgba(220, 79, 137, 0.2)",
        chalkglow: "0 0 20px rgba(45, 212, 191, 0.35)",
      },
      borderRadius: {
        festive: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
