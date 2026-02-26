//** @type {import('tailwindcss').Config} */
//export default {
//  content: [],
 // theme: {
 //   extend: {},
 // },
 // plugins: [],
//}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        morpheus: {
          bg: "#0a0a0f",
          surface: "#111118",
          border: "#1e1e2e",
          accent: "#7c3aed",
          "accent-light": "#8b5cf6",
          text: "#e2e8f0",
          muted: "#64748b",
          dark: "#060609",
        },
      },
      fontFamily: {
        display: ["'DM Sans'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

