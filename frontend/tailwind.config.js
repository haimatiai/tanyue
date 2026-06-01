/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          900: "#020408",
          800: "#060d18",
          700: "#0a1628",
          600: "#0f2040",
        },
        moon: {
          100: "#e8e0d0",
          200: "#c8bfaa",
          300: "#a89f88",
        },
        usa: {
          DEFAULT: "#3b82f6",
          dark: "#1d4ed8",
        },
        china: {
          DEFAULT: "#ef4444",
          dark: "#b91c1c",
        },
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      animation: {
        "spin-slow": "spin 30s linear infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "float-up": "floatUp 0.6s ease-out forwards",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        floatUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
