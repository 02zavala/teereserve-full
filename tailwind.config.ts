/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['var(--font-montserrat)'],
        'dm-serif': ['var(--font-dm-serif)'],
        'sans': ['Playfair Display', 'serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'golf-green': {
          50: '#f0f9f4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1E5631',
          600: '#1E5631',
          700: '#15503d',
          800: '#134e29',
          900: '#0f3d20',
        },
        'golf-gold': {
          50: '#fffcf0',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#D4AF37',
          600: '#D4AF37',
          700: '#b8941f',
          800: '#9c7b1a',
          900: '#7d6316',
        },

        'golf-beige': {
          50: '#fefefe',
          100: '#fdfdf8',
          200: '#fbfbf0',
          300: '#f9f9e8',
          400: '#f7f7e0',
          500: '#F5F5DC',
          600: '#F5F5DC',
          700: '#e8e8c5',
          800: '#dbdbae',
          900: '#cecea7',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "gradient-shift": {
          "0%": { 
            backgroundPosition: "0% 50%" 
          },
          "50%": { 
            backgroundPosition: "100% 50%" 
          },
          "100%": { 
            backgroundPosition: "0% 50%" 
          },
        },
        "shimmer": {
          "0%": { 
            backgroundPosition: "0% 0%" 
          },
          "25%": { 
            backgroundPosition: "100% 100%" 
          },
          "50%": { 
            backgroundPosition: "100% 0%" 
          },
          "75%": { 
            backgroundPosition: "0% 100%" 
          },
          "100%": { 
            backgroundPosition: "0% 0%" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-shift": "gradient-shift 8s ease-in-out infinite",
        "shimmer": "shimmer 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
