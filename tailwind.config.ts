import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        text: "rgb(245, 215, 225)",
        background: "rgb(26, 7, 14)",
        primary: "rgb(228, 147, 178)",
        secondary: "rgb(94, 140, 35)",
        accent: "rgb(90, 213, 89)",
        border: "rgba(228, 147, 178, 0.2)",
        input: "rgba(228, 147, 178, 0.1)",
        ring: "rgb(90, 213, 89)",
        foreground: "rgb(245, 215, 225)",
        muted: {
          DEFAULT: "rgba(228, 147, 178, 0.1)",
          foreground: "rgba(245, 215, 225, 0.7)",
        },
        popover: {
          DEFAULT: "rgb(26, 7, 14)",
          foreground: "rgb(245, 215, 225)",
        },
        card: {
          DEFAULT: "rgba(26, 7, 14, 0.8)",
          foreground: "rgb(245, 215, 225)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
