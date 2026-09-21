import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        "liquid-mid": "rgb(var(--liquid-mid) / <alpha-value>)",
        "liquid-foam": "rgb(var(--liquid-foam) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Georgia", "Times New Roman", "Noto Serif SC", "serif"],
      },
      maxWidth: {
        article: "42.5rem",
        site: "80rem",
      },
      boxShadow: {
        card: "0 24px 70px rgba(30, 24, 18, 0.08)",
        "card-dark": "0 24px 70px rgba(0, 0, 0, 0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
