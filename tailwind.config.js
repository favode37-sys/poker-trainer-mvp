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
                chip: {
                    red: '#ef4444',
                    blue: '#3b82f6',
                    green: '#10b981',
                    black: '#27272a',
                }
            },
            boxShadow: {
                // Clay Effect: Top-left white highlight (inset) + Bottom-right dark shadow (inset) + Hard bottom drop shadow
                'clay-yellow': 'inset 2px 2px 4px rgba(255, 255, 255, 0.6), inset -2px -2px 4px rgba(0, 0, 0, 0.1), 0 8px 0px #d97706', // amber-600 shadow
                'clay-yellow-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.2), 0 0px 0px #d97706', // Pressed state

                // New Small Clay Shadows (4px depth)
                'clay-blue-sm': 'inset 1px 1px 2px rgba(255, 255, 255, 0.6), inset -1px -1px 2px rgba(0, 0, 0, 0.1), 0 4px 0px #3b82f6', // Blue-500 shadow
                'clay-green-sm': 'inset 1px 1px 2px rgba(255, 255, 255, 0.6), inset -1px -1px 2px rgba(0, 0, 0, 0.1), 0 4px 0px #22c55e', // Green-500 shadow
                'clay-orange-sm': 'inset 1px 1px 2px rgba(255, 255, 255, 0.6), inset -1px -1px 2px rgba(0, 0, 0, 0.1), 0 4px 0px #f97316', // Orange-500 shadow
                'clay-neutral-sm': 'inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 4px 0px #94a3b8', // Slate-400 shadow

                // Pressed states (2px depth)
                'clay-pressed-sm': 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -1px -1px 2px rgba(255, 255, 255, 0.4), 0 0px 0px transparent',

                // Chip Shadows (Thick, indented center, soft rim)
                'chip-red': 'inset 0px 0px 0px 4px #ef4444, inset 0px 0px 0px 8px #b91c1c, 0 4px 0px #7f1d1d',
                'chip-blue': 'inset 0px 0px 0px 4px #3b82f6, inset 0px 0px 0px 8px #1d4ed8, 0 4px 0px #1e3a8a',
                'chip-green': 'inset 0px 0px 0px 4px #10b981, inset 0px 0px 0px 8px #047857, 0 4px 0px #064e3b',
                'chip-black': 'inset 0px 0px 0px 4px #3f3f46, inset 0px 0px 0px 8px #18181b, 0 4px 0px #000000',

                // Story Mode Green (Emerald/Green mix)
                'clay-green': 'inset 2px 2px 4px rgba(255, 255, 255, 0.6), inset -2px -2px 4px rgba(0, 0, 0, 0.1), 0 8px 0px #15803d', // green-700 shadow
                'clay-green-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.2), 0 0px 0px #15803d',

                // Stats Purple
                'clay-purple': 'inset 2px 2px 4px rgba(255, 255, 255, 0.6), inset -2px -2px 4px rgba(0, 0, 0, 0.1), 0 8px 0px #7e22ce', // purple-700 shadow
                'clay-purple-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.2), 0 0px 0px #7e22ce',

                // Trainer Blue
                'clay-blue': 'inset 2px 2px 4px rgba(255, 255, 255, 0.6), inset -2px -2px 4px rgba(0, 0, 0, 0.1), 0 8px 0px #2563eb', // blue-600 shadow
                'clay-blue-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.2), 0 0px 0px #2563eb',

                // Detective Pink
                'clay-pink': 'inset 2px 2px 4px rgba(255, 255, 255, 0.6), inset -2px -2px 4px rgba(0, 0, 0, 0.1), 0 8px 0px #db2777', // pink-600 shadow
                'clay-pink-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.2), 0 0px 0px #db2777',

                // Checked State (Green Inset)
                'clay-inset-green': 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.4), inset 0 0 0 2px #16a34a', // green-600 border simulation
            },
            translate: {
                'click': '8px', // Matching the shadow size
                'click-sm': '4px', // For small buttons
            }
        },
    },
    plugins: [],
}
