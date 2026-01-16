'use client';

import { useState, useEffect } from 'react'; // Змінюємо на useEffect
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/app/lib/storage'; // Додаємо імпорт storage
import type { User } from '@/app/lib/storage';

export default function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        name: '',
        password: '',
        language: 'uk',
        acceptTerms: false,
    });
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    // Перевіряємо параметр register у URL (використовуємо useEffect)
    useEffect(() => {
        const registerParam = searchParams.get('register');
        if (registerParam === 'true') {
            setIsRegistering(true);
        }
    }, [searchParams]); // Додаємо searchParams в залежності

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Проста валідація
        if (!formData.email || !formData.password) {
            setError('Заповніть обов\'язкові поля');
            return;
        }

        if (isRegistering) {
            if (!formData.name || !formData.phone) {
                setError('Для реєстрації потрібно ім\'я та телефон');
                return;
            }
            if (!formData.acceptTerms) {
                setError('Потрібно прийняти умови конфіденційності');
                return;
            }
        }

        // Створюємо об'єкт користувача
        const userData: User = {
            id: Date.now().toString(),
            email: formData.email,
            phone: formData.phone,
            name: formData.name,
            interfaceLang: formData.language,
            registrationDate: new Date().toISOString(),
            status: 'active' as const,
            remainingClasses: 0,
            visits: [],
            subscriptionExpiry: undefined, // замість null
            matrixExpiry: undefined,       // замість null
            role: 'user',
        };


        // Зберігаємо користувача через storage service
        const savedUser = storage.saveUser(userData);

        // Перевіряємо роль і перенаправляємо відповідно
        if (savedUser.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
        // ↑↑↑ ЛИШЕ ОДИН router.push() ↑↑↑
    }; // ← ЗАКРИВАЄМО handleSubmit ТУТ

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <div className="container" style={styles.navContent}>
                    <Link href="/" style={styles.logoContainer}>
                        <div style={styles.logo}></div>
                        <span style={styles.logoText}>AMG Pilates Studio</span>
                    </Link>
                </div>
            </nav>

            <main className="container" style={styles.main}>
                <div style={styles.formContainer}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>
                            {isRegistering ? 'Створення акаунта' : 'Вхід в систему'}
                        </h1>
                        <p style={styles.subtitle}>
                            {isRegistering
                                ? 'Зареєструйтеся для доступу до всіх функцій'
                                : 'Увійдіть для бронювання занять'}
                        </p>
                    </div>

                    {/* Форма */}
                    <div style={styles.formCard}>
                        {error && (
                            <div style={styles.error}>{error}</div>
                        )}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            {isRegistering && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Ім'я *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                                {isRegistering && formData.email && (
                                    <p style={styles.emailHint}>
                                        {formData.email.includes('admin') ||
                                            formData.email.includes('studio') ||
                                            formData.email.includes('@pilates.')
                                            ? 'Цей email отримає права адміністратора'
                                            : 'Цей email отримає права користувача'}
                                    </p>
                                )}
                            </div>

                            {isRegistering && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Телефон *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+380"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Пароль *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                    minLength={6}
                                />
                            </div>

                            {isRegistering && (
                                <>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Мова інтерфейсу</label>
                                        <select
                                            name="language"
                                            value={formData.language}
                                            onChange={handleChange}
                                            style={styles.input}
                                        >
                                            <option value="uk">🇺🇦 Українська</option>
                                            <option value="es">🇪🇸 Español</option>
                                            <option value="en">🇬🇧 English</option>
                                        </select>
                                    </div>

                                    <div style={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            name="acceptTerms"
                                            checked={formData.acceptTerms}
                                            onChange={handleChange}
                                            style={styles.checkbox}
                                            required
                                        />
                                        <label htmlFor="terms" style={styles.checkboxLabel}>
                                            Приймаю{' '}
                                            <Link href="/privacy" style={styles.privacyLink}>
                                                політику конфіденційності
                                            </Link>
                                        </label>
                                    </div>
                                </>
                            )}

                            <button type="submit" style={styles.submitButton}>
                                {isRegistering ? 'Зареєструватися' : 'Увійти'}
                            </button>

                            <div style={styles.switchContainer}>
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(!isRegistering)}
                                    style={styles.switchButton}
                                >
                                    {isRegistering
                                        ? 'Вже маєте акаунт? Увійти'
                                        : 'Немає акаунту? Зареєструватися'}
                                </button>
                            </div>

                            {/* Додаємо кнопку Google Sign-In */}
                            {!isRegistering && (
                                <div style={styles.googleContainer}>
                                    <div style={styles.divider}>
                                        <span style={styles.dividerText}>або</span>
                                    </div>
                                    <button
                                        type="button"
                                        style={styles.googleButton}
                                        onClick={() => {
                                            alert('Google Sign-In буде реалізовано пізніше');
                                        }}
                                    >
                                        <div style={styles.googleIcon}>
                                            G
                                        </div>
                                        Увійти через Google
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Тестові дані для розробки */}
                    {process.env.NODE_ENV === 'development' && (
                        <div style={styles.testInfo}>
                            <h3 style={styles.testTitle}>Тестові дані для входу:</h3>
                            <p style={styles.testText}>
                                <strong>Адміністратор:</strong> admin@pilates.com (або будь-який email з "admin")
                            </p>
                            <p style={styles.testText}>
                                <strong>Користувач:</strong> user@gmail.com (звичайний email)
                            </p>
                            <p style={styles.testText}>
                                <strong>Пароль:</strong> будь-який (мінімум 6 символів)
                            </p>
                        </div>
                    )}
                </div>
            </main>
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
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },

    navContent: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem 0'
    },

    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none'
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

    main: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem 0'
    },

    formContainer: {
        width: '100%',
        maxWidth: '400px'
    },

    header: {
        textAlign: 'center' as const,
        marginBottom: '2rem'
    },

    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        marginBottom: '0.5rem'
    },

    subtitle: {
        color: 'var(--color-text-secondary)'
    },

    formCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem'
    },

    error: {
        backgroundColor: 'var(--color-error-bg)',
        color: 'var(--color-error)',
        padding: '0.75rem',
        borderRadius: '0.375rem',
        marginBottom: '1rem',
        textAlign: 'center' as const
    },

    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem'
    },

    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.25rem'
    },

    label: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--color-text-secondary)'
    },

    input: {
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        fontSize: '1rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box' as const
    },

    emailHint: {
        fontSize: '0.75rem',
        color: '#666',
        marginTop: '0.25rem',
        fontStyle: 'italic'
    },

    checkboxGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '0.5rem'
    },

    checkbox: {
        width: '1rem',
        height: '1rem'
    },

    checkboxLabel: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    privacyLink: {
        color: 'var(--color-primary)',
        textDecoration: 'none'
    },

    submitButton: {
        padding: '0.75rem',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1rem',
        width: '100%'
    },

    switchContainer: {
        textAlign: 'center' as const,
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--color-border)'
    },

    switchButton: {
        background: 'none',
        border: 'none',
        color: 'var(--color-primary)',
        cursor: 'pointer',
        fontSize: '0.875rem'
    },

    googleContainer: {
        marginTop: '1rem'
    },

    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '1rem 0'
    },

    dividerText: {
        padding: '0 0.5rem',
        color: '#666',
        fontSize: '0.875rem',
        flexShrink: 0
    },

    googleButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.75rem',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        fontSize: '1rem',
        cursor: 'pointer',
        color: '#333'
    },

    googleIcon: {
        width: '1.5rem',
        height: '1.5rem',
        backgroundColor: '#4285F4',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
    },

    testInfo: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '0.375rem',
        padding: '1rem',
        fontSize: '0.875rem'
    },

    testTitle: {
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#333'
    },

    testText: {
        margin: '0.25rem 0',
        color: '#666'
    }
} as const;