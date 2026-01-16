'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Subscription {
    id: string;
    userId: string;
    type: 'registration' | 'single' | 'membership' | 'group' | 'combo' | 'special';
    category: 'персональні' | 'парні' | 'для трьох' | 'групові' | 'комбіновані' | 'спеціальні';
    name: string;
    duration: number;
    price: number;
    purchaseDate: string;
    startDate?: string;
    endDate?: string;
    remaining: number;
    status: string;
    frequency?: number; // разів на тиждень
    hasMatrix: boolean;
    validUntil?: string; // ← ДОДАЙТЕ ЦЕ ПОЛЕ
}

export default function SubscriptionsPage() {
    const [user, setUser] = useState<any>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [activeTab, setActiveTab] = useState<'current' | 'history' | 'buy'>('current');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('pilates_user');
        if (!userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadSubscriptions(parsedUser.id);
    }, [router]);

    // У функції loadSubscriptions додайте перевірку терміну дії
    const loadSubscriptions = (userId: string) => {
        const savedSubscriptions = localStorage.getItem('pilates_subscriptions');
        if (savedSubscriptions) {
            const allSubscriptions: Subscription[] = JSON.parse(savedSubscriptions);

            // Оновити статуси матрикул, якщо термін дії закінчився
            const updatedSubscriptions = allSubscriptions.map(sub => {
                if (sub.type === 'registration' && sub.validUntil) {
                    const now = new Date();
                    const validUntil = new Date(sub.validUntil);
                    if (validUntil < now && sub.status === 'active') {
                        return { ...sub, status: 'expired' };
                    }
                }
                return sub;
            });

            // Зберегти оновлені дані
            localStorage.setItem('pilates_subscriptions', JSON.stringify(updatedSubscriptions));

            const userSubscriptions = updatedSubscriptions.filter(
                (sub) => sub.userId === userId
            );
            setSubscriptions(userSubscriptions);
        }
    };

    // Функція для перевірки чи активна матрикула
    const isMatrixActive = () => {
        const now = new Date();
        const matrixStartDate = new Date('2026-03-01');

        if (now < matrixStartDate) {
            return { active: false, needsPayment: false, year: now.getFullYear() };
        }

        const currentYear = now.getFullYear();
        const activeMatrix = subscriptions.find(sub =>
            sub.type === 'registration' &&
            sub.status === 'active' &&
            new Date(sub.purchaseDate).getFullYear() === currentYear &&
            (!sub.validUntil || new Date(sub.validUntil) > now)
        );

        return {
            active: !!activeMatrix,
            needsPayment: !activeMatrix,
            year: currentYear,
            validUntil: activeMatrix?.validUntil
        };
    };

    // Викликайте цю функцію при відображенні планів
    const matrixInfo = isMatrixActive(); 
    
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired');
    const pendingSubscriptions = subscriptions.filter(sub => sub.status === 'pending');

    const subscriptionPlans = [
        // Реєстрація
        {
            id: 'registration',
            type: 'registration',
            category: 'спеціальні',
            name: 'Реєстраційний внесок',
            description: 'Одноразовий внесок при першому записі',
            duration: 0,
            price: 35,
            features: ['Одноразовий платіж', 'Обов\'язковий при першому записі'],
            popular: true,
            requiresRegistration: true
        },

        // Одноразові відвідування
        {
            id: 'single-personal',
            type: 'single',
            category: 'персональні',
            name: 'Одноразове персональне',
            description: 'Персональне заняття на реформері (1 особа)',
            duration: 1,
            price: 30,
            features: ['1 заняття на реформері', 'Персональний тренер', '55 хвилин'],
            popular: false
        },
        {
            id: 'single-duet',
            type: 'single',
            category: 'парні',
            name: 'Одноразове дует',
            description: 'Заняття на реформері на двох',
            duration: 1,
            price: 50,
            features: ['1 заняття на двох', 'Персональний тренер', '55 хвилин'],
            popular: false
        },
        {
            id: 'single-trio',
            type: 'single',
            category: 'для трьох',
            name: 'Одноразове тріо',
            description: 'Заняття на реформері на трьох',
            duration: 1,
            price: 70,
            features: ['1 заняття на трьох', 'Персональний тренер', '55 хвилин'],
            popular: false
        },

        // Абонементи (Пакетні)
        // Персональні
        {
            id: 'personal-1',
            type: 'membership',
            category: 'персональні',
            name: 'Персональний (1р/тиж)',
            description: 'Персональні заняття на реформері, 1 раз на тиждень',
            duration: 5,
            price: 110,
            frequency: 1,
            features: ['5 занять (1р/тиж)', 'Термін дії: 5 тижнів', 'Персональний тренер'],
            popular: true
        },
        {
            id: 'personal-2',
            type: 'membership',
            category: 'персональні',
            name: 'Персональний (2р/тиж)',
            description: 'Персональні заняття на реформері, 2 рази на тиждень',
            duration: 10,
            price: 205,
            frequency: 2,
            features: ['10 занять (2р/тиж)', 'Термін дії: 5 тижнів', 'Персональний тренер'],
            popular: false
        },
        {
            id: 'personal-3',
            type: 'membership',
            category: 'персональні',
            name: 'Персональний (3р/тиж)',
            description: 'Персональні заняття на реформері, 3 рази на тиждень',
            duration: 15,
            price: 290,
            frequency: 3,
            features: ['15 занять (3р/тиж)', 'Термін дії: 5 тижнів', 'Персональний тренер'],
            popular: false
        },

        // Дует
        {
            id: 'duet-1',
            type: 'membership',
            category: 'парні',
            name: 'Дует (1р/тиж)',
            description: 'Заняття на реформері на двох, 1 раз на тиждень',
            duration: 5,
            price: 180,
            frequency: 1,
            features: ['5 занять на двох (1р/тиж)', 'Термін дії: 5 тижнів', 'Тренуйтесь з друзями'],
            popular: false
        },
        {
            id: 'duet-2',
            type: 'membership',
            category: 'парні',
            name: 'Дует (2р/тиж)',
            description: 'Заняття на реформері на двох, 2 рази на тиждень',
            duration: 10,
            price: 340,
            frequency: 2,
            features: ['10 занять на двох (2р/тиж)', 'Термін дії: 5 тижнів', 'Тренуйтесь з друзями'],
            popular: false
        },
        {
            id: 'duet-3',
            type: 'membership',
            category: 'парні',
            name: 'Дует (3р/тиж)',
            description: 'Заняття на реформері на двох, 3 рази на тиждень',
            duration: 15,
            price: 480,
            frequency: 3,
            features: ['15 занять на двох (3р/тиж)', 'Термін дії: 5 тижнів', 'Тренуйтесь з друзями'],
            popular: false
        },

        // Тріо
        {
            id: 'trio-1',
            type: 'membership',
            category: 'для трьох',
            name: 'Тріо (1р/тиж)',
            description: 'Заняття на реформері на трьох, 1 раз на тиждень',
            duration: 5,
            price: 250,
            frequency: 1,
            features: ['5 занять на трьох (1р/тиж)', 'Термін дії: 5 тижнів', 'Ідеально для родини'],
            popular: false
        },
        {
            id: 'trio-2',
            type: 'membership',
            category: 'для трьох',
            name: 'Тріо (2р/тиж)',
            description: 'Заняття на реформері на трьох, 2 рази на тиждень',
            duration: 10,
            price: 475,
            frequency: 2,
            features: ['10 занять на трьох (2р/тиж)', 'Термін дії: 5 тижнів', 'Ідеально для родини'],
            popular: false
        },
        {
            id: 'trio-3',
            type: 'membership',
            category: 'для трьох',
            name: 'Тріо (3р/тиж)',
            description: 'Заняття на реформері на трьох, 3 рази на тиждень',
            duration: 15,
            price: 670,
            frequency: 3,
            features: ['15 занять на трьох (3р/тиж)', 'Термін дії: 5 тижнів', 'Ідеально для родини'],
            popular: false
        },

        // Групові заняття
        {
            id: 'group-single',
            type: 'single',
            category: 'групові',
            name: 'Вільний клас (коврик)',
            description: 'Одне групове заняття на ковриках',
            duration: 1,
            price: 10,
            features: ['1 групове заняття', 'На ковриках', '55 хвилин'],
            popular: false
        },
        {
            id: 'group-4',
            type: 'group',
            category: 'групові',
            name: 'Груповий (4 заняття)',
            description: '4 групових заняття на ковриках',
            duration: 4,
            price: 35,
            features: ['4 групових заняття', 'Термін дії: 5 тижнів', 'На ковриках'],
            popular: true
        },
        {
            id: 'group-8',
            type: 'group',
            category: 'групові',
            name: 'Груповий (8 занять)',
            description: '8 групових занять на ковриках',
            duration: 8,
            price: 60,
            features: ['8 групових занять', 'Термін дії: 5 тижнів', 'На ковриках'],
            popular: false
        },
        {
            id: 'group-12',
            type: 'group',
            category: 'групові',
            name: 'Груповий (12 занять)',
            description: '12 групових занять на ковриках',
            duration: 12,
            price: 85,
            features: ['12 групових занять', 'Термін дії: 5 тижнів', 'На ковриках'],
            popular: false
        },

        // Комбіновані пакети
        {
            id: 'combo-1',
            type: 'combo',
            category: 'комбіновані',
            name: 'Комбінований (2+4)',
            description: '2 персональних + 4 групових заняття',
            duration: 6,
            price: 90,
            features: ['2 заняття на реформері', '4 групових заняття', 'Термін дії: 5 тижнів'],
            popular: false
        },
        {
            id: 'combo-2',
            type: 'combo',
            category: 'комбіновані',
            name: 'Комбінований (2+8)',
            description: '2 персональних + 8 групових занять',
            duration: 10,
            price: 110,
            features: ['2 заняття на реформері', '8 групових занять', 'Термін дії: 5 тижнів'],
            popular: false
        },
        {
            id: 'combo-3',
            type: 'combo',
            category: 'комбіновані',
            name: 'Комбінований (4+4)',
            description: '4 персональних + 4 групових заняття',
            duration: 8,
            price: 135,
            features: ['4 заняття на реформері', '4 групових заняття', 'Термін дії: 5 тижнів'],
            popular: false
        },
        {
            id: 'combo-4',
            type: 'combo',
            category: 'комбіновані',
            name: 'Комбінований (4+8)',
            description: '4 персональних + 8 групових занять',
            duration: 12,
            price: 150,
            features: ['4 заняття на реформері', '8 групових занять', 'Термін дії: 5 тижнів'],
            popular: false
        },

        // Спеціальні пропозиції
        {
            id: 'kids-group',
            type: 'special',
            category: 'спеціальні',
            name: 'Дитяча група (12+)',
            description: '4 заняття для дітей від 12 років',
            duration: 4,
            price: 35,
            features: ['4 заняття (1р/тиждень)', 'Для дітей від 12 років', 'Термін дії: 5 тижнів'],
            popular: false,
            ageRestriction: '12+'
        }
    ];

    const handleBuyClick = (plan: any) => {
        // Перевірка чи вже є реєстрація
        if (plan.type === 'registration') {
            const hasRegistration = subscriptions.some(sub =>
                sub.type === 'registration' && sub.status !== 'expired'
            );

            if (hasRegistration) {
                alert('⚠️ Реєстраційний внесок вже сплачено!');
                return;
            }
        }

        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handlePayment = () => {
        if (!user || !selectedPlan) return;

        const now = new Date();
        const matrixStartDate = new Date('2026-01-01');
        const currentYear = now.getFullYear();

        let finalPrice = selectedPlan.price;
        let hasMatrix = false;
        let matrixValidUntil = null;

        // Перевірка чи потрібна матрикула
        if (selectedPlan.type !== 'registration' && now >= matrixStartDate) {
            // Перевіряємо, чи вже сплачено матрикулу за ПОТОЧНИЙ РІК
            const hasPaidMatrixThisYear = subscriptions.some(sub =>
                sub.type === 'registration' &&
                sub.status === 'active' &&
                new Date(sub.purchaseDate).getFullYear() === currentYear &&
                (!sub.validUntil || new Date(sub.validUntil) > now)
            );

            if (!hasPaidMatrixThisYear) {
                finalPrice += 35;
                hasMatrix = true;

                // Автоматично створюємо запис про матрикулу за рік
                matrixValidUntil = new Date(currentYear, 11, 31).toISOString(); // 31 грудня

                const matrixSubscription: Subscription = {
                    id: `matrix-${Date.now()}`,
                    userId: user.id,
                    type: 'registration',
                    category: 'спеціальні',
                    name: `Матрикула ${currentYear} рік`,
                    duration: 0,
                    price: 35,
                    purchaseDate: new Date().toISOString(),
                    remaining: 0,
                    status: 'active',
                    hasMatrix: true,
                    validUntil: matrixValidUntil
                };

                const savedSubscriptions = localStorage.getItem('pilates_subscriptions');
                const allSubscriptions = savedSubscriptions ? JSON.parse(savedSubscriptions) : [];
                allSubscriptions.push(matrixSubscription);
                localStorage.setItem('pilates_subscriptions', JSON.stringify(allSubscriptions));
            }
        }

        // Створення основного абонементу
        const newSubscription: Subscription = {
            id: Date.now().toString(),
            userId: user.id,
            type: selectedPlan.type,
            category: selectedPlan.category,
            name: selectedPlan.name,
            duration: selectedPlan.duration,
            price: finalPrice,
            purchaseDate: new Date().toISOString(),
            remaining: selectedPlan.duration,
            status: selectedPlan.type === 'registration' ? 'active' : 'pending',
            frequency: selectedPlan.frequency || 1,
            hasMatrix,
            validUntil: selectedPlan.type === 'registration' ?
                new Date(currentYear, 11, 31).toISOString() : undefined
        };

        const savedSubscriptions = localStorage.getItem('pilates_subscriptions');
        const allSubscriptions = savedSubscriptions ? JSON.parse(savedSubscriptions) : [];
        allSubscriptions.push(newSubscription);
        localStorage.setItem('pilates_subscriptions', JSON.stringify(allSubscriptions));

        setSubscriptions([...subscriptions, newSubscription]);
        setShowPaymentModal(false);
        setSelectedPlan(null);

        alert(`✅ ${selectedPlan.type === 'registration' ? 'Реєстраційний внесок сплачено!' : 'Абонемент придбано успішно!'}${hasMatrix ? ' (Включно матрикула за поточний рік)' : ''}`);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Не активовано';
        return new Date(dateString).toLocaleDateString('uk-UA');
    };

    const calculateEndDate = (startDate: string, duration: number) => {
        if (!startDate) return null;
        const date = new Date(startDate);
        // Для абонементів: 5 тижнів за будь-яку кількість занять
        if (duration > 1) {
            date.setDate(date.getDate() + (5 * 7));
        }
        return date;
    };

    const getCategoryName = (category: string) => {
        const names: Record<string, string> = {
            'персональні': 'Персональний',
            'парні': 'Дует',
            'для трьох': 'Тріо',
            'групові': 'Груповий',
            'комбіновані': 'Комбінований',
            'спеціальні': 'Спеціальний'
        };
        return names[category] || category;
    };

    const getTypeName = (type: string) => {
        const names: Record<string, string> = {
            'registration': 'Реєстрація',
            'single': 'Одноразове',
            'membership': 'Абонемент',
            'group': 'Груповий',
            'combo': 'Комбінований',
            'special': 'Спецпропозиція'
        };
        return names[type] || type;
    };

    // Функція для группировки планів по категоріям
    const groupedPlans = subscriptionPlans.reduce((acc, plan) => {
        let categoryName = '';
        switch (plan.type) {
            case 'registration':
                categoryName = 'Реєстрація';
                break;
            case 'single':
                if (plan.category === 'персональні' || plan.category === 'парні' || plan.category === 'для трьох') {
                    categoryName = 'Одноразові відвідування';
                } else {
                    categoryName = 'Групові заняття';
                }
                break;
            case 'membership':
                categoryName = 'Абонементи (Пакетні)';
                break;
            case 'group':
                categoryName = 'Групові заняття';
                break;
            case 'combo':
                categoryName = 'Комбіновані пакети';
                break;
            case 'special':
                categoryName = 'Спеціальні пропозиції';
                break;
        }

        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(plan);
        return acc;
    }, {} as Record<string, any[]>);

    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <p>Завантаження...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Навігація */}
            <nav style={styles.nav}>
                <div className="container" style={styles.navContent}>
                    <Link href="/" style={styles.logoContainer}>
                        <div style={styles.logo}></div>
                        <span style={styles.logoText}>AMG Pilates Studio</span>
                    </Link>

                    <div style={styles.navLinks}>
                        <Link href="/dashboard" style={styles.navLink}>
                            ← Панель
                        </Link>
                        <Link href="/profile" style={styles.navLink}>
                            👤 Профіль
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container" style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Мої абонементи</h1>
                    <p style={styles.subtitle}>Керуйте вашими абонементами та купуйте нові</p>
                </div>

                {/* Таби */}
                <div style={styles.tabs}>
                    <button
                        onClick={() => setActiveTab('current')}
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'current' && styles.tabButtonActive)
                        }}
                    >
                        Поточні ({activeSubscriptions.length + pendingSubscriptions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'history' && styles.tabButtonActive)
                        }}
                    >
                        Історія ({expiredSubscriptions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('buy')}
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'buy' && styles.tabButtonActive)
                        }}
                    >
                        Купити новий
                    </button>
                </div>

                {/* Контент */}
                <div style={styles.content}>
                    {activeTab === 'current' && (
                        <>
                            {/* Реєстрація */}
                            {subscriptions.some(sub => sub.type === 'registration' && sub.status === 'active') && (
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>
                                        <span style={styles.sectionIcon}>📋</span>
                                        Реєстрація
                                    </h2>
                                    <div style={styles.cardsGrid}>
                                        {subscriptions
                                            .filter(sub => sub.type === 'registration' && sub.status === 'active')
                                            .map(sub => (
                                                <div key={sub.id} style={styles.cardActive}>
                                                    <div style={styles.cardHeader}>
                                                        <h3 style={styles.cardTitle}>
                                                            {sub.name}
                                                        </h3>
                                                        <span style={styles.badgeActive}>
                                                            Активна
                                                        </span>
                                                    </div>

                                                    <div style={styles.cardBody}>
                                                        <div style={styles.detailsGrid}>
                                                            <div style={styles.detail}>
                                                                <span style={styles.detailLabel}>Тип:</span>
                                                                <span style={styles.detailValue}>{getTypeName(sub.type)}</span>
                                                            </div>
                                                            <div style={styles.detail}>
                                                                <span style={styles.detailLabel}>Ціна:</span>
                                                                <span style={styles.detailValue}>{sub.price}€</span>
                                                            </div>
                                                            <div style={styles.detail}>
                                                                <span style={styles.detailLabel}>Оплачено:</span>
                                                                <span style={styles.detailValue}>{formatDate(sub.purchaseDate)}</span>
                                                            </div>
                                                            <div style={styles.detail}>
                                                                <span style={styles.detailLabel}>Матрикула:</span>
                                                                <span style={styles.detailValue}>✅ Включено</span>
                                                            </div>
                                                        </div>

                                                        <div style={styles.cardNote}>
                                                            <span style={styles.noteIcon}>ℹ️</span>
                                                            Одноразовий реєстраційний внесок. Матрикула активована.
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Очікують активації */}
                            {pendingSubscriptions.filter(sub => sub.type !== 'registration').length > 0 && (
                                <div style={styles.section}>
                                    <h2 style={styles.sectionTitle}>
                                        <span style={styles.sectionIcon}>⏳</span>
                                        Очікують активації
                                    </h2>
                                    <div style={styles.cardsGrid}>
                                        {pendingSubscriptions
                                            .filter(sub => sub.type !== 'registration')
                                            .map(sub => (
                                                <div key={sub.id} style={styles.cardPending}>
                                                    <div style={styles.cardHeader}>
                                                        <h3 style={styles.cardTitle}>
                                                            {sub.name}
                                                        </h3>
                                                        <span style={styles.badgePending}>
                                                            Очікує активації
                                                        </span>
                                                    </div>

                                                    <div style={styles.cardBody}>
                                                        <div style={styles.detailsGrid}>
                                                            <div style={styles.detail}>
                                                                <span style={styles.detailLabel}>Тип:</span>
                                                                <span style={styles.detailValue}>{getTypeName(sub.type)}</span>
                                                            </div>
                                                            <div style={styles.detail}>
                                                                <span style={styles.detailLabel}>Занять:</span>
                                                                <span style={styles.detailValue}>{sub.duration}</span>
                                                            </div>
                                                            <div style={styles.detail}>
                                                                <span style={styles.detailLabel}>Ціна:</span>
                                                                <span style={styles.detailValue}>{sub.price}€</span>
                                                            </div>
                                                            <div style={styles.detail}>
                                                                <span style={styles.detailLabel}>Куплено:</span>
                                                                <span style={styles.detailValue}>{formatDate(sub.purchaseDate)}</span>
                                                            </div>
                                                            {sub.hasMatrix && (
                                                                <div style={styles.detail}>
                                                                    <span style={styles.detailLabel}>Матрикула:</span>
                                                                    <span style={styles.detailValue}>✅ Включено</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div style={styles.cardNote}>
                                                            <span style={styles.noteIcon}>ℹ️</span>
                                                            Активується після першого відвіданого заняття
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Активні абонементи */}
                            <div style={styles.section}>
                                <h2 style={styles.sectionTitle}>
                                    <span style={styles.sectionIcon}>✅</span>
                                    Активні абонементи
                                </h2>

                                {activeSubscriptions.filter(sub => sub.type !== 'registration').length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <div style={styles.emptyIcon}>📋</div>
                                        <h3 style={styles.emptyTitle}>Немає активних абонементів</h3>
                                        <p style={styles.emptyText}>Придбайте свій перший абонемент</p>
                                        <button
                                            onClick={() => setActiveTab('buy')}
                                            style={styles.primaryButton}
                                        >
                                            Переглянути абонементи
                                        </button>
                                    </div>
                                ) : (
                                    <div style={styles.cardsGrid}>
                                        {activeSubscriptions
                                            .filter(sub => sub.type !== 'registration')
                                            .map(sub => {
                                                if (!sub.startDate) return null;

                                                const endDate = calculateEndDate(sub.startDate, sub.duration);
                                                const progress = ((sub.duration - sub.remaining) / sub.duration) * 100;

                                                return (
                                                    <div key={sub.id} style={styles.cardActive}>
                                                        <div style={styles.cardHeader}>
                                                            <h3 style={styles.cardTitle}>
                                                                {sub.name}
                                                            </h3>
                                                            <span style={styles.badgeActive}>
                                                                Активний
                                                            </span>
                                                        </div>

                                                        <div style={styles.cardBody}>
                                                            {/* Прогрес бар */}
                                                            <div style={styles.progressSection}>
                                                                <div style={styles.progressHeader}>
                                                                    <span style={styles.progressText}>
                                                                        Використано: {sub.duration - sub.remaining} з {sub.duration}
                                                                    </span>
                                                                    <span style={styles.progressPercent}>
                                                                        {Math.round(progress)}%
                                                                    </span>
                                                                </div>
                                                                <div style={styles.progressBar}>
                                                                    <div
                                                                        style={{
                                                                            ...styles.progressFill,
                                                                            width: `${progress}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div style={styles.progressFooter}>
                                                                    <span>Залишилось: {sub.remaining} занять</span>
                                                                </div>
                                                            </div>

                                                            {/* Деталі */}
                                                            <div style={styles.detailsGrid}>
                                                                <div style={styles.detail}>
                                                                    <span style={styles.detailLabel}>Тип:</span>
                                                                    <span style={styles.detailValue}>{getTypeName(sub.type)}</span>
                                                                </div>
                                                                <div style={styles.detail}>
                                                                    <span style={styles.detailLabel}>Активовано:</span>
                                                                    <span style={styles.detailValue}>{formatDate(sub.startDate)}</span>
                                                                </div>
                                                                <div style={styles.detail}>
                                                                    <span style={styles.detailLabel}>Діє до:</span>
                                                                    <span style={styles.detailValue}>
                                                                        {endDate ? formatDate(endDate.toISOString()) : '—'}
                                                                    </span>
                                                                </div>
                                                                <div style={styles.detail}>
                                                                    <span style={styles.detailLabel}>Ціна:</span>
                                                                    <span style={styles.detailValue}>{sub.price}€</span>
                                                                </div>
                                                                {sub.frequency && (
                                                                    <div style={styles.detail}>
                                                                        <span style={styles.detailLabel}>Частота:</span>
                                                                        <span style={styles.detailValue}>{sub.frequency}р/тиж</span>
                                                                    </div>
                                                                )}
                                                                <div style={styles.detail}>
                                                                    <span style={styles.detailLabel}>Матрикула:</span>
                                                                    <span style={styles.detailValue}>
                                                                        {sub.hasMatrix ? '✅ Включено' : 'Не потрібна'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={styles.cardFooter}>
                                                            <Link href="/calendar" style={styles.primaryButtonSmall}>
                                                                Забронювати заняття
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'history' && (
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>
                                <span style={styles.sectionIcon}>🕰️</span>
                                Історія абонементів
                            </h2>

                            {expiredSubscriptions.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>📜</div>
                                    <h3 style={styles.emptyTitle}>Історія порожня</h3>
                                    <p style={styles.emptyText}>Тут будуть ваші завершені абонементи</p>
                                </div>
                            ) : (
                                <div style={styles.tableContainer}>
                                    <div style={styles.table}>
                                        <div style={styles.tableHeader}>
                                            <div style={styles.tableCell}>Назва</div>
                                            <div style={styles.tableCell}>Тип</div>
                                            <div style={styles.tableCell}>Занять</div>
                                            <div style={styles.tableCell}>Ціна</div>
                                            <div style={styles.tableCell}>Дата покупки</div>
                                            <div style={styles.tableCell}>Статус</div>
                                        </div>

                                        {expiredSubscriptions.map(sub => (
                                            <div key={sub.id} style={styles.tableRow}>
                                                <div style={styles.tableCell}>
                                                    {sub.name}
                                                </div>
                                                <div style={styles.tableCell}>
                                                    {getTypeName(sub.type)}
                                                </div>
                                                <div style={styles.tableCell}>
                                                    <strong>{sub.duration}</strong>
                                                </div>
                                                <div style={styles.tableCell}>
                                                    {sub.price}€
                                                </div>
                                                <div style={styles.tableCell}>
                                                    {formatDate(sub.purchaseDate)}
                                                </div>
                                                <div style={styles.tableCell}>
                                                    <span style={styles.badgeExpired}>
                                                        Завершено
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'buy' && (
                        <div style={styles.section}>
                            <div style={styles.matrixBanner}>
                                <span style={styles.matrixIcon}>📋</span>
                                <div>
                                    <h3 style={styles.matrixTitle}>Матрикула {matrixInfo.year} року</h3>
                                    <p style={styles.matrixText}>
                                        {matrixInfo.active
                                            ? `✅ Оплачено (дійсна до ${formatDate(matrixInfo.validUntil)})`
                                            : matrixInfo.needsPayment
                                                ? 'Потрібно сплатити 35€ при першій покупці цього року'
                                                : 'Не потрібна (до 01.03.2026)'}
                                    </p>
                                </div>
                            </div>

                            <h2 style={styles.sectionTitle}>
                                <span style={styles.sectionIcon}>🛒</span>
                                Обрати абонемент
                            </h2>

                            <div style={styles.plansContainer}>
                                {Object.entries(groupedPlans).map(([category, plans]) => (
                                    <div key={category} style={styles.categorySection}>
                                        <h3 style={styles.categoryTitle}>{category}</h3>
                                        <div style={styles.plansGrid}>
                                            {plans.map(plan => {
                                                // Розрахунок ціни за заняття
                                                const pricePerClass = plan.duration > 0
                                                    ? Math.round(plan.price / plan.duration)
                                                    : plan.price;

                                                return (
                                                    <div
                                                        key={plan.id}
                                                        style={{
                                                            ...styles.planCard,
                                                            ...(plan.popular && styles.planCardPopular)
                                                        }}
                                                    >
                                                        {plan.popular && (
                                                            <div style={styles.popularBadge}>
                                                                🏆 Популярний вибір
                                                            </div>
                                                        )}

                                                        {plan.ageRestriction && (
                                                            <div style={styles.ageBadge}>
                                                                👶 {plan.ageRestriction}
                                                            </div>
                                                        )}

                                                        <div style={styles.planHeader}>
                                                            <h3 style={styles.planTitle}>{plan.name}</h3>
                                                            <div style={styles.planPrice}>
                                                                <span style={styles.priceAmount}>{plan.price}€</span>
                                                                {plan.duration > 1 && plan.type !== 'membership' && (
                                                                    <span style={styles.pricePerClass}>
                                                                        {pricePerClass}€ за заняття
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <p style={styles.planDescription}>{plan.description}</p>

                                                        <div style={styles.planFeatures}>
                                                            {plan.features.map((feature: string, idx: number) => (
                                                                <div key={idx} style={styles.feature}>
                                                                    <span style={styles.featureIcon}>✓</span>
                                                                    <span>{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div style={styles.planDuration}>
                                                            <span style={styles.durationLabel}>Термін дії:</span>
                                                            <span style={styles.durationValue}>
                                                                {plan.duration === 0 ? 'Одноразово' :
                                                                    plan.duration === 1 ? '1 заняття' :
                                                                        plan.type === 'membership' ? '5 тижнів' :
                                                                            `${plan.duration} занять, 5 тижнів`}
                                                            </span>
                                                        </div>

                                                        {plan.frequency && (
                                                            <div style={styles.planFrequency}>
                                                                <span style={styles.frequencyLabel}>Частота:</span>
                                                                <span style={styles.frequencyValue}>
                                                                    {plan.frequency} разів на тиждень
                                                                </span>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleBuyClick(plan)}
                                                            style={styles.buyButton}
                                                            disabled={plan.type === 'registration' &&
                                                                subscriptions.some(sub =>
                                                                    sub.type === 'registration' && sub.status !== 'expired'
                                                                )}
                                                        >
                                                            {plan.type === 'registration' &&
                                                                subscriptions.some(sub =>
                                                                    sub.type === 'registration' && sub.status !== 'expired'
                                                                )
                                                                ? 'Вже сплачено'
                                                                : 'Обрати план'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Модалка оплати */}
            {showPaymentModal && selectedPlan && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Підтвердження покупки</h2>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                style={styles.modalClose}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={styles.modalContent}>
                            <div style={styles.paymentSummary}>
                                <h3 style={styles.summaryTitle}>Деталі замовлення</h3>

                                <div style={styles.summaryDetails}>
                                    <div style={styles.summaryRow}>
                                        <span>Абонемент:</span>
                                        <span style={styles.summaryValue}>{selectedPlan.name}</span>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span>Кількість занять:</span>
                                        <span style={styles.summaryValue}>
                                            {selectedPlan.duration === 0 ? '—' : selectedPlan.duration}
                                        </span>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span>Термін дії:</span>
                                        <span style={styles.summaryValue}>
                                            {selectedPlan.duration === 0 ? 'Одноразово' :
                                                selectedPlan.duration === 1 ? '1 заняття' :
                                                    selectedPlan.type === 'membership' ? '5 тижнів' :
                                                        `${selectedPlan.duration} занять, 5 тижнів`}
                                        </span>
                                    </div>
                                    {selectedPlan.frequency && (
                                        <div style={styles.summaryRow}>
                                            <span>Частота:</span>
                                            <span style={styles.summaryValue}>
                                                {selectedPlan.frequency} разів на тиждень
                                            </span>
                                        </div>
                                    )}
                                    <div style={styles.summaryRow}>
                                        <span>Вартість:</span>
                                        <span style={styles.summaryPrice}>{selectedPlan.price}€</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.paymentMethods}>
                                <h3 style={styles.methodsTitle}>Спосіб оплати</h3>

                                <div style={styles.methodsList}>
                                    <button style={styles.methodButton}>
                                        <div style={styles.methodIcon}>💳</div>
                                        <div style={styles.methodInfo}>
                                            <div style={styles.methodName}>Кредитна карта</div>
                                            <div style={styles.methodDesc}>Visa, Mastercard</div>
                                        </div>
                                    </button>

                                    <button style={styles.methodButton}>
                                        <div style={styles.methodIcon}>📱</div>
                                        <div style={styles.methodInfo}>
                                            <div style={styles.methodName}>Google Pay / Apple Pay</div>
                                            <div style={styles.methodDesc}>Швидка оплата</div>
                                        </div>
                                    </button>

                                    <button style={styles.methodButton}>
                                        <div style={styles.methodIcon}>🏢</div>
                                        <div style={styles.methodInfo}>
                                            <div style={styles.methodName}>Оплата в студії</div>
                                            <div style={styles.methodDesc}>Готівкою чи картою</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div style={styles.paymentNote}>
                                <span style={styles.noteIcon}>ℹ️</span>
                                {selectedPlan.type === 'registration'
                                    ? 'Реєстраційний внесок сплачується одноразово при першому записі. Включає матрикулу.'
                                    : 'Абонемент активується після першого відвіданого заняття. Термін дії: 5 тижнів.'}
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    style={styles.secondaryButton}
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handlePayment}
                                    style={styles.primaryButton}
                                >
                                    Підтвердити оплату
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, var(--color-background), var(--color-surface))'
    },

    nav: {
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky' as const,
        top: 0,
        zIndex: 100
    },

    navContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-md) 0'
    },

    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        textDecoration: 'none'
    },

    logo: {
        width: '2.5rem',
        height: '2.5rem',
        backgroundColor: 'var(--color-primary)',
        borderRadius: 'var(--radius-md)'
    },

    logoText: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    },

    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)'
    },

    navLink: {
        padding: 'var(--space-sm) var(--space-md)',
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        borderRadius: 'var(--radius-sm)',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    main: {
        padding: 'var(--space-xl) 0 var(--space-2xl)'
    },

    header: {
        marginBottom: 'var(--space-xl)'
    },

    title: {
        fontSize: '2.25rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-sm)'
    },

    subtitle: {
        color: 'var(--color-text-secondary)',
        fontSize: '1.125rem'
    },

    tabs: {
        display: 'flex',
        gap: 'var(--space-xs)',
        marginBottom: 'var(--space-xl)',
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-xs)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)'
    },

    tabButton: {
        flex: 1,
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--color-text-secondary)',
        transition: 'all 0.2s'
    },

    tabButtonActive: {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)'
    },

    content: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-xl)'
    },

    section: {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)'
    },

    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)'
    },

    sectionIcon: {
        fontSize: '1.25rem'
    },

    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--space-lg)'
    },

    cardPending: {
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-warning)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-md)'
    },

    cardActive: {
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-success)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-md)',
        boxShadow: 'var(--shadow-sm)'
    },

    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },

    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    },

    badgePending: {
        backgroundColor: 'var(--color-warning)',
        color: 'white',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: '500'
    },

    badgeActive: {
        backgroundColor: 'var(--color-success)',
        color: 'white',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: '500'
    },

    badgeExpired: {
        backgroundColor: 'var(--color-error)',
        color: 'white',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: '500'
    },

    cardBody: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-md)'
    },

    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--space-sm)'
    },

    detail: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-xs)'
    },

    detailLabel: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    detailValue: {
        fontSize: '1rem',
        color: 'var(--color-text-primary)',
        fontWeight: '500'
    },

    cardNote: {
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary-dark)',
        padding: 'var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)'
    },

    noteIcon: {
        fontSize: '1rem'
    },

    progressSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-sm)'
    },

    progressHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    progressText: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    progressPercent: {
        fontSize: '0.875rem',
        fontWeight: 'bold',
        color: 'var(--color-primary)'
    },

    progressBar: {
        height: '8px',
        backgroundColor: 'var(--color-border)',
        borderRadius: '4px',
        overflow: 'hidden'
    },

    progressFill: {
        height: '100%',
        backgroundColor: 'var(--color-success)',
        borderRadius: '4px',
        transition: 'width 0.3s ease'
    },

    progressFooter: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        textAlign: 'right' as const
    },

    cardFooter: {
        display: 'flex',
        justifyContent: 'center'
    },

    emptyState: {
        textAlign: 'center' as const,
        padding: 'var(--space-2xl)',
        color: 'var(--color-text-secondary)'
    },

    emptyIcon: {
        fontSize: '3rem',
        marginBottom: 'var(--space-md)'
    },

    emptyTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-sm)'
    },

    emptyText: {
        marginBottom: 'var(--space-lg)'
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
        borderBottom: '2px solid var(--color-border)',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr'
    },

    tableRow: {
        borderBottom: '1px solid var(--color-border-light)',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
        '&:hover': {
            backgroundColor: 'var(--color-background)'
        }
    },

    tableCell: {
        padding: 'var(--space-md)',
        textAlign: 'left' as const,
        color: 'var(--color-text-primary)'
    },

    plansContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-2xl)'
    },

    categorySection: {
        marginBottom: 'var(--space-xl)'
    },

    categoryTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-lg)',
        paddingBottom: 'var(--space-sm)',
        borderBottom: '2px solid var(--color-border)'
    },

    plansGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--space-lg)'
    },

    planCard: {
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-md)',
        position: 'relative' as const,
        transition: 'all 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--shadow-lg)'
        }
    },

    planCardPopular: {
        borderColor: 'var(--color-primary)',
        boxShadow: '0 0 0 2px var(--color-primary-light)'
    },

    popularBadge: {
        position: 'absolute' as const,
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        padding: 'var(--space-xs) var(--space-md)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        whiteSpace: 'nowrap' as const
    },

    ageBadge: {
        position: 'absolute' as const,
        top: '12px',
        right: '12px',
        backgroundColor: 'var(--color-warning)',
        color: 'white',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: '500'
    },

    planHeader: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-sm)'
    },

    planTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    },

    planPrice: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--space-sm)'
    },

    priceAmount: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'var(--color-primary)'
    },

    pricePerClass: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    planDescription: {
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6
    },

    planFeatures: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-sm)',
        flex: 1
    },

    feature: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-sm)',
        color: 'var(--color-text-primary)'
    },

    featureIcon: {
        color: 'var(--color-success)',
        fontWeight: 'bold'
    },

    planDuration: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-sm)',
        backgroundColor: 'var(--color-background)',
        borderRadius: 'var(--radius-sm)'
    },

    durationLabel: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    durationValue: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--color-text-primary)'
    },

    planFrequency: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-sm)',
        backgroundColor: 'var(--color-primary-light)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-primary-dark)'
    },

    frequencyLabel: {
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    frequencyValue: {
        fontSize: '0.875rem',
        fontWeight: 'bold'
    },

    buyButton: {
        padding: 'var(--space-md)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: 'var(--color-primary-dark)'
        },
        '&:disabled': {
            backgroundColor: 'var(--color-border)',
            cursor: 'not-allowed'
        }
    },

    primaryButton: {
        padding: 'var(--space-sm) var(--space-lg)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center' as const
    },

    primaryButtonSmall: {
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center' as const
    },

    secondaryButton: {
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    modalOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-md)'
    },

    modal: {
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
    },

    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-lg)',
        borderBottom: '1px solid var(--color-border)'
    },

    modalTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    },

    modalClose: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: 'var(--color-text-secondary)'
    },

    modalContent: {
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-xl)'
    },

    paymentSummary: {
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-lg)'
    },

    summaryTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: 'var(--space-md)',
        color: 'var(--color-text-primary)'
    },

    summaryDetails: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-sm)'
    },

    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-xs) 0',
        borderBottom: '1px solid var(--color-border-light)'
    },

    summaryValue: {
        fontWeight: '500',
        color: 'var(--color-text-primary)'
    },

    summaryPrice: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: 'var(--color-primary)'
    },

    paymentMethods: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-md)'
    },

    methodsTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    },

    methodsList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-sm)'
    },

    methodButton: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left' as const,
        width: '100%',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-primary)'
        }
    },

    methodIcon: {
        fontSize: '1.5rem'
    },

    methodInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-xs)'
    },

    methodName: {
        fontWeight: '500',
        color: 'var(--color-text-primary)'
    },

    methodDesc: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    paymentNote: {
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary-dark)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-sm)'
    },

    modalActions: {
        display: 'flex',
        gap: 'var(--space-md)',
        justifyContent: 'flex-end'
    },

    matrixBanner: {
        backgroundColor: 'var(--color-primary-light)',
        border: '1px solid var(--color-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md) var(--space-lg)',
        marginBottom: 'var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)'
    },

    matrixIcon: {
        fontSize: '1.5rem'
    },

    matrixTitle: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: 'var(--color-primary-dark)',
        marginBottom: 'var(--space-xs)'
    },

    matrixText: {
        fontSize: '0.875rem',
        color: 'var(--color-primary-dark)'
    }, 
    
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--color-text-secondary)'
    }
} as const;