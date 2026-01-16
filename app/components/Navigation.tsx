'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { storage } from '@/app/lib/storage';

export default function Navigation() {
    const [user, setUser] = useState<ReturnType<typeof storage.getUser> | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        setUser(storage.getUser());
    }, [pathname]);

    if (pathname === '/login') return null;

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">P</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">AMG Pilates Studio</span>
                </Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            {/* ПЕРЕД МЕНЮ КОРИСТУВАЧА ДОДАЄМО АДМІН-ПОСИЛАННЯ */}
                            {user?.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                                >
                                    <span>👨‍💼</span>
                                    Адмін
                                </Link>
                            )}

                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-gray-700 hover:text-indigo-600"
                            >
                                Панель керування
                            </Link>

                            <div className="relative group">
                                <button className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="text-indigo-600 font-semibold">
                                            {user.name?.[0] || user.email?.[0] || 'U'}
                                        </span>
                                    </div>
                                    <span className="text-gray-700">{user.name || 'Користувач'}</span>
                                </button>

                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                                    >
                                        👤 Мій профіль
                                    </Link>
                                    <Link
                                        href="/calendar"
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                                    >
                                        📅 Розклад
                                    </Link>
                                    <Link
                                        href="/subscriptions"
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                                    >
                                        💳 Абонементи
                                    </Link>
                                    {/* Також можна додати адмін посилання в меню */}
                                    {user?.role === 'admin' && (
                                        <Link
                                            href="/admin"
                                            className="block px-4 py-3 text-purple-600 hover:bg-purple-50 border-t border-gray-100"
                                        >
                                            👨‍💼 Адмін панель
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            storage.logout();
                                            window.location.href = '/';
                                        }}
                                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 border-t border-gray-100"
                                    >
                                        🚪 Вийти
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="px-4 py-2 text-gray-700 hover:text-indigo-600"
                            >
                                Увійти
                            </Link>
                            <Link
                                href="/login?register=true"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Зареєструватись
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}