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
                'brand-green': '#58CC02',
                'brand-red': '#FF4B4B',
                'brand-blue': '#1CB0F6',
                'surface-gray': '#E5E5E5',
                seat: {
                    1: colors.blue[600],
                    2: colors.red[600],
                    3: colors.emerald[600],
                    4: colors.purple[600],
                    5: colors.orange[600],
                    6: colors.cyan[600],
                },
            },
        },
    },
    plugins: [],
}
