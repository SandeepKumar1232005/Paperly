/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                surface: {
                    DEFAULT: 'var(--surface)',
                    hover: 'var(--surface-hover)',
                    elevated: 'var(--surface-elevated)',
                },
                theme: {
                    bg: 'var(--bg-primary)',
                    'bg-secondary': 'var(--bg-secondary)',
                    'bg-tertiary': 'var(--bg-tertiary)',
                    text: 'var(--text-primary)',
                    'text-secondary': 'var(--text-secondary)',
                    'text-tertiary': 'var(--text-tertiary)',
                    border: 'var(--border)',
                    'border-hover': 'var(--border-hover)',
                    accent: 'var(--accent)',
                    'accent-hover': 'var(--accent-hover)',
                    'accent-muted': 'var(--accent-muted)',
                },
            },
            // Smooth transition timing functions
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'smooth-in': 'cubic-bezier(0.4, 0, 1, 1)',
                'smooth-out': 'cubic-bezier(0, 0, 0.2, 1)',
                'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },
            transitionDuration: {
                '150': '150ms',
                '200': '200ms',
                '250': '250ms',
            },
            backdropBlur: {
                xs: '2px',
                '2xl': '40px',
                '3xl': '64px',
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
                'glass-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.2)',
                'glow-violet': '0 0 30px -5px rgba(139, 92, 246, 0.4)',
                'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.4)',
                'glow-fuchsia': '0 0 30px -5px rgba(217, 70, 239, 0.4)',
                'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            },
            animation: {
                blob: "blob 7s infinite",
                'bounce-slow': 'bounce 3s infinite',
                scroll: 'scroll 20s linear infinite',
                'fade-in': 'fadeIn 0.3s ease-out',
                'fade-in-up': 'fadeInUp 0.4s ease-out',
                'fade-in-down': 'fadeInDown 0.4s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'slide-in-left': 'slideInLeft 0.3s ease-out',
                'text': 'text 5s ease infinite',
                'float': 'float 4s ease-in-out infinite',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'gradient': 'gradientShift 4s ease infinite',
            },
            keyframes: {
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                text: {
                    '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
                    '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 15px -3px rgba(139, 92, 246, 0.3)' },
                    '50%': { boxShadow: '0 0 25px -3px rgba(139, 92, 246, 0.5)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                gradientShift: {
                    '0%': { backgroundPosition: '0% center' },
                    '50%': { backgroundPosition: '100% center' },
                    '100%': { backgroundPosition: '0% center' },
                },
            },
        },
    },
    plugins: [],
}
