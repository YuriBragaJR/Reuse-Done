import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#f2fbf5',
          100: '#e1f6e8',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
        },
        earth: {
          100: '#f5f5f4',
          800: '#44403c',
          900: '#292524'
        }
      }
    },
  },
  plugins: [],
};
export default config;