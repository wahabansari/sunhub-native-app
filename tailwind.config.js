/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './index.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B00',
        'primary-light': '#FFEDD9',
        accent: '#FDBA74',
        ink: '#1A2B3C',
        price: '#C95200',
        surface: '#F5F6F8',
        border: '#E5E7EB',
        success: '#16A34A',
        danger: '#DC2626',
        send: '#2563EB',
        'on-primary': '#FFFFFF',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      fontSize: {
        title: '24px',
        body: '16px',
        caption: '13px',
      },
      fontFamily: {
        inter: 'Inter_400Regular',
      },
    },
  },
  plugins: [],
};
