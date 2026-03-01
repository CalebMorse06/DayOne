import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: "#0a0a1a",
          800: "#12122a",
          700: "#1a1a3e",
          600: "#252552",
        },
        neon: {
          purple: "#a855f7",
          cyan: "#22d3ee",
          magenta: "#ec4899",
          orange: "#f97316",
          green: "#34d399",
        },
        star: {
          white: "#e2e8f0",
          dim: "#94a3b8",
          faint: "#475569",
        },
        warm: {
          amber: "#f59e0b",
          gold: "#eab308",
          copper: "#d97706",
          cream: "#fef3c7",
        },
        retro: {
          teal: "#5eead4",
          coral: "#fb7185",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "bounce-in": "bounceIn 0.5s ease-out",
        "xp-fill": "xpFill 0.8s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "star-twinkle": "starTwinkle 3s ease-in-out infinite",
        "progress-ring": "progressRing 1s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-warm": "pulseWarm 2s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        xpFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--xp-width)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px currentColor, 0 0 10px currentColor" },
          "50%": { boxShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor" },
        },
        starTwinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        progressRing: {
          "0%": { strokeDashoffset: "var(--ring-circumference)" },
          "100%": { strokeDashoffset: "var(--ring-offset)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseWarm: {
          "0%, 100%": { boxShadow: "0 0 5px #f59e0b33, 0 0 10px #f59e0b22" },
          "50%": { boxShadow: "0 0 10px #f59e0b55, 0 0 20px #f59e0b33, 0 0 30px #f59e0b22" },
        },
      },
      boxShadow: {
        "glow-purple": "0 0 10px #a855f7, 0 0 20px #a855f744",
        "glow-cyan": "0 0 10px #22d3ee, 0 0 20px #22d3ee44",
        "glow-magenta": "0 0 10px #ec4899, 0 0 20px #ec489944",
        "glow-orange": "0 0 10px #f97316, 0 0 20px #f9731644",
        "glow-green": "0 0 10px #34d399, 0 0 20px #34d39944",
        "glow-warm": "0 0 10px #f59e0b55, 0 0 20px #f59e0b33",
      },
    },
  },
  plugins: [],
}
export default config
