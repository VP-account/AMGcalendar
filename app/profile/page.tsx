'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    phone?: string;
    name?: string;
    surname?: string;
    birthDate?: string;
    gender?: string;
    goal?: string;
    experience?: string;
    comments?: string;
    preferredLang?: string;
    interfaceLang: string;
    registrationDate: string;
    status: string;
    photo?: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [saveMessage, setSaveMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('pilates_user');
        if (!userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData(parsedUser);
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        if (!user) return;

        const updatedUser = { ...user, ...formData };

        // Оновлюємо в localStorage
        localStorage.setItem('pilates_user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        setIsEditing(false);
        setSaveMessage('✅ Профіль успішно оновлено!');

        setTimeout(() => {
            setSaveMessage('');
        }, 3000);
    };

    const handleCancel = () => {
        setFormData(user || {});
        setIsEditing(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('pilates_user');
        router.push('/');
    };

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
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            Вийти
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container" style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Мій профіль</h1>
                    <p style={styles.subtitle}>Керуйте своїми даними та налаштуваннями</p>
                </div>

                {saveMessage && (
                    <div style={styles.successMessage}>
                        {saveMessage}
                    </div>
                )}

                <div style={styles.profileGrid}>
                    {/* Ліва колонка - Аватар та основна інформація */}
                    <div style={styles.leftColumn}>
                        <div style={styles.avatarSection}>
                            <div style={styles.avatar}>
                                {user.photo ? (
                                    <img src={user.photo} alt="Avatar" style={styles.avatarImage} />
                                ) : (
                                    <div style={styles.avatarPlaceholder}>
                                        {user.name?.[0] || user.email?.[0] || 'U'}
                                    </div>
                                )}
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={styles.editButton}
                                >
                                    ✏️ Редагувати профіль
                                </button>
                            )}

                            <div style={styles.statsCard}>
                                <h3 style={styles.statsTitle}>Статистика</h3>
                                <div style={styles.statsGrid}>
                                    <div style={styles.statItem}>
                                        <div style={styles.statValue}>12</div>
                                        <div style={styles.statLabel}>Відвідано занять</div>
                                    </div>
                                    <div style={styles.statItem}>
                                        <div style={styles.statValue}>4</div>
                                        <div style={styles.statLabel}>Залишилось</div>
                                    </div>
                                    <div style={styles.statItem}>
                                        <div style={styles.statValue}>85%</div>
                                        <div style={styles.statLabel}>Відвідуваність</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Права колонка - Форма */}
                    <div style={styles.rightColumn}>
                        <div style={styles.formCard}>
                            <div style={styles.formHeader}>
                                <h2 style={styles.formTitle}>
                                    {isEditing ? 'Редагування профілю' : 'Особиста інформація'}
                                </h2>

                                {isEditing ? (
                                    <div style={styles.formActions}>
                                        <button onClick={handleCancel} style={styles.cancelButton}>
                                            Скасувати
                                        </button>
                                        <button onClick={handleSave} style={styles.saveButton}>
                                            Зберегти зміни
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            <div style={styles.formSections}>
                                {/* Основина інформація */}
                                <div style={styles.formSection}>
                                    <h3 style={styles.sectionTitle}>👤 Основна інформація</h3>

                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Ім'я</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name || ''}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                    placeholder="Введіть ваше ім'я"
                                                />
                                            ) : (
                                                <div style={styles.fieldValue}>{user.name || 'Не вказано'}</div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Прізвище</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="surname"
                                                    value={formData.surname || ''}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                    placeholder="Введіть ваше прізвище"
                                                />
                                            ) : (
                                                <div style={styles.fieldValue}>{user.surname || 'Не вказано'}</div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Email</label>
                                            <div style={styles.fieldValue}>{user.email}</div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Телефон</label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone || ''}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                    placeholder="+380"
                                                />
                                            ) : (
                                                <div style={styles.fieldValue}>{user.phone || 'Не вказано'}</div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Дата народження</label>
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    name="birthDate"
                                                    value={formData.birthDate || ''}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                />
                                            ) : (
                                                <div style={styles.fieldValue}>
                                                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString('uk-UA') : 'Не вказано'}
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Стать</label>
                                            {isEditing ? (
                                                <select
                                                    name="gender"
                                                    value={formData.gender || ''}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                >
                                                    <option value="">Не вказано</option>
                                                    <option value="male">Чоловіча</option>
                                                    <option value="female">Жіноча</option>
                                                    <option value="other">Інше</option>
                                                </select>
                                            ) : (
                                                <div style={styles.fieldValue}>
                                                    {user.gender === 'male' ? 'Чоловіча' :
                                                        user.gender === 'female' ? 'Жіноча' :
                                                            user.gender === 'other' ? 'Інше' : 'Не вказано'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Налаштування занять */}
                                <div style={styles.formSection}>
                                    <h3 style={styles.sectionTitle}>🏋️ Налаштування занять</h3>

                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Мета занять</label>
                                            {isEditing ? (
                                                <select
                                                    name="goal"
                                                    value={formData.goal || ''}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                >
                                                    <option value="">Не вказано</option>
                                                    <option value="health">Оздоровлення</option>
                                                    <option value="rehabilitation">Реабілітація</option>
                                                    <option value="pregnancy">Підготовка до пологів</option>
                                                    <option value="posture">Корекція постави</option>
                                                    <option value="stress">Зняття стресу</option>
                                                    <option value="fitness">Покращення фітнесу</option>
                                                </select>
                                            ) : (
                                                <div style={styles.fieldValue}>{user.goal || 'Не вказано'}</div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Досвід</label>
                                            {isEditing ? (
                                                <select
                                                    name="experience"
                                                    value={formData.experience || ''}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                >
                                                    <option value="">Не вказано</option>
                                                    <option value="beginner">Початківець</option>
                                                    <option value="intermediate">Середній рівень</option>
                                                    <option value="advanced">Досвідчений</option>
                                                </select>
                                            ) : (
                                                <div style={styles.fieldValue}>
                                                    {user.experience === 'beginner' ? 'Початківець' :
                                                        user.experience === 'intermediate' ? 'Середній рівень' :
                                                            user.experience === 'advanced' ? 'Досвідчений' : 'Не вказано'}
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Бажана мова тренувань</label>
                                            {isEditing ? (
                                                <select
                                                    name="preferredLang"
                                                    value={formData.preferredLang || ''}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                >
                                                    <option value="">Не вказано</option>
                                                    <option value="uk">Українська</option>
                                                    <option value="es">Іспанська</option>
                                                    <option value="en">Англійська</option>
                                                </select>
                                            ) : (
                                                <div style={styles.fieldValue}>
                                                    {user.preferredLang === 'uk' ? 'Українська' :
                                                        user.preferredLang === 'es' ? 'Іспанська' :
                                                            user.preferredLang === 'en' ? 'Англійська' : 'Не вказано'}
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Мова інтерфейсу</label>
                                            {isEditing ? (
                                                <select
                                                    name="interfaceLang"
                                                    value={formData.interfaceLang || 'uk'}
                                                    onChange={handleInputChange}
                                                    style={styles.input}
                                                >
                                                    <option value="uk">Українська</option>
                                                    <option value="es">Español</option>
                                                    <option value="en">English</option>
                                                </select>
                                            ) : (
                                                <div style={styles.fieldValue}>
                                                    {user.interfaceLang === 'uk' ? 'Українська' :
                                                        user.interfaceLang === 'es' ? 'Іспанська' : 'Англійська'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Коментарі та особливі потреби */}
                                <div style={styles.formSection}>
                                    <h3 style={styles.sectionTitle}>📝 Особливі потреби</h3>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Коментарі, травми, особливі потреби</label>
                                        {isEditing ? (
                                            <textarea
                                                name="comments"
                                                value={formData.comments || ''}
                                                onChange={handleInputChange}
                                                style={styles.textarea}
                                                placeholder="Опишіть будь-які травми, обмеження чи особливі потреби..."
                                                rows={4}
                                            />
                                        ) : (
                                            <div style={styles.fieldValue}>
                                                {user.comments || 'Не вказано'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Інформація про акаунт */}
                                <div style={styles.formSection}>
                                    <h3 style={styles.sectionTitle}>📊 Інформація про акаунт</h3>

                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>ID користувача:</span>
                                            <span style={styles.infoValue}>{user.id}</span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>Дата реєстрації:</span>
                                            <span style={styles.infoValue}>
                                                {new Date(user.registrationDate).toLocaleDateString('uk-UA')}
                                            </span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>Статус акаунта:</span>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: user.status === 'active'
                                                    ? 'var(--color-success-bg)'
                                                    : 'var(--color-error-bg)',
                                                color: user.status === 'active'
                                                    ? 'var(--color-success)'
                                                    : 'var(--color-error)'
                                            }}>
                                                {user.status === 'active' ? 'Активний' : 'Неактивний'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Швидкі посилання */}
                <div style={styles.quickLinks}>
                    <Link href="/dashboard" style={styles.quickLink}>
                        ← Повернутись до панелі
                    </Link>
                    <Link href="/subscriptions" style={styles.quickLink}>
                        💳 Мої абонементи →
                    </Link>
                </div>
            </main>
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
        zIndex: 10
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
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
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

    successMessage: {
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-lg)',
        textAlign: 'center' as const,
        fontWeight: '500'
    },

    profileGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-xl)'
    },

    leftColumn: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-lg)'
    },

    avatarSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 'var(--space-lg)'
    },

    avatar: {
        width: '8rem',
        height: '8rem',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: 'var(--color-primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    avatarPlaceholder: {
        fontSize: '3rem',
        fontWeight: 'bold',
        color: 'var(--color-primary)'
    },

    avatarImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },

    editButton: {
        padding: 'var(--space-sm) var(--space-lg)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500'
    },

    statsCard: {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)',
        width: '100%'
    },

    statsTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: 'var(--space-md)',
        color: 'var(--color-text-primary)'
    },

    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-md)'
    },

    statItem: {
        textAlign: 'center' as const
    },

    statValue: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-primary)',
        marginBottom: 'var(--space-xs)'
    },

    statLabel: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    rightColumn: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-lg)'
    },

    formCard: {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)'
    },

    formHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-xl)'
    },

    formTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    },

    formActions: {
        display: 'flex',
        gap: 'var(--space-md)'
    },

    cancelButton: {
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    saveButton: {
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    formSections: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-xl)'
    },

    formSection: {
        paddingBottom: 'var(--space-xl)',
        borderBottom: '1px solid var(--color-border-light)'
    },

    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: 'var(--space-lg)',
        color: 'var(--color-text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)'
    },

    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-lg)'
    },

    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-sm)'
    },

    label: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: 'var(--color-text-secondary)'
    },

    input: {
        padding: 'var(--space-sm) var(--space-md)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '1rem',
        outline: 'none',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-primary)'
    },

    textarea: {
        padding: 'var(--space-sm) var(--space-md)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '1rem',
        outline: 'none',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        fontFamily: 'inherit',
        resize: 'vertical' as const,
        minHeight: '100px'
    },

    fieldValue: {
        padding: 'var(--space-sm) 0',
        fontSize: '1rem',
        color: 'var(--color-text-primary)',
        minHeight: '2.5rem',
        display: 'flex',
        alignItems: 'center'
    },

    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-md)'
    },

    infoItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 'var(--space-xs)'
    },

    infoLabel: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)'
    },

    infoValue: {
        fontSize: '1rem',
        color: 'var(--color-text-primary)',
        fontWeight: '500'
    },

    statusBadge: {
        display: 'inline-block',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.875rem',
        fontWeight: '500'
    },

    quickLinks: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 'var(--space-xl)'
    },

    quickLink: {
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        fontWeight: '500'
    },

    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
    }
} as const;