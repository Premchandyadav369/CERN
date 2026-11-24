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
          border: '#000000',
          borderStrong: '#000000',
        },
        cern: {
          blue: '#0033A0',
          accent: '#4C7DFF',
          cyan: '#00E5FF',
          magenta: '#FF0055',
          yellow: '#FFE600',
          lime: '#00FF66',
          amber: '#FFB020',
          green: '#2ECC8F',
          red: '#FF5C5C',
        },
        detector: {
          track: '#FFE600',
          em: '#00FF66',
          had: '#00E5FF',
          muon: '#FF0055',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A3B8D8',
          muted: '#6B7C99',
          mono: '#C8D7F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal-md': '3px 3px 0px 0px #000000',
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '6px 6px 0px 0px #000000',
        'brutal-xl': '8px 8px 0px 0px #000000',
        'brutal-cyan-sm': '2px 2px 0px 0px #00E5FF',
        'brutal-cyan': '4px 4px 0px 0px #00E5FF',
        'brutal-cyan-lg': '6px 6px 0px 0px #00E5FF',
        'brutal-yellow-sm': '2px 2px 0px 0px #FFE600',
        'brutal-yellow': '4px 4px 0px 0px #FFE600',
        'brutal-yellow-lg': '6px 6px 0px 0px #FFE600',
        'brutal-magenta-sm': '2px 2px 0px 0px #FF0055',
        'brutal-magenta': '4px 4px 0px 0px #FF0055',
        'brutal-magenta-lg': '6px 6px 0px 0px #FF0055',
        'brutal-lime-sm': '2px 2px 0px 0px #00FF66',
        'brutal-lime': '4px 4px 0px 0px #00FF66',
        'brutal-lime-lg': '6px 6px 0px 0px #00FF66',
        'brutal-accent': '4px 4px 0px 0px #4C7DFF',
        'brutal-accent-sm': '2px 2px 0px 0px #4C7DFF',
        'brutal-blue': '4px 4px 0px 0px #0033A0',
        'brutal-amber': '4px 4px 0px 0px #FFB020',
        'brutal-emerald': '4px 4px 0px 0px #2ECC8F',
        'brutal-white': '4px 4px 0px 0px #FFFFFF',
        'brutal-white-sm': '2px 2px 0px 0px #FFFFFF',
      },
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        panel: '0px',
        cell: '0px',
        brutal: '0px',
      },
    },
  },
  plugins: [],
};

export default config;
