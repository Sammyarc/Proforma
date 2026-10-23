/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },

    fontFamily: {
      satoshi: ['Satoshi', 'sans-serif'],
      clash: ['Clash-Display', 'sans-serif'],
    },

    extend: {
      colors: {
        // Legacy aliases (keep during migration, remove in Phase 6)
        Disabled: "#7F8487",
        White: "#FFFFFF",
        MilkWhite: "#F8FAFC",
        Gray900: "#393646",
        Gray800: "#3C3D37",

        // New design system
        accent: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        status: {
          success:       '#22C55E',
          'success-bg':  '#F0FDF4',
          warning:       '#EAB308',
          'warning-bg':  '#FEFCE8',
          error:         '#EF4444',
          'error-bg':    '#FEF2F2',
        },
      },

      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display':    ['3rem',   { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['2.25rem',{ lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.3' }],
        'heading':    ['1.5rem',   { lineHeight: '1.3' }],
        'heading-sm': ['1.25rem',  { lineHeight: '1.4' }],
        'body-lg':    ['1.125rem', { lineHeight: '1.6' }],
        'body':       ['1rem',     { lineHeight: '1.6' }],
        'body-sm':    ['0.875rem', { lineHeight: '1.5' }],
        'caption':    ['0.75rem',  { lineHeight: '1.5' }],
      },

      spacing: {
        'sidebar':    '240px',
        'sidebar-sm': '64px',
        'sidebar-tab':'72px',
        'header':     '64px',
        'mobile-nav': '72px',
        'section':    '96px',
        'section-sm': '64px',
      },

      borderRadius: {
        'card':   '12px',
        'button': '8px',
        'input':  '8px',
        'badge':  '6px',
      },

      boxShadow: {
        'card':       '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'elevated':   '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
      },

      animation: {
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        scaleIn: {
          '0%':   { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
}
