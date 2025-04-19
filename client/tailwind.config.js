/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImageLogin: {
        'login-img': "url('/assets/sidebarImg6.jpg')",
      },

      fontSize: {
        'font-esm': "12px",
      },

      boxShadow: {
        custom: "0px 0px 10px rgba(0, 0, 0, 0.8)",
        custom1: "2px 2px 5px rgba(0, 0, 0, 0.8)",
      },

      colors: {
        charcole: "#325d81", //header
        navy: "#4682B4", //side bar
        navyLight: "#3A3AB8",
        indigo: "#4b0082",
      },
    },
  },
  plugins: [],
  varients: {
    extend: {
      display: ["focus-group"],
    },
  },
};
