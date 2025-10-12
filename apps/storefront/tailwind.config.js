/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00968A',
          50: '#E6F6F4',
          100: '#C2ECE7',
          200: '#8CDCD2',
          300: '#56CCBE',
          400: '#2EBEA9',
          500: '#00968A',
          600: '#007D74',
          700: '#00665F',
          800: '#004F49',
          900: '#003833',
        },
        secondary: {
          DEFAULT: '#9E4E44',
          50: '#FBEFEB',
          100: '#F4D5D0',
          200: '#E8AFA5',
          300: '#DC8979',
          400: '#CF6250',
          500: '#9E4E44',
          600: '#883C33',
          700: '#702D26',
          800: '#582019',
          900: '#3F130D',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#6B7280',
          600: '#4B5563',
          700: '#1F2937',
          800: '#111827',
          900: '#0B0F19',
        },
        background: '#FAFAFA',
        surface: '#FFFFFF',
        border: '#E4E4E7',
        error: '#DC2626',
        warning: '#F59E0B',
        success: '#16A34A',
        info: '#3B82F6',
        overlay: 'rgba(0,0,0,0.45)',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },

      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        full: '9999px',
      },

      boxShadow: {
        xs: '0 1px 1px rgba(0,0,0,0.05)',
        sm: '0 2px 4px rgba(0,0,0,0.06)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 8px 12px rgba(0,0,0,0.12)',
        xl: '0 12px 20px rgba(0,0,0,0.14)',
        glass: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.1)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
      },

      transitionDuration: {
        DEFAULT: '250ms',
        fast: '150ms',
        slow: '400ms',
      },

      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        glassFade: {
          '0%': { backdropFilter: 'blur(0px)', opacity: 0 },
          '100%': { backdropFilter: 'blur(12px)', opacity: 1 },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
      },

      animation: {
        fadeIn: 'fadeIn 0.4s ease-in-out',
        pulseSoft: 'pulseSoft 1.5s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        slideUp: 'slideUp 0.5s ease-out',
        popIn: 'popIn 0.3s ease-out',
        glassFade: 'glassFade 0.5s ease-in-out',
      },

      gradientColorStops: {
        'primary-gradient': ['#00968A', '#2EBEA9', '#56CCBE'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
