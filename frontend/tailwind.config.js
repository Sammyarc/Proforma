
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      md: "768px",
      lg: "976px",
      xl: "1300px",
    },

    fontFamily: {
      satoshi: ['Satoshi', 'sans-serif'],
      clash: ['Clash-Display', 'sans-serif'],
    },

    extend: {
      colors: {
        Disabled: "#7F8487",
        White: "#FFFFFF",
        MilkWhite: "#F8FAFC",
        Gray900: "#393646",
        Gray800: "#3C3D37",
    },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
}


