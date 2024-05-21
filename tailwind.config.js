/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      backgroundImage: {
        "bg-clear-sky": "url('/files/Images/bg-clear-sky.png')",
        "bg-cloudy": "url('/files/Images/bg-cloudy.jpg')",
        "bg-rainy": "url('/files/Images/bg-rainy.jpg')",
        "bg-snowy": "url('/files/Images/bg-snowy.jpg')",
        "bg-windy": "url('/files/Images/bg-windy.jpg')",
        "bg-night": "url('/files/Images/bg-night.png')",
        "bg-misty": "url('/files/Images/bg-mist.jpg')",
        "bg-thunderstorm": "url('/files/Images/bg-thunderstorm.jpg')",
        "bg-drizzle": "url('/files/Images/Images/bg-drizzle.jpg')",
        "bg-default": "url('/files/Images/bg-default.png')",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(-10%)" },
          "50%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
