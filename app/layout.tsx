import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pilates Studio',
  description: 'Бронювання занять пілатесом',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <style>{`
          :root {
            /* === ОСНОВНІ КОЛЬОРИ БРЕНДУ === */
            --color-primary: #4f46e5;
            --color-primary-dark: #4338ca;
            --color-primary-light: #e0e7ff;
            --color-primary-bg: #f5f3ff;
            
            /* === ДРУГОРЯДНІ КОЛЬОРИ === */
            --color-secondary: #8b5cf6;
            --color-accent: #10b981;
            
            /* === НЕЙТРАЛЬНІ КОЛЬОРИ === */
            --color-background: #f9fafb;
            --color-surface: #ffffff;
            --color-border: #e5e7eb;
            --color-border-light: #f3f4f6;
            
            /* === ТЕКСТ === */
            --color-text-primary: #1f2937;
            --color-text-secondary: #6b7280;
            --color-text-muted: #9ca3af;
            --color-text-on-primary: #ffffff;
            
            /* === СТАТУСИ === */
            --color-success: #10b981;
            --color-success-bg: #d1fae5;
            --color-warning: #f59e0b;
            --color-error: #dc2626;
            --color-error-bg: #fee2e2;
            --color-info: #3b82f6;
            
            /* === ТІНІ === */
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            
            /* === ЗАКРУГЛЕННЯ === */
            --radius-sm: 0.375rem;
            --radius-md: 0.5rem;
            --radius-lg: 0.75rem;
            --radius-xl: 1rem;
            --radius-2xl: 1.5rem;
            
            /* === ВІДСТУПИ === */
            --space-xs: 0.25rem;
            --space-sm: 0.5rem;
            --space-md: 1rem;
            --space-lg: 1.5rem;
            --space-xl: 2rem;
            --space-2xl: 3rem;
          }

          /* Базові стилі */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
          }
          
          html {
            -webkit-text-size-adjust: 100%;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            background-color: var(--color-background);
            color: var(--color-text-primary);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
          
          /* Для PWA */
          @media (display-mode: standalone) {
            body {
              padding-top: env(safe-area-inset-top);
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
          
          /* Утиліти */
          .container {
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 var(--space-md);
          }
          
          /* Покращені hover ефекти */
          button {
            transition: all 0.2s ease;
          }
          
          button:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          
          button:active:not(:disabled) {
            transform: translateY(0);
          }
          
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          a {
            transition: opacity 0.2s ease;
          }
          
          a:hover {
            opacity: 0.8;
          }
          
          /* Конкретні кнопки */
          [style*="background-color: var(--color-primary)"]:hover {
            background-color: var(--color-primary-dark) !important;
          }
          
          [style*="border: 2px solid var(--color-primary)"]:hover {
            background-color: var(--color-primary-light) !important;
          }
          
          /* Покращені картки */
          [style*="cursor: pointer"] {
            transition: all 0.2s ease;
          }
          
          [style*="cursor: pointer"]:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md) !important;
          }
          
          /* Мобільна оптимізація */
          @media (max-width: 768px) {
            :root {
              --space-md: 0.75rem;
              --space-lg: 1rem;
              --space-xl: 1.5rem;
            }
          }
          
          /* Приховуємо скролбар для Chrome, Safari та Opera */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          
          /* Приховуємо скролбар для IE, Edge та Firefox */
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          /* Покращена типографіка */
          h1, h2, h3, h4, h5, h6 {
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: var(--space-md);
          }
          
          p {
            margin-bottom: var(--space-md);
          }
          
          /* Утиліта для тексту */
          .text-truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          /* Анімації */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .fade-in {
            animation: fadeIn 0.3s ease-in;
          }
          
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .slide-up {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        {children}

        {/* PWA Install Prompt */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Можна показати кнопку для встановлення
                const installButton = document.createElement('button');
                installButton.style.display = 'none';
                installButton.textContent = '📱 Встановити додаток';
                installButton.style.cssText = \`
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  padding: 12px 20px;
                  background: var(--color-primary);
                  color: white;
                  border: none;
                  border-radius: 50px;
                  font-weight: 600;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  cursor: pointer;
                  z-index: 1000;
                  animation: slideUp 0.3s ease-out;
                \`;
                
                installButton.onclick = async () => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                      installButton.remove();
                    }
                    deferredPrompt = null;
                  }
                };
                
                document.body.appendChild(installButton);
                
                // Показуємо кнопку через 5 секунд
                setTimeout(() => {
                  installButton.style.display = 'block';
                }, 5000);
                
                // Ховаємо кнопку після встановлення
                window.addEventListener('appinstalled', () => {
                  installButton.remove();
                  deferredPrompt = null;
                });
              });
              
              // Перевірка чи вже встановлено PWA
              if (window.matchMedia('(display-mode: standalone)').matches) {
                console.log('PWA встановлено');
              }
            `
          }}
        />
      </body>
    </html>
  )
}