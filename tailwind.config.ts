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
        hub: {
          blue: "#0062D2",
          "blue-dark": "#0047A5",
          "blue-light": "#EBF4FF",
          "blue-subtle": "#F0F7FF",
          cyan: "#00A3FF",
          dark: "#0F172A",
          footer: "#0C1F38",
          red: "#E62E2E",
          "red-hover": "#C92020",
          gray: {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          }
        }
      },
      fontFamily: {
        sans: ["'Inter'", "'Tajawal'", "Segoe UI", "Tahoma", "sans-serif"],
        arabic: ["'Tajawal'", "Segoe UI", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px -1px rgba(0, 0, 0, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 10px 25px -3px rgba(0, 98, 210, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05)",
        badge: "0 2px 6px rgba(230, 46, 46, 0.2)",
      }
    },
  },
  plugins: [],
};
export default config;
