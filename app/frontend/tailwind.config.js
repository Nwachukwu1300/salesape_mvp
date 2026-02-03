module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
      container: {
        center: true,
        padding: '1rem',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(16,24,40,0.04)',
        md: '0 10px 30px rgba(2,6,23,0.08)',
        lg: '0 30px 60px rgba(2,6,23,0.12)'
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(.19,1,.22,1)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0px)' }
        }
      }
    },
  },
  plugins: [],
};
