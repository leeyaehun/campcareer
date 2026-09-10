import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        display: ["var(--font-inter)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
        pixel: ["var(--font-press-start)", "'Press Start 2P'", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          press: "hsl(var(--brand-press))",
          tint: "hsl(var(--brand-tint))",
          bright: "hsl(var(--brand-bright))",
        },
        campcareer: {
          ink: "hsl(var(--cc-ink))",
          "ink-secondary": "hsl(var(--cc-ink-secondary))",
          muted: "hsl(var(--cc-muted))",
          border: "hsl(var(--cc-border))",
          canvas: "hsl(var(--cc-canvas))",
          surface: "hsl(var(--cc-surface))",
          "social-ink": "hsl(var(--cc-social-ink))",
          success: "hsl(var(--cc-success))",
          caution: "hsl(var(--cc-caution))",
          negative: "hsl(var(--cc-negative))",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      spacing: {
        "cc-1": "var(--cc-space-1)",
        "cc-2": "var(--cc-space-2)",
        "cc-3": "var(--cc-space-3)",
        "cc-4": "var(--cc-space-4)",
        "cc-5": "var(--cc-space-5)",
        "cc-6": "var(--cc-space-6)",
        "cc-8": "var(--cc-space-8)",
        "cc-10": "var(--cc-space-10)",
        "cc-12": "var(--cc-space-12)",
        "cc-16": "var(--cc-space-16)",
      },
      borderRadius: {
        "cc-control": "var(--cc-radius-control)",
        "cc-surface": "var(--cc-radius-surface)",
        "cc-large": "var(--cc-radius-large)",
        "cc-featured": "var(--cc-radius-featured)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "cc-surface": "var(--cc-shadow-surface)",
        "cc-raised": "var(--cc-shadow-raised)",
      },
      transitionDuration: {
        "cc-fast": "var(--cc-duration-fast)",
        "cc-standard": "var(--cc-duration-standard)",
      },
    },
  },
  plugins: [],
};
export default config;
