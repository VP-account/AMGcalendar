'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    registrationDate: string;
}

interface Subscription {
    id: string;
    userId: string;
    type: string;
    category: string;
    duration: number;
    price: number;
    purchaseDate: string;
    startDate?: string;
    endDate?: string;
    remaining: number;
    status: string;
}

interface Booking {
    id: string;
    userId: string;
    classId: string;
    status: string;
    bookingDate: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Перевіряємо чи користувач залогінений
        const userData = localStorage.getItem('pilates_user');
        if (!userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadUserData(parsedUser.id);
    }, [router]);

    const loadUserData = (userId: string) => {
        // Завантажуємо абонементи
        const savedSubscriptions = localStorage.getItem('pilates_subscriptions');
        if (savedSubscriptions) {
            const allSubscriptions = JSON.parse(savedSubscriptions);
            const userSubscriptions = allSubscriptions.filter(
                (sub: Subscription) => sub.userId === userId
            );
            setSubscriptions(userSubscriptions);
        }

        // Завантажуємо бронювання
        const savedBookings = localStorage.getItem('pilates_bookings');
        if (savedBookings) {
            const allBookings = JSON.parse(savedBookings);
            const userBookings = allBookings.filter(
                (booking: Booking) => booking.userId === userId
            );
            setBookings(userBookings);
        }

        // Завантажуємо заняття для інформації
        const savedClasses = localStorage.getItem('pilates_classes');
        if (savedClasses) {
            setClasses(JSON.parse(savedClasses));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('pilates_user');
        router.push('/');
    };

    const getActiveSubscription = (): Subscription | undefined => {
        return subscriptions.find(sub => sub.status === 'active' && sub.remaining > 0);
    };

    const getUpcomingBookings = (): Booking[] => {
        return bookings
            .filter(booking => booking.status === 'booked')
            .slice(0, 3); // Тільки 3 найближчі
    };

    const getClassDetails = (classId: string) => {
        return classes.find(cls => cls.id === classId);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string): string => {
        return timeString;
    };

    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <p>Завантаження...</p>
            </div>
        );
    }

    const activeSubscription = getActiveSubscription();
    const upcomingBookings = getUpcomingBookings();

    return (
        <div style={styles.container}>
            {/* Навігація */}
            <nav style={styles.nav}>
                <div className="container" style={styles.navContent}>
                    <Link href="/" style={styles.logoContainer}>
                        <div style={styles.logo}></div>
                        <span style={styles.logoText}>AMG Pilates Studio</span>
                    </Link>

                    <div style={styles.userControls}>
                        <div style={styles.userInfo}>
                            <div style={styles.userAvatar}>
                                {user.name?.[0] || user.email?.[0] || 'U'}
                            </div>
                            <span style={styles.userName}>{user.name || 'Користувач'}</span>
                        </div>
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            Вийти
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container" style={styles.main}>
                {/* Заголовок */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Вітаємо, {user.name || 'Користувач'}! 👋</h1>
                    <p style={styles.subtitle}>Ваша панель керування заняттями</p>
                </div>

                {/* Статистика */}
                <div style={styles.statsGrid}>
                    {/* Активний абонемент */}
                    <div style={styles.statCardPrimary}>
                        <h3 style={styles.statTitle}>Активний абонемент</h3>
                        {activeSubscription ? (
                            <>
                                <div style={styles.statValue}>
                                    {activeSubscription.remaining} / {activeSubscription.duration}
                                </div>
                                <p style={styles.statLabel}>Залишок занять</p>
                                {activeSubscription.endDate && (
                                    <p style={styles.statDate}>
                                        Діє до: {formatDate(activeSubscription.endDate)}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <div style={styles.statValue}>Немає</div>
                                <p style={styles.statLabel}>Придбайте абонемент</p>
                                <Link href="/subscriptions" style={styles.buyLink}>
                                    Купити абонемент →
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Майбутні заняття */}
                    <div style={styles.statCard}>
                        <h3 style={styles.statTitle}>Майбутні заняття</h3>
                        <div style={styles.statValue}>
                            {bookings.filter(b => b.status === 'booked').length}
                        </div>
                        <p style={styles.statLabel}>Заплановано</p>
                    </div>

                    {/* Пройдені заняття */}
                    <div style={styles.statCard}>
                        <h3 style={styles.statTitle}>Пройдені заняття</h3>
                        <div style={styles.statValue}>
                            {bookings.filter(b => b.status === 'attended').length}
                        </div>
                        <p style={styles.statLabel}>В історії</p>
                    </div>
                </div>

                {/* Швидке меню */}
                <div style={styles.quickMenu}>
                    <Link href="/calendar" style={styles.menuItem}>
                        <div style={styles.menuIcon}>📅</div>
                        <div>
                            <h3 style={styles.menuTitle}>Розклад занять</h3>
                            <p style={styles.menuDesc}>Забронюйте нове заняття</p>
                        </div>
                    </Link>

                    <Link href="/profile" style={styles.menuItem}>
                        <div style={styles.menuIcon}>👤</div>
                        <div>
                            <h3 style={styles.menuTitle}>Мій профіль</h3>
                            <p style={styles.menuDesc}>Редагувати дані</p>
                        </div>
                    </Link>

                    <Link href="/subscriptions" style={styles.menuItem}>
                        <div style={styles.menuIcon}>💳</div>
                        <div>
                            <h3 style={styles.menuTitle}>Абонементи</h3>
                            <p style={styles.menuDesc}>Купити новий</p>
                        </div>
                    </Link>
                </div>

                {/* Майбутні заняття */}
                <div style={styles.bookingsSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Майбутні заняття</h2>
                        <Link href="/calendar" style={styles.viewAllLink}>
                            Всі заняття →
                        </Link>
                    </div>

                    {upcomingBookings.length === 0 ? (
                        <div style={styles.noBookings}>
                            <div style={styles.noBookingsIcon}>📅</div>
                            <p style={styles.noBookingsText}>У вас немає майбутніх занять</p>
                            <Link href="/calendar" style={styles.bookNowLink}>
                                Забронювати заняття
                            </Link>
                        </div>
                    ) : (
                        <div style={styles.bookingsList}>
                            {upcomingBookings.map(booking => {
                                const classDetails = getClassDetails(booking.classId);

                                return (
                                    <div key={booking.id} style={styles.bookingCard}>
                                        <div style={styles.bookingDate}>
                                            <div style={styles.bookingDay}>
                                                {new Date(classDetails?.date || booking.bookingDate).getDate()}
                                            </div>
                                            <div style={styles.bookingMonth}>
                                                {new Date(classDetails?.date || booking.bookingDate).toLocaleDateString('uk-UA', { month: 'short' })}
                                            </div>
                                        </div>

                                        <div style={styles.bookingInfo}>
                                            <h3 style={styles.bookingTitle}>
                                                {classDetails?.subtype || 'Заняття'}
                                            </h3>
                                            <div style={styles.bookingDetails}>
                                                {classDetails && (
                                                    <>
                                                        <span>🕐 {classDetails.startTime}</span>
                                                        <span>👩‍🏫 {classDetails.instructor}</span>
                                                        <span>📍 {classDetails.location}</span>
                                                    </>
                                                )}
                                            </div>
                                            <p style={styles.bookingBookedDate}>
                                                Заброньовано: {formatDate(booking.bookingDate)}
                                            </p>
                                        </div>

                                        <div style={styles.bookingActions}>
                                            <button style={styles.cancelButton}>
                                                Скасувати
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Швидкі дії */}
                <div style={styles.quickActions}>
                    <Link href="/about" style={styles.actionButton}>
                        👁 Про студію
                    </Link>
                    <Link href="/help" style={styles.actionButton}>
                        ❓ Допомога
                    </Link>
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

    userControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },

    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },

    userAvatar: {
        width: '2rem',
        height: '2rem',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.875rem'
    },

    userName: {
        color: 'var(--color-text-secondary)',
        fontWeight: '500'
    },

    logoutButton: {
        padding: '0.375rem 0.75rem',
        backgroundColor: 'var(--color-border-light)',
        color: 'var(--color-text-secondary)',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '0.875rem'
    },

    main: {
        padding: '2rem 0 4rem'
    },

    header: {
        marginBottom: '2rem'
    },

    title: {
        fontSize: '2.25rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        marginBottom: '0.5rem'
    },

    subtitle: {
        color: 'var(--color-text-secondary)',
        fontSize: '1.125rem'
    },

    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    },

    statCardPrimary: {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
    },

    statCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--color-border)'
    },

    statTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        opacity: 0.9
    },

    statValue: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '0.25rem'
    },

    statLabel: {
        fontSize: '0.875rem',
        opacity: 0.8,
        marginBottom: '0.5rem'
    },

    statDate: {
        fontSize: '0.75rem',
        opacity: 0.7,
        marginTop: '0.5rem'
    },

    buyLink: {
        display: 'inline-block',
        marginTop: '0.5rem',
        color: 'white',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.875rem'
    },

    quickMenu: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
    },

    menuItem: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--color-border)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },

    menuIcon: {
        fontSize: '2rem'
    },

    menuTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        marginBottom: '0.25rem'
    },

    menuDesc: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    bookingsSection: {
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
    },

    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
    },

    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    },

    viewAllLink: {
        color: 'var(--color-primary)',
        textDecoration: 'none',
        fontWeight: '500'
    },

    noBookings: {
        textAlign: 'center' as const,
        padding: '3rem',
        color: 'var(--color-text-secondary)'
    },

    noBookingsIcon: {
        fontSize: '3rem',
        marginBottom: '1rem'
    },

    noBookingsText: {
        marginBottom: '1rem',
        fontSize: '1.125rem'
    },

    bookNowLink: {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        borderRadius: '0.375rem',
        textDecoration: 'none',
        fontWeight: '500'
    },

    bookingsList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1rem'
    },

    bookingCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.5rem',
        border: '1px solid var(--color-border)',
        borderRadius: '0.75rem',
        transition: 'all 0.2s'
    },

    bookingDate: {
        backgroundColor: 'var(--color-primary-light)',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        textAlign: 'center' as const,
        minWidth: '60px'
    },

    bookingDay: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-primary)'
    },

    bookingMonth: {
        fontSize: '0.875rem',
        color: 'var(--color-primary)',
        textTransform: 'uppercase' as const
    },

    bookingInfo: {
        flex: 1
    },

    bookingTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: 'var(--color-text-primary)'
    },

    bookingDetails: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '1rem',
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        marginBottom: '0.5rem'
    },

    bookingBookedDate: {
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)'
    },

    bookingActions: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem'
    },

    cancelButton: {
        padding: '0.375rem 0.75rem',
        backgroundColor: '#fef2f2',
        color: 'var(--color-error)',
        border: '1px solid #fecaca',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    quickActions: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '1rem'
    },

    actionButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'white',
        color: 'var(--color-text-secondary)',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        fontWeight: '500',
        display: 'inline-block'
    },

    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
    }
} as const;