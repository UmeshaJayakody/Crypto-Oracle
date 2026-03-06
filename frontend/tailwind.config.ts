import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oracle: {
          bg:       "#0a0a0f",
          surface:  "#0f0f18",
          card:     "#13131f",
          border:   "#1e1e2e",
          cyan:     "#00d4ff",
          amber:    "#f59e0b",
          emerald:  "#10b981",
          rose:     "#f43f5e",
          muted:    "#6b7280",
          text:     "#e2e8f0",
        },
      },
      fontFamily: {
        mono:    ["IBM Plex Mono", "monospace"],
        display: ["DM Serif Display", "serif"],
        sans:    ["DM Sans", "sans-serif"],
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "arc-draw":    "arcDraw 1.2s ease-out forwards",
        "fade-in":     "fadeIn 0.4s ease-out forwards",
        "slide-up":    "slideUp 0.3s ease-out forwards",
        "glow-cyan":   "glowCyan 2s ease-in-out infinite",
      },
      keyframes: {
        arcDraw: {
          "0%":   { strokeDashoffset: "283" },
          "100%": { strokeDashoffset: "var(--target-offset)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowCyan: {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(0,212,255,0.3)" },
          "50%":      { boxShadow: "0 0 20px 6px rgba(0,212,255,0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
