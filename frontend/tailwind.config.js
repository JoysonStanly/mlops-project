/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 80px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'aurora-gradient': 'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 35%), radial-gradient(circle at top right, rgba(16,185,129,0.18), transparent 30%), linear-gradient(135deg, #081120 0%, #0f172a 40%, #111827 100%)',
      },
    },
  },
  plugins: [],
};
