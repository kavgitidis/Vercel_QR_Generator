/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mocha: {
          base: "#1e1e2e",
          mantle: "#181825",
          crust: "#11111b",
          text: "#cdd6f4",
          subtext: "#a6adc8",
          surface: "#313244",
          overlay: "#45475a",
          blue: "#89b4fa",
          lavender: "#b4befe",
          green: "#a6e3a1",
          peach: "#fab387",
          maroon: "#eba0ac",
          mauve: "#cba6f7",
        }
      }
    },
  },
  plugins: [],
}
