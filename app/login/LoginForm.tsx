'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/app/lib/storage';
import type { User } from '@/app/lib/storage';

export default function LoginForm() {
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false); // Для перевірки клієнтського рендерингу
    const router = useRouter();

    // 1. Спочатку встановлюємо isMounted
    useEffect(() => {
        setIsMounted(true);
        
        // Перевіряємо URL параметри клієнтським способом
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const registerParam = params.get('register');
            if (registerParam === 'true') {
                setIsRegistering(true);
            }
        }
    }, []);

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
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('=== FORM SUBMISSION START ===');
    setError('');

    // Валідація
    if (!formData.email || !formData.password) {
        setError('Заповніть обов\'язкові поля');
        setIsSubmitting(false);
        return;
    }

    if (isRegistering) {
        if (!formData.name || !formData.phone) {
            setError('Для реєстрації потрібно ім\'я та телефон');
            setIsSubmitting(false);
            return;
        }
        if (!formData.acceptTerms) {
            setError('Потрібно прийняти умови конфіденційності');
            setIsSubmitting(false);
            return;
        }
    }

    try {
        console.log('Attempting to process form...');
        
        // Перевіряємо, чи користувач вже існує
        const existingUser = storage.getUserByEmail(formData.email);
        
        // РЕЄСТРАЦІЯ
        if (isRegistering) {
            if (existingUser) {
                setError('Користувач з таким email вже зареєстрований');
                setIsSubmitting(false);
                return;
            }
            
            // Створюємо нового користувача з паролем
            const userData: User = {
                id: `user_${Date.now()}`,
                email: formData.email,
                password: formData.password, // Зберігаємо пароль
                phone: formData.phone || '',
                name: formData.name || '',
                interfaceLang: formData.language,
                registrationDate: new Date().toISOString(),
                status: 'active',
                remainingClasses: 0,
                visits: [],
                subscriptionExpiry: undefined,
                matrixExpiry: undefined,
                role: 'user',
            };
            
            console.log('Registering new user:', userData);
            storage.saveUser(userData);
            
        } 
        // ВХІД
        else {
            if (!existingUser) {
                setError('Користувача не знайдено. Зареєструйтесь спочатку.');
                setIsSubmitting(false);
                return;
            }
            
            // Перевірка пароля
            if (!existingUser.password || existingUser.password !== formData.password) {
                setError('Невірний пароль');
                setIsSubmitting(false);
                return;
            }
            
            console.log('Logging in existing user:', existingUser);
            storage.saveUser(existingUser); // Зберігаємо як активного користувача
        }
        
        // Перевіряємо, чи збережено
        const currentUser = storage.getUser();
        console.log('Current user from storage:', currentUser);
        
        if (!currentUser) {
            throw new Error('Не вдалося зберегти користувача');
        }
        
        console.log('Redirecting to dashboard...');
        
        // Використовуємо window.location для надійності
        window.location.href = '/dashboard';
        
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        setError(`Помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
        setIsSubmitting(false);
    }
    
    console.log('=== FORM SUBMISSION END ===');
};

    // Показуємо loading поки компонент не змонтований на клієнті
    if (!isMounted) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div>Завантаження форми...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Повний JSX рендер тільки після монтування
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        {isRegistering ? 'Створення аккаунта' : 'Вхід'}
                    </h1>
                    <p style={styles.subtitle}>
                        {isRegistering 
                            ? 'Заповніть форму для реєстрації' 
                            : 'Увійдіть у свій акаунт'}
                    </p>
                </div>

                {error && (
                    <div style={styles.error}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="ваш@email.com"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>
                            Пароль *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {isRegistering && (
                        <>
                            <div style={styles.inputGroup}>
                                <label htmlFor="name" style={styles.label}>
                                    Ім'я *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Ваше ім'я"
                                    required={isRegistering}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label htmlFor="phone" style={styles.label}>
                                    Телефон *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="+380 XX XXX XX XX"
                                    required={isRegistering}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label htmlFor="language" style={styles.label}>
                                    Мова інтерфейсу
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    style={styles.input}
                                    disabled={isSubmitting}
                                >
                                    <option value="uk">Українська</option>
                                    <option value="en">English</option>
                                    <option value="pl">Polski</option>
                                </select>
                            </div>

                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    style={styles.checkbox}
                                    required={isRegistering}
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="acceptTerms" style={styles.checkboxLabel}>
                                    Я приймаю умови конфіденційності та обробки персональних даних
                                </label>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        style={{
                            ...styles.button,
                            opacity: isSubmitting ? 0.7 : 1,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Обробка...' : (isRegistering ? 'Зареєструватися' : 'Увійти')}
                    </button>
                </form>

                <div style={styles.footer}>
                    {isRegistering ? (
                        <p style={styles.footerText}>
                            Вже маєте акаунт?{' '}
                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                style={styles.linkButton}
                                disabled={isSubmitting}
                            >
                                Увійти
                            </button>
                        </p>
                    ) : (
                        <p style={styles.footerText}>
                            Немає акаунта?{' '}
                            <button
                                type="button"
                                onClick={() => setIsRegistering(true)}
                                style={styles.linkButton}
                                disabled={isSubmitting}
                            >
                                Зареєструватися
                            </button>
                        </p>
                    )}
                    <Link href="/" style={styles.homeLink}>
                        ← На головну
                    </Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
        padding: '20px',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
    },
    header: {
        textAlign: 'center' as const,
        marginBottom: '1.5rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#718096',
        fontSize: '0.875rem',
    },
    error: {
        backgroundColor: '#fed7d7',
        color: '#c53030',
        padding: '0.75rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        fontSize: '0.875rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#4a5568',
    },
    input: {
        padding: '0.5rem 0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '0.875rem',
        transition: 'all 0.2s',
    },
    checkboxGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    checkbox: {
        width: '1rem',
        height: '1rem',
    },
    checkboxLabel: {
        fontSize: '0.75rem',
        color: '#4a5568',
    },
    button: {
        backgroundColor: '#4299e1',
        color: 'white',
        padding: '0.75rem',
        borderRadius: '6px',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        marginTop: '0.5rem',
    },
    footer: {
        marginTop: '1.5rem',
        textAlign: 'center' as const,
    },
    footerText: {
        color: '#718096',
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
    },
    linkButton: {
        color: '#4299e1',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        padding: '0',
        textDecoration: 'underline',
    },
    homeLink: {
        display: 'inline-block',
        color: '#718096',
        fontSize: '0.75rem',
        textDecoration: 'none',
        marginTop: '0.5rem',
    },
} as const;
