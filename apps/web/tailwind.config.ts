import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#060A12',
          sub: '#0A0F1A',
          surface: '#0D1422',
          raised: '#131C2E',
          border: 'rgba(255, 255, 255, 0.08)',
          borderStrong: 'rgba(255, 255, 255, 0.16)',
        },
        cern: {
          blue: '#0033A0',
          accent: '#4C7DFF',
          cyan: '#3DD6FF',
          magenta: '#E04FD0',
          amber: '#FFB020',
          green: '#2ECC8F',
          red: '#FF5C5C',
        },
        detector: {
          track: '#FFD166',
          em: '#06D6A0',
          had: '#118AB2',
          muon: '#EF476F',
        },
        text: {
          primary: '#E8EEF9',
          secondary: '#9FB0CC',
          muted: '#6B7C99',
          mono: '#C8D7F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        panel: '6px',
        cell: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
