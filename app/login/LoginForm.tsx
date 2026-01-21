// app/login/LoginForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/app/lib/storage';
import type { User } from '@/app/lib/storage';

// Виносимо всю логіку з `useSearchParams()` в цей компонент
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
    const searchParams = useSearchParams(); // Хук тепер в дочірньому компоненті

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
        setError('');

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
            subscriptionExpiry: undefined,
            matrixExpiry: undefined,
            role: 'user',
        };

        const savedUser = storage.saveUser(userData);
        router.push(savedUser.role === 'admin' ? '/admin' : '/dashboard');
    };

    // Копіюємо JSX твоєї форми з файлу page.tsx (весь код після return)
    return (
        <div style={styles.container}>
            {/* ... увесь JSX з твого поточного коду ... */}
            {/* Скопіюй всі стилі styles знизу сюди */}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, var(--color-background), white)'
    },
    // ... КОПІЮЙ СЮДИ ВСІ ІНШІ СТИЛІ З ПОПЕРЕДНЬОГО ФАЙЛУ ...
} as const;
