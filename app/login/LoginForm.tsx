'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const registerParam = searchParams.get('register');
        if (registerParam === 'true') {
            setIsRegistering(true);
        }
    }, [searchParams]);

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
    
    if (isSubmitting) return; // Запобігаємо повторним відправкам
    
    setIsSubmitting(true);
    console.log('=== FORM SUBMISSION START ===');
    setError('');

    // Валідація
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

    // Формуємо об'єкт користувача
    const userData: User = {
        id: `user_${Date.now()}`,
        email: formData.email,
        phone: formData.phone || '',
        name: formData.name || '',
        interfaceLang: formData.language,
        registrationDate: new Date().toISOString(),
        status: 'active',
        remainingClasses: 0,
        visits: [],
        subscriptionExpiry: undefined,  // Використовуємо undefined замість null
        matrixExpiry: undefined,        // Використовуємо undefined замість null
        role: 'user',
        // Необов'язкові поля - можна не додавати, вони в інтерфейсі позначені як optional (?)
    };

    console.log('User data prepared:', userData);

    try {
        console.log('Attempting to save user...');
        
        // Перевіряємо, чи користувач вже існує
        const existingUser = storage.getUserByEmail(formData.email);
        
        if (existingUser && isRegistering) {
            setError('Користувач з таким email вже зареєстрований');
            return;
        }
        
        if (!existingUser && !isRegistering) {
            setError('Користувача не знайдено. Зареєструйтесь спочатку.');
            return;
        }

        // Якщо це вхід (не реєстрація), використовуємо існуючого користувача
        const userToSave = isRegistering ? userData : existingUser!;
        
        // Викликаємо saveUser
        const savedUser = storage.saveUser(userToSave);
        console.log('User saved, response:', savedUser);
        
        // Перевіряємо localStorage
        console.log('Checking localStorage...');
        const activeUserJson = localStorage.getItem('pilates_user');
        console.log('Active user in localStorage:', activeUserJson);
        
        const allUsersJson = localStorage.getItem('pilates_users');
        console.log('All users in localStorage:', allUsersJson);
        
        // Перевіряємо через storage методи
        const currentUser = storage.getUser();
        console.log('Current user from storage:', currentUser);
        
        const usersList = storage.getAllUsers();
        console.log('All users from storage:', usersList);
        
        if (!currentUser) {
            console.error('No user found after save!');
            setError('Помилка: користувач не збережений');
            return;
        }
        
        console.log('Redirecting to dashboard...');
        
        // Використовуємо window.location для надійності
        window.location.href = '/dashboard';
        
        // Альтернатива через router (коментуємо, бо вже використовуємо window.location)
        // router.push('/dashboard');
        
    } catch (error) {
        console.error('Error in handleSubmit:', error);
        setError(`Помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
        setIsSubmitting(false); // Відновлюємо кнопку при помилці
    }
};
        
        try {
            const savedUser = storage.saveUser(userData);
            console.log('User saved successfully:', savedUser);
            
            const allUsers = storage.getAllUsers();
            console.log('All users in storage:', allUsers);
            
            const currentUser = storage.getUser();
            console.log('Current user:', currentUser);
            
            console.log('Redirecting to dashboard...');
            router.push('/dashboard');
            
        } catch (error) {
            console.error('Error saving user:', error);
            setError('Помилка збереження користувача');
        
    };

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
                                />
                                <label htmlFor="acceptTerms" style={styles.checkboxLabel}>
                                    Я приймаю умови конфіденційності та обробки персональних даних
                                </label>
                            </div>
                        </>
                    )}

                    <button type="submit" style={styles.button}>
                        {isRegistering ? 'Зареєструватися' : 'Увійти'}
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
