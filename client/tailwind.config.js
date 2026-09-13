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
        // Base canvas & foreground with alpha modifier support
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',

        // Card & elevated surfaces (shadcn/ui semantic compatibility)
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'hsl(var(--border) / <alpha-value>)',
          muted: '#141C2B',
          elevated: '#2A374F',
          active: '#0EA5E9',
        },
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',

        // Enterprise Financial Surface Hierarchy
        surface: {
          DEFAULT: '#0F1523',
          subtle: '#0B101D',
          elevated: '#172033',
          highlight: '#1C263C',
        },

        // Restrained Financial Brand Accents
        brand: {
          cyan: '#0EA5E9',
          'cyan-bright': '#38BDF8',
          'cyan-hover': '#0284C7',
          'cyan-subtle': 'rgba(14, 165, 233, 0.08)',
          indigo: '#6366F1',
          'indigo-bright': '#818CF8',
        },

        // Financial Risk Semantics (Low: 0-39, Medium: 40-69, High: 70-100)
        risk: {
          low: {
            DEFAULT: '#10B981',
            bg: 'rgba(16, 185, 129, 0.08)',
            border: 'rgba(16, 185, 129, 0.25)',
            text: '#34D399',
          },
          medium: {
            DEFAULT: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.08)',
            border: 'rgba(245, 158, 11, 0.25)',
            text: '#FBBF24',
          },
          high: {
            DEFAULT: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.08)',
            border: 'rgba(239, 68, 68, 0.25)',
            text: '#F87171',
          },
          critical: {
            DEFAULT: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.08)',
            border: 'rgba(239, 68, 68, 0.25)',
            text: '#F87171',
          },
        },

        // Clean Status Indicators
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#0EA5E9',
          neutral: '#94A3B8',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.85rem' }],
        'mono-badge': ['10px', { lineHeight: '12px', letterSpacing: '0.05em' }],
        'mono-label': ['11px', { lineHeight: '14px', letterSpacing: '0.03em' }],
        'mono-table': ['12px', { lineHeight: '16px', letterSpacing: '-0.01em' }],
        'mono-metric': ['24px', { lineHeight: '30px', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        panel: '0 2px 10px -1px rgba(0, 0, 0, 0.4), 0 1px 3px -1px rgba(0, 0, 0, 0.3)',
        elevated: '0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        command: '0 16px 36px -6px rgba(0, 0, 0, 0.65), 0 4px 12px -2px rgba(0, 0, 0, 0.4)',
        'glow-cyan': '0 0 12px rgba(14, 165, 233, 0.18)',
        'glow-indigo': '0 0 12px rgba(99, 102, 241, 0.18)',
        'glow-critical': '0 0 12px rgba(239, 68, 68, 0.20)',
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
