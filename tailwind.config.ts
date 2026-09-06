import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /**
       * A near-square radius scale.
       *
       * The app used `rounded-xl` (12px) as its default surface, ~900 times across 51 tool
       * pages, which read as soft and consumer-ish rather than like a professional tool.
       * Overriding the scale here squares everything off at once instead of editing every
       * call site, and keeps the existing class names meaningful.
       *
       * `full` is deliberately untouched: step indicators, page-number badges, the credit
       * pill and spinners are genuinely circular, and squaring those looks broken.
       */
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '3px',
        '3xl': '4px',
        full: '9999px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
