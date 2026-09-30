/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'sans-serif',
                ],
            },
            colors: {
                brand: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb', // Primary accent #2563EB
                    700: '#1d4ed8', // Accent hover
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                canvas: {
                    bg: 'var(--canvas-bg)',
                    dot: 'var(--canvas-dot)',
                    dotHover: 'var(--canvas-dot-hover)',
                },
                surface: {
                    primary: 'var(--surface-primary)',
                    secondary: 'var(--surface-secondary)',
                    subtle: 'var(--surface-subtle)',
                    border: 'var(--surface-border)',
                    borderSubtle: 'var(--surface-border-subtle)',
                },
                content: {
                    primary: 'var(--content-primary)',
                    secondary: 'var(--content-secondary)',
                    muted: 'var(--content-muted)',
                },
                status: {
                    success: '#16a34a', // Success #16A34A
                    warning: '#d97706',
                    error: '#dc2626',
                },
            },
            boxShadow: {
                panel: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
                floating: '0 4px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
                modal: '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.15)',
            },
        },
    },
    plugins: [],
}

