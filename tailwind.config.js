/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            container: {
                padding: {
                    DEFAULT: '1rem',
                    sm: '3rem',
                    lg: '6rem',
                    xl: '8rem',
                    '2xl': '10rem',
                },
            },
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px',
                // => @media (min-width: 1536px) { ... }
            },
            fontFamily: {
                primary: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    100: '#ffe5a1',
                    200: '#ffcd74',
                    300: '#bf841a',
                },
            },
        },
    },
    plugins: [],
};
