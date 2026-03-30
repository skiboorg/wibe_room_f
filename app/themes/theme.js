import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/lara';

const CompactLight = definePreset(Aura, {
    semantic: {
        primary: {
            50:  '#e6f0ff',
            100: '#cce1ff',
            200: '#99c3ff',
            300: '#66a5ff',
            400: '#3387ff',
            500: '#006AFE', // основной
            600: '#0055cb',
            700: '#004099',
            800: '#002b66',
            900: '#001533',
            950: '#000a1a'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#006AFE',
                    inverseColor: '#ffffff',
                    hoverColor: '#0055cb',
                    activeColor: '#004099'
                },
                highlight: {
                    background: '#e6f0ff',
                    focusBackground: '#cce1ff',
                    color: '#002b66',
                    focusColor: '#002b66'
                }
            },
            dark: {
                primary: {
                    color: '#66a5ff',
                    inverseColor: '#001533',
                    hoverColor: '#99c3ff',
                    activeColor: '#006AFE'
                },
                highlight: {
                    background: 'rgba(0, 106, 254, .08)',
                    focusBackground: 'rgba(0, 106, 254, .12)',
                    color: 'rgba(230, 240, 255, .95)',
                    focusColor: 'rgba(230, 240, 255, .95)'
                }
            }
        }
    },
    rules: {
        global: {
            fontSize: '0.75rem',
            borderRadius: '0.2rem'
        },
        button: {
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            gap: '0.3rem'
        },
        input: {
            fontSize: '0.75rem',
            padding: '0.3rem 0.5rem'
        },
        dropdown: {
            fontSize: '0.75rem',
            itemPadding: '0.25rem 0.5rem'
        },
        datatable: {
            cellPadding: '0.25rem 0.5rem',
            fontSize: '0.75rem'
        },
        dialog: {
            padding: '0.75rem',
            headerFontSize: '0.9rem',
            contentFontSize: '0.75rem'
        },
        card: {
            padding: '0.75rem'
        },
        tabview: {
            fontSize: '0.75rem'
        },
        checkbox: {
            size: '1rem'
        },
        radiobutton: {
            size: '1rem'
        }
    }
});

export default {
    preset: CompactLight,
    options: {
        darkModeSelector: '.p-dark'
    }
};