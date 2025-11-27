import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // New Brand Palette
                brand: {
                    primary: '#A3DAD0', // Pastel Turquoise
                    accent: '#F4D3B2',  // Sand Orange
                    dark: '#212121',    // Dark Gray (Text)
                },
                functional: {
                    success: '#A8D5A2', // Pastel Green
                    error: '#F5B1B1',   // Pastel Red
                    warning: '#FDE68A', // Pastel Yellow
                },
                neutral: {
                    bg: '#F9FAFB',      // Off-white background
                    surface: '#FFFFFF', // Pure white surface
                    text: {
                        main: '#333333',
                        secondary: '#666666',
                    },
                    border: '#E5E7EB',
                },
                // Legacy seat colors (muted for new style)
                seat: {
                    1: colors.blue[400],
                    2: colors.red[400],
                    3: colors.emerald[400],
                    4: colors.purple[400],
                    5: colors.orange[400],
                    6: colors.cyan[400],
                },
            },
        },
    },
    plugins: [],
}
