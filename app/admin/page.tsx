'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/app/lib/storage';

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalBookings: number;
    todayBookings: number;
    revenue: number;
    popularInstructor: string;
}

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        activeUsers: 0,
        totalBookings: 0,
        todayBookings: 0,
        revenue: 0,
        popularInstructor: ''
    });
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('pilates_user');
        if (!userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);

        // Перевірка прав адміна
        if (parsedUser.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        setUser(parsedUser);
        loadAdminData();
    }, [router]);

    const loadAdminData = () => {
        // Використовуємо storage замість прямого доступу до localStorage
        const users = storage.getAllUsers(); 
        const subscriptions = storage.getSubscriptions();
        const bookings = storage.getBookings();
        const classes = storage.getClasses();

        // Статистика
        const today = new Date().toDateString();
        const todayBookings = bookings.filter((b: any) =>
            new Date(b.bookingDate).toDateString() === today
        );

        // Аналітика по тренерам
        const instructorStats: Record<string, number> = {};
        classes.forEach((cls: any) => {
            instructorStats[cls.instructor] = (instructorStats[cls.instructor] || 0) + 1;
        });

        const popularInstructor = Object.entries(instructorStats)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Немає даних';

        // Виручка
        const revenue = subscriptions.reduce((sum: number, sub: any) => sum + sub.price, 0);

        setStats({
            totalUsers: users.length,
            activeUsers: subscriptions.filter((s: any) => s.status === 'active').length,
            totalBookings: bookings.length,
            todayBookings: todayBookings.length,
            revenue,
            popularInstructor
        });

        // Останні бронювання
        setRecentBookings(bookings.slice(-5).reverse());

        // Останні користувачі
        setRecentUsers(users.slice(-5).reverse());
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('pilates_user');
        router.push('/');
    };

    if (!user) {
        return (
            <div style={styles.loading}>
                <p>Завантаження...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Верхня навігація */}
            <nav style={styles.topNav}>
                <div className="container" style={styles.topNavContent}>
                    <div style={styles.adminHeader}>
                        <h1 style={styles.adminTitle}>👨‍💼 Адмін Панель</h1>
                        <p style={styles.adminSubtitle}>Pilates Studio Management</p>
                    </div>

                    <div style={styles.adminActions}>
                        <button
                            onClick={() => router.push('/dashboard')}
                            style={styles.userViewButton}
                        >
                            👤 Перейти до користувача
                        </button>
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            Вийти
                        </button>
                    </div>
                </div>
            </nav>

            <div style={styles.mainLayout}>
                {/* Бокова панель */}
                <aside style={styles.sidebar}>
                    <div style={styles.adminInfo}>
                        <div style={styles.adminAvatar}>
                            {user.name?.[0] || user.email?.[0] || 'A'}
                        </div>
                        <div>
                            <h3 style={styles.adminName}>{user.name || 'Адміністратор'}</h3>
                            <p style={styles.adminEmail}>{user.email}</p>
                        </div>
                    </div>

                    <nav style={styles.sidebarNav}>
                        <Link href="/admin" style={styles.navItemActive}>
                            <span style={styles.navIcon}>📊</span>
                            <span>Дашборд</span>
                        </Link>

                        <Link href="/admin/schedule" style={styles.navItem}>
                            <span style={styles.navIcon}>📅</span>
                            <span>Розклад</span>
                        </Link>

                        <Link href="/admin/users" style={styles.navItem}>
                            <span style={styles.navIcon}>👥</span>
                            <span>Користувачі</span>
                        </Link>

                        <Link href="/admin/attendance" style={styles.navItem}>
                            <span style={styles.navIcon}>✅</span>
                            <span>Присутність</span>
                        </Link>

                        <Link href="/admin/analytics" style={styles.navItem}>
                            <span style={styles.navIcon}>📈</span>
                            <span>Аналітика</span>
                        </Link>

                        <Link href="/admin/settings" style={styles.navItem}>
                            <span style={styles.navIcon}>⚙️</span>
                            <span>Налаштування</span>
                        </Link>
                    </nav>
                </aside>

                {/* Основний контент */}
                <main style={styles.mainContent}>
                    {/* Статистика */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>👥</div>
                            <div>
                                <h3 style={styles.statValue}>{stats.totalUsers}</h3>
                                <p style={styles.statLabel}>Користувачів</p>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>✅</div>
                            <div>
                                <h3 style={styles.statValue}>{stats.activeUsers}</h3>
                                <p style={styles.statLabel}>Активних</p>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>📅</div>
                            <div>
                                <h3 style={styles.statValue}>{stats.todayBookings}</h3>
                                <p style={styles.statLabel}>Сьогодні</p>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>💰</div>
                            <div>
                                <h3 style={styles.statValue}>{stats.revenue}€</h3>
                                <p style={styles.statLabel}>Виручка</p>
                            </div>
                        </div>
                    </div>

                    {/* Швидкі дії */}
                    <div style={styles.quickActions}>
                        <h2 style={styles.sectionTitle}>Швидкі дії</h2>
                        <div style={styles.actionsGrid}>
                            <button style={styles.actionButton}>
                                <span style={styles.actionIcon}>➕</span>
                                <span>Додати заняття</span>
                            </button>

                            <button style={styles.actionButton}>
                                <span style={styles.actionIcon}>👤</span>
                                <span>Додати користувача</span>
                            </button>

                            <button style={styles.actionButton}>
                                <span style={styles.actionIcon}>📧</span>
                                <span>Надіслати сповіщення</span>
                            </button>

                            <button style={styles.actionButton}>
                                <span style={styles.actionIcon}>📊</span>
                                <span>Звіт за тиждень</span>
                            </button>
                        </div>
                    </div>

                    {/* Останні бронювання */}
                    <div style={styles.recentSection}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Останні бронювання</h2>
                            <Link href="/admin/schedule" style={styles.viewAllLink}>
                                Всі бронювання →
                            </Link>
                        </div>

                        <div style={styles.tableContainer}>
                            <div style={styles.table}>
                                <div style={styles.tableHeader}>
                                    <div style={styles.tableCell}>Користувач</div>
                                    <div style={styles.tableCell}>Заняття</div>
                                    <div style={styles.tableCell}>Час</div>
                                    <div style={styles.tableCell}>Статус</div>
                                    <div style={styles.tableCell}>Дії</div>
                                </div>

                                {recentBookings.map(booking => (
                                    <div key={booking.id} style={styles.tableRow}>
                                        <div style={styles.tableCell}>
                                            <div style={styles.userCell}>
                                                <div style={styles.userAvatarSmall}>
                                                    {booking.userId.slice(0, 2)}
                                                </div>
                                                Користувач #{booking.userId.slice(-4)}
                                            </div>
                                        </div>
                                        <div style={styles.tableCell}>Заняття #{booking.classId.slice(-4)}</div>
                                        <div style={styles.tableCell}>{formatDate(booking.bookingDate)}</div>
                                        <div style={styles.tableCell}>
                                            <span style={styles.statusBadgeBooked}>
                                                {booking.status === 'booked' ? 'Заброньовано' : booking.status}
                                            </span>
                                        </div>
                                        <div style={styles.tableCell}>
                                            <button style={styles.smallButton}>
                                                Деталі
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Останні користувачі */}
                    <div style={styles.recentSection}>
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Нові користувачі</h2>
                            <Link href="/admin/users" style={styles.viewAllLink}>
                                Всі користувачі →
                            </Link>
                        </div>

                        <div style={styles.usersGrid}>
                            {recentUsers.map(user => (
                                <div key={user.id} style={styles.userCard}>
                                    <div style={styles.userCardHeader}>
                                        <div style={styles.userAvatarMedium}>
                                            {user.name?.[0] || user.email?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h4 style={styles.userName}>{user.name || 'Користувач'}</h4>
                                            <p style={styles.userEmail}>{user.email}</p>
                                        </div>
                                    </div>

                                    <div style={styles.userDetails}>
                                        <div style={styles.userDetail}>
                                            <span>Телефон:</span>
                                            <span>{user.phone || 'Не вказано'}</span>
                                        </div>
                                        <div style={styles.userDetail}>
                                            <span>Зареєстрований:</span>
                                            <span>{formatDate(user.registrationDate)}</span>
                                        </div>
                                    </div>

                                    <div style={styles.userActions}>
                                        <button style={styles.userActionButton}>
                                            Написати
                                        </button>
                                        <button style={styles.userActionButton}>
                                            Деталі
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)'
    },

    topNav: {
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        borderBottom: '1px solid var(--color-border)'
    },

    topNavContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-md) 0'
    },

    adminHeader: {},

    adminTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        margin: 0
    },

    adminSubtitle: {
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem',
        margin: 0
    },

    adminActions: {
        display: 'flex',
        gap: 'var(--space-md)',
        alignItems: 'center'
    },

    userViewButton: {
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary-dark)',
        border: '1px solid var(--color-primary)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    logoutButton: {
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'var(--color-error-bg)',
        color: 'var(--color-error)',
        border: '1px solid var(--color-error)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    mainLayout: {
        display: 'flex',
        minHeight: 'calc(100vh - 80px)'
    },

    sidebar: {
        width: '250px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: 'var(--space-lg) 0'
    },

    adminInfo: {
        padding: '0 var(--space-lg) var(--space-lg)',
        borderBottom: '1px solid var(--color-border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)'
    },

    adminAvatar: {
        width: '3rem',
        height: '3rem',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.25rem'
    },

    adminName: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        margin: 0
    },

    adminEmail: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        margin: 0
    },

    sidebarNav: {
        padding: 'var(--space-lg) 0'
    },

    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) var(--space-lg)',
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-primary)'
        }
    },

    navItemActive: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) var(--space-lg)',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        textDecoration: 'none',
        borderRight: '3px solid var(--color-primary)'
    },

    navIcon: {
        fontSize: '1.25rem'
    },

    mainContent: {
        flex: 1,
        padding: 'var(--space-xl)',
        overflow: 'auto'
    },

    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)'
    },

    statCard: {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)'
    },

    statIcon: {
        fontSize: '2rem',
        color: 'var(--color-primary)'
    },

    statValue: {
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        margin: 0
    },

    statLabel: {
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem',
        margin: 0
    },

    quickActions: {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)',
        marginBottom: 'var(--space-xl)'
    },

    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-lg)'
    },

    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-md)'
    },

    actionButton: {
        padding: 'var(--space-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 'var(--space-sm)',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-primary)'
        }
    },

    actionIcon: {
        fontSize: '2rem'
    },

    recentSection: {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)',
        marginBottom: 'var(--space-xl)'
    },

    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)'
    },

    viewAllLink: {
        color: 'var(--color-primary)',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.875rem'
    },

    tableContainer: {
        overflowX: 'auto' as const
    },

    table: {
        width: '100%',
        borderCollapse: 'collapse' as const
    },

    tableHeader: {
        backgroundColor: 'var(--color-background)',
        borderBottom: '2px solid var(--color-border)'
    },

    tableRow: {
        borderBottom: '1px solid var(--color-border-light)',
        '&:hover': {
            backgroundColor: 'var(--color-background)'
        }
    },

    tableCell: {
        padding: 'var(--space-md)',
        textAlign: 'left' as const,
        color: 'var(--color-text-primary)'
    },

    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)'
    },

    userAvatarSmall: {
        width: '1.5rem',
        height: '1.5rem',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold'
    },

    statusBadgeBooked: {
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: '500'
    },

    smallButton: {
        padding: 'var(--space-xs) var(--space-sm)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '500'
    },

    usersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 'var(--space-md)'
    },

    userCard: {
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-md)'
    },

    userCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)'
    },

    userAvatarMedium: {
        width: '3rem',
        height: '3rem',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: 'bold'
    },

    userName: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        margin: 0
    },

    userEmail: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        margin: 0
    },

    userDetails: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-xs)'
    },

    userDetail: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    userActions: {
        display: 'flex',
        gap: 'var(--space-sm)'
    },

    userActionButton: {
        flex: 1,
        padding: 'var(--space-xs)',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '0.75rem'
    },

    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--color-text-secondary)'
    }
} as const;