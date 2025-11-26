module.exports = {
    content: [
        "./pages/**/*.{vue,js}",
        "./components/**/*.{vue,js}",
        "./layouts/**/*.{vue,js}",
        "./plugins/**/*.{js,ts}",
        "./nuxt.config.{js,ts}"
    ],
    darkMode: '.p-dark',
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '16px',   // по умолчанию (мобилки)
                sm: '20px',
                md: '24px',
                lg: '30px',
                xl: '0px',
                '2xl': '0px'
            },
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1248px',
                '2xl': '1248px'
            }
        },
        extend: {
            colors: {
                primary: '#006AFE', // Добавляем свой основной цвет
                secondary: '#E1422D', // Добавляем второй цвет
                customGray: '#B0B0B0', // Добавляем пользовательский серый
            },
        },
    },
    plugins: [
        require('tailwindcss-primeui'),
        require('@tailwindcss/typography'),
    ]
}
