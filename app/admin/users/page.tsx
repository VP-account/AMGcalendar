'use client';

import { useState, useEffect } from 'react';
import { storage, User } from '@/app/lib/storage';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        // Отримуємо користувачів з storage
        const allUsers = storage.getAllUsers();

        // Якщо немає користувачів, створюємо тестових
        if (allUsers.length === 0) {
            const testUsers: User[] = [
                {
                    id: '1',
                    email: 'cliente1@gmail.com',
                    phone: '+34600123456',
                    name: 'Марія',
                    surname: 'Гарсія',
                    interfaceLang: 'es',
                    registrationDate: new Date('2024-01-15').toISOString(),
                    status: 'active',
                    role: 'user',
                    remainingClasses: 4,
                    subscriptionExpiry: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    email: 'cliente2@gmail.com',
                    phone: '+34611234567',
                    name: 'Карлос',
                    surname: 'Родрігес',
                    interfaceLang: 'es',
                    registrationDate: new Date('2024-02-01').toISOString(),
                    status: 'active',
                    role: 'user',
                    remainingClasses: 8,
                    subscriptionExpiry: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    email: 'cliente3@gmail.com',
                    phone: '+34622345678',
                    name: 'Анна',
                    surname: 'Лопес',
                    interfaceLang: 'es',
                    registrationDate: new Date('2024-02-10').toISOString(),
                    status: 'active',
                    role: 'user',
                    remainingClasses: 0,
                    subscriptionExpiry: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // Прострочений
                },
                {
                    id: '4',
                    email: 'admin@amgpilates.com',
                    phone: '+34633456789',
                    name: 'AMG',
                    surname: 'Pilates',
                    interfaceLang: 'es',
                    registrationDate: new Date('2024-01-01').toISOString(),
                    status: 'active',
                    role: 'admin',
                    remainingClasses: 0
                },
                {
                    id: '5',
                    email: 'turista@gmail.com',
                    phone: '+380501234567',
                    name: 'Олена',
                    surname: 'Петренко',
                    interfaceLang: 'uk',
                    registrationDate: new Date('2024-02-15').toISOString(),
                    status: 'active',
                    role: 'user',
                    remainingClasses: 1,
                    subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];

            // Зберігаємо користувачів
            // testUsers.forEach(user => storage.saveUser(user));
            storage.saveAllUsers(testUsers);
            setUsers(testUsers);
        } else {
            setUsers(allUsers);
        }

        setIsLoading(false);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUserStatus = (userId: string) => {
        const updatedUsers: User[] = users.map(user =>
            user.id === userId
                ? {
                    ...user,
                    status: user.status === 'active' ? 'inactive' : 'active'
                }
                : user
        );

        setUsers(updatedUsers);
        storage.saveAllUsers(updatedUsers);

        const currentUser = storage.getUser();
        const updatedUser = updatedUsers.find(u => u.id === userId);

        if (currentUser && updatedUser && currentUser.id === userId) {
            storage.updateUser({ status: updatedUser.status });
        }
    };


    const deleteUser = (userId: string) => {
        if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            storage.saveAllUsers(updatedUsers);
        }
    };

    const formatPhone = (phone?: string) => {
        if (!phone) return 'Не вказано';

        // Формат для іспанських номерів: +34 XXX XXX XXX
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('34')) {
            return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
        }
        // Формат для українських номерів
        if (cleaned.length === 12 && cleaned.startsWith('380')) {
            return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
        }
        return phone;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getSubscriptionStatus = (user: User) => {
        if (!user.subscriptionExpiry) return { text: 'Немає', color: 'text-gray-500', bg: 'bg-gray-100' };

        const expiryDate = new Date(user.subscriptionExpiry);
        const today = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: 'Прострочено', color: 'text-red-600', bg: 'bg-red-100' };
        } else if (diffDays < 7) {
            return { text: `Закінчується через ${diffDays} дн.`, color: 'text-orange-600', bg: 'bg-orange-100' };
        } else {
            return { text: `Дійсний до ${formatDate(user.subscriptionExpiry)}`, color: 'text-green-600', bg: 'bg-green-100' };
        }
    };

    const addNewUser = () => {
        const newUser: User = {
            id: Date.now().toString(),
            email: `newuser${Date.now().toString().slice(-4)}@gmail.com`,
            phone: '+34600000000',
            name: 'Новий',
            surname: 'Користувач',
            interfaceLang: 'es',
            registrationDate: new Date().toISOString(),
            status: 'active',
            role: 'user',
            remainingClasses: 0
        };

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        storage.saveUser(newUser);
        storage.saveAllUsers(updatedUsers);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-[var(--color-text-secondary)]">
                    Завантаження користувачів...
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                    Керування клієнтами
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Клієнти AMG Pilates Studio (Іспанія)
                </p>
            </div>

            {/* Пошук та дії */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Пошук за іменем, прізвищем, email або телефону..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            🔍
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                            onClick={addNewUser}
                        >
                            + Додати клієнта
                        </button>
                        <button className="px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-light)] transition-colors">
                            Експорт в Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Таблиця користувачів */}
            <div className="bg-[var(--color-surface)] rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--color-background)]">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                    Клієнт
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                    Контакти
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                    Мова
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                    Статус акаунту
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                    Залишок занять
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                    Абонемент
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--color-text-secondary)]">
                                    Дії
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => {
                                const subStatus = getSubscriptionStatus(user);

                                return (
                                    <tr
                                        key={user.id}
                                        className="border-b border-[var(--color-border-light)] hover:bg-[var(--color-primary-bg)]"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-[var(--color-primary)] font-semibold">
                                                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[var(--color-text-primary)]">
                                                        {user.name} {user.surname}
                                                    </div>
                                                    <div className="text-xs text-[var(--color-text-muted)]">
                                                        Зареєстрований: {formatDate(user.registrationDate)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-[var(--color-text-primary)] font-medium">{user.email}</div>
                                            <div className="text-sm text-[var(--color-text-secondary)]">
                                                {formatPhone(user.phone)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.interfaceLang === 'es' ? 'bg-red-100 text-red-800' :
                                                    user.interfaceLang === 'uk' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.interfaceLang === 'es' ? '🇪🇸 Español' :
                                                    user.interfaceLang === 'uk' ? '🇺🇦 Українська' :
                                                        '🇬🇧 English'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                                                    ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                                                    : 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
                                                }`}>
                                                {user.status === 'active' ? 'Активний' : 'Неактивний'}
                                            </span>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {user.role === 'admin' ? '👑 Власник' : '👤 Клієнт'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${user.remainingClasses && user.remainingClasses > 0
                                                        ? 'text-[var(--color-accent)]'
                                                        : 'text-[var(--color-text-muted)]'
                                                    }`}>
                                                    {user.remainingClasses || 0}
                                                </div>
                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                    залишок занять
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${subStatus.bg} ${subStatus.color}`}>
                                                {subStatus.text}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => toggleUserStatus(user.id)}
                                                    className={`px-3 py-1 rounded text-sm ${user.status === 'active'
                                                            ? 'bg-[var(--color-error-bg)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white'
                                                            : 'bg-[var(--color-success-bg)] text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white'
                                                        } transition-colors`}
                                                >
                                                    {user.status === 'active' ? 'Деактивувати' : 'Активувати'}
                                                </button>
                                                <button
                                                    onClick={() => {/* Редагування */ }}
                                                    className="px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded text-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                                >
                                                    Редагувати
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="px-3 py-1 bg-[var(--color-error-bg)] text-[var(--color-error)] rounded text-sm hover:bg-[var(--color-error)] hover:text-white transition-colors"
                                                    >
                                                        Видалити
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-[var(--color-text-secondary)]">
                        Клієнтів не знайдено
                    </div>
                )}

                <div className="p-4 border-t border-[var(--color-border)] flex justify-between items-center">
                    <div className="text-sm text-[var(--color-text-secondary)]">
                        Показано {filteredUsers.length} з {users.length} клієнтів
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-[var(--color-text-secondary)]">Клієнтів на сторінці:</span>
                        <select className="px-2 py-1 border border-[var(--color-border)] rounded text-sm">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow">
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                        Всього клієнтів
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {users.length}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        з них {users.filter(u => u.interfaceLang === 'es').length} іспанці
                    </div>
                </div>
                <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow">
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                        Активні абонементи
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-success)]">
                        {users.filter(u => {
                            if (!u.subscriptionExpiry) return false;
                            return new Date(u.subscriptionExpiry) > new Date();
                        }).length}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        з {users.length} клієнтів
                    </div>
                </div>
                <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow">
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                        Залишок занять
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-accent)]">
                        {users.reduce((sum, u) => sum + (u.remainingClasses || 0), 0)}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        загалом у всіх клієнтів
                    </div>
                </div>
                <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow">
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                        Середній залишок
                    </div>
                    <div className="text-2xl font-bold text-[var(--color-primary)]">
                        {Math.round(users.reduce((sum, u) => sum + (u.remainingClasses || 0), 0) / users.length) || 0}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        занять на клієнта
                    </div>
                </div>
            </div>

            {/* Примітки */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-medium text-yellow-800 mb-2">ℹ️ Примітки:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Телефони формату відповідно до іспанських стандартів (+34 XXX XXX XXX)</li>
                    <li>• Мова інтерфейсу: ES - іспанська, UK - українська, EN - англійська</li>
                    <li>• Абонемент прострочується через 5 тижнів після активації</li>
                    <li>• Клієнти з простроченим абонементом позначаються червоним кольором</li>
                </ul>
            </div>
        </div>
    );
}