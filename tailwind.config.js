/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF4C29", // Vibrant Orange-Red from the image
        secondary: "#53B175", // Fresh Green
        background: "#F2F3F2", // Soft gray background
        card: {
          pink: "#F8E8EE",
          green: "#E8F5E9",
          orange: "#FFF3E0",
          blue: "#E3F2FD",
        }
      },
      borderRadius: {
        'xl': '15px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}
