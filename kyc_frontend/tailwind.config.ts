import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── Colors ────────────────────────────────────────────────────────
      colors: {
        forest: {
          DEFAULT: '#1a3d2e',
          dark:    '#1e4937',
          mid:     '#2d6147',
          light:   '#3d7a5a',
        },
        lime: {
          DEFAULT: '#7fd957',
          bright:  '#8ce563',
        },
        'mint-surface': '#f0f9f4',
        'off-white':    '#f8f9fa',
        charcoal:       '#1f2937',
        'medium-gray':  '#6b7280',
        'light-gray':   '#e5e7eb',
        success:        '#10b981',
        warning:        '#f59e0b',
        error:          '#ef4444',
        info:           '#3b82f6',
      },

      // ── Typography ────────────────────────────────────────────────────
      fontFamily: {
        display: ['Space Grotesk', 'monospace'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ── Spacing ───────────────────────────────────────────────────────
      spacing: {
        sidebar:             '240px',
        'sidebar-collapsed': '64px',
        header:              '64px',
      },

      width: {
        sidebar:             '240px',
        'sidebar-collapsed': '64px',
      },
      height: {
        header: '64px',
      },

      // ── Border radius ─────────────────────────────────────────────────
      borderRadius: {
        sm:   '4px',
        md:   '6px',
        lg:   '8px',
        xl:   '12px',
        '2xl':'16px',
      },

      // ── Box shadows ───────────────────────────────────────────────────
      boxShadow: {
        card:        '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        modal:       '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
        dropdown:    '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
      },

      // ── Keyframes & animations ────────────────────────────────────────
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'slide-up':   'slide-up 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'fade-in':    'fade-in 0.15s ease-out',
        shimmer:      'shimmer 1.5s infinite linear',
      },

      // ── Transitions ───────────────────────────────────────────────────
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
