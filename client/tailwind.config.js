export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    // Bangla glyphs fall back to Noto Sans Bengali automatically, English uses Inter
    fontFamily: { sans: ['Inter', 'Noto Sans Bengali', 'system-ui', 'sans-serif'] },
    colors: { brand: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' } },
  } },
  plugins: [],
};
