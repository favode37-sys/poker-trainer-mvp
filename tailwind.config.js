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
            },
        },
    },
    plugins: [],
}
