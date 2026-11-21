/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — values come from CSS variables (see index.css)
        canvas: 'var(--bg)',
        card: 'var(--surface)',
        card2: 'var(--surface2)',
        line: 'var(--border)',
        ink: 'var(--text)',
        sub: 'var(--muted)',
        brand: 'var(--primary)',
        blue: 'var(--blue)',
        cyan: 'var(--cyan)',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
