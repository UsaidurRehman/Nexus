/** @type {import('tailwindcss').Config} */
/**
 * NEXUS '26 brand palette.
 *
 * Sampled from the official Canva design system:
 *   • BIIT wordmark asset        -> #0531D8 (official BIIT blue, the primary)
 *   • Rendered NEXUS '26 banner  -> navy / royal / cyan / mint range
 *   • Rawalpindi map texture     -> the faint grid motif used behind sections
 *
 * Mirrored in BRAND.COLORS inside src/config.js. Change both together.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nexus: {
          ink: '#01061F', // page background
          abyss: '#020A3D', // raised background
          navy: '#020B83', // deep brand navy
          deep: '#03117E',
          royal: '#021CAB',
          blue: '#0531D8', // ★ BIIT official blue — primary
          azure: '#0B4FE8',
          cyan: '#12A4D9',
          teal: '#4FCCA8',
          green: '#3BE38B',
          mint: '#7DFBA4', // ★ accent
          peri: '#8A95E8',
          lilac: '#B4BFFD',
          paper: '#F7F7FC',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Arial Black"', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(125, 251, 164, 0.45)',
        card: '0 24px 60px -28px rgba(1, 6, 31, 0.95)',
        lift: '0 32px 70px -30px rgba(5, 49, 216, 0.55)',
      },
      backgroundImage: {
        'nexus-grad': 'linear-gradient(135deg, #020B83 0%, #0531D8 50%, #12A4D9 85%, #3BE38B 130%)',
        'nexus-sheen': 'linear-gradient(100deg, #F7F7FC 20%, #B4BFFD 55%, #7DFBA4 95%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.22,1,.36,1) both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
