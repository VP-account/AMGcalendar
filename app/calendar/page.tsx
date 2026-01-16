'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage, Class } from '@/app/lib/storage';

// Константи
const DAYS_AHEAD = 35; // 5 тижнів
const WORKING_DAYS = [1, 2, 3, 4, 5]; // Пн-Пт

export default function CalendarPage() {
    const [user, setUser] = useState<any>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSubscription, setActiveSubscription] = useState<any>(null);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
    const router = useRouter();

    useEffect(() => {
        // Перевіряємо чи користувач залогінений
        const userData = storage.getUser();
        if (!userData) {
            router.push('/login');
            return;
        }

        setUser(userData);
        loadData();
    }, [router]);

    useEffect(() => {
        if (user) {
            const sub = storage.getActiveSubscription(user.id);
            setActiveSubscription(sub);
        }
    }, [user]);

    const loadData = () => {
        const loadedClasses = storage.getClasses();
        setClasses(loadedClasses);

        // Отримуємо унікальні дати з занять
        const uniqueDates = [...new Set(loadedClasses.map(c => c.date))].sort();
        setAvailableDates(uniqueDates);

        // Встановлюємо першу доступну дату
        if (uniqueDates.length > 0 && !selectedDate) {
            setSelectedDate(uniqueDates[0]);
        }

        setIsLoading(false);
    };

    // Генеруємо дати для відображення (5 тижнів вперед)
    const generateCalendarDates = () => {
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < DAYS_AHEAD; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }

        return dates;
    };

    // Отримуємо заняття для конкретної дати
    const getClassesForDate = (date: string): Class[] => {
        return classes.filter(cls => cls.date === date);
    };

    // Форматування дати
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('uk-UA', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Отримати назву дня тижня (скорочено)
    const getDayName = (dateStr: string): string => {
        const date = new Date(dateStr);
        const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return days[date.getDay()];
    };

    // Отримати число місяця
    const getDayNumber = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.getDate().toString();
    };

    // Перевірити чи це вихідний
    const isWeekend = (dateStr: string): boolean => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
    };

    // Перевірити чи є заняття на цей день
    const hasClasses = (dateStr: string): boolean => {
        return getClassesForDate(dateStr).length > 0;
    };

    // Обробка бронювання
    const handleBooking = (classItem: Class) => {
        if (!user) return;

        if (!activeSubscription) {
            alert('Для бронювання потрібен абонемент');
            router.push('/subscriptions');
            return;
        }

        if (activeSubscription.status !== 'active') {
            alert('Ваш абонемент очікує активації');
            return;
        }

        if (activeSubscription.remaining <= 0) {
            alert('У вас закінчились заняття');
            return;
        }

        if (classItem.currentBookings >= classItem.maxCapacity) {
            alert('Немає вільних місць');
            return;
        }

        // Створюємо бронювання
        const booking = {
            userId: user.id,
            classId: classItem.id,
            status: 'booked' as const,
            bookingDate: new Date().toISOString()
        };

        storage.saveBooking(booking);

        // Оновлюємо заняття
        storage.updateClass(classItem.id, {
            currentBookings: classItem.currentBookings + 1
        });

        // Оновлюємо абонемент
        const subscriptions = storage.getSubscriptions();
        const updatedSubscriptions = subscriptions.map(s =>
            s.id === activeSubscription.id
                ? { ...s, remaining: s.remaining - 1 }
                : s
        );
        localStorage.setItem('pilates_subscriptions', JSON.stringify(updatedSubscriptions));
        setActiveSubscription({ ...activeSubscription, remaining: activeSubscription.remaining - 1 });

        // Оновлюємо дані
        loadData();

        alert('✅ Заняття успішно заброньовано!');
    };

    // Навігація по тижнях
    const nextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const prevWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    // Генеруємо дати для поточного тижня
    const getCurrentWeekDates = () => {
        const dates: string[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p>Завантаження розкладу...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const weekDates = getCurrentWeekDates();
    const today = new Date().toISOString().split('T')[0];

    return (
        <div style={styles.container}>
            {/* Навігаційна панель */}
            <nav style={styles.nav}>
                <div style={styles.navContent}>
                    <Link href="/" style={styles.logoContainer}>
                        <div style={styles.logo}>🧘</div>
                        <span style={styles.logoText}>AMG Pilates Studio</span>
                    </Link>

                    <div style={styles.userSection}>
                        <div style={styles.userInfo}>
                            <div style={styles.userAvatar}>
                                {user.name?.[0] || user.email?.[0] || 'U'}
                            </div>
                            <div>
                                <div style={styles.userName}>{user.name || 'Користувач'}</div>
                                <div style={styles.userEmail}>{user.email}</div>
                            </div>
                        </div>
                        <Link href="/dashboard" style={styles.dashboardLink}>
                            ← Панель
                        </Link>
                    </div>
                </div>
            </nav>

            <main style={styles.main}>
                {/* Заголовок */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Розклад занять</h1>
                    <p style={styles.subtitle}>
                        AMG Pilates Studio, Саллоу | Бронювання на 5 тижнів вперед
                    </p>
                </div>

                {/* Інформація про абонемент */}
                {activeSubscription && (
                    <div style={styles.subscriptionBanner}>
                        <div style={styles.subscriptionInfo}>
                            <span style={styles.subscriptionType}>
                                {activeSubscription.category === 'group' ? 'Групові заняття' :
                                    activeSubscription.category === 'private' ? 'Персональні' :
                                        activeSubscription.category}
                            </span>
                            <span style={styles.subscriptionRemaining}>
                                Залишилось: <strong>{activeSubscription.remaining}</strong> занять
                            </span>
                        </div>
                        {activeSubscription.endDate && (
                            <div style={styles.subscriptionExpiry}>
                                Дійсний до: {new Date(activeSubscription.endDate).toLocaleDateString('uk-UA')}
                            </div>
                        )}
                    </div>
                )}

                {/* Календар */}
                <div style={styles.calendarSection}>
                    <div style={styles.calendarHeader}>
                        <button onClick={prevWeek} style={styles.navButton}>‹</button>
                        <h2 style={styles.calendarTitle}>
                            {currentWeekStart.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} -
                            {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
                                .toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
                        </h2>
                        <button onClick={nextWeek} style={styles.navButton}>›</button>
                    </div>

                    <div style={styles.daysGrid}>
                        {weekDates.map(dateStr => {
                            const isWeekendDay = isWeekend(dateStr);

                            // 1. Якщо це вихідний — повністю пропускаємо цей день
                            if (isWeekendDay) return null;

                            const hasClassesToday = hasClasses(dateStr);
                            const isToday = dateStr === today;
                            const dayClasses = getClassesForDate(dateStr);

                            return (
                                <div
                                    key={dateStr}
                                    style={{
                                        ...styles.dayColumn,
                                        ...(isToday ? styles.todayColumn : {})
                                    }}
                                >
                                    {/* Шапка дня (Назва та Число) */}
                                    <div style={styles.dayHeader}>
                                        <div style={styles.dayName}>{getDayName(dateStr)}</div>
                                        <div style={{
                                            ...styles.dayNumber,
                                            ...(isToday ? styles.todayNumber : {})
                                        }}>
                                            {getDayNumber(dateStr)}
                                            {isToday && <div style={styles.todayBadge}>сьогодні</div>}
                                        </div>
                                    </div>

                                    {/* Список занять або повідомлення про порожній день */}
                                    {hasClassesToday ? (
                                        <div style={styles.classesList}>
                                            {dayClasses.map(cls => {
                                                const isFull = cls.currentBookings >= cls.maxCapacity;
                                                const canBook = !isFull && activeSubscription?.remaining > 0;

                                                return (
                                                    <div
                                                        key={cls.id}
                                                        style={{
                                                            ...styles.classCard,
                                                            ...(isFull ? styles.classCardFull : {})
                                                        }}
                                                        onClick={() => canBook && handleBooking(cls)}
                                                    >
                                                        <div style={styles.classTime}>
                                                            {cls.startTime}
                                                        </div>

                                                        {/* Блок з іконкою попереду */}
                                                        <div style={{ ...styles.className, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span>
                                                                {cls.type === 'group' ? '👥' :
                                                                    cls.type === 'private' ? '👤' : '👥👥'}
                                                            </span>
                                                            {cls.subtype}
                                                        </div>

                                                        <div style={{
                                                            ...styles.classAvailability,
                                                            ...(isFull ? styles.classAvailabilityFull : styles.classAvailabilityFree)
                                                        }}>
                                                            {isFull ? 'Заповнено' : `${cls.maxCapacity - cls.currentBookings}/${cls.maxCapacity}`}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* Повідомлення для робочих днів без занять */
                                        <div style={styles.noClasses}>
                                            <div style={styles.noClassesIcon}>📅</div>
                                            <div style={styles.noClassesText}>Немає занять</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Деталі обраної дати */}
                {selectedDate && (
                    <div style={styles.selectedDateSection}>
                        
                    </div>
                )}

                {/* Інформація про студію */}
                
            </main>
        </div>
    );
}

// Стилі
const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },

    nav: {
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky' as const,
        top: 0,
        zIndex: 100
    },

    navContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none'
    },

    logo: {
        fontSize: '2rem'
    },

    logoText: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#1f2937'
    },

    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },

    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },

    userAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#6366f1',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.125rem'
    },

    userName: {
        fontWeight: '600',
        color: '#1f2937'
    },

    userEmail: {
        fontSize: '0.875rem',
        color: '#6b7280'
    },

    dashboardLink: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        borderRadius: '0.375rem',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.875rem'
    },

    main: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
    },

    header: {
        marginBottom: '2rem',
        textAlign: 'center' as const
    },

    title: {
        fontSize: '2.25rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '0.5rem'
    },

    subtitle: {
        color: '#6b7280',
        fontSize: '1.125rem'
    },

    subscriptionBanner: {
        backgroundColor: '#dbeafe',
        border: '1px solid #93c5fd',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    subscriptionInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.25rem'
    },

    subscriptionType: {
        fontWeight: '600',
        color: '#1e40af'
    },

    subscriptionRemaining: {
        color: '#4b5563',
        fontSize: '0.875rem'
    },

    subscriptionExpiry: {
        color: '#6b7280',
        fontSize: '0.875rem'
    },

    calendarSection: {
        marginBottom: '2rem'
    },

    calendarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },

    navButton: {
        padding: '0.5rem 1rem',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '1.25rem',
        color: '#4b5563'
    },

    calendarTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#111827'
    },

    daysGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },

    dayColumn: {
        minHeight: '300px',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        backgroundColor: 'white'
    },

    weekendColumn: {
        backgroundColor: '#f9fafb',
        opacity: 0.8
    },

    todayColumn: {
        borderColor: '#6366f1',
        borderWidth: '2px'
    },

    dayHeader: {
        textAlign: 'center' as const,
        marginBottom: '0.75rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #f3f4f6'
    },

    dayName: {
        fontWeight: '600',
        color: '#374151',
        fontSize: '0.875rem'
    },

    dayNumber: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        position: 'relative' as const
    },

    todayNumber: {
        color: '#6366f1'
    },

    todayBadge: {
        position: 'absolute' as const,
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.625rem',
        color: '#6366f1',
        whiteSpace: 'nowrap' as const
    },

    weekendMessage: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: '#9ca3af'
    },

    weekendIcon: {
        fontSize: '2rem',
        marginBottom: '0.5rem'
    },

    weekendText: {
        fontSize: '0.875rem'
    },

    classesList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem'
    },

    classCard: {
        padding: '0.5rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db'
        }
    },

    classCardFull: {
        opacity: 0.6,
        cursor: 'not-allowed',
        '&:hover': {
            backgroundColor: '#f9fafb'
        }
    },

    classTime: {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '0.25rem'
    },

    className: {
        fontSize: '0.75rem',
        color: '#4b5563',
        marginBottom: '0.25rem',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },

    classType: {
        fontSize: '0.75rem',
        color: '#6b7280'
    },

    classAvailability: {
        fontSize: '0.625rem',
        padding: '0.125rem 0.25rem',
        borderRadius: '0.125rem',
        display: 'inline-block',
        marginTop: '0.25rem'
    },

    classAvailabilityFree: {
        backgroundColor: '#d1fae5',
        color: '#065f46'
    },

    classAvailabilityFull: {
        backgroundColor: '#fee2e2',
        color: '#991b1b'
    },

    classPrice: {
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#6366f1',
        marginTop: '0.25rem'
    },

    noClasses: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: '#9ca3af'
    },

    noClassesIcon: {
        fontSize: '1.5rem',
        marginBottom: '0.5rem'
    },

    noClassesText: {
        fontSize: '0.75rem'
    },

    selectedDateSection: {
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },

    selectedDateTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1.5rem'
    },

    classesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem'
    },

    detailedClassCard: {
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        backgroundColor: '#f9fafb'
    },

    detailedClassCardFull: {
        opacity: 0.7
    },

    detailedClassHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
    },

    detailedClassName: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#111827',
        marginRight: '1rem'
    },

    detailedClassPrice: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#6366f1'
    },

    detailedClassInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
        marginBottom: '1rem'
    },

    detailedClassTime: {
        fontSize: '0.875rem',
        color: '#4b5563'
    },

    detailedClassType: {
        fontSize: '0.875rem',
        color: '#4b5563'
    },

    detailedClassInstructor: {
        fontSize: '0.875rem',
        color: '#4b5563'
    },

    detailedClassFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    detailedAvailability: {
        padding: '0.375rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    detailedAvailabilityFree: {
        backgroundColor: '#d1fae5',
        color: '#065f46'
    },

    detailedAvailabilityFull: {
        backgroundColor: '#fee2e2',
        color: '#991b1b'
    },

    bookButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#4f46e5'
        }
    },

    studioInfo: {
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },

    studioTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1rem'
    },

    studioDetails: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem'
    },

    studioDetail: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#4b5563'
    },

    detailIcon: {
        fontSize: '1.125rem'
    },

    loadingContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1rem'
    },

    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #f3f4f6',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};