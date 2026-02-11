/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        textColor: "#2D2D2D",
        grayColor: "#D8D8D8",
        blueColor: "#3366FF",
        yellowColor: "#F8D57E",
        pinkColor: "#F2BFAF",
        redColor: "#FF6250",
        greenColor: "#009379",
        lightGreen: "#F2FAF8",
        lightPurple: "#ECE7FB",
        offWhiteColor: "#FCFAF5",
        whiteColor: "#FFFFFF",
        borderColor: "#D0D0D0",
      },
    },
  },
  plugins: [],
};
