import { Poppins } from "next/font/google";
import { title } from "process";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: '#142857',
      },
      fontFamily: {
        Poppins: ["Poppins"],

      },
    },
  },
  plugins: [],
} satisfies Config;
