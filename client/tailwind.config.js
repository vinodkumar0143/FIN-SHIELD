/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        foreground: '#F8FAFC',
        surface: {
          DEFAULT: '#111827',
          subtle: '#0F131D',
          elevated: '#1F2937',
          highlight: '#262A35',
        },
        border: {
          DEFAULT: '#1E293B',
          muted: '#161F30',
          elevated: '#334155',
          active: '#06B6D4',
        },
        brand: {
          cyan: '#06B6D4',
          'cyan-bright': '#4CD7F6',
          indigo: '#6366F1',
          'indigo-bright': '#818CF8',
        },
        risk: {
          low: {
            DEFAULT: '#10B981',
            bg: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.35)',
            text: '#34D399',
          },
          medium: {
            DEFAULT: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.35)',
            text: '#FBBF24',
          },
          high: {
            DEFAULT: '#F97316',
            bg: 'rgba(249, 115, 22, 0.12)',
            border: 'rgba(249, 115, 22, 0.35)',
            text: '#FB923C',
          },
          critical: {
            DEFAULT: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.12)',
            border: 'rgba(239, 68, 68, 0.35)',
            text: '#F87171',
          },
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#06B6D4',
          neutral: '#94A3B8',
        },
        muted: {
          DEFAULT: '#64748B',
          foreground: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.85rem' }],
        'mono-badge': ['10px', { lineHeight: '12px', letterSpacing: '0.06em' }],
        'mono-label': ['11px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        'mono-table': ['12px', { lineHeight: '16px', letterSpacing: '-0.01em' }],
        'mono-metric': ['24px', { lineHeight: '30px', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'glow-cyan': '0 0 16px rgba(6, 182, 212, 0.25)',
        'glow-indigo': '0 0 16px rgba(99, 102, 241, 0.25)',
        'glow-critical': '0 0 16px rgba(239, 68, 68, 0.25)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'command': '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
