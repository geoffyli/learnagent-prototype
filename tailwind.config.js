/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        'near-black': '#1e293b',
        'deep-dark': '#0f172a',
        'primary': '#2563eb',
        'primary-hover': '#1d4ed8',
        'accent': '#7c3aed',
        'accent-light': '#ede9fe',
        'surface': '#f8fafc',
        'surface-hover': '#f1f5f9',
        'card-border': '#e2e8f0',
        'border-light': '#f1f5f9',
        'muted': '#64748b',
        'muted-light': '#94a3b8',
        'success': '#16a34a',
        'success-light': '#f0fdf4',
        'warning': '#d97706',
        'warning-light': '#fffbeb',
        'error': '#dc2626',
        'error-light': '#fef2f2',
        'locked': '#94a3b8',
      },
      borderRadius: {
        'sharp': '4px',
        'comfortable': '8px',
        'generous': '16px',
        'large': '20px',
        'signature': '22px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      letterSpacing: {
        'display': '-1.44px',
        'display-sm': '-1.2px',
        'heading': '-0.48px',
        'subheading': '-0.32px',
        'code': '0.16px',
        'label': '0.28px',
      },
      lineHeight: {
        'display': '1',
        'tight': '1.2',
        'snug': '1.3',
        'body': '1.4',
        'relaxed': '1.5',
        'button': '1.71',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'typing-dot': 'typingDot 1.4s ease-in-out infinite',
        'inbox-pulse': 'inboxPulse 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        typingDot: {
          '0%, 60%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '30%': { opacity: '1', transform: 'scale(1)' },
        },
        inboxPulse: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
