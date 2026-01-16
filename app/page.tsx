'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleRegisterClick = () => {
    router.push('/login?register=true');
  };

  const handleScheduleClick = () => {
    router.push('/calendar');
  };

  const handleLearnMoreClick = () => {
    // Можна додати плавний скрол до секції
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.container}>
      {/* Навігація */}
      <nav style={styles.nav}>
        <div className="container" style={styles.navContent}>
          <Link href="/" style={styles.logoContainer}>
            <div style={styles.logo}></div>
            <span style={styles.logoText}>AMG Pilates Studio</span>
          </Link>
          <div style={styles.navButtons}>
            <button
              onClick={handleLoginClick}
              style={styles.loginBtn}
            >
              Увійти
            </button>
            <button
              onClick={handleRegisterClick}
              style={styles.registerBtn}
            >
              Зареєструватись
            </button>
          </div>
        </div>
      </nav>

      {/* Герой секція */}
      <main className="container" style={styles.main}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>
            Бронювання занять <span style={styles.highlight}>пілатесом</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Записуйтесь на заняття онлайн, обирайте тренера та оплачуйте абонементи
            зручно з телефону чи комп'ютера
          </p>

          <div style={styles.heroButtons}>
            <button
              onClick={handleScheduleClick}
              style={styles.primaryButton}
            >
              Подивитись розклад
            </button>
            <button
              onClick={handleLearnMoreClick}
              style={styles.secondaryButton}
            >
              Дізнатись більше
            </button>
          </div>
        </div>

        {/* Функції */}
        <div id="features" style={styles.features}>
          {[
            {
              title: '🕐 Онлайн-розклад',
              desc: 'Дивіться вільні місця та записуйтесь в реальному часі',
              link: '/calendar'
            },
            {
              title: '💳 Зручна оплата',
              desc: 'Оплачуйте карткою, Google Pay або подарунковим сертифікатом',
              link: '/subscriptions'
            },
            {
              title: '📱 PWA додаток',
              desc: 'Додайте на домашній екран та користуйтесь як мобільним додатком',
              link: '/about#pwa'
            },
          ].map((feature, idx) => (
            <Link
              key={idx}
              href={feature.link}
              style={styles.featureCard}
            >
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </Link>
          ))}
        </div>

        {/* Як це працює */}
        <div style={styles.howItWorks}>
          <h2 style={styles.howItWorksTitle}>Як це працює</h2>
          <div style={styles.steps}>
            {[
              { step: '1', title: 'Реєстрація', desc: 'Створіть акаунт за 1 хвилину' },
              { step: '2', title: 'Обирайте заняття', desc: 'Переглядайте розклад та вільні місця' },
              { step: '3', title: 'Бронюйте', desc: 'Записуйтесь на зручний час' },
              { step: '4', title: 'Тренуйтесь', desc: 'Приходьте на заняття та прогресуйте' },
            ].map((step, idx) => (
              <div key={idx} style={styles.stepCard}>
                <div style={styles.stepNumber}>{step.step}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <div style={styles.footerLogoContainer}>
              <div style={styles.footerLogo}></div>
              <span style={styles.footerLogoText}>AMG Pilates Studio</span>
            </div>
            <p style={styles.footerText}>© 2024 Pilates Studio. Всі права захищено</p>
          </div>

          <div style={styles.footerRight}>
            <Link href="/about" style={styles.footerLink}>Про студію</Link>
            <Link href="/contact" style={styles.footerLink}>Контакти</Link>
            <Link href="/privacy" style={styles.footerLink}>Конфіденційність</Link>
            <div style={styles.languageSelector}>
              <button style={styles.languageBtn}>🇺🇦</button>
              <button style={styles.languageBtn}>🇪🇸</button>
              <button style={styles.languageBtn}>🇬🇧</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, var(--color-background), white)'
  },

  nav: {
    backgroundColor: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10
  },

  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0'
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    cursor: 'pointer'
  },

  logo: {
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '0.5rem'
  },

  logoText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--color-text-primary)'
  },

  navButtons: {
    display: 'flex',
    gap: '1rem'
  },

  loginBtn: {
    padding: '0.5rem 1rem',
    color: 'var(--color-text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    borderRadius: '0.375rem',
    transition: 'all 0.2s'
  },

  registerBtn: {
    padding: '0.5rem 1.5rem',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s'
  },

  main: {
    padding: '4rem 0'
  },

  hero: {
    textAlign: 'center' as const,
    marginBottom: '6rem'
  },

  heroTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'var(--color-text-primary)',
    marginBottom: '1.5rem',
    lineHeight: 1.2
  },

  highlight: {
    color: 'var(--color-primary)'
  },

  heroSubtitle: {
    fontSize: '1.25rem',
    color: '#4b5563',
    marginBottom: '2.5rem',
    maxWidth: '48rem',
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  heroButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    justifyContent: 'center',
    alignItems: 'center'
  },

  primaryButton: {
    padding: '1rem 2rem',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderRadius: '0.75rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    minWidth: '200px',
    transition: 'all 0.2s'
  },

  secondaryButton: {
    padding: '1rem 2rem',
    backgroundColor: 'white',
    color: 'var(--color-primary)',
    border: '2px solid var(--color-primary)',
    borderRadius: '0.75rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '200px',
    transition: 'all 0.2s'
  },

  features: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
    marginBottom: '6rem'
  },

  featureCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--color-border-light)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'block'
  },

  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: 'var(--color-text-primary)'
  },

  featureDesc: {
    color: '#4b5563'
  },

  howItWorks: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginBottom: '6rem'
  },

  howItWorksTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '3rem',
    color: 'var(--color-text-primary)'
  },

  steps: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem'
  },

  stepCard: {
    textAlign: 'center' as const,
    padding: '1.5rem'
  },

  stepNumber: {
    width: '4rem',
    height: '4rem',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 auto 1rem'
  },

  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: 'var(--color-text-primary)'
  },

  stepDesc: {
    color: 'var(--color-text-secondary)'
  },

  footer: {
    backgroundColor: 'var(--color-text-primary)',
    color: 'white',
    padding: '3rem 0'
  },

  footerContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem'
  },

  footerLeft: {
    textAlign: 'center' as const
  },

  footerLogoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },

  footerLogo: {
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  footerLogoText: {
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },

  footerText: {
    color: 'var(--color-text-muted)'
  },

  footerRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    alignItems: 'center'
  },

  footerLink: {
    color: 'var(--color-text-muted)',
    textDecoration: 'none',
    transition: 'color 0.2s'
  },

  languageSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem'
  },

  languageBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontSize: '1.25rem',
    padding: '0.25rem'
  }
} as const;

// Додаємо hover ефекти через JavaScript
if (typeof window !== 'undefined') {
  // Це буде працювати тільки на клієнті
  const addHoverEffects = () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (btn.style.backgroundColor === 'rgb(79, 70, 229)') {
          btn.style.backgroundColor = 'var(--color-primary-dark)';
        } else if (btn.style.backgroundColor === 'white' && btn.style.color === 'rgb(79, 70, 229)') {
          btn.style.backgroundColor = 'var(--color-border-light)';
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (btn.style.backgroundColor === 'var(--color-primary-dark)') {
          btn.style.backgroundColor = 'var(--color-primary)';
        } else if (btn.style.backgroundColor === 'var(--color-border-light)' && btn.style.color === 'rgb(79, 70, 229)') {
          btn.style.backgroundColor = 'white';
        }
      });
    });
  };

  // Викликаємо після завантаження сторінки
  window.addEventListener('load', addHoverEffects);
}